/** Server-only. True when Railway (or local) Postgres is configured. */
export function databaseUrl() {
  return process.env.DATABASE_URL?.trim() || undefined;
}

export function isDatabaseConfigured() {
  return Boolean(databaseUrl());
}
