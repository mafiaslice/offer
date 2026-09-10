import type { Metadata } from "next";
import { DiscoverView } from "@/components/discover-view";
import { errorMessage, listGigs } from "@/lib/data";
import type { GigListItem } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Discover",
};

export default async function DiscoverPage() {
  let gigs: GigListItem[] = [];
  let loadError: string | undefined;
  try {
    const { data } = await listGigs();
    gigs = data;
  } catch (error) {
    loadError = errorMessage(error);
  }
  return <DiscoverView initialGigs={gigs} loadError={loadError} />;
}
