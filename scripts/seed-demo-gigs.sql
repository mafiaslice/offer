-- OPT-IN demo seed. Not a migration. Build and CI do not run this file.
--
-- Apply only when you want the three Discover fixtures in Postgres:
--   npm run seed:demo
--     (reads SUPABASE_SERVICE_ROLE_KEY from .env.local; never commit the key)
--   or, after you sign in once so a profiles row exists:
--     psql "$DATABASE_URL" -f scripts/seed-demo-gigs.sql
--
-- Uses the oldest profile as host. Re-running is idempotent on slug.

do $$
declare
  host uuid;
  hangout uuid := '11111111-1111-1111-1111-111111111111';
  food uuid := '22222222-2222-2222-2222-222222222222';
  festival uuid := '33333333-3333-3333-3333-333333333333';
begin
  select id into host from public.profiles order by created_at asc limit 1;

  if host is null then
    raise notice 'No profiles yet. Sign in once, then re-run scripts/seed-demo-gigs.sql.';
    return;
  end if;

  insert into public.gigs (
    id, slug, host_user_id, title, summary, kind, category, location_label,
    location_type, starts_at, cover_tone, status, instructions, incentive
  ) values
    (
      hangout,
      'hangout-with-slice',
      host,
      'Hangout with Slice',
      'A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.',
      'volunteer',
      'Events',
      'Ikoyi, Lagos',
      'in-person',
      timestamptz '2026-09-25 10:00:00+01',
      'sunset',
      'open',
      'Come dressed in black or white, wear comfortable shoes, and arrive 30 minutes early for briefing.',
      'Transport support is available for every volunteer.'
    ),
    (
      food,
      'community-food-drive',
      host,
      'Community food drive',
      'Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.',
      'volunteer',
      'Community',
      'Yaba, Lagos',
      'in-person',
      timestamptz '2026-10-02 08:00:00+01',
      'mint',
      'open',
      'Wear a comfortable top, closed shoes, and be ready to work on your feet.',
      'Breakfast and transport support are provided.'
    ),
    (
      festival,
      'festival-crew',
      host,
      'Festival crew wanted',
      'Join the on-ground crew helping a live festival run smoothly from doors open through close.',
      'paid',
      'Events',
      'Victoria Island, Lagos',
      'in-person',
      timestamptz '2026-10-12 16:00:00+01',
      'night',
      'open',
      'Black trousers, plain black top, and comfortable closed shoes required.',
      '₦35,000 stipend with dinner included.'
    )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    kind = excluded.kind,
    category = excluded.category,
    location_label = excluded.location_label,
    starts_at = excluded.starts_at,
    cover_tone = excluded.cover_tone,
    instructions = excluded.instructions,
    incentive = excluded.incentive;

  delete from public.gig_roles where gig_id in (hangout, food, festival);

  insert into public.gig_roles (gig_id, title, sort_order) values
    (hangout, 'Welcome guests and help people find their way', 0),
    (hangout, 'Support setup, icebreakers, and light coordination', 1),
    (food, 'Pack food parcels and label deliveries', 0),
    (food, 'Welcome families and keep the distribution line moving', 1),
    (festival, 'Guest check-in and wristband support', 0),
    (festival, 'Wayfinding and light event operations', 1);

  delete from public.gig_slots where gig_id in (hangout, food, festival);

  insert into public.gig_slots (gig_id, starts_at, capacity) values
    (hangout, timestamptz '2026-09-25 10:00:00+01', 5),
    (food, timestamptz '2026-10-02 08:00:00+01', 12),
    (festival, timestamptz '2026-10-12 16:00:00+01', 8);

  raise notice 'Demo gigs seeded for host %.', host;
end $$;
