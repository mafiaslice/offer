import { demoGigDetails, toListItem } from "@/lib/data/demo-catalog";
import type { GigListItem } from "@/lib/data/types";

/** @deprecated Use GigListItem from lib/data/types. Kept for existing imports. */
export type DemoGig = GigListItem;

/** Temporary display fixtures used by the demo adapter when DATABASE_URL is unset. */
export const demoGigs: DemoGig[] = demoGigDetails.map(toListItem);

export function getDemoGig(slug: string) {
  return demoGigs.find((gig) => gig.slug === slug);
}
