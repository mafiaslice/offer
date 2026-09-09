import type { Gig, GigRole, GigSlot } from "./gig";
import type { User } from "./user";

/**
 * Interest in a Gig / Role / Slot. Status values are not finalized
 * (see docs/open-decisions.md).
 */
export type Application = {
  id: string;
  gigId: Gig["id"];
  roleId?: GigRole["id"];
  slotId?: GigSlot["id"];
  applicantUserId: User["id"];
  status: string;
  createdAt: string;
};
