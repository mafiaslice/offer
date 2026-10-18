-- Offer on Railway Postgres.
-- Ported from supabase/migrations (profiles, gigs, roles, slots, applications,
-- message threads, check-ins). Auth lives in public.users / public.sessions.
-- Row level security is not used. The app enforces ownership in server code.

create table public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index sessions_user_id_idx on public.sessions (user_id);
create index sessions_expires_at_idx on public.sessions (expires_at);

create table public.profiles (
  id uuid primary key references public.users (id) on delete cascade,
  display_name text not null default '',
  phone text,
  avatar_url text,
  bio text,
  intent text check (intent is null or intent in ('need', 'help', 'both')),
  created_at timestamptz not null default now()
);

create table public.gigs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  host_user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  summary text not null default '',
  kind text not null check (kind in ('volunteer', 'paid')),
  category text not null check (category in ('Events', 'Community', 'Hospitality', 'Projects')),
  location_label text,
  location_type text check (location_type is null or location_type in ('in-person', 'remote')),
  starts_at timestamptz,
  ends_at timestamptz,
  cover_image_url text,
  cover_tone text not null default 'sunset' check (cover_tone in ('sunset', 'mint', 'night')),
  status text not null default 'open' check (status in ('draft', 'open', 'filled', 'completed', 'cancelled')),
  instructions text,
  incentive text,
  created_at timestamptz not null default now()
);

create table public.gig_roles (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs (id) on delete cascade,
  title text not null,
  description text,
  capacity integer,
  sort_order integer not null default 0
);

create table public.gig_slots (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs (id) on delete cascade,
  role_id uuid references public.gig_roles (id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  capacity integer
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  applicant_user_id uuid not null references public.profiles (id) on delete cascade,
  gig_id uuid not null references public.gigs (id) on delete cascade,
  role_id uuid references public.gig_roles (id) on delete set null,
  slot_id uuid references public.gig_slots (id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined', 'withdrawn')),
  note text,
  created_at timestamptz not null default now(),
  unique (applicant_user_id, gig_id)
);

create index gigs_status_starts_at_idx on public.gigs (status, starts_at);
create index gigs_host_user_id_idx on public.gigs (host_user_id);
create index gig_roles_gig_id_idx on public.gig_roles (gig_id);
create index gig_slots_gig_id_idx on public.gig_slots (gig_id);
create index applications_gig_id_idx on public.applications (gig_id);
create index applications_applicant_user_id_idx on public.applications (applicant_user_id);

create table public.message_threads (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs (id) on delete cascade,
  host_user_id uuid not null references public.profiles (id) on delete cascade,
  participant_user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now(),
  last_message_preview text not null default '',
  last_message_sender_id uuid references public.profiles (id) on delete set null,
  host_last_read_at timestamptz,
  participant_last_read_at timestamptz,
  unique (gig_id, host_user_id, participant_user_id),
  check (host_user_id <> participant_user_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.message_threads (id) on delete cascade,
  sender_user_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) between 1 and 4000),
  created_at timestamptz not null default now()
);

create index message_threads_host_user_id_idx on public.message_threads (host_user_id);
create index message_threads_participant_user_id_idx on public.message_threads (participant_user_id);
create index message_threads_gig_id_idx on public.message_threads (gig_id);
create index message_threads_last_message_at_idx on public.message_threads (last_message_at desc);
create index messages_thread_id_created_at_idx on public.messages (thread_id, created_at);

create or replace function public.touch_message_thread()
returns trigger
language plpgsql
as $$
begin
  update public.message_threads
    set
      last_message_at = new.created_at,
      last_message_preview = left(new.body, 240),
      last_message_sender_id = new.sender_user_id
    where id = new.thread_id;
  return new;
end;
$$;

create trigger on_message_inserted
  after insert on public.messages
  for each row execute procedure public.touch_message_thread();

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  gig_id uuid not null references public.gigs (id) on delete cascade,
  slot_id uuid references public.gig_slots (id) on delete set null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  checked_in_at timestamptz not null default now(),
  checked_out_at timestamptz,
  unique (gig_id, user_id),
  check (checked_out_at is null or checked_out_at >= checked_in_at)
);

create index check_ins_gig_id_idx on public.check_ins (gig_id);
create index check_ins_user_id_idx on public.check_ins (user_id);
