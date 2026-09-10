-- Host↔applicant 1:1 threads: one row per (gig_id, host_user_id, participant_user_id).
-- Group chat, email/SMS copies, and presence are still open (docs/open-decisions.md).

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
security definer
set search_path = public
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

alter table public.message_threads enable row level security;
alter table public.messages enable row level security;

-- Applicants keep gig titles after a gig leaves `open` (My Gigs + threads).
create policy "applicants read gigs they applied to"
  on public.gigs for select
  to authenticated
  using (
    exists (
      select 1 from public.applications a
      where a.gig_id = id and a.applicant_user_id = auth.uid()
    )
  );

create policy "thread participants read threads"
  on public.message_threads for select
  to authenticated
  using (
    host_user_id = auth.uid()
    or participant_user_id = auth.uid()
    or exists (
      select 1 from public.gigs g
      where g.id = gig_id and g.host_user_id = auth.uid()
    )
  );

create policy "participants create gig threads"
  on public.message_threads for insert
  to authenticated
  with check (
    (host_user_id = auth.uid() or participant_user_id = auth.uid())
    and host_user_id <> participant_user_id
    and exists (
      select 1 from public.gigs g
      where g.id = gig_id and g.host_user_id = host_user_id
    )
    and exists (
      select 1 from public.applications a
      where a.gig_id = gig_id
        and a.applicant_user_id = participant_user_id
        and a.status <> 'withdrawn'
    )
  );

create policy "participants update own threads"
  on public.message_threads for update
  to authenticated
  using (host_user_id = auth.uid() or participant_user_id = auth.uid())
  with check (host_user_id = auth.uid() or participant_user_id = auth.uid());

create policy "thread participants read messages"
  on public.messages for select
  to authenticated
  using (
    exists (
      select 1 from public.message_threads t
      where t.id = thread_id
        and (
          t.host_user_id = auth.uid()
          or t.participant_user_id = auth.uid()
          or exists (
            select 1 from public.gigs g
            where g.id = t.gig_id and g.host_user_id = auth.uid()
          )
        )
    )
  );

create policy "thread participants send messages"
  on public.messages for insert
  to authenticated
  with check (
    sender_user_id = auth.uid()
    and exists (
      select 1 from public.message_threads t
      where t.id = thread_id
        and (t.host_user_id = auth.uid() or t.participant_user_id = auth.uid())
    )
  );

grant select, insert, update on public.message_threads to authenticated;
grant select, insert on public.messages to authenticated;
