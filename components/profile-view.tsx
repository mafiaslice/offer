"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { useOffer } from "@/components/offer-provider";

type ProfileTab = "About" | "Gigs";

const settings = [
  ["Personal details", "Name, phone, and profile photo", "↗"],
  ["Safety and verification", "Build trust before you show up", "›"],
  ["Notifications", "Choose what Offer sends you", "›"],
];

export function ProfileView() {
  const router = useRouter();
  const { user, source, refresh } = useOffer();
  const [tab, setTab] = useState<ProfileTab>("About");
  const supabaseReady = isSupabaseConfigured();
  const displayName = user?.displayName ?? (source === "demo-adapter" ? "Mafia Slice" : "Your profile");
  const handle = user?.email?.split("@")[0] ?? (source === "demo-adapter" ? "slice" : "guest");
  const initials = user?.initials ?? (source === "demo-adapter" ? "MS" : "O");
  const bio = user?.bio ?? (source === "demo-adapter" ? "Building spaces where good people can meet, help, and make things happen." : "Complete your profile after you sign in.");
  const signedIn = Boolean(user) || source === "demo-adapter";

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
            <Link href="/auth" className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white hover:text-black">Sign in</Link>
          ) : (
            <button type="button" className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white hover:text-black">Edit profile</button>
          )}
        </div>
        <div className="mt-6"><h2 className="text-2xl font-bold tracking-[-0.04em]">{displayName}</h2><p className="mt-1 text-sm text-white/60">@{handle}</p><p className="mt-4 max-w-md text-sm leading-6 text-white/80">{bio}</p></div>
        <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Host</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Volunteer</span>{signedIn ? <span className="rounded-full bg-success/20 px-3 py-1.5 text-xs font-semibold text-[#a6ee91]">{user?.phone ? "Phone on file" : source === "demo-adapter" ? "Phone verified" : "Signed in"}</span> : null}</div>
      </section>

      <div className="grid grid-cols-3 gap-3"><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">{source === "demo-adapter" ? "3" : "—"}</p><p className="mt-1 text-xs font-semibold text-purple-gray">Gigs joined</p></div><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">{source === "demo-adapter" ? "1" : "—"}</p><p className="mt-1 text-xs font-semibold text-purple-gray">Gigs hosted</p></div><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">{source === "demo-adapter" ? "4.9" : "—"}</p><p className="mt-1 text-xs font-semibold text-purple-gray">Trust score</p></div></div>

      <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7"><div className="flex rounded-2xl bg-lavender p-1.5"><button type="button" onClick={() => setTab("About")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${tab === "About" ? "bg-black text-white" : "text-purple-gray"}`}>About</button><button type="button" onClick={() => setTab("Gigs")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${tab === "Gigs" ? "bg-black text-white" : "text-purple-gray"}`}>Gigs</button></div>{tab === "About" ? <div className="mt-6 space-y-5"><div><h2 className="text-lg font-bold tracking-[-0.03em]">What I&apos;m about</h2><p className="mt-2 text-sm leading-6 text-purple-gray">{bio}</p></div><div className="rounded-2xl bg-lavender p-4"><p className="text-xs font-bold uppercase tracking-wide text-purple">Trust on Offer</p><p className="mt-1 text-sm font-semibold leading-6">Verified details and a clear gig history help people know who they&apos;re meeting.</p></div></div> : <div className="mt-6 space-y-3"><Link href="/my-gigs" className="flex items-center justify-between rounded-2xl bg-lavender p-4"><span><strong className="block text-sm font-bold">See your gigs</strong><span className="mt-1 block text-xs text-purple-gray">Hosted and joined</span></span><span className="text-purple">↗</span></Link></div>}</section>

      <section className="space-y-3"><h2 className="px-1 text-lg font-bold tracking-[-0.03em]">Account</h2><div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_28px_rgba(53,32,79,0.07)]">{settings.map(([title, description, icon]) => <button key={title} type="button" className="flex min-h-[4.5rem] w-full items-center justify-between gap-4 border-b border-black/5 px-4 text-left last:border-0 hover:bg-lavender"><span><strong className="block text-sm font-bold">{title}</strong><span className="mt-1 block text-xs text-purple-gray">{description}</span></span><span className="text-lg text-purple-gray">{icon}</span></button>)}{supabaseReady ? <button type="button" onClick={() => void signOut()} className="flex min-h-[4.5rem] w-full items-center justify-between gap-4 px-4 text-left hover:bg-lavender"><span><strong className="block text-sm font-bold">{user ? "Sign out" : "Sign in"}</strong><span className="mt-1 block text-xs text-purple-gray">{user ? "End this session on this device" : "Use email to get a one-time code"}</span></span><span className="text-lg text-purple-gray">↗</span></button> : null}</div></section>
    </div>
  );
}
