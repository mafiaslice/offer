import { redirect } from "next/navigation";
import { signInHref } from "@/lib/auth";
import { getSessionProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/env";

/** When Supabase is configured, send unsigned visitors to `/auth`. Demo adapter stays open. */
export async function redirectUnsignedToAuth(nextPath: string) {
  if (!isSupabaseConfigured()) return;
  const user = await getSessionProfile();
  if (!user) redirect(signInHref(nextPath));
}
