import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isProtectedPage, signInHref } from "@/lib/auth";
import { readSessionCookie, SESSION_COOKIE } from "@/lib/auth/cookie";
import { isDatabaseConfigured } from "@/lib/db/env";

/**
 * Optimistic session gate for protected pages.
 * The cookie signature is checked here. Database ownership checks stay in the data layer.
 */
export async function proxy(request: NextRequest) {
  if (!isDatabaseConfigured()) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (!isProtectedPage(pathname)) return NextResponse.next();

  const session = readSessionCookie(request.cookies.get(SESSION_COOKIE)?.value);
  if (session) return NextResponse.next();

  const next = `${pathname}${search}`;
  return NextResponse.redirect(new URL(signInHref(next), request.url));
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
