import type { Gig, GigSlot } from "./gig";
import type { User } from "./user";

/**
 * Record that someone showed up. Check-in method (including QR) is not
 * implemented (see docs/open-decisions.md).
 */
export type CheckIn = {
  id: string;
  gigId: Gig["id"];
  slotId?: GigSlot["id"];
  userId: User["id"];
  checkedInAt: string;
};
