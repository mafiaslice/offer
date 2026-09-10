import type { Gig, GigRole, GigSlot } from "./gig";
import type { User } from "./user";

/**
 * Interest in a Gig / Role / Slot.
 * Hosts accept or decline; applicants may withdraw. Invite-only matching is still open.
 */
export type ApplicationStatus = "pending" | "accepted" | "declined" | "withdrawn";

export type Application = {
  id: string;
  gigId: Gig["id"];
  roleId?: GigRole["id"];
  slotId?: GigSlot["id"];
  applicantUserId: User["id"];
  status: ApplicationStatus;
  note?: string;
  createdAt: string;
};
