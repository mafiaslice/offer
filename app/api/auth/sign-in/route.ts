import { NextResponse } from "next/server";
import { signIn } from "@/lib/auth/accounts";
import { errorMessage, httpStatus } from "@/lib/data";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string; password?: string };
    const result = await signIn({ email: body.email ?? "", password: body.password ?? "" });
    return NextResponse.json({ data: result.profile, needsProfile: result.needsProfile });
  } catch (error) {
    return NextResponse.json({ error: errorMessage(error) }, { status: httpStatus(error) });
  }
}
