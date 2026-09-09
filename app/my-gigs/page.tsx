import type { Metadata } from "next";
import { MyGigsView } from "@/components/my-gigs-view";

export const metadata: Metadata = {
  title: "My Gigs",
};

export default function MyGigsPage() {
  return <MyGigsView />;
}
