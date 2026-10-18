#!/usr/bin/env node
/**
 * Opt-in starter gigs. Not used by build or pre-deploy.
 *
 *   npm run seed:demo
 *
 * Uses the oldest profile as host. If none exists, creates a seed host.
 * Set SEED_HOST_EMAIL and SEED_HOST_PASSWORD to choose that account.
 * A generated password is printed once and is not stored in the repo.
 */
import { randomBytes } from "node:crypto";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import bcrypt from "bcryptjs";
import postgres from "postgres";

function loadLocalEnv() {
  if (process.env.DATABASE_URL?.trim()) return;
  for (const name of [".env.local", ".env"]) {
    const path = resolve(process.cwd(), name);
    if (!existsSync(path) || typeof process.loadEnvFile !== "function") continue;
    process.loadEnvFile(path);
    if (process.env.DATABASE_URL?.trim()) return;
  }
}

loadLocalEnv();

const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error("DATABASE_URL is not set. Apply migrations first: npm run db:migrate");
  process.exit(1);
}

const sql = postgres(url, {
  max: 1,
  prepare: false,
  onnotice: (notice) => {
    if (notice.message) console.log(notice.message);
  },
});

const existing = await sql`select id from public.profiles order by created_at asc limit 1`;
if (existing.length === 0) {
  const email = (process.env.SEED_HOST_EMAIL?.trim() || "seed-host@offer.local").toLowerCase();
  const provided = process.env.SEED_HOST_PASSWORD?.trim();
  const password = provided || randomBytes(18).toString("base64url");
  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await sql`
    insert into public.users (email, password_hash)
    values (${email}, ${passwordHash})
    on conflict (email) do update set email = public.users.email
    returning id
  `;
  await sql`
    insert into public.profiles (id, display_name, intent)
    values (${user.id}, 'Offer Seed Host', 'both')
    on conflict (id) do nothing
  `;
  console.log(`Created seed host ${email}.`);
  if (!provided) {
    console.log(`SEED_HOST_PASSWORD was unset. One-time password: ${password}`);
  }
}

const seedPath = resolve(process.cwd(), "scripts/seed-demo-gigs.sql");
await sql.file(seedPath);
await sql.end();
console.log("Starter gigs seeded.");
