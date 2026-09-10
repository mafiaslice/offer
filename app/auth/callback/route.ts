import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/discover";
  return value;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
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
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
    if (!profile) {
      await supabase.from("profiles").upsert({
        id: user.id,
        display_name: user.user_metadata?.display_name ?? user.email?.split("@")[0] ?? "",
        phone: user.phone ?? null,
      });
    } else if (!profile.display_name?.trim()) {
      return NextResponse.redirect(new URL(`/auth?step=profile&next=${encodeURIComponent(next)}`, origin));
    }
  }

  return NextResponse.redirect(new URL(next, origin));
}
