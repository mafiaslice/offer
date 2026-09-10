import { NextResponse } from "next/server";
import { createGig, dataSource, errorMessage, httpStatus, listGigs } from "@/lib/data";
import type { CreateGigInput } from "@/lib/data/types";

export async function GET(request: Request) {
  const url = new URL(request.url);
  try {
    const result = await listGigs({
      query: url.searchParams.get("q") ?? undefined,
      category: url.searchParams.get("category") ?? undefined,
      kind: url.searchParams.get("kind") ?? undefined,
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { data: [], meta: { total: 0, source: dataSource() }, error: errorMessage(error) },
      { status: httpStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CreateGigInput>;
    if (!body.title?.trim() || !body.summary?.trim() || !body.date || !body.startTime || !body.locationLabel?.trim()) {
      return NextResponse.json({ error: "Title, summary, place, date, and start time are required." }, { status: 400 });
    }

    const result = await createGig({
      title: body.title,
      summary: body.summary,
      kind: body.kind === "paid" ? "paid" : "volunteer",
      category: body.category ?? "Events",
      locationLabel: body.locationLabel,
      locationType: body.locationType === "remote" ? "remote" : "in-person",
      date: body.date,
      startTime: body.startTime,
      slotCount: Math.max(1, Number(body.slotCount) || 1),
      roles: Array.isArray(body.roles) ? body.roles : [],
      incentive: body.incentive,
      instructions: body.instructions,
    });

    return NextResponse.json({ data: result.gig, meta: { source: result.source, persisted: result.persisted } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
