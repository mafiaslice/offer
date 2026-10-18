import { NextResponse } from "next/server";
import { safeNextPath } from "@/lib/auth";

/** Magic-link callbacks are no longer used. Send the visitor to email + password sign-in. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  return NextResponse.redirect(new URL(`/auth?next=${encodeURIComponent(next)}`, url.origin));
}
