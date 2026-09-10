import type { Metadata } from "next";
import { MyGigsView } from "@/components/my-gigs-view";
import { errorMessage, listMyActivity } from "@/lib/data";
import type { HostApplicant, MyGigCard } from "@/lib/data/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Gigs",
};

export default async function MyGigsPage() {
  let hosted: MyGigCard[] = [];
  let joined: MyGigCard[] = [];
  let reviewQueue: HostApplicant[] = [];
  let loadError: string | undefined;
  try {
    const activity = await listMyActivity();
    hosted = activity.hosted;
    joined = activity.joined;
    reviewQueue = activity.reviewQueue;
  } catch (error) {
    loadError = errorMessage(error);
  }
  return <MyGigsView hosted={hosted} joined={joined} reviewQueue={reviewQueue} loadError={loadError} />;
}
