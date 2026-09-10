import { NextResponse } from "next/server";
import { dataSource, errorMessage, getGigBySlug, httpStatus } from "@/lib/data";

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const gig = await getGigBySlug(slug);
    if (!gig) {
      return NextResponse.json({ error: "Gig not found.", meta: { source: dataSource() } }, { status: 404 });
    }
    return NextResponse.json({ data: gig, meta: { source: dataSource() } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error), meta: { source: dataSource() } }, { status: httpStatus(error) });
  }
}
