import { demoGigDetails, demoMyGigs, demoReviewQueue, toListItem } from "@/lib/data/demo-catalog";
import { applicationUiStatus, slugify } from "@/lib/data/format";
import type {
  ApplyInput,
  CreateGigInput,
  GigDetail,
  GigListFilters,
  ListResult,
  MyActivity,
  SessionProfile,
  UserApplication,
} from "@/lib/data/types";

const source = "demo-adapter" as const;

function matchesFilters(gig: GigDetail, filters: GigListFilters = {}) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const searchable = `${gig.title} ${gig.hostName} ${gig.locationLabel} ${gig.category}`.toLowerCase();
  const matchesQuery = !query || searchable.includes(query);
  const matchesCategory =
    !filters.category || filters.category === "all" || gig.category.toLowerCase() === filters.category.toLowerCase();
  const matchesKind =
    !filters.kind || filters.kind === "all" || gig.kindLabel.toLowerCase() === filters.kind.toLowerCase();
  return matchesQuery && matchesCategory && matchesKind;
}

export function listGigs(filters: GigListFilters = {}): ListResult<ReturnType<typeof toListItem>[]> {
  const data = demoGigDetails.filter((gig) => matchesFilters(gig, filters)).map(toListItem);
  return { data, meta: { total: data.length, source } };
}

export function getGigBySlug(slug: string): GigDetail | null {
  return demoGigDetails.find((gig) => gig.slug === slug) ?? null;
}

export function getSessionProfile(): SessionProfile | null {
  return null;
}

export function listMyActivity(): MyActivity {
  return {
    hosted: demoMyGigs.filter((gig) => gig.mode === "Hosted"),
    joined: demoMyGigs.filter((gig) => gig.mode === "Joined"),
    applications: [],
    reviewQueue: demoReviewQueue,
  };
}

export function createGig(input: CreateGigInput): GigDetail {
  const slug = slugify(input.title);
  return {
    id: `demo-${slug}`,
    slug,
    title: input.title,
    hostName: "You",
    hostInitials: "YO",
    kindLabel: input.kind === "paid" ? "Paid gig" : "Volunteer",
    locationLabel: input.locationLabel,
    dateLabel: input.date,
    longDateLabel: input.date,
    imageTone: input.kind === "paid" ? "night" : "sunset",
    category: "Events",
    spotsLabel: `${input.slotCount} spots left`,
    summary: input.summary,
    about: input.summary,
    roles: input.roles,
    incentive: input.incentive ?? "",
    instructions: input.instructions ?? "",
    verified: false,
    status: "open",
  };
}

export function applyToGig(input: ApplyInput): UserApplication {
  return {
    id: `demo-app-${input.gigSlug}`,
    gigSlug: input.gigSlug,
    gigTitle: getGigBySlug(input.gigSlug)?.title ?? input.gigSlug,
    role: input.roleTitle,
    status: applicationUiStatus("pending"),
    rawStatus: "pending",
    createdAt: new Date().toISOString(),
    note: input.note,
  };
}

export function reviewApplication(id: string, status: "accepted" | "declined") {
  const applicant = demoReviewQueue.find((item) => item.id === id);
  return { id, status, gigSlug: applicant?.gigSlug ?? "" };
}
