import { createHmac, timingSafeEqual } from "node:crypto";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DEMO_ID_RE = /^[a-z0-9][a-z0-9-]{0,80}$/i;

/** Server-only signing secret. Demo/CI use a fixed fallback so build works without credentials. */
export function checkInSecret() {
  return process.env.CHECK_IN_SECRET?.trim() || "offer-demo-check-in";
}

function isGigId(value: string) {
  return UUID_RE.test(value) || DEMO_ID_RE.test(value);
}

function signPayload(payload: string) {
  return createHmac("sha256", checkInSecret()).update(payload).digest("hex").slice(0, 16);
}

function signaturesMatch(expected: string, actual: string) {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/**
 * Stable per-gig (optional Slot) token for `/check-in/[token]`.
 * The QR identifies the Gig; check-in still requires a Host or accepted Participant.
 */
export function createCheckInToken(gigId: string, slotId?: string) {
  const payload = slotId ? `${gigId}.${slotId}` : gigId;
  return `${payload}.${signPayload(payload)}`;
}

export function parseCheckInToken(token: string): { gigId: string; slotId?: string } | null {
  const trimmed = token.trim();
  if (!trimmed || trimmed.length > 180) return null;
  const parts = trimmed.split(".");
  if (parts.length !== 2 && parts.length !== 3) return null;
  const signature = parts.at(-1) ?? "";
  const payload = parts.slice(0, -1).join(".");
  const gigId = parts[0] ?? "";
  const slotId = parts.length === 3 ? parts[1] : undefined;
  if (!isGigId(gigId) || (slotId && !isGigId(slotId))) return null;
  if (!signaturesMatch(signPayload(payload), signature)) return null;
  return slotId ? { gigId, slotId } : { gigId };
}

export function checkInPath(token: string) {
  return `/check-in/${encodeURIComponent(token)}`;
}
