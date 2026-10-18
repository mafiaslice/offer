"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { GigCard } from "@/components/gig-card";
import { Icon } from "@/components/icon";
import { StarShowcase } from "@/components/star-showcase";
import { useOffer } from "@/components/offer-provider";
import type { GigListItem } from "@/lib/data/types";

const categories = ["All gigs", "Events", "Community", "Hospitality", "Projects"] as const;

type DiscoverViewProps = {
  initialGigs: GigListItem[];
  loadError?: string;
};

export function DiscoverView({ initialGigs, loadError }: DiscoverViewProps) {
  const { user, source } = useOffer();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All gigs");
  const [kind, setKind] = useState<"Volunteer" | "Paid gig">("Volunteer");
  const greetingName = user?.displayName.split(" ")[0] ?? (source === "demo-adapter" ? "Slice" : "");
  const filtered = useMemo(() => initialGigs.filter((gig) => {
    const haystack = `${gig.title} ${gig.hostName} ${gig.locationLabel} ${gig.category}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "All gigs" || gig.category === category) && gig.kindLabel === kind;
  }), [category, initialGigs, kind, query]);
  const topical = filtered.filter((gig) => gig.kindLabel === "Volunteer");
  const paid = filtered.filter((gig) => gig.kindLabel === "Paid gig");
  const liveEmpty = source === "postgres" && initialGigs.length === 0 && !loadError;

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-semibold text-purple-ink">{greetingName ? `Good morning, ${greetingName}` : "Good morning"}</p><h1 className="text-[2.15rem] font-normal leading-[1.05] tracking-[-0.025em] text-white sm:text-5xl">Volunteer first. Paid when you need it.</h1></div><button type="button" aria-label="Notifications" className="grid size-11 shrink-0 place-items-center rounded-full border border-white/15 glass text-lg shadow-sm transition-colors hover:bg-white/15 hover:text-white"><Icon name="circle-alert" className="size-5" /></button></header>

      <div className="flex items-center gap-3"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-full border border-white/15 glass px-4 shadow-sm focus-within:border-purple focus-within:ring-4 focus-within:ring-purple/10"><Icon name="search" className="size-5 shrink-0 text-purple-gray" /><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search gigs" placeholder="Search gigs, places or roles" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-purple-gray" /></label><button type="button" aria-label="Filter gigs" className="grid size-12 shrink-0 place-items-center rounded-full bg-purple-fill text-white shadow-lg shadow-black/10 transition-colors hover:bg-[#7A3FF0]"><Icon name="list-filter" className="size-5" /></button></div>

      <div className="hide-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${category === item ? "bg-purple-fill text-white" : "border border-white/15 glass text-purple-gray hover:text-white"}`}>{item}</button>)}</div>
      <div className="flex rounded-2xl glass p-1.5 shadow-sm" role="tablist" aria-label="Gig type"><button type="button" role="tab" aria-selected={kind === "Volunteer"} onClick={() => setKind("Volunteer")} className={`min-h-11 flex-1 rounded-xl px-3 text-sm font-bold transition-colors ${kind === "Volunteer" ? "bg-purple-fill text-white" : "text-purple-gray"}`}>Volunteer Gigs</button><button type="button" role="tab" aria-selected={kind === "Paid gig"} onClick={() => setKind("Paid gig")} className={`min-h-11 flex-1 rounded-xl px-3 text-sm font-bold transition-colors ${kind === "Paid gig" ? "bg-purple-fill text-white" : "text-purple-gray"}`}>Paid Gigs</button></div>

      {loadError ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/20 glass px-5 py-12 text-center">
          <p className="text-base font-bold">Discover couldn&apos;t load gigs</p>
          <p className="mt-2 text-sm leading-6 text-purple-gray">Live data didn&apos;t return a list. This is not the demo catalog — try again in a moment.</p>
        </div>
      ) : null}
      {liveEmpty ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/20 glass px-5 py-12 text-center">
          <p className="text-base font-bold">Be the first to post a volunteer gig.</p>
          <Link href="/post" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-purple-fill px-5 text-sm font-bold text-white">Post a Gig</Link>
        </div>
      ) : null}
      {!liveEmpty && kind === "Volunteer" && topical.length > 0 ? <section className="space-y-4" aria-labelledby="volunteer-gigs-heading"><div className="flex items-center justify-between"><h2 id="volunteer-gigs-heading" className="text-xl font-normal tracking-[-0.025em]">Volunteer gigs</h2><span className="text-sm font-semibold text-purple-gray">{topical.length} available</span></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{topical.map((gig) => <GigCard key={gig.slug} href={`/gigs/${gig.slug}`} {...gig} />)}</div></section> : null}
      {!liveEmpty && kind === "Paid gig" && paid.length > 0 ? <section className="space-y-4" aria-labelledby="paid-gigs-heading"><div className="flex items-center justify-between"><h2 id="paid-gigs-heading" className="text-xl font-normal tracking-[-0.025em]">Paid gigs</h2><span className="text-sm font-semibold text-purple-gray">{paid.length} available</span></div><div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{paid.map((gig) => <GigCard key={gig.slug} href={`/gigs/${gig.slug}`} {...gig} />)}</div></section> : null}
      {!liveEmpty && filtered.length === 0 ? <div className="rounded-[1.5rem] border border-dashed border-white/20 glass px-5 py-12 text-center"><p className="text-base font-bold">No gigs match that search</p><p className="mt-2 text-sm leading-6 text-purple-gray">Try another place, category, or gig type.</p><button type="button" onClick={() => { setQuery(""); setCategory("All gigs"); setKind("Volunteer"); }} className="mt-5 min-h-11 rounded-full bg-purple-fill px-5 text-sm font-bold text-white">Clear filters</button></div> : null}
      <StarShowcase />
      <button type="button" className="flex w-full items-center justify-center gap-2 rounded-full glass px-5 py-4 text-sm font-bold text-white shadow-card transition-colors hover:bg-white/15 hover:text-white"><Icon name="map-pin" className="size-5" /> Explore gigs on the map</button>
    </div>
  );
}
