import { NextResponse } from "next/server";
import { errorMessage, httpStatus, reviewApplication } from "@/lib/data";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    if (body.status !== "accepted" && body.status !== "declined" && body.status !== "withdrawn") {
      return NextResponse.json({ error: "Status must be accepted, declined, or withdrawn." }, { status: 400 });
    }
    const result = await reviewApplication(id, body.status);
    return NextResponse.json({ data: result, meta: { source: result.source, persisted: result.persisted } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
