import { NextResponse } from "next/server";
import { dataSource, errorMessage, httpStatus, listMyActivity } from "@/lib/data";

export async function GET() {
  try {
    const data = await listMyActivity();
    return NextResponse.json({ data, meta: { source: dataSource() } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error), meta: { source: dataSource() } }, { status: httpStatus(error) });
  }
}
