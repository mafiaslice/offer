import { NextResponse } from "next/server";
import { checkOut, errorMessage, httpStatus } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; gigSlug?: string; userId?: string; slotId?: string };
    if (!body.token?.trim() && !body.gigSlug?.trim()) {
      return NextResponse.json({ error: "Gig or check-in code is required." }, { status: 400 });
    }
    const result = await checkOut({
      token: body.token,
      gigSlug: body.gigSlug,
      userId: body.userId,
      slotId: body.slotId,
    });
    return NextResponse.json({ data: result.data, meta: { source: result.source, persisted: result.persisted } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
