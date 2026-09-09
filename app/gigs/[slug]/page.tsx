import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

type GigRecord = {
  title: string;
  kind: "Volunteer" | "Paid gig";
  host: string;
  hostInitials: string;
  date: string;
  location: string;
  spots: string;
  about: string;
  tone: string;
  roles: string[];
  incentive: string;
  instructions: string;
};

const gigs: Record<string, GigRecord> = {
  "hangout-with-slice": {
    title: "Hangout with Slice",
    kind: "Volunteer",
    host: "Slice",
    hostInitials: "MS",
    date: "Friday, September 25 · 10:00 AM",
    location: "Ikoyi, Lagos",
    spots: "5 spots left",
    about: "A relaxed community hangout bringing good people together for an afternoon of food, conversation, and new connections.",
    tone: "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]",
    roles: ["Welcome guests and help people find their way", "Support setup, icebreakers, and light coordination"],
    incentive: "Transport support is available for every volunteer.",
    instructions: "Come dressed in black or white, wear comfortable shoes, and arrive 30 minutes early for briefing.",
  },
  "community-food-drive": {
    title: "Community food drive",
    kind: "Volunteer",
    host: "Neighbourhood Hub",
    hostInitials: "NH",
    date: "Saturday, October 2 · 8:00 AM",
    location: "Yaba, Lagos",
    spots: "12 spots left",
    about: "Help pack and distribute food parcels to families in the neighbourhood with a welcoming, organised team.",
    tone: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]",
    roles: ["Pack food parcels and label deliveries", "Welcome families and keep the distribution line moving"],
    incentive: "Breakfast and transport support are provided.",
    instructions: "Wear a comfortable top, closed shoes, and be ready to work on your feet.",
  },
  "festival-crew": {
    title: "Festival crew wanted",
    kind: "Paid gig",
    host: "Live Works",
    hostInitials: "LW",
    date: "Monday, October 12 · 4:00 PM",
    location: "Victoria Island, Lagos",
    spots: "8 spots left",
    about: "Join the on-ground crew helping a live festival run smoothly from doors open through close.",
    tone: "from-[#29244b] via-[#6e49a8] to-[#ff4da3]",
    roles: ["Guest check-in and wristband support", "Wayfinding and light event operations"],
    incentive: "₦35,000 stipend with dinner included.",
    instructions: "Black trousers, plain black top, and comfortable closed shoes required.",
  },
};

export function generateStaticParams() {
  return Object.keys(gigs).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const gig = gigs[slug];
  return { title: gig?.title ?? "Gig details" };
}

export default async function GigDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const gig = gigs[slug];

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

      <div className={`relative h-64 overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${gig.tone} p-5 shadow-[0_18px_40px_rgba(53,32,79,0.12)] sm:h-80`}>
        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-black backdrop-blur-sm">{gig.kind}</span>
        <span className="absolute bottom-5 left-5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">{gig.spots}</span>
      </div>

      <section className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="space-y-3">
          <h1 className="max-w-xl text-[2rem] font-bold leading-[1.02] tracking-[-0.06em] sm:text-4xl">{gig.title}</h1>
          <div className="flex items-center gap-3 text-sm text-purple-gray">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#f5cc00] to-[#ff4da3] text-xs font-bold text-white">{gig.hostInitials}</span>
            <span>Hosted by <strong className="text-black">{gig.host}</strong></span>
            <span className="rounded-full bg-success/15 px-2 py-1 text-[10px] font-bold text-[#37951a]">Verified</span>
          </div>
        </div>

        <div className="grid gap-3 border-y border-black/5 py-5 sm:grid-cols-3">
          <div className="flex gap-3"><span className="text-lg">◷</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">When</p><p className="mt-1 text-sm font-bold leading-snug">{gig.date}</p></div></div>
          <div className="flex gap-3"><span className="text-lg">⌖</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">Where</p><p className="mt-1 text-sm font-bold leading-snug">{gig.location}</p></div></div>
          <div className="flex gap-3"><span className="text-lg">♧</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">Availability</p><p className="mt-1 text-sm font-bold leading-snug">{gig.spots}</p></div></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-[-0.03em]">About this gig</h2>
          <p className="text-sm leading-6 text-purple-gray">{gig.about}</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-[-0.03em]">What you&apos;ll do</h2>
          <ul className="space-y-2.5">
            {gig.roles.map((role) => <li key={role} className="flex gap-3 text-sm leading-6 text-purple-gray"><span className="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-lavender text-xs font-bold text-purple">✓</span>{role}</li>)}
          </ul>
        </div>

        <div className="rounded-2xl bg-lavender p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-purple">Incentive</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-black">{gig.incentive}</p>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-[-0.03em]">Instructions</h2>
          <p className="text-sm leading-6 text-purple-gray">{gig.instructions}</p>
        </div>

        <div className="flex h-36 items-end rounded-2xl bg-[radial-gradient(circle_at_30%_20%,rgba(142,82,255,0.15),transparent_45%),linear-gradient(135deg,#eef0f8,#e6e0f5)] p-4">
          <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-black shadow-sm">⌖ {gig.location}</span>
        </div>
      </section>

      <div className="sticky bottom-3 z-10 rounded-2xl bg-black p-2 shadow-[0_16px_32px_rgba(0,0,0,0.2)]">
        <button type="button" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-purple px-5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black">Join this gig</button>
      </div>
    </div>
  );
}
