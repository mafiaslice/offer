import type { Metadata } from "next";
import { PlaceholderPage } from "@/components/placeholder-page";

export const metadata: Metadata = {
  title: "Messages",
};

export default function MessagesPage() {
  return (
    <PlaceholderPage
      title="Messages"
      description="Conversation threads will live here. There is no messaging backend in this scaffold."
    >
      <div className="rounded-card border border-dashed border-border bg-white px-4 py-10 text-center text-sm text-purple-gray">
        No threads yet — placeholder route.
      </div>
    </PlaceholderPage>
  );
}
