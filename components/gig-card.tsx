type GigCardProps = {
  title: string;
  hostName: string;
  kindLabel: "Volunteer" | "Paid gig";
  locationLabel?: string;
  dateLabel?: string;
  imageTone?: "sunset" | "mint" | "night";
};

/**
 * Structural image-led gig card. Not product UI — visual matching waits
 * on reference boards (docs/ui-reference.md).
 */
export function GigCard({
  title,
  hostName,
  kindLabel,
  locationLabel,
  dateLabel,
  imageTone = "sunset",
}: GigCardProps) {
  const volunteer = kindLabel === "Volunteer";
  const tone = {
    sunset: "from-[#ffcf91] via-[#ff7da8] to-[#8e52ff]",
    mint: "from-[#bcebdc] via-[#77d9c4] to-[#7b8cff]",
    night: "from-[#29244b] via-[#6e49a8] to-[#ff4da3]",
  }[imageTone];

  return (
    <article className="group overflow-hidden rounded-[1.5rem] border border-black/5 bg-white shadow-[0_14px_34px_rgba(53,32,79,0.08)] transition-transform hover:-translate-y-0.5">
      <div
        className={`relative h-44 bg-linear-to-br ${tone} p-4 sm:h-48`}
        aria-hidden
      >
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-black backdrop-blur-sm">
            {volunteer ? "Volunteer" : "Paid gig"}
          </span>
          <button type="button" aria-label={`Save ${title}`} className="grid size-9 place-items-center rounded-full bg-white/90 text-black backdrop-blur-sm transition-transform hover:scale-105">
            <span aria-hidden className="text-lg leading-none">♡</span>
          </button>
        </div>
        <span className="absolute bottom-4 left-4 rounded-full bg-black/75 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {dateLabel ?? "Open now"}
        </span>
      </div>
      <div className="space-y-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold leading-tight tracking-[-0.03em] text-black sm:text-xl">
            {title}
          </h2>
          <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-lavender text-purple" aria-hidden>↗</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-purple-gray">
          <span>⌖ {locationLabel ?? "Nearby"}</span>
          <span>•</span>
          <span>Host · {hostName}</span>
        </div>
        <div className="flex items-center justify-between border-t border-black/5 pt-3">
          <span className="text-xs font-semibold text-purple-gray">8 spots left</span>
          <button type="button" className="min-h-10 rounded-full bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-purple">View gig</button>
        </div>
      </div>
    </article>
  );
}
