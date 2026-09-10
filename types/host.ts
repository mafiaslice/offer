import type { User } from "./user";

/**
 * Host is a capability on User — anyone signed in can post a Gig.
 * There is no separate Host account type or hosts table.
 */
export type Host = {
  id: User["id"];
  userId: User["id"];
  displayName: string;
  createdAt: string;
};
