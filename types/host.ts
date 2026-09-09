import type { User } from "./user";

/**
 * The person or group who creates a Gig and defines Roles and Slots.
 * Whether Host is a distinct account type is unresolved
 * (see docs/open-decisions.md).
 */
export type Host = {
  id: string;
  userId: User["id"];
  displayName: string;
  createdAt: string;
};
