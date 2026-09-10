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
    summary: "A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.",
    kind: "volunteer",
    category: "Events",
    location_label: "Ikoyi, Lagos",
    location_type: "in-person",
    starts_at: "2026-09-25T09:00:00+00:00",
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
    summary: "Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.",
    kind: "volunteer",
    category: "Community",
    location_label: "Yaba, Lagos",
    location_type: "in-person",
    starts_at: "2026-10-02T07:00:00+00:00",
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
    summary: "Join the on-ground crew helping a live festival run smoothly from doors open through close.",
    kind: "paid",
    category: "Events",
    location_label: "Victoria Island, Lagos",
    location_type: "in-person",
    starts_at: "2026-10-12T15:00:00+00:00",
    cover_tone: "night",
    status: "open",
    instructions: "Black trousers, plain black top, and comfortable closed shoes required.",
    incentive: "₦35,000 stipend with dinner included.",
  },
];

const { error: gigError } = await supabase.from("gigs").upsert(gigs, { onConflict: "slug" });
if (gigError) {
  console.error(gigError.message);
  process.exit(1);
}

const gigIds = [hangout, food, festival];
const { error: deleteRolesError } = await supabase.from("gig_roles").delete().in("gig_id", gigIds);
if (deleteRolesError) {
  console.error(deleteRolesError.message);
  process.exit(1);
}

const { error: roleError } = await supabase.from("gig_roles").insert([
  { gig_id: hangout, title: "Welcome guests and help people find their way", sort_order: 0 },
  { gig_id: hangout, title: "Support setup, icebreakers, and light coordination", sort_order: 1 },
  { gig_id: food, title: "Pack food parcels and label deliveries", sort_order: 0 },
  { gig_id: food, title: "Welcome families and keep the distribution line moving", sort_order: 1 },
  { gig_id: festival, title: "Guest check-in and wristband support", sort_order: 0 },
  { gig_id: festival, title: "Wayfinding and light event operations", sort_order: 1 },
]);
if (roleError) {
  console.error(roleError.message);
  process.exit(1);
}

const { error: deleteSlotsError } = await supabase.from("gig_slots").delete().in("gig_id", gigIds);
if (deleteSlotsError) {
  console.error(deleteSlotsError.message);
  process.exit(1);
}

const { error: slotError } = await supabase.from("gig_slots").insert([
  { gig_id: hangout, starts_at: "2026-09-25T09:00:00+00:00", capacity: 5 },
  { gig_id: food, starts_at: "2026-10-02T07:00:00+00:00", capacity: 12 },
  { gig_id: festival, starts_at: "2026-10-12T15:00:00+00:00", capacity: 8 },
]);
if (slotError) {
  console.error(slotError.message);
  process.exit(1);
}

console.log(`Demo gigs seeded for host ${host}.`);
