import Link from "next/link";
import { Icon, type IconName } from "@/components/icon";
import { dataSource, listGigs } from "@/lib/data";
import { listGigs as listDemoGigs } from "@/lib/data/demo-adapter";
import { toneGradient } from "@/lib/data/format";
import type { GigListItem } from "@/lib/data/types";

const steps: Array<{ icon: IconName; title: string; detail: string }> = [
  {
    icon: "plus",
    title: "Host posts a Gig with Roles and Slots",
    detail: "The Host names the work, the Role, and the Slot.",
  },
  {
    icon: "users",
    title: "Volunteers apply",
    detail: "Volunteers apply for a Role. Paid gigs stay available when a Host needs them.",
  },
  {
    icon: "circle-check",
    title: "Check in with QR",
    detail: "Participants check in with the Gig QR.",
  },
];

const audiences: Array<{ title: string; body: string; points: string[] }> = [
  {
    title: "For Volunteers",
    body: "Find a volunteer Gig, apply, and check in.",
    points: [
      "A Host posts a Gig with Roles and Slots.",
      "You apply for a Role.",
      "Check in with QR when you show up.",
    ],
  },
  {
    title: "For Hosts",
    body: "Post the Gig, then meet the people who applied.",
    points: [
      "Post a Gig with Roles and Slots.",
      "Volunteers apply for each Role.",
      "Check participants in with QR.",
    ],
  },
];

async function volunteerStrip(): Promise<{ gigs: GigListItem[]; sample: boolean }> {
  if (dataSource() === "postgres") {
    try {
      const { data } = await listGigs({ kind: "volunteer" });
      const gigs = data.filter((gig) => gig.kindLabel === "Volunteer").slice(0, 3);
      if (gigs.length > 0) return { gigs, sample: false };
    } catch {
      // Live gigs did not load. The strip falls back to the demo catalog.
    }
    const { data } = listDemoGigs({ kind: "volunteer" });
    return {
      gigs: data.filter((gig) => gig.kindLabel === "Volunteer").slice(0, 3),
      sample: true,
    };
  }

  const { data } = await listGigs({ kind: "volunteer" });
  return { gigs: data.filter((gig) => gig.kindLabel === "Volunteer").slice(0, 3), sample: false };
}

function GlassLink({
  href,
  children,
  primary = false,
}: {
  href: string;
  children: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={href}
      className={
        primary
          ? "inline-flex min-h-12 items-center justify-center rounded-2xl bg-white px-6 text-sm font-medium text-[#181427] transition-colors duration-150 ease-out hover:bg-[#F4F1F8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          : "inline-flex min-h-12 items-center justify-center rounded-2xl border border-white/25 bg-white/10 px-6 text-sm font-medium text-white backdrop-blur-xl transition-colors duration-150 ease-out hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      }
    >
      {children}
    </Link>
  );
}

