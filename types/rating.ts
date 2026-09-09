import type { Gig } from "./gig";
import type { User } from "./user";

/**
 * Trust signal after a Gig. Scale, visibility, and who may rate whom
 * are unresolved (see docs/open-decisions.md).
 */
export type Rating = {
  id: string;
  gigId: Gig["id"];
  fromUserId: User["id"];
  toUserId: User["id"];
  score: number;
  createdAt: string;
};
