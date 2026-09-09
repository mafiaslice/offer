"use client";

import { useMemo, useState } from "react";
import { GigCard } from "@/components/gig-card";
import { demoGigs } from "@/lib/gig-data";

const categories = ["All gigs", "Events", "Community", "Hospitality", "Projects"] as const;

export function DiscoverView() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("All gigs");
  const [kind, setKind] = useState<"All" | "Volunteer" | "Paid gig">("All");
  const filtered = useMemo(() => demoGigs.filter((gig) => {
    const haystack = `${gig.title} ${gig.hostName} ${gig.locationLabel} ${gig.category}`.toLowerCase();
    return haystack.includes(query.toLowerCase()) && (category === "All gigs" || gig.category === category) && (kind === "All" || gig.kindLabel === kind);
  }), [category, kind, query]);
  const topical = filtered.filter((gig) => gig.kindLabel === "Volunteer");
  const paid = filtered.filter((gig) => gig.kindLabel === "Paid gig");

  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4"><div><p className="mb-2 text-sm font-semibold text-purple">Good morning, Slice</p><h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] text-black sm:text-5xl">Find your people.</h1></div><button type="button" aria-label="Notifications" className="grid size-11 shrink-0 place-items-center rounded-full border border-black/5 bg-white text-lg shadow-sm transition-colors hover:bg-black hover:text-white">♧</button></header>

      <div className="flex items-center gap-3"><label className="flex min-h-12 flex-1 items-center gap-3 rounded-full border border-black/5 bg-white px-4 shadow-sm focus-within:border-purple focus-within:ring-4 focus-within:ring-purple/10"><svg className="size-5 shrink-0 text-purple-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search gigs" placeholder="Search gigs, places or roles" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-purple-gray/70" /></label><button type="button" aria-label="Filter gigs" className="grid size-12 shrink-0 place-items-center rounded-full bg-black text-white shadow-lg shadow-black/10 transition-colors hover:bg-purple">☷</button></div>

      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">{categories.map((item) => <button key={item} type="button" onClick={() => setCategory(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${category === item ? "bg-black text-white" : "border border-black/5 bg-white text-purple-gray hover:text-black"}`}>{item}</button>)}</div>
      <div className="flex gap-2"><button type="button" onClick={() => setKind("All")} className={`min-h-9 rounded-full px-4 text-xs font-bold ${kind === "All" ? "bg-purple text-white" : "bg-white text-purple-gray shadow-sm"}`}>Everything</button><button type="button" onClick={() => setKind("Volunteer")} className={`min-h-9 rounded-full px-4 text-xs font-bold ${kind === "Volunteer" ? "bg-purple text-white" : "bg-white text-purple-gray shadow-sm"}`}>Volunteer first</button><button type="button" onClick={() => setKind("Paid gig")} className={`min-h-9 rounded-full px-4 text-xs font-bold ${kind === "Paid gig" ? "bg-purple text-white" : "bg-white text-purple-gray shadow-sm"}`}>Paid gigs</button></div>

      {topical.length > 0 ? <section className="space-y-4" aria-labelledby="topical-heading"><div className="flex items-center justify-between"><h2 id="topical-heading" className="text-xl font-bold tracking-[-0.04em]">Topical</h2><span className="text-sm font-semibold text-purple-gray">{topical.length} available</span></div><div className="grid gap-5 md:grid-cols-2">{topical.map((gig) => <GigCard key={gig.slug} href={`/gigs/${gig.slug}`} {...gig} />)}</div></section> : null}
      {paid.length > 0 ? <section className="space-y-4" aria-labelledby="for-you-heading"><div className="flex items-center justify-between"><h2 id="for-you-heading" className="text-xl font-bold tracking-[-0.04em]">For you</h2><span className="text-sm font-semibold text-purple-gray">{paid.length} available</span></div><div className="grid gap-5 md:grid-cols-2">{paid.map((gig) => <GigCard key={gig.slug} href={`/gigs/${gig.slug}`} {...gig} />)}</div></section> : null}
      {filtered.length === 0 ? <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white px-5 py-12 text-center"><p className="text-base font-bold">No gigs match that search</p><p className="mt-2 text-sm leading-6 text-purple-gray">Try another place, category, or gig type.</p><button type="button" onClick={() => { setQuery(""); setCategory("All gigs"); setKind("All"); }} className="mt-5 min-h-11 rounded-full bg-black px-5 text-sm font-bold text-white">Clear filters</button></div> : null}
      <button type="button" className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold text-black shadow-[0_10px_24px_rgba(53,32,79,0.08)] transition-colors hover:bg-black hover:text-white"><span aria-hidden>⌖</span> Explore gigs on the map</button>
    </div>
  );
}
