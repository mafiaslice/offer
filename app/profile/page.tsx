import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = {
  title: "Profile",
};

export default function ProfilePage() {
  return (
    <PlaceholderPage
      title="Profile"
      description="Your Offer profile. Auth and which fields belong here are still open. Nothing is stored yet."
    >
      <div className="rounded-card border border-border bg-white p-4 text-sm text-purple-gray">
        Identity verification is out of scope for this workspace.
      </div>
    </PlaceholderPage>
  );
}
