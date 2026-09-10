import type { Gig, GigSlot } from "./gig";
import type { User } from "./user";

/**
 * Record that someone showed up on a Gig.
 * v1 is one row per (gig, user) with optional Slot. QR / self-check
 * behavior is documented in docs/open-decisions.md.
 */
export type CheckIn = {
  id: string;
  gigId: Gig["id"];
  slotId?: GigSlot["id"];
  userId: User["id"];
  checkedInAt: string;
  checkedOutAt?: string;
};
