import type { Metadata } from "next";
import { GigCard } from "@/components/gig-card";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = {
  title: "Discover",
};

export default function DiscoverPage() {
  return (
    <PlaceholderPage
      title="Discover"
      description="Find volunteer gigs first, then paid gigs. This list is a layout placeholder — there is no live data yet."
    >
      <GigCard
        title="Community garden morning"
        hostName="Neighborhood Host"
        kindLabel="Volunteer"
        locationLabel="Nearby"
      />
      <p className="text-xs text-purple-gray">
        Placeholder card only. Image area is a gradient until reference boards
        and media exist.
      </p>
    </PlaceholderPage>
  );
}
