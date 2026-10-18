"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { signInHref } from "@/lib/auth";
import { useOffer } from "@/components/offer-provider";
import { GigCheckInPanel } from "@/components/gig-check-in-panel";
import { Icon } from "@/components/icon";
import type { EnsureThreadInput, HostApplicant, MyGigCard } from "@/lib/data/types";

type GigStatus = "Upcoming" | "Completed";
type GigMode = "Joined" | "Hosted";

function toneClass(tone: MyGigCard["imageTone"]) {
  return {
    sunset: "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]",
    mint: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]",
    night: "from-[#29244b] via-[#6e49a8] to-[#ff4da3]",
  }[tone ?? "sunset"] ?? "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]";
}

function Stat({ value, label }: { value: string; label: string }) {
  return <div className="rounded-2xl glass p-4 shadow-card"><p className="text-2xl font-normal tracking-[-0.025em]">{value}</p><p className="mt-1 text-xs font-semibold text-purple-gray">{label}</p></div>;
}

function MyGigCardView({
  gig,
  applicationStatus,
  onMessage,
}: {
  gig: MyGigCard;
  applicationStatus?: "Applied" | "Accepted" | "Declined";
  onMessage?: () => void;
}) {
  return (
    <article className="rounded-3xl bg-[linear-gradient(135deg,#5646BC_0%,#8870DD_55%,#D98AB5_100%)] p-px shadow-card">
      <div className="overflow-hidden rounded-[23px] bg-[#211A35]/92 backdrop-blur-xl">
      <Link href={`/gigs/${gig.slug}`} className="group flex gap-3 p-3 transition-transform duration-150 hover:-translate-y-0.5 sm:gap-4 sm:p-4">
        <div className={`relative h-28 w-28 shrink-0 rounded-2xl bg-gradient-to-br ${toneClass(gig.imageTone)} sm:h-32 sm:w-32`}><span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-1 text-[9px] font-bold text-ink">{gig.kindLabel}</span></div>
        <div className="min-w-0 flex-1 py-1">
          <div className="flex items-start justify-between gap-2"><h2 className="line-clamp-2 text-base font-normal leading-tight tracking-[-0.025em] sm:text-lg">{gig.title}</h2><span className="text-purple-ink"><Icon name="arrow-up-right" className="size-5" /></span></div>
          <p className="mt-2 text-xs font-semibold text-purple-gray">{gig.mode} · {gig.hostName}</p>
          <p className="mt-1 text-xs text-purple-gray">{gig.dateLabel} · {gig.locationLabel}</p>
          <span className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${applicationStatus ? "bg-purple/10 text-purple-ink" : gig.status === "Upcoming" ? "bg-purple/10 text-purple-ink" : "bg-success/15 text-success"}`}>{applicationStatus ?? gig.status}</span>
        </div>
      </Link>
      {onMessage || (gig.mode === "Joined" && gig.checkInToken) ? (
        <div className="flex flex-wrap gap-4 border-t border-white/15 px-4 py-3">
          {onMessage ? <button type="button" onClick={onMessage} className="text-sm font-bold text-purple-ink">Message host</button> : null}
          {gig.mode === "Joined" && gig.checkInToken ? <Link href={`/check-in/${encodeURIComponent(gig.checkInToken)}`} className="text-sm font-bold text-purple-ink">Check in</Link> : null}
        </div>
      ) : null}
      </div>
    </article>
  );
}

function ApplicationReview({ applicants, onDecide, onMessage }: { applicants: HostApplicant[]; onDecide: (id: string, status: "accepted" | "declined") => Promise<boolean>; onMessage: (applicationId: string) => void }) {
  const [decisions, setDecisions] = useState<Record<string, "Accepted" | "Declined">>({});
  const title = applicants[0]?.gigTitle ?? "Your gig";

  return (
    <section className="space-y-4 rounded-[1.75rem] glass p-5 shadow-card sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-purple-ink">{title}</p>
          <h2 className="mt-1 text-xl font-normal tracking-[-0.025em]">Applications to review</h2>
        </div>
        <span className="rounded-full bg-purple/10 px-3 py-1.5 text-xs font-bold text-purple-ink">{applicants.filter((applicant) => !decisions[applicant.id] && applicant.status === "pending").length} pending</span>
      </div>
      <div className="space-y-3">
        {applicants.map((applicant) => {
          const decision = decisions[applicant.id] ?? (applicant.status === "accepted" ? "Accepted" : applicant.status === "declined" ? "Declined" : undefined);
          return (
            <div key={applicant.id} className="rounded-2xl border border-white/15 bg-white/10 p-3">
              <div className="flex items-center gap-3">
                <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${applicant.tone} text-xs font-bold text-white`}>{applicant.initials}</span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-bold">{applicant.name}</strong>
                  <span className="mt-0.5 block truncate text-xs text-purple-gray">{applicant.role} · {applicant.trust}</span>
                </span>
                {decision ? <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${decision === "Accepted" ? "bg-success/15 text-success" : "bg-error/10 text-error"}`}>{decision}</span> : null}
              </div>
              {!decision ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => { void onDecide(applicant.id, "declined").then((ok) => { if (ok) setDecisions((current) => ({ ...current, [applicant.id]: "Declined" })); }); }} className="min-h-10 rounded-xl border border-white/15 text-xs font-bold text-purple-gray transition-colors hover:border-error hover:text-error">Decline</button>
                  <button type="button" onClick={() => { void onDecide(applicant.id, "accepted").then((ok) => { if (ok) setDecisions((current) => ({ ...current, [applicant.id]: "Accepted" })); }); }} className="min-h-10 rounded-xl bg-purple-fill text-xs font-bold text-white transition-colors hover:bg-[#7A3FF0]">Accept</button>
                </div>
              ) : null}
              <button type="button" onClick={() => onMessage(applicant.id)} className="mt-2 text-xs font-bold text-purple-ink">Message applicant</button>
            </div>
          );
        })}
      </div>
      <p className="text-xs leading-5 text-purple-gray">Accepting reserves the role. Message from here when you want a 1:1 thread — Offer does not auto-start chats.</p>
    </section>
  );
}

type MyGigsViewProps = {
  hosted: MyGigCard[];
  joined: MyGigCard[];
  reviewQueue: HostApplicant[];
  loadError?: string;
};

export function MyGigsView({ hosted, joined, reviewQueue, loadError }: MyGigsViewProps) {
  const [status, setStatus] = useState<GigStatus>("Upcoming");
  const [mode, setMode] = useState<"All" | GigMode>("All");
  const router = useRouter();
  const { applications, reviewApplication, ensureThread, source, user, ready } = useOffer();
  const gigs = useMemo(() => [...joined, ...hosted], [hosted, joined]);
  const applicationBySlug = useMemo(() => new Map(applications.map((application) => [application.gigSlug, application.status])), [applications]);
  const filtered = useMemo(() => gigs.filter((gig) => gig.status === status && (mode === "All" || gig.mode === mode)), [gigs, mode, status]);
  const joinedCount = joined.length;
  const hostedCount = hosted.length;
  const completedCount = gigs.filter((gig) => gig.status === "Completed").length;
  const needsSignIn = source === "postgres" && ready && !user;
  const showReview = reviewQueue.length > 0 && status === "Upcoming" && mode !== "Joined";

  async function openThread(input: EnsureThreadInput) {
    if (source === "postgres" && ready && !user) {
      router.push(signInHref("/my-gigs"));
      return;
    }
    const result = await ensureThread(input);
    if (!result.ok || !result.thread) {
      if (result.status === 401) router.push(signInHref("/my-gigs"));
      return;
    }
    router.push(`/messages?thread=${result.thread.id}`);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <header className="space-y-2"><p className="text-sm font-semibold text-purple-ink">Your gigs</p><h1 className="text-[2.15rem] font-normal leading-[1.05] tracking-[-0.025em] sm:text-5xl">Your gigs.</h1><p className="text-sm leading-6 text-purple-gray sm:text-base">Gigs you&apos;re volunteering on and gigs you host.</p></header>

      <div className="grid grid-cols-3 gap-3"><Stat value={String(joinedCount)} label="Joined" /><Stat value={String(hostedCount)} label="Hosted" /><Stat value={String(completedCount)} label="Gigs completed" /></div>

      {needsSignIn ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/20 glass px-5 py-12 text-center">
          <p className="text-base font-bold">Sign in to see your gigs</p>
          <p className="mt-2 text-sm leading-6 text-purple-gray">Hosted and applied gigs, Message host/applicant, and the check-in QR live here after you sign in.</p>
          <Link href={signInHref("/my-gigs")} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-purple-fill px-5 text-sm font-bold text-white">Sign in</Link>
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-[1.5rem] border border-dashed border-white/20 glass px-5 py-12 text-center">
          <p className="text-base font-bold">My Gigs couldn&apos;t load</p>
          <p className="mt-2 text-sm leading-6 text-purple-gray">{loadError}</p>
        </div>
      ) : null}

      {!needsSignIn ? (
        <>
      <div className="flex rounded-2xl glass p-1.5 shadow-sm"><button type="button" onClick={() => setMode("All")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "All" ? "bg-purple-fill text-white" : "text-purple-gray"}`}>All gigs</button><button type="button" onClick={() => setMode("Joined")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "Joined" ? "bg-purple-fill text-white" : "text-purple-gray"}`}>Joined</button><button type="button" onClick={() => setMode("Hosted")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${mode === "Hosted" ? "bg-purple-fill text-white" : "text-purple-gray"}`}>Hosted</button></div>

      <div className="flex items-center justify-between"><div className="flex gap-5 border-b border-white/15"><button type="button" onClick={() => setStatus("Upcoming")} className={`relative pb-3 text-sm font-bold ${status === "Upcoming" ? "text-white" : "text-purple-gray"}`}>Upcoming{status === "Upcoming" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-purple-fill" /> : null}</button><button type="button" onClick={() => setStatus("Completed")} className={`relative pb-3 text-sm font-bold ${status === "Completed" ? "text-white" : "text-purple-gray"}`}>Past{status === "Completed" ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-purple-fill" /> : null}</button></div><Link href="/post" className="text-sm font-bold text-purple-ink">+ Post</Link></div>

      <div className={filtered.length > 0 ? "grid gap-4 lg:grid-cols-2" : ""}>{filtered.length > 0 ? filtered.map((gig) => (
        <div key={`${gig.mode}-${gig.id}-${gig.title}`} className="space-y-3">
          <MyGigCardView gig={gig} applicationStatus={applicationBySlug.get(gig.slug) ?? gig.applicationStatus} onMessage={gig.mode === "Joined" ? () => { void openThread({ gigSlug: gig.slug }); } : undefined} />
          {gig.mode === "Hosted" ? <GigCheckInPanel gigSlug={gig.slug} compact /> : null}
        </div>
      )) : <div className="rounded-[1.5rem] border border-dashed border-white/20 glass px-5 py-12 text-center"><p className="text-base font-bold">Nothing here yet</p><p className="mt-2 text-sm leading-6 text-purple-gray">Your {mode === "All" ? "gigs" : mode.toLowerCase() + " gigs"} will appear here.</p><Link href="/discover" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-purple-fill px-5 text-sm font-bold text-white">Discover gigs</Link></div>}</div>
      {showReview ? <ApplicationReview applicants={reviewQueue} onMessage={(applicationId) => { void openThread({ applicationId }); }} onDecide={async (id, nextStatus) => {
        if (source === "postgres" && ready && !user) {
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
        </>
      ) : null}
    </div>
  );
}
