export function supabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || undefined;
}

export function supabaseAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || undefined;
}

/** True when public Supabase credentials are present. Build/CI stay on the demo adapter without them. */
export function isSupabaseConfigured() {
  return Boolean(supabaseUrl() && supabaseAnonKey());
}

/** Phone OTP needs Twilio on the Supabase project. Off unless explicitly enabled. */
export function isSmsAuthEnabled() {
  return process.env.NEXT_PUBLIC_SUPABASE_SMS_AUTH === "true";
}
