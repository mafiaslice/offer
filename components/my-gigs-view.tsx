"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { signInHref } from "@/lib/auth";
import { useOffer } from "@/components/offer-provider";
import type { HostApplicant, MyGigCard } from "@/lib/data/types";

type GigStatus = "Upcoming" | "Completed";
type GigMode = "Joined" | "Hosted";

function toneClass(tone: MyGigCard["imageTone"]) {
  return {
    sunset: "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]",
    mint: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]",
    night: "from-[#29244b] via-[#6e49a8] to-[#ff4da3]",
  }[tone];
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">{value}</p><p className="mt-1 text-xs font-semibold text-purple-gray">{label}</p></div>;
}

function MyGigCardView({ gig, applicationStatus }: { gig: MyGigCard; applicationStatus?: "Applied" | "Accepted" | "Declined" }) {
  return (
    <Link href={`/gigs/${gig.slug}`} className="group flex gap-3 rounded-[1.5rem] bg-white p-3 shadow-[0_12px_28px_rgba(53,32,79,0.07)] transition-transform hover:-translate-y-0.5 sm:gap-4 sm:p-4">
      <div className={`relative h-28 w-28 shrink-0 rounded-2xl bg-gradient-to-br ${toneClass(gig.imageTone)} sm:h-32 sm:w-32`}><span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-black">{gig.kindLabel}</span></div>
      <div className="min-w-0 flex-1 py-1">
        <div className="flex items-start justify-between gap-2"><h2 className="line-clamp-2 text-base font-bold leading-tight tracking-[-0.03em] sm:text-lg">{gig.title}</h2><span className="text-lg text-purple">↗</span></div>
        <p className="mt-2 text-xs font-semibold text-purple-gray">{gig.mode} · {gig.hostName}</p>
        <p className="mt-1 text-xs text-purple-gray">{gig.dateLabel} · {gig.locationLabel}</p>
        <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${applicationStatus ? "bg-purple/10 text-purple" : gig.status === "Upcoming" ? "bg-purple/10 text-purple" : "bg-success/15 text-[#37951a]"}`}>{applicationStatus ?? gig.status}</span>
      </div>
    </Link>
  );
}

function ApplicationReview({ applicants, onDecide }: { applicants: HostApplicant[]; onDecide: (id: string, status: "accepted" | "declined") => Promise<boolean> }) {
  const [decisions, setDecisions] = useState<Record<string, "Accepted" | "Declined">>({});
  const title = applicants[0]?.gigTitle ?? "Your gig";

  return (
    <section className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-purple">{title}</p>
          <h2 className="mt-1 text-xl font-bold tracking-[-0.04em]">Applications to review</h2>
        </div>
        <span className="rounded-full bg-purple/10 px-3 py-1.5 text-xs font-bold text-purple">{applicants.filter((applicant) => !decisions[applicant.id] && applicant.status === "pending").length} pending</span>
      </div>
      <div className="space-y-3">
        {applicants.map((applicant) => {
          const decision = decisions[applicant.id] ?? (applicant.status === "accepted" ? "Accepted" : applicant.status === "declined" ? "Declined" : undefined);
          return (
            <div key={applicant.id} className="rounded-2xl border border-black/5 bg-lavender/60 p-3">
              <div className="flex items-center gap-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${applicant.tone} text-xs font-bold text-white`}>{applicant.initials}</span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-bold">{applicant.name}</strong>
                  <span className="mt-0.5 block truncate text-xs text-purple-gray">{applicant.role} · {applicant.trust}</span>
                </span>
                {decision ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${decision === "Accepted" ? "bg-success/15 text-[#37951a]" : "bg-error/10 text-error"}`}>{decision}</span> : null}
              </div>
              {!decision ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { void onDecide(applicant.id, "declined").then((ok) => { if (ok) setDecisions((current) => ({ ...current, [applicant.id]: "Declined" })); }); }} className="min-h-10 rounded-xl border border-black/10 text-xs font-bold text-purple-gray transition-colors hover:border-error hover:text-error">Decline</button>
                  <button type="button" onClick={() => { void onDecide(applicant.id, "accepted").then((ok) => { if (ok) setDecisions((current) => ({ ...current, [applicant.id]: "Accepted" })); }); }} className="min-h-10 rounded-xl bg-black text-xs font-bold text-white transition-colors hover:bg-purple">Accept</button>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-purple-gray">Applicant decisions notify people and reserve their selected role once messaging is connected.</p>
    </section>
  );
}

type MyGigsViewProps = {
  hosted: MyGigCard[];
  joined: MyGigCard[];
  reviewQueue: HostApplicant[];
};

export function MyGigsView({ hosted, joined, reviewQueue }: MyGigsViewProps) {
  const [status, setStatus] = useState<GigStatus>("Upcoming");
  const [mode, setMode] = useState<"All" | GigMode>("All");
  const router = useRouter();
  const { applications, reviewApplication, source, user, ready } = useOffer();
  const gigs = useMemo(() => [...joined, ...hosted], [hosted, joined]);
  const applicationBySlug = useMemo(() => new Map(applications.map((application) => [application.gigSlug, application.status])), [applications]);
  const filtered = useMemo(() => gigs.filter((gig) => gig.status === status && (mode === "All" || gig.mode === mode)), [gigs, mode, status]);
  const extraJoined = applications.filter((application) => !gigs.some((gig) => gig.slug === application.gigSlug)).length;
  const joinedCount = source === "demo-adapter" ? 3 + extraJoined : joined.length;
  const hostedCount = source === "demo-adapter" ? 1 : hosted.length;
  const peopleMet = source === "demo-adapter" ? "12" : "—";

  return (
    <div className="mx-auto max-w-3xl space-y-7">
      <header className="space-y-2"><p className="text-sm font-semibold text-purple">Your activity</p><h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">My gigs.</h1><p className="text-sm leading-6 text-purple-gray sm:text-base">Keep track of where you&apos;re showing up and what you&apos;re building.</p></header>

      <div className="grid grid-cols-3 gap-3"><Stat value={String(joinedCount)} label="Joined" /><Stat value={String(hostedCount)} label="Hosted" /><Stat value={peopleMet} label="People met" /></div>

      <div className="flex rounded-2xl bg-white p-1.5 shadow-sm"><button type="button" onClick={() => setMode("All")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "All" ? "bg-black text-white" : "text-purple-gray"}`}>All gigs</button><button type="button" onClick={() => setMode("Joined")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "Joined" ? "bg-black text-white" : "text-purple-gray"}`}>Joined</button><button type="button" onClick={() => setMode("Hosted")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "Hosted" ? "bg-black text-white" : "text-purple-gray"}`}>Hosted</button></div>

      <div className="flex items-center justify-between"><div className="flex gap-5 border-b border-black/10"><button type="button" onClick={() => setStatus("Upcoming")} className={`relative pb-3 text-sm font-bold ${status === "Upcoming" ? "text-black" : "text-purple-gray"}`}>Upcoming{status === "Upcoming" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-purple" /> : null}</button><button type="button" onClick={() => setStatus("Completed")} className={`relative pb-3 text-sm font-bold ${status === "Completed" ? "text-black" : "text-purple-gray"}`}>Past{status === "Completed" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-purple" /> : null}</button></div><Link href="/post" className="text-sm font-bold text-purple">+ Post</Link></div>

      <div className="space-y-3">{filtered.length > 0 ? filtered.map((gig) => <MyGigCardView key={`${gig.mode}-${gig.id}-${gig.title}`} gig={gig} applicationStatus={applicationBySlug.get(gig.slug) ?? gig.applicationStatus} />) : <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white px-5 py-12 text-center"><p className="text-base font-bold">Nothing here yet</p><p className="mt-2 text-sm leading-6 text-purple-gray">Your {mode === "All" ? "gigs" : mode.toLowerCase() + " gigs"} will appear here.</p><Link href="/discover" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">Discover gigs</Link></div>}</div>
      {mode === "Hosted" && status === "Upcoming" && reviewQueue.length > 0 ? <ApplicationReview applicants={reviewQueue} onDecide={async (id, nextStatus) => {
        if (source === "supabase" && ready && !user) {
          router.push(signInHref("/my-gigs"));
          return false;
        }
        const result = await reviewApplication(id, nextStatus);
        if (!result.ok) {
          if (result.status === 401) router.push(signInHref("/my-gigs"));
          return false;
        }
        return true;
      }} /> : null}
    </div>
  );
}
