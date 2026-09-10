"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInHref } from "@/lib/auth";
import { useOffer } from "@/components/offer-provider";

type GigKind = "volunteer" | "paid";

const inputClass = "min-h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-purple-gray/60 focus:border-purple focus:ring-4 focus:ring-purple/10";
const labelClass = "text-sm font-bold text-black";

export function PostGigForm() {
  const router = useRouter();
  const { source, user, ready } = useOffer();
  const [kind, setKind] = useState<GigKind>("volunteer");
  const [roles, setRoles] = useState(["Guest welcome & check-in"]);
  const [submitted, setSubmitted] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function addRole() {
    setRoles((current) => [...current, ""]);
  }

  function updateRole(index: number, value: string) {
    setRoles((current) => current.map((role, roleIndex) => (roleIndex === index ? value : role)));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (source === "supabase" && ready && !user) {
      router.push(signInHref("/post"));
      return;
    }

    const form = new FormData(event.currentTarget);
    setBusy(true);
    const response = await fetch("/api/gigs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: String(form.get("title") ?? ""),
        summary: String(form.get("summary") ?? ""),
        kind,
        category: String(form.get("category") ?? "events"),
        locationType: String(form.get("locationType") ?? "in-person"),
        locationLabel: String(form.get("locationLabel") ?? ""),
        date: String(form.get("date") ?? ""),
        startTime: String(form.get("startTime") ?? ""),
        slotCount: Number(form.get("slotCount") ?? 5),
        roles: roles.map((role) => role.trim()).filter(Boolean),
        incentive: String(form.get("incentive") ?? ""),
        instructions: String(form.get("instructions") ?? ""),
      }),
    });
    const body = (await response.json()) as { data?: { slug: string }; meta?: { persisted?: boolean }; error?: string };
    setBusy(false);

    if (!response.ok) {
      if (response.status === 401) {
        router.push(signInHref("/post"));
        return;
      }
      setError(body.error ?? "Could not create this gig.");
      return;
    }

    setSlug(body.data?.slug ?? null);
    setPersisted(Boolean(body.meta?.persisted));
    setSubmitted(true);
  }

  return (
    <form onSubmit={submit} className="space-y-5 pb-5">
      <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="mb-5 flex rounded-2xl bg-lavender p-1.5">
          {(["volunteer", "paid"] as const).map((option) => (
            <button key={option} type="button" onClick={() => setKind(option)} className={`min-h-11 flex-1 rounded-xl text-sm font-bold capitalize transition-all ${kind === option ? "bg-black text-white shadow-sm" : "text-purple-gray hover:text-black"}`}>
              {option} gig
            </button>
          ))}
        </div>
        <div className="rounded-2xl bg-lavender p-4">
          <p className="text-sm font-bold text-black">{kind === "volunteer" ? "Volunteer first" : "A paid opportunity"}</p>
          <p className="mt-1 text-xs leading-5 text-purple-gray">{kind === "volunteer" ? "People are showing up because they believe in what you’re making. Be clear about the experience and any support you can provide." : "Be clear about the work, time commitment, and payment. Paid gigs will be surfaced after volunteer opportunities."}</p>
        </div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="space-y-1"><h2 className="text-lg font-bold tracking-[-0.03em]">The basics</h2><p className="text-sm text-purple-gray">Give your gig a clear shape.</p></div>
        <label className="block space-y-2"><span className={labelClass}>Gig name</span><input name="title" className={inputClass} placeholder="e.g. Hangout with Slice" required /></label>
        <label className="block space-y-2"><span className={labelClass}>Tell people about it</span><textarea name="summary" className={`${inputClass} min-h-32 resize-none py-3`} placeholder="What are you bringing people together to do?" required /></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2"><span className={labelClass}>Category</span><select name="category" className={inputClass} defaultValue="events"><option value="events">Events</option><option value="community">Community</option><option value="hospitality">Hospitality</option><option value="projects">Projects</option></select></label><label className="block space-y-2"><span className={labelClass}>Gig type</span><select name="locationType" className={inputClass} defaultValue="in-person"><option value="in-person">In-person</option><option value="remote">Remote</option></select></label></div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="space-y-1"><h2 className="text-lg font-bold tracking-[-0.03em]">When and where</h2><p className="text-sm text-purple-gray">Help people know what showing up looks like.</p></div>
        <label className="block space-y-2"><span className={labelClass}>Place</span><div className="relative"><span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-purple-gray">⌖</span><input name="locationLabel" className={`${inputClass} pl-10`} placeholder="Search for a place or add an address" required /></div></label>
        <div className="grid gap-4 sm:grid-cols-2"><label className="block space-y-2"><span className={labelClass}>Date</span><input name="date" type="date" className={inputClass} required /></label><label className="block space-y-2"><span className={labelClass}>Start time</span><input name="startTime" type="time" defaultValue="10:00" className={inputClass} required /></label></div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="space-y-1"><h2 className="text-lg font-bold tracking-[-0.03em]">People and roles</h2><p className="text-sm text-purple-gray">Set expectations and keep slots visible.</p></div>
        <label className="block space-y-2"><span className={labelClass}>Total slots</span><input name="slotCount" type="number" min="1" defaultValue="5" className={inputClass} required /></label>
        <div className="space-y-3"><div className="flex items-center justify-between"><span className={labelClass}>Roles needed</span><span className="text-xs font-semibold text-purple-gray">{roles.length} role{roles.length === 1 ? "" : "s"}</span></div>{roles.map((role, index) => <div key={`${index}-${role}`} className="flex gap-2"><input className={inputClass} value={role} onChange={(event) => updateRole(index, event.target.value)} placeholder="e.g. Guest welcome & check-in" aria-label={`Role ${index + 1}`} /><button type="button" onClick={() => setRoles((current) => current.filter((_, roleIndex) => roleIndex !== index))} className="grid size-12 shrink-0 place-items-center rounded-2xl border border-black/10 text-lg text-purple-gray transition-colors hover:border-error hover:text-error" aria-label={`Remove role ${index + 1}`}>×</button></div>)}<button type="button" onClick={addRole} className="min-h-11 rounded-full border border-dashed border-purple px-4 text-sm font-bold text-purple transition-colors hover:bg-lavender">+ Add another role</button></div>
      </section>

      <section className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <div className="space-y-1"><h2 className="text-lg font-bold tracking-[-0.03em]">The details people need</h2><p className="text-sm text-purple-gray">Clear instructions make good gigs feel safe.</p></div>
        {kind === "volunteer" ? <label className="block space-y-2"><span className={labelClass}>Incentive or support</span><input name="incentive" className={inputClass} placeholder="e.g. Transport support and breakfast provided" /></label> : <label className="block space-y-2"><span className={labelClass}>Payment</span><input name="incentive" className={inputClass} placeholder="e.g. ₦35,000 per person" /></label>}
        <label className="block space-y-2"><span className={labelClass}>Instructions</span><textarea name="instructions" className={`${inputClass} min-h-28 resize-none py-3`} placeholder="Dress code, arrival time, what to bring..." /></label>
        <button type="button" className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-lavender text-center transition-colors hover:border-purple"><span className="text-2xl text-purple">＋</span><span className="mt-1 text-sm font-bold">Add photos or a cover</span><span className="mt-1 text-xs text-purple-gray">Show people what they&apos;re joining</span></button>
      </section>

      {error ? <div role="alert" className="rounded-2xl bg-error/10 p-4 text-sm font-semibold text-error">{error}</div> : null}
      {submitted ? (
        <div role="status" className="rounded-2xl bg-success/15 p-4 text-sm font-semibold text-[#328e1c]">
          {persisted
            ? "Your gig is live. Anyone signed in can host — no separate Host account."
            : "Your gig draft is ready. Publishing persists once Supabase env vars are set."}
          {persisted && slug ? (
            <button type="button" onClick={() => router.push(`/gigs/${slug}`)} className="mt-3 block text-sm font-bold text-black underline">
              View gig
            </button>
          ) : null}
        </div>
      ) : null}
      <button type="submit" disabled={busy} className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-black px-5 text-base font-bold text-white shadow-[0_14px_28px_rgba(0,0,0,0.16)] transition-colors hover:bg-purple disabled:opacity-60">{busy ? "Creating…" : kind === "volunteer" ? "Create volunteer gig" : "Create paid gig"}</button>
      <p className="text-center text-xs leading-5 text-purple-gray">v1 publishes the gig as open so people can find it. Offer does not take payment.</p>
    </form>
  );
}
