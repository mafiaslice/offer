import Link from "next/link";
import { GradientShell } from "@/components/gradient-shell";
import { Icon } from "@/components/icon";
import { toneGradient } from "@/lib/data/format";

type GigCardProps = {
  href: string;
  title: string;
  hostName: string;
  kindLabel: "Volunteer" | "Paid gig";
  locationLabel?: string;
  dateLabel?: string;
  imageTone?: "sunset" | "mint" | "night";
  spotsLabel?: string;
};

export function GigCard({
  href,
  title,
  hostName,
  kindLabel,
  locationLabel,
  dateLabel,
  imageTone = "sunset",
  spotsLabel = "Spots open",
}: GigCardProps) {
  const volunteer = kindLabel === "Volunteer";

  return (
    <article className="transition-transform duration-150 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5">
      <GradientShell innerClassName="overflow-hidden">
        <Link href={href} className={`relative block h-44 bg-linear-to-br ${toneGradient(imageTone)} p-4 sm:h-48`} aria-label={`View ${title}`}>
          <div className="flex items-start justify-between">
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium text-ink backdrop-blur-sm">
              {volunteer ? "Volunteer" : "Paid gig"}
            </span>
          </div>
          <span className="absolute bottom-4 left-4 rounded-full bg-ink/80 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            {dateLabel || "Open now"}
          </span>
        </Link>
        <div className="space-y-3 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <Link href={href} className="text-lg font-normal leading-tight tracking-[-0.025em] text-white sm:text-xl">
              {title}
            </Link>
            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-[#E7E2EB]/25 bg-white/10 text-purple-ink" aria-hidden>
              <Icon name="arrow-up-right" className="size-4" />
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-purple-gray">
            <span className="inline-flex items-center gap-1">
              <Icon name="map-pin" className="size-4" />
              {locationLabel || "Place TBA"}
            </span>
            <span>•</span>
            <span>Host · {hostName || "Host"}</span>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-3">
            <span className="text-xs font-medium text-purple-gray">{spotsLabel}</span>
            <Link
              href={href}
              className="flex min-h-10 items-center rounded-full bg-purple-fill px-5 text-sm font-medium text-white transition-colors duration-150 hover:bg-[#7A3FF0]"
            >
              View details
            </Link>
          </div>
        </div>
      </GradientShell>
    </article>
  );
}
