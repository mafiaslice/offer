import type { Metadata } from "next";
import { LandingPage } from "@/components/landing-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Offer" },
  description:
    "Offer is where Hosts find trusted, vetted hands for events and projects. Volunteers first, and paid gigs when needed.",
};

export default function Home() {
  return <LandingPage />;
}
