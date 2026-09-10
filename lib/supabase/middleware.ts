import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProtectedPage, signInHref } from "@/lib/auth";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/env";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach(({ name, value }) => {
    to.cookies.set(name, value);
  });
  return to;
}

/**
 * Refresh the Supabase auth cookies on each request.
 * Next.js 16 calls this from `proxy.ts` (the `middleware.ts` convention is deprecated).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!isSupabaseConfigured()) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl()!, supabaseAnonKey()!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
        Object.entries(headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });
      },
    },
  });

  // Validates the JWT (do not use getSession() here).
  const { data } = await supabase.auth.getClaims();
  const signedIn = Boolean(data?.claims);
  const pathname = request.nextUrl.pathname;

  if (!signedIn && isProtectedPage(pathname)) {
    const next = `${pathname}${request.nextUrl.search}`;
    const redirectResponse = NextResponse.redirect(new URL(signInHref(next), request.url));
    return copyCookies(response, redirectResponse);
  }

  return response;
}
