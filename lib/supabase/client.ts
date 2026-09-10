import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

export function createClient() {
  const url = supabaseUrl();
  const key = supabaseAnonKey();
  if (!url || !key) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }
  return createBrowserClient<Database>(url, key);
}
