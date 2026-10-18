#!/usr/bin/env node
/**
 * Apply db/migrations/*.sql in order. Safe to re-run.
 *
 *   npm run db:migrate
 *
 * Reads DATABASE_URL from the environment, then .env.local, then .env.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
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
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = postgres(url, {
  max: 1,
  prepare: false,
  onnotice: (notice) => {
    if (notice.code === "42P07") return;
    if (notice.message) console.log(notice.message);
  },
});
const dir = resolve(process.cwd(), "db/migrations");
const files = readdirSync(dir)
  .filter((file) => file.endsWith(".sql"))
  .sort();

await sql`create table if not exists public.schema_migrations (
  id text primary key,
  applied_at timestamptz not null default now()
)`;

for (const file of files) {
  const applied = await sql`select id from public.schema_migrations where id = ${file}`;
  if (applied.length > 0) {
    console.log(`skip ${file}`);
    continue;
  }
  const body = readFileSync(resolve(dir, file), "utf8");
  await sql.begin(async (tx) => {
    await tx.unsafe(body);
    await tx`insert into public.schema_migrations (id) values (${file})`;
  });
  console.log(`applied ${file}`);
}

await sql.end();
console.log("migrations complete");
