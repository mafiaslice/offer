import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db/client";
import { isDatabaseConfigured } from "@/lib/db/env";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ ok: true, database: "not-configured" });
  }

  try {
    await getDb().execute(sql`select 1`);
  } catch {
    return NextResponse.json({ ok: false, database: "down" }, { status: 503 });
  }

  if (!process.env.AUTH_SECRET?.trim()) {
    return NextResponse.json({ ok: false, database: "ok", auth: "missing-secret" }, { status: 503 });
  }

  return NextResponse.json({ ok: true, database: "ok" });
}
