"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInHref } from "@/lib/auth";
import { useOffer } from "@/components/offer-provider";

type GigJoinButtonProps = {
  slug: string;
  kind: "Volunteer" | "Paid gig";
  roles: string[];
  hostUserId?: string;
};

export function GigJoinButton({ slug, kind, roles, hostUserId }: GigJoinButtonProps) {
  const router = useRouter();
  const { applyToGig, hasApplied, ensureThread, source, user, ready } = useOffer();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [role, setRole] = useState(roles[0] ?? "General support");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const volunteer = kind !== "Paid gig";
  const isHost = Boolean(hostUserId && user?.id === hostUserId);
  const needsSignIn = source === "supabase" && ready && !user;
  const checkingSession = source === "supabase" && !ready;
  const applied = sent || hasApplied(slug);
  const ctaLabel = applied ? "Application sent" : volunteer ? "Join this gig" : "Apply for this gig";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (source === "supabase" && ready && !user) {
      router.push(signInHref(`/gigs/${slug}`));
      return;
    }
    setBusy(true);
    const result = await applyToGig(slug, role, note);
    setBusy(false);
    if (!result.ok) {
      if (result.status === 401) {
        router.push(signInHref(`/gigs/${slug}`));
        return;
      }
      setError(result.error ?? "Could not send application.");
      return;
    }
    setSent(true);
  }

  if (isHost) {
    return (
      <div className="sticky bottom-3 z-10 space-y-2 rounded-2xl bg-black p-2 shadow-[0_16px_32px_rgba(0,0,0,0.2)]">
        <Link href="/my-gigs" className="flex min-h-12 w-full items-center justify-center rounded-xl bg-purple px-5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black">
          You&apos;re hosting this gig
        </Link>
      </div>
    );
  }

  if (needsSignIn) {
    return (
      <div className="sticky bottom-3 z-10 space-y-2 rounded-2xl bg-black p-3 shadow-[0_16px_32px_rgba(0,0,0,0.2)]">
        <Link href={signInHref(`/gigs/${slug}`)} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-purple px-5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black">
          {volunteer ? "Sign in to join this gig" : "Sign in to apply"}
        </Link>
        <p className="px-2 pb-1 text-center text-[11px] leading-4 text-white/70">You need an Offer account to apply. Identity verification is not required.</p>
      </div>
    );
  }

  return (
    <>
      <div className="sticky bottom-3 z-10 rounded-2xl bg-black p-2 shadow-[0_16px_32px_rgba(0,0,0,0.2)]">
        <button
          type="button"
          disabled={checkingSession}
          onClick={() => setOpen(true)}
          className="flex min-h-12 w-full items-center justify-center rounded-xl bg-purple px-5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black disabled:opacity-60"
        >
          {checkingSession ? "Checking your session…" : ctaLabel}
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center" role="presentation" onClick={() => setOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="join-gig-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-black/10 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-purple">{volunteer ? "You're almost in" : "Apply to join"}</p>
                <h2 id="join-gig-title" className="mt-1 text-2xl font-bold tracking-[-0.05em]">Tell the host about you.</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-lavender text-lg" aria-label="Close">×</button>
            </div>
            {applied ? (
              <div className="mt-6 rounded-2xl bg-success/15 p-4">
                <p className="text-sm font-bold text-[#328e1c]">Application sent.</p>
                <p className="mt-1 text-sm leading-6 text-[#328e1c]/80">The host can now review your profile. Message them when you want a 1:1 thread for this gig.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href="/my-gigs" className="flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">My gigs</Link>
                  <button
                    type="button"
                    onClick={() => {
                      void ensureThread({ gigSlug: slug }).then((result) => {
                        if (result.ok && result.thread) {
                          setOpen(false);
                          router.push(`/messages?thread=${result.thread.id}`);
                          return;
                        }
                        if (result.status === 401) router.push(signInHref(`/gigs/${slug}`));
                      });
                    }}
                    className="min-h-11 rounded-full bg-lavender px-5 text-sm font-bold text-black"
                  >
                    Message host
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="mt-6 space-y-5">
                {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}
                <label className="block space-y-2">
                  <span className="text-sm font-bold">Which role interests you?</span>
                  <select value={role} onChange={(event) => setRole(event.target.value)} className="min-h-13 w-full rounded-2xl border border-black/10 bg-lavender px-4 text-sm font-semibold outline-none focus:border-purple focus:ring-4 focus:ring-purple/10">
                    {(roles.length > 0 ? roles : ["General support"]).map((item) => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-bold">Add a note <span className="font-normal text-purple-gray">(optional)</span></span>
                  <textarea value={note} onChange={(event) => setNote(event.target.value)} className="min-h-28 w-full resize-none rounded-2xl border border-black/10 bg-lavender px-4 py-3 text-sm outline-none placeholder:text-purple-gray/60 focus:border-purple focus:ring-4 focus:ring-purple/10" placeholder="Anything the host should know?" />
                </label>
                <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60">
                  {busy ? "Sending…" : "Send application"}
                </button>
                <p className="text-center text-xs leading-5 text-purple-gray">Your profile will be visible to the host. Offer does not take payment.</p>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
