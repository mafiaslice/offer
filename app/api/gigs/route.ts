import { NextResponse } from "next/server";
import { demoGigs } from "@/lib/gig-data";

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const category = url.searchParams.get("category");
  const kind = url.searchParams.get("kind");

  const gigs = demoGigs.filter((gig) => {
    const searchable = `${gig.title} ${gig.hostName} ${gig.locationLabel} ${gig.category}`.toLowerCase();
    const matchesQuery = !query || searchable.includes(query);
    const matchesCategory = !category || category === "all" || gig.category.toLowerCase() === category.toLowerCase();
    const matchesKind = !kind || kind === "all" || gig.kindLabel.toLowerCase() === kind.toLowerCase();
    return matchesQuery && matchesCategory && matchesKind;
  });

  return NextResponse.json({ data: gigs, meta: { total: gigs.length, source: "demo-adapter" } });
}
