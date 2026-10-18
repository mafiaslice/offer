import { and, eq, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import {
  hashSessionToken,
  issueSessionCookieValue,
  readSessionCookie,
  SESSION_COOKIE,
  sessionCookieOptions,
  sessionLifetimeMs,
} from "@/lib/auth/cookie";
import { getDb } from "@/lib/db/client";
import { sessions, users } from "@/lib/db/schema";

export type AuthUser = { id: string; email: string };

export async function createSession(userId: string) {
  const expiresAt = new Date(Date.now() + sessionLifetimeMs());
  const issued = issueSessionCookieValue(expiresAt);
  await getDb().insert(sessions).values({
    userId,
    tokenHash: hashSessionToken(issued.token),
    expiresAt,
  });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, issued.value, sessionCookieOptions(expiresAt));
}

export async function destroySession() {
  const cookieStore = await cookies();
  const parsed = readSessionCookie(cookieStore.get(SESSION_COOKIE)?.value);
  if (parsed) {
    await getDb().delete(sessions).where(eq(sessions.tokenHash, hashSessionToken(parsed.token)));
  }
  cookieStore.set(SESSION_COOKIE, "", { ...sessionCookieOptions(new Date(0)), maxAge: 0 });
}

export async function getUserForSessionValue(value: string | undefined): Promise<AuthUser | null> {
  const parsed = readSessionCookie(value);
  if (!parsed) return null;
  const rows = await getDb()
    .select({ id: users.id, email: users.email })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.tokenHash, hashSessionToken(parsed.token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  return getUserForSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
}
