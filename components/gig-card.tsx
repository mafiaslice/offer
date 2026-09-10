import Link from "next/link";
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

/**
 * Structural image-led gig card. Not product UI — visual matching waits
 * on reference boards (docs/ui-reference.md).
 */
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
    <article className="group overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-[0_14px_34px_rgba(53,32,79,0.08)] transition-transform hover:-translate-y-0.5">
      <Link href={href} className={`relative block h-44 bg-linear-to-br ${toneGradient(imageTone)} p-4 sm:h-48`} aria-label={`View ${title}`}>
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-black backdrop-blur-sm">
            {volunteer ? "Volunteer" : "Paid gig"}
          </span>
        </div>
        <span className="absolute bottom-4 left-4 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {dateLabel || "Open now"}
        </span>
      </Link>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <Link href={href} className="text-lg font-bold leading-tight tracking-[-0.03em] text-black sm:text-xl">
            {title}
          </Link>
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-lavender text-purple" aria-hidden>↗</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-purple-gray">
          <span>⌖ {locationLabel || "Place TBA"}</span>
          <span>•</span>
          <span>Host · {hostName || "Host"}</span>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          <span className="text-xs font-semibold text-purple-gray">{spotsLabel}</span>
          <Link href={href} className="flex min-h-10 items-center rounded-full bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-purple">View details</Link>
        </div>
      </div>
    </article>
  );
}
