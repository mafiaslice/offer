import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { databaseUrl } from "@/lib/db/env";
import * as schema from "@/lib/db/schema";

type Database = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as { offerSql?: ReturnType<typeof postgres>; offerDb?: Database };

function sqlClient() {
  const url = databaseUrl();
  if (!url) {
    throw new Error("DATABASE_URL is not set.");
  }
  if (!globalForDb.offerSql) {
    globalForDb.offerSql = postgres(url, {
      max: 10,
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    });
  }
  return globalForDb.offerSql;
}

export function getDb() {
  if (!globalForDb.offerDb) {
    globalForDb.offerDb = drizzle(sqlClient(), { schema });
  }
  return globalForDb.offerDb;
}
