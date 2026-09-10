"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useOffer } from "@/components/offer-provider";

type GigJoinButtonProps = {
  slug: string;
  kind: "Volunteer" | "Paid gig";
  roles: string[];
};

export function GigJoinButton({ slug, kind, roles }: GigJoinButtonProps) {
  const router = useRouter();
  const { applyToGig, hasApplied, source, user } = useOffer();
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(() => hasApplied(slug));
  const [role, setRole] = useState(roles[0] ?? "General support");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (source === "supabase" && !user) {
      router.push(`/auth?next=${encodeURIComponent(`/gigs/${slug}`)}`);
      return;
    }
    setBusy(true);
    const result = await applyToGig(slug, role, note);
    setBusy(false);
    if (!result.ok) {
      if (result.status === 401) {
        router.push(`/auth?next=${encodeURIComponent(`/gigs/${slug}`)}`);
        return;
      }
      setError(result.error ?? "Could not send application.");
      return;
    }
    setSent(true);
  }

  return (
    <>
      <div className="sticky bottom-3 z-10 rounded-2xl bg-black p-2 shadow-[0_16px_32px_rgba(0,0,0,0.2)]">
        <button type="button" onClick={() => setOpen(true)} className="flex min-h-12 w-full items-center justify-center rounded-xl bg-purple px-5 text-sm font-bold text-white transition-colors hover:bg-white hover:text-black">{sent ? "Application sent" : kind === "Paid gig" ? "Apply for this gig" : "Join this gig"}</button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center" role="presentation" onClick={() => setOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="join-gig-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
            <div className="mx-auto mb-5 h-1.5 w-12 rounded-full bg-black/10 sm:hidden" />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-purple">{kind === "Paid gig" ? "Apply to join" : "You're almost in"}</p>
                <h2 id="join-gig-title" className="mt-1 text-2xl font-bold tracking-[-0.05em]">Tell the host about you.</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="grid size-10 place-items-center rounded-full bg-lavender text-lg" aria-label="Close">×</button>
            </div>
            {sent ? (
              <div className="mt-6 rounded-2xl bg-success/15 p-4">
                <p className="text-sm font-bold text-[#328e1c]">Application sent.</p>
                <p className="mt-1 text-sm leading-6 text-[#328e1c]/80">The host can now review your profile. We&apos;ll notify you when they respond.</p>
                <button type="button" onClick={() => setOpen(false)} className="mt-4 min-h-11 rounded-full bg-black px-5 text-sm font-bold text-white">Done</button>
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
                <p className="text-center text-xs leading-5 text-purple-gray">Your profile will be visible to the host.</p>
              </form>
            )}
          </section>
        </div>
      ) : null}
    </>
  );
}
