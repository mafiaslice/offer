#!/usr/bin/env node
/**
 * Opt-in demo seed. Not used by build/CI.
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY from the environment only — never hard-code it.
 * The Next.js app does not read this key (anon + RLS).
 *
 *   npm run seed:demo
 *
 * Without the service role key, run the SQL instead:
 *   psql "$DATABASE_URL" -f scripts/seed-demo-gigs.sql
 */
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath) && typeof process.loadEnvFile === "function") {
  process.loadEnvFile(envPath);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

const SQL_HINT = `Missing NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY.

The app never uses the service role. This script reads it from env only (optional).
Do not commit .env.local or the key.

Option A — add both to .env.local, then:
  npm run seed:demo

Option B — SQL editor / psql (no service role):
  1. Sign in once so a profiles row exists
  2. psql "$DATABASE_URL" -f scripts/seed-demo-gigs.sql
`;

if (!url || !serviceKey) {
  console.error(SQL_HINT);
  process.exit(1);
}

const hangout = "11111111-1111-1111-1111-111111111111";
const food = "22222222-2222-2222-2222-222222222222";
const festival = "33333333-3333-3333-3333-333333333333";
const kitchen = "44444444-4444-4444-4444-444444444444";
const mural = "55555555-5555-5555-5555-555555555555";
const hangoutWelcome = "11111111-1111-1111-1111-111111111101";
const hangoutSetup = "11111111-1111-1111-1111-111111111102";
const foodPack = "22222222-2222-2222-2222-222222222201";
const foodWelcome = "22222222-2222-2222-2222-222222222202";
const festivalDoor = "33333333-3333-3333-3333-333333333301";
const festivalOps = "33333333-3333-3333-3333-333333333302";
const kitchenPlate = "44444444-4444-4444-4444-444444444401";
const kitchenTables = "44444444-4444-4444-4444-444444444402";
const muralPrime = "55555555-5555-5555-5555-555555555501";
const muralFill = "55555555-5555-5555-5555-555555555502";

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: profiles, error: profileError } = await supabase
  .from("profiles")
  .select("id")
  .order("created_at", { ascending: true })
  .limit(1);

if (profileError) {
  console.error(profileError.message);
  process.exit(1);
}

const host = profiles?.[0]?.id;
if (!host) {
  console.error("No profiles yet. Sign in once at /auth, then re-run npm run seed:demo.");
  process.exit(1);
}

const gigs = [
  {
    id: hangout,
    slug: "hangout-with-slice",
    host_user_id: host,
    title: "Hangout with Slice",
    summary:
      "A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.\n\nSlice is opening the doors for an unhurried afternoon in Ikoyi. Volunteers keep the space warm: greet people by name, help them find a seat, and make sure nobody is hovering alone with a plate.\n\nThis is a volunteer gig. Come ready to talk, listen, and help the room feel like it belongs to everyone who showed up.",
    kind: "volunteer",
    category: "Events",
    location_label: "Ikoyi, Lagos",
    location_type: "in-person",
    starts_at: "2026-09-25T09:00:00+00:00",
    ends_at: "2026-09-25T14:00:00+00:00",
    cover_tone: "sunset",
    status: "open",
    instructions: "Come dressed in black or white, wear comfortable shoes, and arrive 30 minutes early for briefing.",
    incentive: "Transport support is available for every volunteer.",
  },
  {
    id: food,
    slug: "community-food-drive",
    host_user_id: host,
    title: "Community food drive",
    summary:
      "Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.\n\nNeighbourhood Hub runs a regular food drive for families nearby. Volunteers pack parcels in the morning, then keep the distribution line kind and clear when people arrive.\n\nNo special skills. Closed shoes, a calm voice, and a willingness to lift boxes are enough.",
    kind: "volunteer",
    category: "Community",
    location_label: "Yaba, Lagos",
    location_type: "in-person",
    starts_at: "2026-10-02T07:00:00+00:00",
    ends_at: "2026-10-02T14:00:00+00:00",
    cover_tone: "mint",
    status: "open",
    instructions: "Wear a comfortable top, closed shoes, and be ready to work on your feet.",
    incentive: "Breakfast and transport support are provided.",
  },
  {
    id: festival,
    slug: "festival-crew",
    host_user_id: host,
    title: "Festival crew wanted",
    summary:
      "Join the on-ground crew helping a live festival run smoothly from doors open through close.\n\nLive Works needs extra hands for a one-night festival on Victoria Island. This is a paid gig: guest check-in, wristbands, and wayfinding until close.\n\nPayment is agreed with the host in the incentive note. Offer does not take or hold funds.",
    kind: "paid",
    category: "Events",
    location_label: "Victoria Island, Lagos",
    location_type: "in-person",
    starts_at: "2026-10-12T15:00:00+00:00",
    ends_at: "2026-10-12T23:00:00+00:00",
    cover_tone: "night",
    status: "open",
    instructions: "Black trousers, plain black top, and comfortable closed shoes required.",
    incentive: "₦35,000 stipend with dinner included.",
  },
  {
    id: kitchen,
    slug: "neighbourhood-kitchen",
    host_user_id: host,
    title: "Neighbourhood kitchen service",
    summary:
      "Plate lunch, refill water, and keep a community kitchen feeling like a dining room.\n\nTable & Co opens a community kitchen on Sundays. Volunteers plate lunch, keep water on the tables, and treat every guest like they booked a seat.\n\nHospitality here is volunteer work: no till, no tips, just a room that feels looked after.",
    kind: "volunteer",
    category: "Hospitality",
    location_label: "Surulere, Lagos",
    location_type: "in-person",
    starts_at: "2026-10-18T10:00:00+00:00",
    ends_at: "2026-10-18T15:00:00+00:00",
    cover_tone: "sunset",
    status: "open",
    instructions: "Wear a plain dark top, closed shoes, and hair tied back. Arrive at 10:30 AM for a short briefing.",
    incentive: "A staff meal is served after the last sitting.",
  },
  {
    id: mural,
    slug: "community-mural",
    host_user_id: host,
    title: "Community mural day",
    summary:
      "Prime a wall, pass paint, and help a neighbourhood mural go up in a single day.\n\nStudio Yard is painting a mural with neighbours on a Yaba side street. Volunteers prime, tape, and fill colour — no portfolio required.\n\nThis is a volunteer project gig. The artists lead; you keep the wall moving and the street tidy.",
    kind: "volunteer",
    category: "Projects",
    location_label: "Yaba, Lagos",
    location_type: "in-person",
    starts_at: "2026-11-01T08:00:00+00:00",
    ends_at: "2026-11-01T16:00:00+00:00",
    cover_tone: "night",
    status: "open",
    instructions: "Wear clothes you can paint in and closed shoes. Sunscreen if you have it. Meet at the corner shop at 8:45 AM.",
    incentive: "Lunch, water, and a spare set of gloves are provided.",
  },
];

