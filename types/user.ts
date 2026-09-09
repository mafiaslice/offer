/**
 * A person on Offer. Host, Volunteer, and Participant are roles a user can take —
 * not separate products. Auth and profile fields are unresolved
 * (see docs/open-decisions.md).
 */
export type User = {
  id: string;
  displayName: string;
  createdAt: string;
};
