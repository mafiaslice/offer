/** Shared auth path helpers. Safe to import from proxy and the App Router. */

export const AUTH_PATH = "/auth";

export function isProtectedPage(pathname: string) {
  return pathname === "/post" || pathname.startsWith("/post/") || pathname.startsWith("/check-in/");
}

export function safeNextPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/discover";
  return value;
}

export function signInHref(next: string) {
  return `${AUTH_PATH}?next=${encodeURIComponent(safeNextPath(next))}`;
}
