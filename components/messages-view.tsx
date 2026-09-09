"use client";

import { useMemo, useState } from "react";

type Thread = {
  name: string;
  initials: string;
  gig: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
  tone: string;
};

const threads: Thread[] = [
  { name: "Slice", initials: "MS", gig: "Hangout with Slice", preview: "Amazing — I’ll send the briefing here.", time: "3:45 PM", unread: 2, online: true, tone: "from-[#f5cc00] to-[#ff4da3]" },
  { name: "Live Works", initials: "LW", gig: "Festival crew wanted", preview: "Can you confirm you’ll be there by 4?", time: "1:20 PM", unread: 1, online: true, tone: "from-[#29244b] to-[#ff4da3]" },
  { name: "Neighbourhood Hub", initials: "NH", gig: "Community food drive", preview: "Thank you for showing up yesterday!", time: "Yesterday", unread: 0, online: false, tone: "from-[#bcebdc] to-[#7b8cff]" },
  { name: "Tola Adebayo", initials: "TA", gig: "Open mic night", preview: "I can help with guest welcome.", time: "Mon", unread: 0, online: false, tone: "from-[#ffcf91] to-[#8e52ff]" },
  { name: "Offer Support", initials: "O", gig: "Your Offer account", preview: "Welcome to Offer. Here’s how it works.", time: "Sun", unread: 0, online: true, tone: "from-[#8e52ff] to-[#49d7b8]" },
];

function Avatar({ thread }: { thread: Thread }) {
  return <span className={`relative grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${thread.tone} text-sm font-bold text-white shadow-sm`}>{thread.initials}<span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${thread.online ? "bg-success" : "bg-border"}`} /></span>;
}

export function MessagesView() {
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [query, setQuery] = useState("");
  const visibleThreads = useMemo(() => threads.filter((thread) => (filter === "All" || thread.unread > 0) && `${thread.name} ${thread.gig} ${thread.preview}`.toLowerCase().includes(query.toLowerCase())), [filter, query]);

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header className="flex items-end justify-between gap-4"><div className="space-y-2"><p className="text-sm font-semibold text-purple">Stay in the loop</p><h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Messages.</h1></div><button type="button" aria-label="New message" className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-xl text-white shadow-lg shadow-black/10 transition-colors hover:bg-purple">＋</button></header>

      <label className="flex min-h-12 items-center gap-3 rounded-full border border-black/5 bg-white px-4 shadow-sm focus-within:border-purple focus-within:ring-4 focus-within:ring-purple/10"><svg className="size-5 shrink-0 text-purple-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg><input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search messages" placeholder="Search messages" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-purple-gray/70" /></label>

      <div className="flex gap-2"><button type="button" onClick={() => setFilter("All")} className={`min-h-10 rounded-full px-5 text-sm font-bold transition-colors ${filter === "All" ? "bg-black text-white" : "bg-white text-purple-gray shadow-sm"}`}>All</button><button type="button" onClick={() => setFilter("Unread")} className={`min-h-10 rounded-full px-5 text-sm font-bold transition-colors ${filter === "Unread" ? "bg-black text-white" : "bg-white text-purple-gray shadow-sm"}`}>Unread <span className="ml-1 rounded-full bg-purple/10 px-1.5 py-0.5 text-[10px] text-purple">3</span></button></div>

      <section className="overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-3" aria-label="Conversations"><div className="divide-y divide-black/5">{visibleThreads.length > 0 ? visibleThreads.map((thread) => <button key={thread.name} type="button" className="flex w-full items-center gap-3 px-3 py-4 text-left transition-colors hover:bg-lavender/60 sm:gap-4 sm:px-4"><Avatar thread={thread} /><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm font-bold text-black sm:text-base">{thread.name}</strong><time className="shrink-0 text-[10px] font-semibold text-purple-gray sm:text-xs">{thread.time}</time></span><span className="mt-0.5 block truncate text-xs font-semibold text-purple">{thread.gig}</span><span className={`mt-1 block truncate text-xs ${thread.unread ? "font-semibold text-black" : "text-purple-gray"}`}>{thread.preview}</span></span>{thread.unread > 0 ? <span className="grid size-6 shrink-0 place-items-center rounded-full bg-purple text-[10px] font-bold text-white">{thread.unread}</span> : <span className="text-sm text-purple-gray">›</span>}</button>) : <div className="px-5 py-14 text-center"><p className="font-bold">No messages found</p><p className="mt-2 text-sm text-purple-gray">Try another search or check all messages.</p></div>}</div></section>

      <div className="rounded-2xl bg-lavender p-4 text-center"><p className="text-sm font-bold">Keep conversations on Offer</p><p className="mt-1 text-xs leading-5 text-purple-gray">Your gig details and safety tools stay in one place when you message here.</p></div>
    </div>
  );
}
