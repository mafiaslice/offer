import type { Metadata } from "next";
import { DiscoverView } from "@/components/discover-view";
import { listGigs } from "@/lib/data";

export const metadata: Metadata = {
  title: "Discover",
};

export default async function DiscoverPage() {
  const { data } = await listGigs();
  return <DiscoverView initialGigs={data} />;
}
