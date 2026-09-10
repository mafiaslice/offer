import type { Gig } from "./gig";
import type { User } from "./user";

/**
 * v1 is one 1:1 Host↔applicant thread per (gig, host, participant).
 * Group chat, email/SMS copies, and edit/delete are still open
 * (see docs/open-decisions.md).
 */
export type MessageThread = {
  id: string;
  gigId: Gig["id"];
  hostUserId: User["id"];
  participantUserId: User["id"];
  createdAt: string;
};

export type Message = {
  id: string;
  threadId: MessageThread["id"];
  senderUserId: User["id"];
  body: string;
  createdAt: string;
};
