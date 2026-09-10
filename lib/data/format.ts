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
