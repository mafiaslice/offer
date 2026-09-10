import { NextResponse } from "next/server";
import { dataSource, ensureThread, errorMessage, httpStatus, listInbox } from "@/lib/data";

export async function GET() {
  try {
    const result = await listInbox();
    return NextResponse.json({ data: result.data, meta: { source: result.source } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error), meta: { source: dataSource() } }, { status: httpStatus(error) });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { applicationId?: string; gigSlug?: string };
    if (!body.applicationId?.trim() && !body.gigSlug?.trim()) {
      return NextResponse.json({ error: "Choose a gig or application to message." }, { status: 400 });
    }
    const result = await ensureThread({
      applicationId: body.applicationId,
      gigSlug: body.gigSlug,
    });
    return NextResponse.json(
      { data: result.data, meta: { source: result.source, persisted: result.persisted, created: result.created } },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
