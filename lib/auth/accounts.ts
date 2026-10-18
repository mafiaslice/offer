import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { getDb } from "@/lib/db/client";
import { httpError, pgCode } from "@/lib/db/errors";
import { profiles, users } from "@/lib/db/schema";
import { initialsFromName } from "@/lib/data/format";
import type { SessionProfile } from "@/lib/data/types";

type ProfileRow = typeof profiles.$inferSelect;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function toSession(user: { id: string; email: string }, profile: Pick<ProfileRow, "displayName" | "phone" | "bio" | "intent" | "avatarUrl">): SessionProfile {
  const displayName = profile.displayName.trim() || user.email.split("@")[0] || "You";
  const intent = profile.intent === "need" || profile.intent === "help" || profile.intent === "both" ? profile.intent : undefined;
  return {
    id: user.id,
    displayName,
    initials: initialsFromName(displayName),
    email: user.email,
    phone: profile.phone ?? undefined,
    bio: profile.bio ?? undefined,
    intent,
    avatarUrl: profile.avatarUrl ?? undefined,
  };
}

export async function signUp(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const password = input.password ?? "";
  if (!email.includes("@") || email.startsWith("@") || email.endsWith("@")) {
    httpError("Enter a valid email.", 400);
  }
  if (password.length < 8) httpError("Password must be at least 8 characters.", 400);

  const passwordHash = await hashPassword(password);
  try {
    const created = await getDb().transaction(async (tx) => {
      const [user] = await tx.insert(users).values({ email, passwordHash }).returning({ id: users.id, email: users.email });
      const [profile] = await tx
        .insert(profiles)
        .values({ id: user.id, displayName: "" })
        .returning();
      return { user, profile };
    });
    await createSession(created.user.id);
    return {
      profile: toSession(created.user, created.profile),
      needsProfile: !created.profile.displayName.trim(),
    };
  } catch (error) {
    if (pgCode(error) === "23505") httpError("An account with that email already exists. Sign in instead.", 409);
    throw error;
  }
}

export async function signIn(input: { email: string; password: string }) {
  const email = normalizeEmail(input.email);
  const password = input.password ?? "";
  if (!email || !password) httpError("Email or password is incorrect.", 401);

  const [user] = await getDb()
    .select({ id: users.id, email: users.email, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    httpError("Email or password is incorrect.", 401);
  }

  let [profile] = await getDb().select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (!profile) {
    [profile] = await getDb().insert(profiles).values({ id: user.id, displayName: "" }).returning();
  }

  await createSession(user.id);
  return {
    profile: toSession(user, profile),
    needsProfile: !profile.displayName.trim(),
  };
}
