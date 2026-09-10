/**
 * A person on Offer. Host, Volunteer, and Participant are roles a user can take —
 * not separate products. Host is a capability (anyone signed in can post a Gig).
 * Auth is Supabase email OTP / magic link; see docs/data-layer.md.
 */
export type User = {
  id: string;
  displayName: string;
  createdAt: string;
  phone?: string;
  avatarUrl?: string;
  bio?: string;
};
