import type { User } from "./user";

/**
 * In-app message body. Threading and audience (Host↔applicant vs group)
 * are unresolved. No messaging backend in this scaffold
 * (see docs/open-decisions.md).
 */
export type Message = {
  id: string;
  senderUserId: User["id"];
  body: string;
  createdAt: string;
};
