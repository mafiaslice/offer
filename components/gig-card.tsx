type GigCardProps = {
  title: string;
  hostName: string;
  kindLabel: "Volunteer" | "Paid gig";
  locationLabel?: string;
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
}: GigCardProps) {
  const volunteer = kindLabel === "Volunteer";

  return (
    <article className="overflow-hidden rounded-card border border-border bg-white shadow-sm">
      <div
        className="h-40 bg-linear-to-br from-purple/80 via-purple to-turquoise/50"
        aria-hidden
      />
      <div className="space-y-2 p-4">
        <p
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            volunteer ? "bg-lavender text-purple" : "bg-yellow/30 text-black"
          }`}
        >
          {kindLabel}
        </p>
        <h2 className="text-lg font-semibold tracking-tight text-black">
          {title}
        </h2>
        <p className="text-sm text-purple-gray">
          Host · {hostName}
          {locationLabel ? ` · ${locationLabel}` : null}
        </p>
      </div>
    </article>
  );
}
