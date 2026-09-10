import type { Metadata } from "next";
import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { GigJoinButton } from "@/components/gig-join-button";
import { GigCheckInPanel } from "@/components/gig-check-in-panel";
import { errorMessage, getCheckInContext, getGigBySlug } from "@/lib/data";
import { toneGradient } from "@/lib/data/format";
import type { GigDetail, GigRoleView, GigSlotView } from "@/lib/data/types";

export const dynamic = "force-dynamic";

function paragraphs(text: string) {
  return text.split(/\n\n+/).map((part) => part.trim()).filter(Boolean);
}

function roleList(gig: GigDetail): GigRoleView[] {
  if (gig.roleDetails?.length) return gig.roleDetails.filter((role) => role.title?.trim());
  return (gig.roles ?? []).filter(Boolean).map((title) => ({ title }));
}

function slotList(gig: GigDetail): GigSlotView[] {
  return (gig.slots ?? []).filter((slot) => slot.timeLabel || slot.startsAt);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const gig = await getGigBySlug(slug);
    return { title: gig?.title ?? "Gig details" };
  } catch {
    return { title: "Gig details" };
  }
}

function GigUnavailable({
  title,
  body,
}: {
  title: string;
  body: string;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-5">
      <Link href="/discover" className="grid size-11 place-items-center rounded-full bg-white text-xl shadow-sm transition-colors hover:bg-black hover:text-white" aria-label="Back to discover">
        ←
      </Link>
      <EmptyState title={title} body={body} href="/discover" action="Back to Discover" />
    </div>
  );
}

