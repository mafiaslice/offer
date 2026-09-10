import { NextResponse } from "next/server";
import { checkIn, dataSource, errorMessage, getCheckInContext, httpStatus } from "@/lib/data";

function parseInput(url: URL, body?: { token?: string; gigSlug?: string; userId?: string; slotId?: string }) {
  return {
    token: body?.token?.trim() || url.searchParams.get("token")?.trim() || undefined,
    gigSlug: body?.gigSlug?.trim() || url.searchParams.get("gigSlug")?.trim() || undefined,
    userId: body?.userId?.trim() || undefined,
    slotId: body?.slotId?.trim() || url.searchParams.get("slot")?.trim() || undefined,
  };
}

export async function GET(request: Request) {
  try {
    const input = parseInput(new URL(request.url));
    if (!input.token && !input.gigSlug) {
      return NextResponse.json({ error: "Gig or check-in code is required." }, { status: 400 });
    }
    const result = await getCheckInContext(input);
    return NextResponse.json({ data: result.data, meta: { source: result.source } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error), meta: { source: dataSource() } }, { status: httpStatus(error) });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; gigSlug?: string; userId?: string; slotId?: string };
    const input = parseInput(new URL(request.url), body);
    if (!input.token && !input.gigSlug) {
      return NextResponse.json({ error: "Gig or check-in code is required." }, { status: 400 });
    }
    const result = await checkIn(input);
    return NextResponse.json({ data: result.data, meta: { source: result.source, persisted: result.persisted } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