const { error: gigError } = await supabase.from("gigs").upsert(gigs, { onConflict: "slug" });
if (gigError) {
  console.error(gigError.message);
  process.exit(1);
}

const gigIds = [hangout, food, festival, kitchen, mural];
const { error: deleteSlotsError } = await supabase.from("gig_slots").delete().in("gig_id", gigIds);
if (deleteSlotsError) {
  console.error(deleteSlotsError.message);
  process.exit(1);
}

const { error: deleteRolesError } = await supabase.from("gig_roles").delete().in("gig_id", gigIds);
if (deleteRolesError) {
  console.error(deleteRolesError.message);
  process.exit(1);
}

const { error: roleError } = await supabase.from("gig_roles").insert([
  { id: hangoutWelcome, gig_id: hangout, title: "Welcome guests and help people find their way", description: "Meet people at the door, help them feel at home, and point them to food and conversation.", capacity: 3, sort_order: 0 },
  { id: hangoutSetup, gig_id: hangout, title: "Support setup, icebreakers, and light coordination", description: "Set tables, run a simple icebreaker, and keep the afternoon moving without making it stiff.", capacity: 2, sort_order: 1 },
  { id: foodPack, gig_id: food, title: "Pack food parcels and label deliveries", description: "Assemble parcels from the packing list and label them so the afternoon hand-off stays accurate.", capacity: 8, sort_order: 0 },
  { id: foodWelcome, gig_id: food, title: "Welcome families and keep the distribution line moving", description: "Greet families, check names against the list, and keep the line moving without rushing anyone.", capacity: 4, sort_order: 1 },
  { id: festivalDoor, gig_id: festival, title: "Guest check-in and wristband support", description: "Check tickets, fit wristbands, and keep the door line honest and friendly.", capacity: 5, sort_order: 0 },
  { id: festivalOps, gig_id: festival, title: "Wayfinding and light event operations", description: "Point people to stages, water, and exits. Help the crew close down after the last set.", capacity: 3, sort_order: 1 },
  { id: kitchenPlate, gig_id: kitchen, title: "Plate and serve lunch", description: "Plate from the pass and walk dishes to tables with a short, kind hello.", capacity: 4, sort_order: 0 },
  { id: kitchenTables, gig_id: kitchen, title: "Keep tables and water stations ready", description: "Clear plates, refill water, and reset tables between sittings.", capacity: 2, sort_order: 1 },
  { id: muralPrime, gig_id: mural, title: "Prime and tape the wall", description: "Roll primer, tape edges, and keep the scaffold area clear for the lead artists.", capacity: 6, sort_order: 0 },
  { id: muralFill, gig_id: mural, title: "Fill colour and keep the street tidy", description: "Fill marked sections, rinse brushes, and bag tape and cups so the street stays walkable.", capacity: 4, sort_order: 1 },
]);
if (roleError) {
  console.error(roleError.message);
  process.exit(1);
}

const { error: slotError } = await supabase.from("gig_slots").insert([
  { gig_id: hangout, starts_at: "2026-09-25T09:00:00+00:00", ends_at: "2026-09-25T14:00:00+00:00", capacity: 5 },
  { gig_id: food, role_id: foodPack, starts_at: "2026-10-02T07:00:00+00:00", ends_at: "2026-10-02T11:00:00+00:00", capacity: 8 },
  { gig_id: food, role_id: foodWelcome, starts_at: "2026-10-02T11:00:00+00:00", ends_at: "2026-10-02T14:00:00+00:00", capacity: 4 },
  { gig_id: festival, starts_at: "2026-10-12T15:00:00+00:00", ends_at: "2026-10-12T23:00:00+00:00", capacity: 8 },
  { gig_id: kitchen, starts_at: "2026-10-18T10:00:00+00:00", ends_at: "2026-10-18T15:00:00+00:00", capacity: 6 },
  { gig_id: mural, starts_at: "2026-11-01T08:00:00+00:00", ends_at: "2026-11-01T16:00:00+00:00", capacity: 10 },
]);
if (slotError) {
  console.error(slotError.message);
  process.exit(1);
}

console.log(`Demo gigs seeded for host ${host}.`);
