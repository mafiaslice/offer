import { redirect } from "next/navigation";
import { signInHref } from "@/lib/auth";
import { getSessionProfile } from "@/lib/data";
import { isDatabaseConfigured } from "@/lib/db/env";

/** When Postgres is configured, send unsigned visitors to `/auth`. Demo adapter stays open. */
export async function redirectUnsignedToAuth(nextPath: string) {
  if (!isDatabaseConfigured()) return;
  const user = await getSessionProfile();
  if (!user) redirect(signInHref(nextPath));
}
