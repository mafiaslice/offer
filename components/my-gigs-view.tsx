"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useOffer } from "@/components/offer-provider";

type GigStatus = "Upcoming" | "Completed";
type GigMode = "Joined" | "Hosted";

type MyGig = {
  title: string;
  host: string;
  date: string;
  location: string;
  status: GigStatus;
  mode: GigMode;
  kind: "Volunteer" | "Paid gig";
  tone: string;
  slug: string;
};

const gigs: MyGig[] = [
  { title: "Hangout with Slice", host: "Slice", date: "Sep 25 · 10 AM", location: "Ikoyi", status: "Upcoming", mode: "Joined", kind: "Volunteer", tone: "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]", slug: "hangout-with-slice" },
  { title: "Festival crew wanted", host: "Live Works", date: "Oct 12 · 4 PM", location: "Victoria Island", status: "Upcoming", mode: "Joined", kind: "Paid gig", tone: "from-[#29244b] via-[#6e49a8] to-[#ff4da3]", slug: "festival-crew" },
  { title: "Community food drive", host: "Neighbourhood Hub", date: "Aug 02 · 8 AM", location: "Yaba", status: "Completed", mode: "Joined", kind: "Volunteer", tone: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]", slug: "community-food-drive" },
  { title: "Open mic night", host: "Slice", date: "Nov 04 · 6 PM", location: "Surulere", status: "Upcoming", mode: "Hosted", kind: "Volunteer", tone: "from-[#f5cc00] via-[#ff9a6b] to-[#ff4da3]", slug: "hangout-with-slice" },
];

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">{value}</p><p className="mt-1 text-xs font-semibold text-purple-gray">{label}</p></div>;
}

function MyGigCard({ gig, applicationStatus }: { gig: MyGig; applicationStatus?: "Applied" | "Accepted" }) {
  return (
    <Link href={`/gigs/${gig.slug}`} className="group flex gap-3 rounded-[1.5rem] bg-white p-3 shadow-[0_12px_28px_rgba(53,32,79,0.07)] transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-4">
      <div className={`relative h-28 w-28 shrink-0 rounded-2xl bg-gradient-to-br ${gig.tone} sm:h-32 sm:w-32`}><span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-black">{gig.kind}</span></div>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-2"><h2 className="line-clamp-2 text-base font-bold leading-tight tracking-[-0.03em] sm:text-lg">{gig.title}</h2><span className="text-lg text-purple">↗</span></div>
        <p className="mt-2 text-xs font-semibold text-purple-gray">{gig.mode} · {gig.host}</p>
        <p className="mt-1 text-xs text-purple-gray">{gig.date} · {gig.location}</p>
        <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${applicationStatus ? "bg-purple/10 text-purple" : gig.status === "Upcoming" ? "bg-purple/10 text-purple" : "bg-success/15 text-[#37951a]"}`}>{applicationStatus ?? gig.status}</span>
      </div>
    </Link>
  );
}

export function MyGigsView() {
  const [status, setStatus] = useState<GigStatus>("Upcoming");
  const [mode, setMode] = useState<"All" | GigMode>("All");
  const { applications } = useOffer();
  const applicationBySlug = useMemo(() => new Map(applications.map((application) => [application.gigSlug, application.status])), [applications]);
  const filtered = useMemo(() => gigs.filter((gig) => gig.status === status && (mode === "All" || gig.mode === mode)), [mode, status]);

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header className="space-y-2"><p className="text-sm font-semibold text-purple">Your activity</p><h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">My gigs.</h1><p className="text-sm leading-6 text-purple-gray sm:text-base">Keep track of where you&apos;re showing up and what you&apos;re building.</p></header>

      <div className="grid grid-cols-3 gap-3"><Stat value={String(3 + applications.filter((application) => !gigs.some((gig) => gig.slug === application.gigSlug)).length)} label="Joined" /><Stat value="1" label="Hosted" /><Stat value="12" label="People met" /></div>

      <div className="flex rounded-2xl bg-white p-1.5 shadow-sm"><button type="button" onClick={() => setMode("All")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "All" ? "bg-black text-white" : "text-purple-gray"}`}>All gigs</button><button type="button" onClick={() => setMode("Joined")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "Joined" ? "bg-black text-white" : "text-purple-gray"}`}>Joined</button><button type="button" onClick={() => setMode("Hosted")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "Hosted" ? "bg-black text-white" : "text-purple-gray"}`}>Hosted</button></div>

      <div className="flex items-center justify-between"><div className="flex gap-5 border-b border-black/10"><button type="button" onClick={() => setStatus("Upcoming")} className={`relative pb-3 text-sm font-bold ${status === "Upcoming" ? "text-black" : "text-purple-gray"}`}>Upcoming{status === "Upcoming" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-purple" /> : null}</button><button type="button" onClick={() => setStatus("Completed")} className={`relative pb-3 text-sm font-bold ${status === "Completed" ? "text-black" : "text-purple-gray"}`}>Past{status === "Completed" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-purple" /> : null}</button></div><Link href="/post" className="text-sm font-bold text-purple">+ Post</Link></div>

      <div className="space-y-3">{filtered.length > 0 ? filtered.map((gig) => <MyGigCard key={`${gig.mode}-${gig.title}`} gig={gig} applicationStatus={applicationBySlug.get(gig.slug)} />) : <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white px-5 py-12 text-center"><p className="text-base font-bold">Nothing here yet</p><p className="mt-2 text-sm leading-6 text-purple-gray">Your {mode === "All" ? "gigs" : mode.toLowerCase() + " gigs"} will appear here.</p><Link href="/discover" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">Discover gigs</Link></div>}</div>
    </div>
  );
}
