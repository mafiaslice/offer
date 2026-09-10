import type { ApplicationStatus, ApplicationUiStatus, GigCategory, GigKindLabel, ImageTone } from "@/lib/data/types";

export const GIG_CATEGORIES = ["Events", "Community", "Hospitality", "Projects"] as const;

export function kindLabel(kind: "volunteer" | "paid"): GigKindLabel {
  return kind === "paid" ? "Paid gig" : "Volunteer";
}

export function parseKindFilter(value?: string): "volunteer" | "paid" | undefined {
  if (!value || value === "all") return undefined;
  const lower = value.toLowerCase();
  if (lower === "paid" || lower === "paid gig") return "paid";
  if (lower === "volunteer") return "volunteer";
  return undefined;
}

export function normalizeCategory(value: string): GigCategory {
  const match = GIG_CATEGORIES.find((item) => item.toLowerCase() === value.toLowerCase());
  return match ?? "Events";
}

export function coverToneFor(kind: "volunteer" | "paid", category: GigCategory): ImageTone {
  if (kind === "paid") return "night";
  if (category === "Community") return "mint";
  if (category === "Projects") return "night";
  return "sunset";
}

export const IMAGE_TONES = ["sunset", "mint", "night"] as const;

export const TONE_GRADIENTS: Record<ImageTone, string> = {
  sunset: "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]",
  mint: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]",
  night: "from-[#29244b] via-[#6e49a8] to-[#ff4da3]",
};

export function imageTone(value?: string | null): ImageTone {
  if (value === "mint" || value === "night" || value === "sunset") return value;
  return "sunset";
}

export function toneGradient(value?: string | null) {
  return TONE_GRADIENTS[imageTone(value)];
}

export function formatSlotLabel(startsAt?: string | null, endsAt?: string | null) {
  const start = formatLongDateLabel(startsAt);
  if (!endsAt) return start;
  const end = new Date(endsAt);
  if (Number.isNaN(end.getTime())) return start;
  const endTime = end.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  return `${start} – ${endTime}`;
}

export function roleTitlesFrom(roles: Array<string | { title?: string | null }> | null | undefined) {
  if (!roles?.length) return [];
  return roles
    .map((role) => (typeof role === "string" ? role : role.title)?.trim())
    .filter((title): title is string => Boolean(title));
}

export function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "O";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function formatDateLabel(iso?: string | null) {
  if (!iso) return "Open now";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Open now";
  const day = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(":00", "");
  return `${day} · ${time}`;
}

export function formatLongDateLabel(iso?: string | null) {
  if (!iso) return "Date to be confirmed";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Date to be confirmed";
  return date.toLocaleString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function combineDateAndTime(date: string, time: string) {
  const iso = new Date(`${date}T${time}:00`);
  return Number.isNaN(iso.getTime()) ? new Date().toISOString() : iso.toISOString();
}

export function slugify(value: string) {
  const base = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || "gig";
}

export function applicationUiStatus(status: ApplicationStatus): ApplicationUiStatus {
  if (status === "accepted") return "Accepted";
  if (status === "declined") return "Declined";
  return "Applied";
}

export function gigLifecycleStatus(startsAt?: string | null, status?: string): "Upcoming" | "Completed" {
  if (status === "completed" || status === "cancelled") return "Completed";
  if (startsAt && new Date(startsAt).getTime() < Date.now() - 12 * 60 * 60 * 1000) return "Completed";
  return "Upcoming";
}

export function spotsLabel(count?: number | null) {
  if (count == null) return "Spots open";
  if (count <= 0) return "No spots left";
  return `${count} spot${count === 1 ? "" : "s"} left`;
}

export const AVATAR_TONES = [
  "from-[#f5cc00] to-[#ff4da3]",
  "from-[#29244b] to-[#ff4da3]",
  "from-[#bcebdc] to-[#7b8cff]",
  "from-[#ffcf91] to-[#8e52ff]",
  "from-[#8e52ff] to-[#49d7b8]",
] as const;

export function avatarTone(seed: string) {
  let hash = 0;
  for (const ch of seed) hash = (hash + ch.charCodeAt(0)) % AVATAR_TONES.length;
  return AVATAR_TONES[hash] ?? AVATAR_TONES[0];
}

export function formatThreadTime(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const now = new Date();
  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

export function threadUnread(input: {
  viewerId: string;
  hostUserId: string;
  lastMessageSenderId: string | null;
  lastMessageAt: string;
  hostLastReadAt: string | null;
  participantLastReadAt: string | null;
}) {
  if (!input.lastMessageSenderId || input.lastMessageSenderId === input.viewerId) return 0;
  const lastRead = input.viewerId === input.hostUserId ? input.hostLastReadAt : input.participantLastReadAt;
  if (!lastRead) return 1;
  return new Date(input.lastMessageAt).getTime() > new Date(lastRead).getTime() ? 1 : 0;
}

export const MAX_MESSAGE_LENGTH = 4000;

export function formatCheckInTime(iso?: string | null) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

export function checkInState(record: { checkedInAt: string; checkedOutAt?: string } | null | undefined) {
  if (!record) return "out" as const;
  return record.checkedOutAt ? ("out" as const) : ("in" as const);
}
