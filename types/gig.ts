import type { User } from "./user";

/**
 * Volunteer is the primary gig kind. Paid gigs are secondary.
 * Whether a single Gig can mix kinds across Roles is unresolved
 * (see docs/open-decisions.md).
 */
export type GigKind = "volunteer" | "paid";

/**
 * A Gig is the unit of work on Offer — not an "offer" or a "task".
 * v1 create publishes as `open` so the gig is discoverable. Other
 * lifecycle values exist in the schema but are not a product spec.
 */
export type Gig = {
  id: string;
  hostId: User["id"];
  title: string;
  summary: string;
  kind: GigKind;
  coverImageUrl?: string;
  locationLabel?: string;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
};

/**
 * A named part on a Gig (what someone would do).
 */
export type GigRole = {
  id: string;
  gigId: Gig["id"];
  title: string;
  description?: string;
  capacity?: number;
};

/**
 * An available time/capacity window. Whether a Slot must belong to a Role
 * is unresolved (see docs/open-decisions.md).
 */
export type GigSlot = {
  id: string;
  gigId: Gig["id"];
  roleId?: GigRole["id"];
  startsAt: string;
  endsAt?: string;
  capacity?: number;
};
