"use client";

import Link from "next/link";
import { useState } from "react";

type ProfileTab = "About" | "Gigs";

const settings = [
  ["Personal details", "Name, phone, and profile photo", "↗"],
  ["Safety and verification", "Build trust before you show up", "›"],
  ["Notifications", "Choose what Offer sends you", "›"],
];

export function ProfileView() {
  const [tab, setTab] = useState<ProfileTab>("About");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="flex items-center justify-between"><div><p className="text-sm font-semibold text-purple">Your Offer profile</p><h1 className="mt-2 text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Profile.</h1></div><button type="button" className="grid size-11 place-items-center rounded-full bg-white text-lg shadow-sm" aria-label="Profile settings">⚙</button></header>

      <section className="overflow-hidden rounded-[1.75rem] bg-black p-5 text-white shadow-[0_16px_36px_rgba(0,0,0,0.16)] sm:p-7">
        <div className="flex items-start justify-between gap-4"><span className="grid size-20 place-items-center rounded-[1.5rem] bg-gradient-to-br from-[#f5cc00] via-[#ff4da3] to-purple text-xl font-bold shadow-lg">MS</span><button type="button" className="rounded-full border border-white/20 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white hover:text-black">Edit profile</button></div>
        <div className="mt-6"><h2 className="text-2xl font-bold tracking-[-0.04em]">Mafia Slice</h2><p className="mt-1 text-sm text-white/60">@slice · Lagos, Nigeria</p><p className="mt-4 max-w-md text-sm leading-6 text-white/80">Building spaces where good people can meet, help, and make things happen.</p></div>
        <div className="mt-6 flex flex-wrap gap-2"><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Host</span><span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Volunteer</span><span className="rounded-full bg-success/20 px-3 py-1.5 text-xs font-semibold text-[#a6ee91]">Phone verified</span></div>
      </section>

      <div className="grid grid-cols-3 gap-3"><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">3</p><p className="mt-1 text-xs font-semibold text-purple-gray">Gigs joined</p></div><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">1</p><p className="mt-1 text-xs font-semibold text-purple-gray">Gigs hosted</p></div><div className="rounded-2xl bg-white p-4 shadow-[0_10px_24px_rgba(53,32,79,0.06)]"><p className="text-2xl font-bold tracking-[-0.05em]">4.9</p><p className="mt-1 text-xs font-semibold text-purple-gray">Trust score</p></div></div>

      <section className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7"><div className="flex rounded-2xl bg-lavender p-1.5"><button type="button" onClick={() => setTab("About")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${tab === "About" ? "bg-black text-white" : "text-purple-gray"}`}>About</button><button type="button" onClick={() => setTab("Gigs")} className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-colors ${tab === "Gigs" ? "bg-black text-white" : "text-purple-gray"}`}>Gigs</button></div>{tab === "About" ? <div className="mt-6 space-y-5"><div><h2 className="text-lg font-bold tracking-[-0.03em]">What I&apos;m about</h2><p className="mt-2 text-sm leading-6 text-purple-gray">I like bringing thoughtful people together and making sure everyone has a clear, welcoming way to participate.</p></div><div className="rounded-2xl bg-lavender p-4"><p className="text-xs font-bold uppercase tracking-wide text-purple">Trust on Offer</p><p className="mt-1 text-sm font-semibold leading-6">Verified details and a clear gig history help people know who they&apos;re meeting.</p></div></div> : <div className="mt-6 space-y-3"><Link href="/my-gigs" className="flex items-center justify-between rounded-2xl bg-lavender p-4"><span><strong className="block text-sm font-bold">Hangout with Slice</strong><span className="mt-1 block text-xs text-purple-gray">Hosted · Sep 25</span></span><span className="text-purple">↗</span></Link><Link href="/my-gigs" className="flex items-center justify-between rounded-2xl bg-lavender p-4"><span><strong className="block text-sm font-bold">Community food drive</strong><span className="mt-1 block text-xs text-purple-gray">Joined · Aug 02</span></span><span className="text-purple">↗</span></Link></div>}</section>

      <section className="space-y-3"><h2 className="px-1 text-lg font-bold tracking-[-0.03em]">Account</h2><div className="overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_28px_rgba(53,32,79,0.07)]">{settings.map(([title, description, icon]) => <button key={title} type="button" className="flex min-h-[4.5rem] w-full items-center justify-between gap-4 border-b border-black/5 px-4 text-left last:border-0 hover:bg-lavender"><span><strong className="block text-sm font-bold">{title}</strong><span className="mt-1 block text-xs text-purple-gray">{description}</span></span><span className="text-lg text-purple-gray">{icon}</span></button>)}</div></section>
    </div>
  );
}
