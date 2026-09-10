-- OPT-IN demo seed. Not a migration. Build and CI do not run this file.
--
-- Apply only when you want Discover fixtures in Postgres:
--   npm run seed:demo
--     (reads SUPABASE_SERVICE_ROLE_KEY from .env.local; never commit the key)
--   or, after you sign in once so a profiles row exists:
--     psql "$DATABASE_URL" -f scripts/seed-demo-gigs.sql
--
-- Uses the oldest profile as host. Re-running is idempotent on slug.
-- Roles, slots, and a fuller summary are included so gig detail feels real.

do $$
declare
  host uuid;
  hangout uuid := '11111111-1111-1111-1111-111111111111';
  food uuid := '22222222-2222-2222-2222-222222222222';
  festival uuid := '33333333-3333-3333-3333-333333333333';
  kitchen uuid := '44444444-4444-4444-4444-444444444444';
  mural uuid := '55555555-5555-5555-5555-555555555555';
  hangout_welcome uuid := '11111111-1111-1111-1111-111111111101';
  hangout_setup uuid := '11111111-1111-1111-1111-111111111102';
  food_pack uuid := '22222222-2222-2222-2222-222222222201';
  food_welcome uuid := '22222222-2222-2222-2222-222222222202';
  festival_door uuid := '33333333-3333-3333-3333-333333333301';
  festival_ops uuid := '33333333-3333-3333-3333-333333333302';
  kitchen_plate uuid := '44444444-4444-4444-4444-444444444401';
  kitchen_tables uuid := '44444444-4444-4444-4444-444444444402';
  mural_prime uuid := '55555555-5555-5555-5555-555555555501';
  mural_fill uuid := '55555555-5555-5555-5555-555555555502';
