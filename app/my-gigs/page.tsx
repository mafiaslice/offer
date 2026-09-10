import type { Metadata } from "next";
import { MyGigsView } from "@/components/my-gigs-view";
import { listMyActivity } from "@/lib/data";

export const metadata: Metadata = {
  title: "My Gigs",
};

export default async function MyGigsPage() {
  const activity = await listMyActivity();
  return <MyGigsView hosted={activity.hosted} joined={activity.joined} reviewQueue={activity.reviewQueue} />;
}