export default async function GigDetailsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let gig: GigDetail | null = null;
  let loadError = "";
  try {
    gig = await getGigBySlug(slug);
  } catch (error) {
    loadError = errorMessage(error);
  }

  if (loadError) {
    return (
      <GigUnavailable
        title="This gig could not be loaded"
        body="The listing is missing some data right now. Nothing crashed — try Discover again, or open the gig once the host has published it."
      />
    );
  }

  if (!gig) {
    return (
      <GigUnavailable
        title="This gig isn't available"
        body="It may have been filled, cancelled, or the link is stale. Discover still lists open gigs."
      />
    );
  }

  const attendance = await getCheckInContext({ gigSlug: slug }).then((result) => result.data).catch(() => null);
  const showHostAttendance = attendance?.viewerRole === "host";
  const showSelfCheckIn = attendance?.viewerRole === "accepted";
  const roles = roleList(gig);
  const slots = slotList(gig);
  const aboutParts = paragraphs(gig.about || gig.summary || "");
  const hostName = gig.hostName?.trim() || "Host";
  const place = gig.locationLabel?.trim() || "Place to be confirmed";
  const when = gig.longDateLabel?.trim() || "Date to be confirmed";
  const spots = gig.spotsLabel?.trim() || "Spots open";

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-5">
      <div className="flex items-center justify-between">
        <Link href="/discover" className="grid size-11 place-items-center rounded-full bg-white text-xl shadow-sm transition-colors hover:bg-black hover:text-white" aria-label="Back to discover">←</Link>
        <div className="flex gap-2">
          <button type="button" className="grid size-11 place-items-center rounded-full bg-white text-xl shadow-sm" aria-label="Save gig">♡</button>
          <button type="button" className="grid size-11 place-items-center rounded-full bg-white text-lg shadow-sm" aria-label="Share gig">↗</button>
        </div>
      </div>

      <div className={`relative h-64 overflow-hidden rounded-[1.75rem] bg-gradient-to-br ${toneGradient(gig.imageTone)} p-5 shadow-[0_18px_40px_rgba(53,32,79,0.12)] sm:h-80`}>
        <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-black backdrop-blur-sm">{gig.kindLabel || "Volunteer"}</span>
        <span className="absolute bottom-5 left-5 rounded-full bg-black/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">{spots}</span>
      </div>

      <section className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="space-y-3">
          <h1 className="max-w-xl text-[2rem] font-bold leading-[1.02] tracking-[-0.06em] sm:text-4xl">{gig.title || "Untitled gig"}</h1>
          <div className="flex items-center gap-3 text-sm text-purple-gray">
            <span className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#f5cc00] to-[#ff4da3] text-xs font-bold text-white">{gig.hostInitials || "H"}</span>
            <span>Hosted by <strong className="text-black">{hostName}</strong></span>
          </div>
        </div>

        <div className="grid gap-3 border-y border-black/5 py-5 sm:grid-cols-3">
          <div className="flex gap-3"><span className="text-lg">◷</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">When</p><p className="mt-1 text-sm font-bold leading-snug">{when}</p></div></div>
          <div className="flex gap-3"><span className="text-lg">⌖</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">Where</p><p className="mt-1 text-sm font-bold leading-snug">{place}</p></div></div>
          <div className="flex gap-3"><span className="text-lg">♧</span><div><p className="text-[11px] font-semibold uppercase tracking-wide text-purple-gray">Availability</p><p className="mt-1 text-sm font-bold leading-snug">{spots}</p></div></div>
        </div>

        <div className="space-y-2">
          <h2 className="text-lg font-bold tracking-[-0.03em]">About this gig</h2>
          {aboutParts.length > 0 ? (
            aboutParts.map((part) => (
              <p key={part.slice(0, 48)} className="text-sm leading-6 text-purple-gray">
                {part}
              </p>
            ))
          ) : (
            <p className="text-sm leading-6 text-purple-gray">The host hasn&apos;t added a description yet.</p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-[-0.03em]">Roles</h2>
          {roles.length > 0 ? (
            <ul className="space-y-3">
              {roles.map((role) => (
                <li key={role.title} className="rounded-2xl bg-lavender/70 p-4">
                  <p className="text-sm font-bold">{role.title}</p>
                  {role.description ? <p className="mt-1 text-sm leading-6 text-purple-gray">{role.description}</p> : null}
                  {role.capacity != null ? <p className="mt-2 text-xs font-semibold text-purple">{role.capacity} spot{role.capacity === 1 ? "" : "s"}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-purple-gray">The host hasn&apos;t listed roles yet. You can still apply for general support.</p>
          )}
        </div>

        <div className="space-y-3">
          <h2 className="text-lg font-bold tracking-[-0.03em]">Slots</h2>
          {slots.length > 0 ? (
            <ul className="space-y-3">
              {slots.map((slot, index) => (
                <li key={slot.id ?? `${slot.startsAt}-${index}`} className="flex gap-3 rounded-2xl border border-black/5 p-4">
                  <span className="text-lg">◷</span>
                  <div>
                    <p className="text-sm font-bold leading-snug">{slot.timeLabel}</p>
                    <p className="mt-1 text-xs font-semibold text-purple-gray">
                      {slot.roleTitle ? `${slot.roleTitle} · ` : ""}
                      {slot.capacity != null ? `${slot.capacity} spot${slot.capacity === 1 ? "" : "s"}` : spots}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm leading-6 text-purple-gray">Slot times will show here when the host sets them.</p>
          )}
        </div>

        {gig.incentive ? (
          <div className="rounded-2xl bg-lavender p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-purple">{gig.kindLabel === "Paid gig" ? "Paid gig" : "Incentive"}</p>
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
          <span className="rounded-full bg-white px-3 py-2 text-xs font-bold text-black shadow-sm">⌖ {place}</span>
        </div>
      </section>

      {showHostAttendance ? <GigCheckInPanel gigSlug={gig.slug} /> : null}
      {showSelfCheckIn && attendance ? (
        <Link href={attendance.path} className="flex min-h-12 items-center justify-center rounded-2xl bg-white text-sm font-bold text-purple shadow-[0_14px_34px_rgba(53,32,79,0.08)]">
          Check in for this gig
        </Link>
      ) : null}

      <GigJoinButton slug={gig.slug} kind={gig.kindLabel === "Paid gig" ? "Paid gig" : "Volunteer"} roles={roles.map((role) => role.title)} hostUserId={gig.hostUserId} />
    </div>
  );
}
