import { NextResponse } from "next/server";
import { dataSource, ensureProfile, errorMessage, getSessionProfile, httpStatus } from "@/lib/data";

export async function GET() {
  try {
    const user = await getSessionProfile();
    return NextResponse.json({ data: user, meta: { source: dataSource() } });
  } catch (error) {
    return NextResponse.json({ data: null, meta: { source: dataSource() }, error: errorMessage(error) }, { status: httpStatus(error) });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as {
      displayName?: string;
      bio?: string;
      intent?: "need" | "help" | "both";
      phone?: string;
    };
    const user = await ensureProfile(body);
    return NextResponse.json({ data: user, meta: { source: dataSource() } });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
