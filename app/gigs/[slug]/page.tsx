import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GigJoinButton } from "@/components/gig-join-button";
import { getGigBySlug } from "@/lib/data";

const tones = {
  sunset: "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]",
  mint: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]",
  night: "from-[#29244b] via-[#6e49a8] to-[#ff4da3]",
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gig = await getGigBySlug(slug);
  return { title: gig?.title ?? "Gig details" };
}

export default async function GigDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gig = await getGigBySlug(slug);

  if (!gig) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-5">
      <div className="flex items-center justify-between">
        <Link href="/discover" className="grid size-11 place-items-center rounded-full bg-white text-xl shadow-sm transition-colors hover:bg-black hover:text-white" aria-label="Back to discover">←</Link>
        <div className="flex gap-2">
          <button type="button" className="grid size-11 place-items-center rounded-full bg-white text-xl shadow-sm" aria-label="Save gig">♡</button>
          <button type="button" className="grid size-11 place-items-center rounded-full bg-white text-lg shadow-sm" aria-label="Share gig">↗</button>
        </div>
      </div>

      <div className={`relative h-64 overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${tones[gig.imageTone]} p-5 shadow-[0_18px_40px_rgba(53,32,79,0.12)] sm:h-80`}>
        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-black backdrop-blur-sm">{gig.kindLabel}</span>
        <span className="absolute bottom-5 left-5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">{gig.spotsLabel}</span>
      </div>

      <section className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="space-y-3">
          <h1 className="max-w-xl text-[2rem] font-bold leading-[1.02] tracking-[-0.06em] sm:text-4xl">{gig.title}</h1>
          <div className="flex items-center gap-3 text-sm text-purple-gray">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#f5cc00] to-[#ff4da3] text-xs font-bold text-white">{gig.hostInitials}</span>
            <span>Hosted by <strong className="text-black">{gig.hostName}</strong></span>
            {gig.verified ? <span className="rounded-full bg-success/15 px-2 py-1 text-[10px] font-bold text-[#37951a]">Verified</span> : null}
          </div>
        </div>

        <div className="grid gap-3 border-y border-black/5 py-5 sm:grid-cols-3">
          <div className="flex gap-3"><span className="text-lg">◷</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">When</p><p className="mt-1 text-sm font-bold leading-snug">{gig.longDateLabel}</p></div></div>
          <div className="flex gap-3"><span className="text-lg">⌖</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">Where</p><p className="mt-1 text-sm font-bold leading-snug">{gig.locationLabel}</p></div></div>
          <div className="flex gap-3"><span className="text-lg">♧</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">Availability</p><p className="mt-1 text-sm font-bold leading-snug">{gig.spotsLabel}</p></div></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-[-0.03em]">About this gig</h2>
          <p className="text-sm leading-6 text-purple-gray">{gig.about}</p>
        </div>

        {gig.roles.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-lg font-bold tracking-[-0.03em]">What you&apos;ll do</h2>
            <ul className="space-y-2.5">
              {gig.roles.map((role) => <li key={role} className="flex gap-3 text-sm leading-6 text-purple-gray"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-lavender text-xs font-bold text-purple">✓</span>{role}</li>)}
            </ul>
          </div>
        ) : null}

        {gig.incentive ? (
          <div className="rounded-2xl bg-lavender p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-purple">Incentive</p>
            <p className="mt-1 text-sm font-semibold leading-6 text-black">{gig.incentive}</p>
          </div>
        ) : null}

        {gig.instructions ? (
          <div className="space-y-2">
            <h2 className="text-lg font-bold tracking-[-0.03em]">Instructions</h2>
            <p className="text-sm leading-6 text-purple-gray">{gig.instructions}</p>
          </div>
        ) : null}

        <div className="flex h-36 items-end rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(142,82,255,0.15),transparent_45%),linear-gradient(135deg,#eef0f8,#e6e0f5)] p-4">
          <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-black shadow-sm">⌖ {gig.locationLabel}</span>
        </div>
      </section>

      <GigJoinButton slug={gig.slug} kind={gig.kindLabel} roles={gig.roles} />
    </div>
  );
}
