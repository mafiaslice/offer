"use client";

import { ScrollStackDeck, type StackCard } from "@/components/scroll-stack-deck";

/** Sample showcase. These people appear in the demo catalog; the counts are not a ranking. */
const demoStars: StackCard[] = [
  {
    id: "demo-tola",
    tabTitle: "01 · Demo",
    title: "Tola Adebayo",
    description: "Demo data. Guest welcome on neighbourhood gigs. 6 gigs completed.",
    tone: "sunset",
  },
  {
    id: "demo-nia",
    tabTitle: "02 · Demo",
    title: "Nia Okafor",
    description: "Demo data. Setup and coordination. 4 gigs completed.",
    tone: "mint",
  },
  {
    id: "demo-david",
    tabTitle: "03 · Demo",
    title: "David Eze",
    description: "Demo data. Door list and check-in. 5 gigs completed.",
    tone: "night",
  },
];

export function StarShowcase() {
  return (
    <ScrollStackDeck
      items={demoStars}
      title="Star of the month"
      subtitle="Demo data. Offer does not rank volunteers yet — this is a sample showcase, not a live leaderboard."
    />
  );
}
