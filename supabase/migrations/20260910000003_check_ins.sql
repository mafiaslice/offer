-- v1 attendance: one CheckIn per (gig, user) with optional Slot.
-- QR identifies the Gig; auth + accepted application (or Host on behalf) authorizes the write.
-- Per-application tokens, geofence, and ratings-from-attendance are still open (docs/open-decisions.md).

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

alter table public.check_ins enable row level security;

create policy "hosts read check-ins on own gigs"
  on public.check_ins for select
  to authenticated
  using (
    exists (
      select 1 from public.gigs g
      where g.id = gig_id and g.host_user_id = auth.uid()
    )
  );

create policy "participants read own check-ins"
  on public.check_ins for select
  to authenticated
  using (user_id = auth.uid());

create policy "hosts insert check-ins on own gigs"
  on public.check_ins for insert
  to authenticated
  with check (
    exists (
      select 1 from public.gigs g
      where g.id = gig_id and g.host_user_id = auth.uid()
    )
    and exists (
      select 1 from public.applications a
      where a.gig_id = gig_id
        and a.applicant_user_id = user_id
        and a.status = 'accepted'
    )
  );

create policy "accepted participants insert own check-ins"
  on public.check_ins for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1 from public.applications a
      where a.gig_id = gig_id
        and a.applicant_user_id = auth.uid()
        and a.status = 'accepted'
    )
  );

create policy "hosts update check-ins on own gigs"
  on public.check_ins for update
  to authenticated
  using (
    exists (
      select 1 from public.gigs g
      where g.id = gig_id and g.host_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.gigs g
      where g.id = gig_id and g.host_user_id = auth.uid()
    )
  );

create policy "participants update own check-ins"
  on public.check_ins for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.check_ins to authenticated;
