import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = {
  title: "My Gigs",
};

export default function MyGigsPage() {
  return (
    <PlaceholderPage
      title="My Gigs"
      description="Gigs you host and gigs you joined as a Volunteer or Participant will show up here. No data is loaded yet."
    >
      <div className="rounded-card border border-dashed border-border bg-white px-4 py-10 text-center text-sm text-purple-gray">
        Nothing to show — this route is a structural placeholder.
      </div>
    </PlaceholderPage>
  );
}
