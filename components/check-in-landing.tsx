"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInHref } from "@/lib/auth";
import { useOffer } from "@/components/offer-provider";
import { CheckInQr } from "@/components/check-in-qr";
import { GigCheckInPanel } from "@/components/gig-check-in-panel";
import { checkInState, formatCheckInTime } from "@/lib/data/format";
import type { CheckInContext, CheckInRecord } from "@/lib/data/types";

type CheckInLandingProps = {
  token: string;
  initial: CheckInContext | null;
  error?: string;
};

async function postAttendance(
  path: "/api/check-ins" | "/api/check-ins/checkout",
  payload: { token: string; userId?: string },
) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { data?: CheckInRecord; error?: string };
  if (!response.ok) {
    const error = new Error(body.error ?? "Could not update attendance.") as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  return body.data;
}

export function CheckInLanding({ token, initial, error: loadError }: CheckInLandingProps) {
  const router = useRouter();
  const { source, user, ready } = useOffer();
  const [context, setContext] = useState(initial);
  const [error, setError] = useState(loadError ?? "");
  const [busy, setBusy] = useState(false);

  const own = context?.ownCheckIn ?? null;
  const present = checkInState(own) === "in";

  async function refresh() {
    const response = await fetch(`/api/check-ins?token=${encodeURIComponent(token)}`);
    const body = (await response.json()) as { data?: CheckInContext; error?: string };
    if (response.ok && body.data) setContext(body.data);
  }

  async function act(path: "/api/check-ins" | "/api/check-ins/checkout") {
    setError("");
    if (source === "supabase" && ready && !user) {
      router.push(signInHref(`/check-in/${encodeURIComponent(token)}`));
      return;
    }
    setBusy(true);
    try {
      await postAttendance(path, { token });
      await refresh();
    } catch (err) {
      const status = err && typeof err === "object" && "status" in err ? Number(err.status) : 0;
      if (status === 401) {
        router.push(signInHref(`/check-in/${encodeURIComponent(token)}`));
        return;
      }
      setError(err instanceof Error ? err.message : "Could not update attendance.");
    } finally {
      setBusy(false);
    }
  }

  if (!context) {
    return (
      <div className="mx-auto max-w-lg space-y-5">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-purple">Check-in</p>
          <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em]">This code is not valid.</h1>
          <p className="text-sm leading-6 text-purple-gray">{error || "Ask the host to show the gig QR again."}</p>
        </header>
        <Link href="/discover" className="inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">
          Discover gigs
        </Link>
      </div>
    );
  }

  if (context.viewerRole === "host") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <header className="space-y-2">
          <p className="text-sm font-semibold text-purple">Host tools</p>
          <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Attendance.</h1>
          <p className="text-sm leading-6 text-purple-gray sm:text-base">
            Show the QR so accepted participants can check themselves in, or record it for them.
          </p>
        </header>
        <GigCheckInPanel gigSlug={context.gig.slug} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-purple">{context.gig.kindLabel}</p>
        <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em]">{context.gig.title}</h1>
        <p className="text-sm leading-6 text-purple-gray">
          {context.gig.dateLabel} · {context.gig.locationLabel}
          <span className="mt-1 block">Hosted by {context.gig.hostName}</span>
        </p>
      </header>

      {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}

      {context.viewerRole === "accepted" ? (
        <section className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
          {present ? (
            <div className="rounded-2xl bg-success/15 p-4">
              <p className="text-sm font-bold text-[#328e1c]">You&apos;re checked in.</p>
              <p className="mt-1 text-sm leading-6 text-[#328e1c]/80">Since {formatCheckInTime(own?.checkedInAt)}.</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-lavender p-4">
              <p className="text-sm font-bold">Ready when you are.</p>
              <p className="mt-1 text-sm leading-6 text-purple-gray">
                {own?.checkedOutAt ? `Last out ${formatCheckInTime(own.checkedOutAt)}.` : "Confirm you showed up for this gig."}
              </p>
            </div>
          )}
          <button
            type="button"
            disabled={busy}
            onClick={() => void act(present ? "/api/check-ins/checkout" : "/api/check-ins")}
            className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60"
          >
            {busy ? "Saving…" : present ? "Check out" : "Check in"}
          </button>
        </section>
      ) : null}

      {context.viewerRole === "pending" ? (
        <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
          <p className="text-sm font-bold">Application is still pending.</p>
          <p className="mt-2 text-sm leading-6 text-purple-gray">The host needs to accept you before you can check in on this gig.</p>
        </section>
      ) : null}

      {context.viewerRole === "none" || context.viewerRole === "unsigned" ? (
        <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
          <p className="text-sm font-bold">{context.viewerRole === "unsigned" ? "Sign in to check in." : "You're not on this gig."}</p>
          <p className="mt-2 text-sm leading-6 text-purple-gray">
            Check-in is for accepted participants. Apply first, or ask the host to check you in after they accept you.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/gigs/${context.gig.slug}`} className="inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">
              View gig
            </Link>
            {context.viewerRole === "unsigned" ? (
              <Link href={signInHref(`/check-in/${encodeURIComponent(token)}`)} className="inline-flex min-h-11 items-center rounded-full bg-lavender px-5 text-sm font-bold text-black">
                Sign in
              </Link>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)]">
        <CheckInQr token={token} label="Same QR the host is showing" />
      </div>
    </div>
  );
}
