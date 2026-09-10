-- Offer schema: profiles, gigs, roles, slots, applications + RLS.
-- Host is a capability on a signed-in user (gigs.host_user_id), not a separate account type.

create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
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

-- Profile row for every new auth user (email OTP, magic link, or phone).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, phone)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      ''
    ),
    nullif(new.phone, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.gigs enable row level security;
alter table public.gig_roles enable row level security;
alter table public.gig_slots enable row level security;
alter table public.applications enable row level security;

-- Profiles: anyone can read display fields; users manage their own row.
create policy "profiles are readable"
  on public.profiles for select
  using (true);

create policy "users insert own profile"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "users update own profile"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Gigs: public can read open gigs; hosts read/write their own.
create policy "open gigs are public"
  on public.gigs for select
  using (status = 'open' or host_user_id = auth.uid());

create policy "authenticated users create own gigs"
  on public.gigs for insert
  to authenticated
  with check (host_user_id = auth.uid());

create policy "hosts update own gigs"
  on public.gigs for update
  to authenticated
  using (host_user_id = auth.uid())
  with check (host_user_id = auth.uid());

create policy "roles visible with parent gig"
  on public.gig_roles for select
  using (
    exists (
      select 1 from public.gigs g
      where g.id = gig_id and (g.status = 'open' or g.host_user_id = auth.uid())
    )
  );

create policy "hosts write roles on own gigs"
  on public.gig_roles for all
  to authenticated
  using (
    exists (select 1 from public.gigs g where g.id = gig_id and g.host_user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.gigs g where g.id = gig_id and g.host_user_id = auth.uid())
  );

create policy "slots visible with parent gig"
  on public.gig_slots for select
  using (
    exists (
      select 1 from public.gigs g
      where g.id = gig_id and (g.status = 'open' or g.host_user_id = auth.uid())
    )
  );

create policy "hosts write slots on own gigs"
  on public.gig_slots for all
  to authenticated
  using (
    exists (select 1 from public.gigs g where g.id = gig_id and g.host_user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.gigs g where g.id = gig_id and g.host_user_id = auth.uid())
  );

-- Applications: applicants manage their own; hosts review on their gigs.
create policy "applicants read own applications"
  on public.applications for select
  to authenticated
  using (
    applicant_user_id = auth.uid()
    or exists (select 1 from public.gigs g where g.id = gig_id and g.host_user_id = auth.uid())
  );

create policy "applicants create own applications"
  on public.applications for insert
  to authenticated
  with check (applicant_user_id = auth.uid());

create policy "applicants withdraw own applications"
  on public.applications for update
  to authenticated
  using (applicant_user_id = auth.uid())
  with check (applicant_user_id = auth.uid() and status = 'withdrawn');

create policy "hosts review applications on own gigs"
  on public.applications for update
  to authenticated
  using (
    exists (select 1 from public.gigs g where g.id = gig_id and g.host_user_id = auth.uid())
  )
  with check (
    exists (select 1 from public.gigs g where g.id = gig_id and g.host_user_id = auth.uid())
    and status in ('pending', 'accepted', 'declined')
  );

grant usage on schema public to anon, authenticated;

grant select on public.profiles, public.gigs, public.gig_roles, public.gig_slots to anon, authenticated;
grant insert, update on public.profiles to authenticated;
grant insert, update on public.gigs to authenticated;
grant insert, update, delete on public.gig_roles, public.gig_slots to authenticated;
grant select, insert, update on public.applications to authenticated;
