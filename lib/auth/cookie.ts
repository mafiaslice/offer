import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "offer_session";
const SESSION_DAYS = 30;

export function sessionLifetimeMs() {
  return SESSION_DAYS * 24 * 60 * 60 * 1000;
}

function authSecret() {
  const secret = process.env.AUTH_SECRET?.trim();
  if (!secret) {
    throw Object.assign(new Error("AUTH_SECRET is not set."), { status: 500 });
  }
  return secret;
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(`${authSecret()}:${token}`).digest("hex");
}

function sign(payload: string) {
  return createHmac("sha256", authSecret()).update(payload).digest("base64url");
}

export function issueSessionCookieValue(expiresAt: Date) {
  const token = randomBytes(32).toString("base64url");
  const expires = Math.floor(expiresAt.getTime() / 1000).toString();
  const payload = `${token}.${expires}`;
  return { token, value: `${payload}.${sign(payload)}`, expiresAt };
}

/** Optimistic cookie check. A valid signature is not proof the session row still exists. */
export function readSessionCookie(value: string | undefined | null): { token: string; expiresAt: Date } | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [token, expires, signature] = parts;
  if (!token || !expires || !signature || !/^\d+$/.test(expires)) return null;
  let expected = "";
  try {
    expected = sign(`${token}.${expires}`);
  } catch {
    return null;
  }
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null;
  const expiresAt = new Date(Number(expires) * 1000);
  if (Number.isNaN(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) return null;
  return { token, expiresAt };
}

export function sessionCookieOptions(expiresAt: Date) {
  const flag = process.env.AUTH_COOKIE_SECURE?.trim();
  const secure = flag === "true" ? true : flag === "false" ? false : process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure,
    sameSite: "lax" as const,
    path: "/",
    expires: expiresAt,
  };
}
