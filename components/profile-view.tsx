"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { signInHref } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { useOffer } from "@/components/offer-provider";

type ProfileTab = "About" | "Gigs";
type Intent = "need" | "help" | "both";

const inputClass = "min-h-13 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-purple-gray/60 focus:border-purple focus:ring-4 focus:ring-purple/10";

const settings = [
  ["Personal details", "Name and a short bio hosts can see", "↗"],
  ["Safety and verification", "Identity verification is not in this version", "—"],
  ["Notifications", "Choose what Offer sends you — still open", "›"],
];

const intentOptions = [
  ["need", "Find trusted hands", "I have a project or gig to fill"],
  ["help", "Show up and help", "I want to join gigs and meet people"],
  ["both", "Both", "I want to do both"],
] as const;

export function ProfileView() {
  const router = useRouter();
  const { user, source, updateProfile, refresh } = useOffer();
  const [tab, setTab] = useState<ProfileTab>("About");
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [bioDraft, setBioDraft] = useState("");
  const [intent, setIntent] = useState<Intent>("both");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const supabaseReady = isSupabaseConfigured();
  const displayName = user?.displayName ?? (source === "demo-adapter" ? "Mafia Slice" : "Guest");
  const handle = user?.email?.split("@")[0] ?? (source === "demo-adapter" ? "slice" : "guest");
  const initials = user?.initials ?? (source === "demo-adapter" ? "MS" : "G");
  const bio = user?.bio ?? (source === "demo-adapter" ? "Building spaces where good people can meet, help, and make things happen." : "Add a display name after you sign in. Identity verification is not required.");
  const signedIn = Boolean(user) || source === "demo-adapter";
  const canEdit = Boolean(user) || source === "demo-adapter";

  function startEditing() {
    setName(user?.displayName ?? (source === "demo-adapter" ? "Mafia Slice" : ""));
    setBioDraft(user?.bio ?? (source === "demo-adapter" ? "Building spaces where good people can meet, help, and make things happen." : ""));
    setIntent(user?.intent ?? "both");
    setError("");
    setEditing(true);
  }

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const result = await updateProfile({ displayName: name.trim(), bio: bioDraft, intent });
    setBusy(false);
    if (!result.ok) {
      if (result.status === 401) {
        router.push(signInHref("/profile"));
        return;
      }
      setError(result.error ?? "Could not save your profile.");
      return;
    }
    setEditing(false);
  }

  async function signOut() {
    if (supabaseReady) {
      await createClient().auth.signOut();
      await refresh();
    }
    router.push("/auth");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between"><div><p className="text-sm font-semibold text-purple">Your Offer profile</p><h1 className="mt-2 text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Profile.</h1></div><button type="button" className="grid size-11 place-items-center rounded-full bg-white text-lg shadow-sm" aria-label="Profile settings">⚙</button></header>

      <section className="overflow-hidden rounded-[1.75rem] bg-black p-5 text-white shadow-[0_16px_36px_rgba(0,0,0,0.16)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <span className="grid size-20 place-items-center rounded-[1.5rem] bg-gradient-to-br from-[#f5cc00] via-[#ff4da3] to-purple text-xl font-bold shadow-lg">{initials}</span>
          {supabaseReady && !user ? (
            <Link href={signInHref("/profile")} className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white hover:text-black">Sign in</Link>
          ) : canEdit ? (
            <button type="button" onClick={startEditing} className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white hover:text-black">Edit profile</button>
          ) : null}
        </div>
        <div className="mt-6"><h2 className="text-2xl font-bold tracking-[-0.04em]">{displayName}</h2><p className="mt-1 text-sm text-white/60">@{handle}</p><p className="mt-4 max-w-md text-sm leading-6 text-white/80">{bio}</p></div>
        <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Host</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Volunteer</span>{signedIn ? <span className="rounded-full bg-success/20 px-3 py-1.5 text-xs font-semibold text-[#a6ee91]">{user?.phone ? "Phone on file" : source === "demo-adapter" ? "Demo session" : "Signed in"}</span> : null}</div>
      </section>

      {editing ? (
        <form onSubmit={saveProfile} className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-purple">Your details</p>
              <h2 className="mt-1 text-lg font-bold tracking-[-0.03em]">Make it feel like you.</h2>
            </div>
            <button type="button" onClick={() => setEditing(false)} className="text-sm font-bold text-purple">Cancel</button>
          </div>
          {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}
          <label className="block space-y-2">
            <span className="text-sm font-bold">Your name</span>
            <input className={inputClass} value={name} onChange={(event) => setName(event.target.value)} required />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-bold">Short bio <span className="font-normal text-purple-gray">(optional)</span></span>
            <textarea className={`${inputClass} min-h-24 resize-none py-3`} value={bioDraft} onChange={(event) => setBioDraft(event.target.value)} />
          </label>
          <div className="space-y-3">
            <p className="text-sm font-bold">I&apos;m here to...</p>
            <div className="space-y-2">
              {intentOptions.map(([value, title, description]) => (
                <button key={value} type="button" onClick={() => setIntent(value)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${intent === value ? "border-purple bg-purple/5 ring-2 ring-purple/10" : "border-black/10 hover:bg-lavender"}`}>
                  <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${intent === value ? "border-purple bg-purple text-xs text-white" : "border-black/20"}`}>{intent === value ? "✓" : null}</span>
                  <span>
                    <strong className="block text-sm font-bold">{title}</strong>
                    <span className="mt-0.5 block text-xs text-purple-gray">{description}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
          <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60">
            {busy ? "Saving…" : "Save profile"}
          </button>
          <p className="text-center text-xs leading-5 text-purple-gray">Hosts you apply with can see your name and bio. Offer does not take payment.</p>
        </form>
      ) : null}

      <div className="grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">—</p><p className="mt-1 text-xs font-semibold text-purple-gray">Gigs joined</p></div><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">—</p><p className="mt-1 text-xs font-semibold text-purple-gray">Gigs hosted</p></div></div>

      <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7"><div className="flex rounded-2xl bg-lavender p-1.5"><button type="button" onClick={() => setTab("About")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${tab === "About" ? "bg-black text-white" : "text-purple-gray"}`}>About</button><button type="button" onClick={() => setTab("Gigs")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${tab === "Gigs" ? "bg-black text-white" : "text-purple-gray"}`}>Gigs</button></div>{tab === "About" ? <div className="mt-6 space-y-5"><div><h2 className="text-lg font-bold tracking-[-0.03em]">What I&apos;m about</h2><p className="mt-2 text-sm leading-6 text-purple-gray">{bio}</p></div><div className="rounded-2xl bg-lavender p-4"><p className="text-xs font-bold uppercase tracking-wide text-purple">On Offer</p><p className="mt-1 text-sm font-semibold leading-6">Your display name is what hosts and applicants see. Ratings and identity verification are not in this version.</p></div></div> : <div className="mt-6 space-y-3"><Link href="/my-gigs" className="flex items-center justify-between rounded-2xl bg-lavender p-4"><span><strong className="block text-sm font-bold">See your gigs</strong><span className="mt-1 block text-xs text-purple-gray">Hosted and joined</span></span><span className="text-purple">↗</span></Link></div>}</section>

      <section className="space-y-3"><h2 className="px-1 text-lg font-bold tracking-[-0.03em]">Account</h2><div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_28px_rgba(53,32,79,0.07)]">{settings.map(([title, description, icon]) => <button key={title} type="button" onClick={title === "Personal details" && canEdit ? startEditing : undefined} className="flex min-h-[4.5rem] w-full items-center justify-between gap-4 border-b border-black/5 px-4 text-left last:border-0 hover:bg-lavender"><span><strong className="block text-sm font-bold">{title}</strong><span className="mt-1 block text-xs text-purple-gray">{description}</span></span><span className="text-lg text-purple-gray">{icon}</span></button>)}{supabaseReady ? <button type="button" onClick={() => { if (user) { void signOut(); } else { router.push(signInHref("/profile")); } }} className="flex min-h-[4.5rem] w-full items-center justify-between gap-4 px-4 text-left hover:bg-lavender"><span><strong className="block text-sm font-bold">{user ? "Sign out" : "Sign in"}</strong><span className="mt-1 block text-xs text-purple-gray">{user ? "End this session on this device" : "Use email to get a one-time code"}</span></span><span className="text-lg text-purple-gray">↗</span></button> : null}</div></section>
    </div>
  );
}
