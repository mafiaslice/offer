import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { errorMessage, httpStatus } from "@/lib/data";

export const runtime = "nodejs";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
