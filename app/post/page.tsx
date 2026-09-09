import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = {
  title: "Post",
};

export default function PostPage() {
  return (
    <PlaceholderPage
      title="Post a Gig"
      description="Hosts will create a Gig with Roles and Slots here. Posting is not wired — this is structure only."
    >
      <div className="rounded-card border border-border bg-white p-4 text-sm text-purple-gray">
        Minimum fields, drafts, and who can post are still open decisions.
      </div>
    </PlaceholderPage>
  );
}
