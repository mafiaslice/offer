import { NextResponse } from "next/server";
import { safeNextPath, signInHref } from "@/lib/auth";
import { ensureProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const origin = url.origin;

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL(next, origin));
  }

  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type");
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error.message)}`, origin));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type: type as "email" | "magiclink" | "signup" | "invite" | "recovery" | "email_change",
      token_hash: tokenHash,
    });
    if (error) {
      return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error.message)}`, origin));
    }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const profile = await ensureProfile({});
    if (!profile?.displayName?.trim()) {
      return NextResponse.redirect(new URL(`${signInHref(next)}&step=profile`, origin));
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