begin
  select id into host from public.profiles order by created_at asc limit 1;

  if host is null then
    raise notice 'No profiles yet. Sign in once, then re-run scripts/seed-demo-gigs.sql.';
    return;
  end if;

  insert into public.gigs (
    id, slug, host_user_id, title, summary, kind, category, location_label,
    location_type, starts_at, ends_at, cover_tone, status, instructions, incentive
  ) values
    (
      hangout,
      'hangout-with-slice',
      host,
      'Hangout with Slice',
      'A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.

Slice is opening the doors for an unhurried afternoon in Ikoyi. Volunteers keep the space warm: greet people by name, help them find a seat, and make sure nobody is hovering alone with a plate.

This is a volunteer gig. Come ready to talk, listen, and help the room feel like it belongs to everyone who showed up.',
      'volunteer',
      'Events',
      'Ikoyi, Lagos',
      'in-person',
      timestamptz '2026-09-25 10:00:00+01',
      timestamptz '2026-09-25 15:00:00+01',
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
      'Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.

Neighbourhood Hub runs a regular food drive for families nearby. Volunteers pack parcels in the morning, then keep the distribution line kind and clear when people arrive.

No special skills. Closed shoes, a calm voice, and a willingness to lift boxes are enough.',
      'volunteer',
      'Community',
      'Yaba, Lagos',
      'in-person',
      timestamptz '2026-10-02 08:00:00+01',
      timestamptz '2026-10-02 15:00:00+01',
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
      'Join the on-ground crew helping a live festival run smoothly from doors open through close.

Live Works needs extra hands for a one-night festival on Victoria Island. This is a paid gig: guest check-in, wristbands, and wayfinding until close.

Payment is agreed with the host in the incentive note. Offer does not take or hold funds.',
      'paid',
      'Events',
      'Victoria Island, Lagos',
      'in-person',
      timestamptz '2026-10-12 16:00:00+01',
      timestamptz '2026-10-13 00:00:00+01',
      'night',
      'open',
      'Black trousers, plain black top, and comfortable closed shoes required.',
      '₦35,000 stipend with dinner included.'
    ),
    (
      kitchen,
      'neighbourhood-kitchen',
      host,
      'Neighbourhood kitchen service',
      'Plate lunch, refill water, and keep a community kitchen feeling like a dining room.

Table & Co opens a community kitchen on Sundays. Volunteers plate lunch, keep water on the tables, and treat every guest like they booked a seat.

Hospitality here is volunteer work: no till, no tips, just a room that feels looked after.',
      'volunteer',
      'Hospitality',
      'Surulere, Lagos',
      'in-person',
      timestamptz '2026-10-18 11:00:00+01',
      timestamptz '2026-10-18 16:00:00+01',
      'sunset',
      'open',
      'Wear a plain dark top, closed shoes, and hair tied back. Arrive at 10:30 AM for a short briefing.',
      'A staff meal is served after the last sitting.'
    ),
    (
      mural,
      'community-mural',
      host,
      'Community mural day',
      'Prime a wall, pass paint, and help a neighbourhood mural go up in a single day.

Studio Yard is painting a mural with neighbours on a Yaba side street. Volunteers prime, tape, and fill colour — no portfolio required.

This is a volunteer project gig. The artists lead; you keep the wall moving and the street tidy.',
      'volunteer',
      'Projects',
      'Yaba, Lagos',
      'in-person',
      timestamptz '2026-11-01 09:00:00+01',
      timestamptz '2026-11-01 17:00:00+01',
      'night',
      'open',
      'Wear clothes you can paint in and closed shoes. Sunscreen if you have it. Meet at the corner shop at 8:45 AM.',
      'Lunch, water, and a spare set of gloves are provided.'
    )
  on conflict (slug) do update set
    title = excluded.title,
    summary = excluded.summary,
    kind = excluded.kind,
    category = excluded.category,
    location_label = excluded.location_label,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    cover_tone = excluded.cover_tone,
    instructions = excluded.instructions,
    incentive = excluded.incentive;

  delete from public.gig_slots where gig_id in (hangout, food, festival, kitchen, mural);
  delete from public.gig_roles where gig_id in (hangout, food, festival, kitchen, mural);

  insert into public.gig_roles (id, gig_id, title, description, capacity, sort_order) values
    (hangout_welcome, hangout, 'Welcome guests and help people find their way', 'Meet people at the door, help them feel at home, and point them to food and conversation.', 3, 0),
    (hangout_setup, hangout, 'Support setup, icebreakers, and light coordination', 'Set tables, run a simple icebreaker, and keep the afternoon moving without making it stiff.', 2, 1),
    (food_pack, food, 'Pack food parcels and label deliveries', 'Assemble parcels from the packing list and label them so the afternoon hand-off stays accurate.', 8, 0),
    (food_welcome, food, 'Welcome families and keep the distribution line moving', 'Greet families, check names against the list, and keep the line moving without rushing anyone.', 4, 1),
    (festival_door, festival, 'Guest check-in and wristband support', 'Check tickets, fit wristbands, and keep the door line honest and friendly.', 5, 0),
    (festival_ops, festival, 'Wayfinding and light event operations', 'Point people to stages, water, and exits. Help the crew close down after the last set.', 3, 1),
    (kitchen_plate, kitchen, 'Plate and serve lunch', 'Plate from the pass and walk dishes to tables with a short, kind hello.', 4, 0),
    (kitchen_tables, kitchen, 'Keep tables and water stations ready', 'Clear plates, refill water, and reset tables between sittings.', 2, 1),
    (mural_prime, mural, 'Prime and tape the wall', 'Roll primer, tape edges, and keep the scaffold area clear for the lead artists.', 6, 0),
    (mural_fill, mural, 'Fill colour and keep the street tidy', 'Fill marked sections, rinse brushes, and bag tape and cups so the street stays walkable.', 4, 1);

  insert into public.gig_slots (gig_id, role_id, starts_at, ends_at, capacity) values
    (hangout, null, timestamptz '2026-09-25 10:00:00+01', timestamptz '2026-09-25 15:00:00+01', 5),
    (food, food_pack, timestamptz '2026-10-02 08:00:00+01', timestamptz '2026-10-02 12:00:00+01', 8),
    (food, food_welcome, timestamptz '2026-10-02 12:00:00+01', timestamptz '2026-10-02 15:00:00+01', 4),
    (festival, null, timestamptz '2026-10-12 16:00:00+01', timestamptz '2026-10-13 00:00:00+01', 8),
    (kitchen, null, timestamptz '2026-10-18 11:00:00+01', timestamptz '2026-10-18 16:00:00+01', 6),
    (mural, null, timestamptz '2026-11-01 09:00:00+01', timestamptz '2026-11-01 17:00:00+01', 10);

  raise notice 'Demo gigs seeded for host %.', host;
end $$;
