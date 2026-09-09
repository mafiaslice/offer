import type { Metadata } from "next";
import { GigCard } from "@/components/gig-card";

export const metadata: Metadata = {
  title: "Discover",
};

export default function DiscoverPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-purple">Good morning, Slice</p>
          <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] text-black sm:text-5xl">Find your people.</h1>
        </div>
        <button type="button" aria-label="Notifications" className="grid size-11 shrink-0 place-items-center rounded-full border border-black/5 bg-white text-lg shadow-sm transition-colors hover:bg-black hover:text-white">♧</button>
      </header>

      <div className="flex items-center gap-3">
        <label className="flex min-h-12 flex-1 items-center gap-3 rounded-full border border-black/5 bg-white px-4 shadow-sm focus-within:border-purple focus-within:ring-4 focus-within:ring-purple/10">
          <svg className="size-5 shrink-0 text-purple-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
          <input aria-label="Search gigs" placeholder="Search gigs, places or roles" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-purple-gray/70" />
        </label>
        <button type="button" aria-label="Filter gigs" className="grid size-12 shrink-0 place-items-center rounded-full bg-black text-white shadow-lg shadow-black/10 transition-colors hover:bg-purple">
          <svg className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M4 6h16M7 12h10M10 18h4" /></svg>
        </button>
      </div>

      <div className="hide-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-0">
        {[
          ["All gigs", true],
          ["Events", false],
          ["Community", false],
          ["Hospitality", false],
          ["Projects", false],
        ].map(([label, active]) => (
          <button key={label as string} type="button" className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-bold transition-colors ${active ? "bg-black text-white" : "border border-black/5 bg-white text-purple-gray hover:text-black"}`}>
            {label as string}
          </button>
        ))}
      </div>

      <section className="space-y-4" aria-labelledby="topical-heading">
        <div className="flex items-center justify-between">
          <h2 id="topical-heading" className="text-xl font-bold tracking-[-0.04em]">Topical</h2>
          <button type="button" className="text-sm font-bold text-purple">View all</button>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <GigCard href="/gigs/hangout-with-slice" title="Hangout with Slice" hostName="Slice" kindLabel="Volunteer" locationLabel="Ikoyi" dateLabel="Sep 25 · 10 AM" imageTone="sunset" />
          <GigCard href="/gigs/community-food-drive" title="Community food drive" hostName="Neighbourhood Hub" kindLabel="Volunteer" locationLabel="Yaba" dateLabel="Oct 02 · 8 AM" imageTone="mint" />
        </div>
      </section>

      <section className="space-y-4" aria-labelledby="for-you-heading">
        <div className="flex items-center justify-between">
          <h2 id="for-you-heading" className="text-xl font-bold tracking-[-0.04em]">For you</h2>
          <button type="button" className="text-sm font-bold text-purple">View all</button>
        </div>
        <GigCard href="/gigs/festival-crew" title="Festival crew wanted" hostName="Live Works" kindLabel="Paid gig" locationLabel="Victoria Island" dateLabel="Oct 12 · 4 PM" imageTone="night" />
      </section>

      <button type="button" className="flex w-full items-center justify-center gap-2 rounded-full bg-white px-5 py-4 text-sm font-bold text-black shadow-[0_10px_24px_rgba(53,32,79,0.08)] transition-colors hover:bg-black hover:text-white">
        <span aria-hidden>⌖</span> Explore gigs on the map
      </button>
    </div>
  );
}
