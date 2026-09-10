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

/** Short copy for `/auth?next=…` so signed-out CTAs never feel like a crash. */
export function authIntentCopy(next: string) {
  const path = safeNextPath(next);
  if (path.startsWith("/gigs/")) return "Sign in to join this gig or message the host. Identity verification is not required.";
  if (path === "/post" || path.startsWith("/post/")) return "Sign in to post a gig. Anyone with an account can host — Host is a capability, not a separate account.";
  if (path === "/my-gigs") return "Sign in to see gigs you host or joined, message people, and show a check-in QR.";
  if (path === "/messages" || path.startsWith("/messages")) return "Sign in to read and send Host↔applicant messages for a gig.";
  if (path.startsWith("/check-in/")) return "Sign in to check in for this gig.";
  if (path === "/profile") return "Sign in to save a display name on your profile.";
  return "Sign in to continue on Offer. Volunteer gigs come first; payments are not part of this walkthrough.";
}
