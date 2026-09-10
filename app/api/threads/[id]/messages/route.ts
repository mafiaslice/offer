import { NextResponse } from "next/server";
import { dataSource, errorMessage, httpStatus, listThreadMessages, sendThreadMessage } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await listThreadMessages(id);
    return NextResponse.json({ data: result.data, meta: { source: result.source } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error), meta: { source: dataSource() } }, { status: httpStatus(error) });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = (await request.json()) as { body?: string };
    if (!body.body?.trim()) {
      return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
    }
    const result = await sendThreadMessage(id, body.body);
    return NextResponse.json(
      { data: result.data, meta: { source: result.source, persisted: result.persisted } },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