export async function LandingPage() {
  const { gigs, sample } = await volunteerStrip();

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#181427] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-[#5646BC]/45 blur-3xl" />
        <div className="absolute top-48 -right-20 h-96 w-96 rounded-full bg-[#D98AB5]/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#8870DD]/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-4 py-4 sm:px-8 lg:px-10">
        <header className="sticky top-3 z-20 flex items-center justify-between gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] backdrop-blur-xl">
          <Link href="/" className="text-base tracking-[-0.03em] text-white" aria-label="Offer">
            Offer
          </Link>
          <nav aria-label="Landing" className="flex items-center gap-1 sm:gap-2">
            <Link href="/discover" className="rounded-lg px-3 py-2 text-sm text-[#C9C2D4] transition-colors duration-150 hover:text-white">
              Find a gig
            </Link>
            <Link href="/post" className="rounded-2xl border border-white/25 px-3 py-2 text-sm text-white transition-colors duration-150 hover:bg-white/10">
              Post a Gig
            </Link>
          </nav>
        </header>

        <main className="flex flex-1 flex-col gap-8 py-6 sm:gap-12 sm:py-8">
          <section className="rounded-[28.8px] bg-[linear-gradient(135deg,#5646BC_0%,#8870DD_55%,#D98AB5_100%)] p-px shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)]">
            <div className="grid gap-8 rounded-[27.8px] bg-[#211A35]/80 px-5 py-8 backdrop-blur-xl sm:px-8 sm:py-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center lg:gap-10 lg:px-12 lg:py-14">
              <div>
                <p className="text-sm text-[#E7E2EB]">Hosts and Volunteers</p>
                <h1 className="mt-3 text-[48px] leading-none font-normal tracking-[-0.025em] sm:text-[60px] sm:leading-[60px]">
                  Offer
                </h1>
                <p className="mt-4 max-w-xl text-xl leading-7 tracking-[-0.02em] text-white sm:text-2xl sm:leading-8">
                  Volunteer first. Paid when you need it.
                </p>
                <p className="mt-4 max-w-xl text-base leading-6 text-white/75">
                  Offer is where Hosts find trusted, vetted hands for events and projects. Volunteers first, and paid gigs when needed.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <GlassLink href="/discover" primary>
                    Find a gig
                  </GlassLink>
                  <GlassLink href="/post">Post a Gig</GlassLink>
                </div>
              </div>

              <ol className="grid gap-3">
                {steps.map((step, index) => (
                  <li key={step.title} className="flex items-start gap-3 rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-xl">
                    <span className="grid size-10 shrink-0 place-items-center rounded-2xl border border-white/20 bg-white/10 text-white">
                      <Icon name={step.icon} className="size-5" />
                    </span>
                    <span>
                      <span className="block text-xs tracking-wide text-[#C9C2D4]">0{index + 1}</span>
                      <span className="mt-1 block text-sm leading-5 text-white">{step.title}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          <section aria-labelledby="how-it-works-heading" className="grid gap-4">
            <div className="max-w-2xl">
              <h2 id="how-it-works-heading" className="text-[32px] leading-9 font-normal tracking-[-0.025em] sm:text-[40px] sm:leading-[44px]">
                How it works
              </h2>
              <p className="mt-3 text-base leading-6 text-white/70">
                Three steps, for Volunteers and for Hosts. A Host posts a Gig with Roles and Slots, volunteers apply, and everyone checks in with QR.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              {audiences.map((audience) => (
                <article key={audience.title} className="rounded-3xl border border-[#E7E2EB]/20 bg-white/10 p-4 backdrop-blur-xl sm:p-6">
                  <h3 className="text-lg tracking-[-0.02em]">{audience.title}</h3>
                  <p className="mt-2 text-sm leading-5 text-white/70">{audience.body}</p>
                  <ol className="mt-5 grid gap-3">
                    {audience.points.map((point, index) => (
                      <li key={point} className="flex gap-3 rounded-2xl border border-white/10 bg-[#201938]/70 px-3 py-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-white/10 text-xs text-white">{index + 1}</span>
                        <span className="text-sm leading-5 text-white">{point}</span>
                      </li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="volunteer-gigs-heading" className="grid gap-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 id="volunteer-gigs-heading" className="text-[32px] leading-9 font-normal tracking-[-0.025em] sm:text-[40px] sm:leading-[44px]">
                  Volunteer Gigs
                </h2>
                <p className="mt-2 text-sm leading-5 text-white/70">
                  {sample
                    ? "Showing demo Gigs until a Host posts a volunteer Gig."
                    : "Open volunteer Gigs you can apply for."}
                </p>
              </div>
              <Link href="/discover" className="hidden text-sm text-[#C9C2D4] transition-colors duration-150 hover:text-white sm:inline">
                Find a gig
              </Link>
            </div>

            {gigs.length > 0 ? (
              <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-1 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
                {gigs.map((gig) => (
                  <Link
                    key={gig.slug}
                    href={`/gigs/${gig.slug}`}
                    className="flex w-[78%] shrink-0 snap-start flex-col rounded-3xl bg-[linear-gradient(135deg,#5646BC_0%,#8870DD_55%,#D98AB5_100%)] p-px text-white shadow-[0_20px_25px_-5px_rgba(53,36,86,0.15)] transition-transform duration-150 hover:-translate-y-0.5 sm:w-[46%] lg:w-auto"
                  >
                    <span className="flex h-full flex-col gap-3 rounded-[23px] bg-[#211A35]/92 p-3 backdrop-blur-xl">
                    <span className={`block h-28 rounded-2xl bg-linear-to-br ${toneGradient(gig.imageTone)}`} />
                    <span className="px-1 pb-1">
                      <span className="text-xs font-medium tracking-wide text-purple-gray uppercase">Volunteer</span>
                      <span className="mt-1 block text-lg leading-6 tracking-[-0.02em]">{gig.title}</span>
                      <span className="mt-2 block text-sm text-purple-gray">Host · {gig.hostName}</span>
                      <span className="mt-2 flex items-center gap-1.5 text-sm text-purple-gray">
                        <Icon name="map-pin" className="size-4 shrink-0" />
                        {gig.locationLabel}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-sm text-purple-gray">
                        <Icon name="clock" className="size-4 shrink-0" />
                        {gig.dateLabel}
                      </span>
                      <span className="mt-3 block text-xs font-medium text-white">{gig.spotsLabel}</span>
                    </span>
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-white/25 bg-white/5 px-5 py-10 text-center">
                <p className="text-base">No volunteer Gigs are open yet.</p>
                <div className="mt-5">
                  <GlassLink href="/post" primary>
                    Post a Gig
                  </GlassLink>
                </div>
              </div>
            )}
          </section>
        </main>

        <footer className="mt-4 border-t border-white/15 py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-lg tracking-[-0.03em]">Offer</p>
              <p className="mt-1 text-sm text-white/70">Volunteer first. Paid when you need it.</p>
            </div>
            <nav aria-label="Footer" className="flex gap-4 text-sm text-[#C9C2D4]">
              <Link href="/discover" className="transition-colors duration-150 hover:text-white">
                Find a gig
              </Link>
              <Link href="/post" className="transition-colors duration-150 hover:text-white">
                Post a Gig
              </Link>
            </nav>
          </div>
        </footer>
      </div>
    </div>
  );
}
