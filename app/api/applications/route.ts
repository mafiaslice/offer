import { NextResponse } from "next/server";
import { applyToGig, errorMessage, httpStatus } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { gigSlug?: string; roleTitle?: string; note?: string };
    if (!body.gigSlug?.trim() || !body.roleTitle?.trim()) {
      return NextResponse.json({ error: "Gig and role are required." }, { status: 400 });
    }
    const result = await applyToGig({
      gigSlug: body.gigSlug,
      roleTitle: body.roleTitle,
      note: body.note,
    });
    return NextResponse.json(
      { data: result.application, meta: { source: result.source, persisted: result.persisted } },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
