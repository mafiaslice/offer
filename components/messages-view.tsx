"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { signInHref } from "@/lib/auth";
import { useOffer } from "@/components/offer-provider";
import { formatThreadTime, MAX_MESSAGE_LENGTH } from "@/lib/data/format";
import { readDemoMessages, readDemoThreads, rememberDemoMessage, rememberDemoThread } from "@/lib/data/demo-message-store";
import type { ChatMessage, InboxThread, StartableThread, ThreadMessagesPayload } from "@/lib/data/types";

function Avatar({ thread }: { thread: InboxThread }) {
  return (
    <span className={`relative grid size-14 shrink-0 place-items-center rounded-full bg-gradient-to-br ${thread.tone} text-sm font-bold text-white shadow-sm`}>
      {thread.counterpartInitials}
      <span className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-white ${thread.online ? "bg-success" : "bg-border"}`} />
    </span>
  );
}

function mergeThreads(server: InboxThread[], extra: InboxThread[]) {
  const byId = new Map<string, InboxThread>();
  for (const thread of [...extra, ...server]) byId.set(thread.id, thread);
  return [...byId.values()].sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export function MessagesView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("thread");
  const { source, user, ready, ensureThread } = useOffer();
  const [filter, setFilter] = useState<"All" | "Unread">("All");
  const [query, setQuery] = useState("");
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [startable, setStartable] = useState<StartableThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [active, setActive] = useState<InboxThread | null>(null);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);

  const loadInbox = useCallback(async () => {
    const response = await fetch("/api/threads");
    if (response.status === 401) {
      setUnauthorized(true);
      setThreads([]);
      setStartable([]);
      setLoading(false);
      return;
    }
    const body = (await response.json()) as { data?: { threads?: InboxThread[]; startable?: StartableThread[] }; error?: string };
    if (!response.ok) {
      setError(body.error ?? "Could not load messages.");
      setLoading(false);
      return;
    }
    setUnauthorized(false);
    const extras = source === "demo-adapter" ? readDemoThreads() : [];
    setThreads(mergeThreads(body.data?.threads ?? [], extras));
    setStartable(body.data?.startable ?? []);
    setLoading(false);
  }, [source]);

  const loadThread = useCallback(async (threadId: string) => {
    setDraft("");
    const response = await fetch(`/api/threads/${threadId}/messages`);
    if (response.status === 401) {
      setUnauthorized(true);
      return;
    }
    const extras = source === "demo-adapter" ? (readDemoMessages()[threadId] ?? []) : [];
    if (!response.ok) {
      const overlay = source === "demo-adapter" ? readDemoThreads().find((thread) => thread.id === threadId) : undefined;
      if (overlay) {
        setActive(overlay);
        setMessages(extras);
        setThreads((current) => current.map((thread) => (thread.id === threadId ? { ...thread, unread: 0 } : thread)));
        return;
      }
      setError("Conversation not found.");
      return;
    }
    const body = (await response.json()) as { data?: ThreadMessagesPayload };
    if (!body.data) return;
    if (source === "demo-adapter") rememberDemoThread(body.data.thread);
    setActive(body.data.thread);
    setMessages([...body.data.messages, ...extras.filter((message) => !body.data!.messages.some((item) => item.id === message.id))]);
    setThreads((current) => current.map((thread) => (thread.id === threadId ? { ...body.data!.thread, unread: 0 } : thread)));
  }, [source]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadInbox();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadInbox]);

  useEffect(() => {
    if (!selectedId) return;
    const timer = window.setTimeout(() => {
      void loadThread(selectedId);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadThread, selectedId]);

  const visibleThreads = useMemo(
    () =>
      threads.filter(
        (thread) =>
          (filter === "All" || thread.unread > 0) &&
          `${thread.counterpartName} ${thread.gigTitle} ${thread.preview}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [filter, query, threads],
  );
  const unreadCount = threads.reduce((sum, thread) => sum + thread.unread, 0);

  function openThread(id: string) {
    setError("");
    router.replace(`/messages?thread=${id}`, { scroll: false });
  }

  function closeThread() {
    setError("");
    setDraft("");
    router.replace("/messages", { scroll: false });
  }

  async function startConversation(applicationId: string) {
    if (source === "supabase" && ready && !user) {
      router.push(signInHref("/messages"));
      return;
    }
    const result = await ensureThread({ applicationId });
    if (!result.ok || !result.thread) {
      if (result.status === 401) router.push(signInHref("/messages"));
      else setError(result.error ?? "Could not open conversation.");
      return;
    }
    setComposerOpen(false);
    setThreads((current) => mergeThreads(current, [result.thread!]));
    openThread(result.thread.id);
  }

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    setError("");
    const response = await fetch(`/api/threads/${selectedId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    const body = (await response.json()) as { data?: ChatMessage; error?: string };
    setSending(false);
    if (!response.ok) {
      if (response.status === 401) router.push(signInHref("/messages"));
      else setError(body.error ?? "Could not send message.");
      return;
    }
    if (!body.data) return;
    if (source === "demo-adapter") rememberDemoMessage(body.data);
    setMessages((current) => [...current, body.data!]);
    setThreads((current) =>
      current.map((thread) =>
        thread.id === selectedId
          ? { ...thread, preview: body.data!.body, lastMessageAt: body.data!.createdAt, timeLabel: formatThreadTime(body.data!.createdAt), unread: 0 }
          : thread,
      ),
    );
    setDraft("");
  }

  if (selectedId) {
    if (unauthorized) {
      return (
        <div className="mx-auto max-w-2xl space-y-5">
          <header className="flex items-center gap-3">
            <button type="button" onClick={closeThread} className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm" aria-label="Back to messages">←</button>
            <h1 className="text-lg font-bold tracking-[-0.04em]">Sign in to message</h1>
          </header>
          <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white px-5 py-12 text-center">
            <p className="text-base font-bold">This thread needs a session</p>
            <p className="mt-2 text-sm leading-6 text-purple-gray">Host↔applicant conversations stay on Offer. Sign in to read and reply.</p>
            <Link href={signInHref(`/messages?thread=${selectedId}`)} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">Sign in</Link>
          </div>
        </div>
      );
    }
    const thread = active?.id === selectedId ? active : threads.find((item) => item.id === selectedId) ?? active;
    if (!thread) {
      return (
        <div className="mx-auto max-w-2xl space-y-5">
          <header className="flex items-center gap-3">
            <button type="button" onClick={closeThread} className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm" aria-label="Back to messages">←</button>
            <h1 className="text-lg font-bold tracking-[-0.04em]">{error || loading ? (error || "Loading conversation…") : "Loading conversation…"}</h1>
          </header>
          {error ? (
            <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white px-5 py-12 text-center">
              <p className="text-base font-bold">Conversation not found</p>
              <p className="mt-2 text-sm leading-6 text-purple-gray">That thread isn&apos;t available. Message a host or applicant from My Gigs.</p>
              <Link href="/my-gigs" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">My gigs</Link>
            </div>
          ) : null}
        </div>
      );
    }
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-5">
        <header className="flex items-center gap-3">
          <button type="button" onClick={closeThread} className="grid size-11 shrink-0 place-items-center rounded-full bg-white text-xl shadow-sm transition-colors hover:bg-black hover:text-white" aria-label="Back to messages">←</button>
          <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${thread.tone} text-xs font-bold text-white`}>{thread.counterpartInitials}</span>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-[-0.04em]">{thread.counterpartName}</h1>
            <p className="truncate text-xs font-semibold text-purple">{thread.gigTitle}</p>
          </div>
          {thread.gigSlug ? <Link href={`/gigs/${thread.gigSlug}`} className="text-sm font-bold text-purple">Gig</Link> : null}
        </header>

        <section className="min-h-[22rem] space-y-3 rounded-[1.75rem] bg-white p-4 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-5" aria-label="Conversation">
          {messages.filter((message) => message.threadId === selectedId).length === 0 ? (
            <div className="px-3 py-16 text-center">
              <p className="font-bold">Say hello</p>
              <p className="mt-2 text-sm text-purple-gray">This is a 1:1 thread with the {thread.role === "host" ? "applicant" : "host"} for this gig.</p>
            </div>
          ) : (
            messages.filter((message) => message.threadId === selectedId).map((message) => (
              <div key={message.id} className={`flex ${message.mine ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${message.mine ? "bg-black text-white" : "bg-lavender text-black"}`}>
                  <p className="text-sm leading-6">{message.body}</p>
                  <time className={`mt-1 block text-[10px] font-semibold ${message.mine ? "text-white/60" : "text-purple-gray"}`}>{formatThreadTime(message.createdAt)}</time>
                </div>
              </div>
            ))
          )}
        </section>

        {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}

        <form onSubmit={send} className="sticky bottom-24 z-10 flex gap-2 rounded-2xl bg-white p-2 shadow-[0_14px_34px_rgba(53,32,79,0.08)] lg:bottom-4">
          <label className="sr-only" htmlFor="message-body">Message</label>
          <input
            id="message-body"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Write a message"
            className="min-h-12 min-w-0 flex-1 rounded-xl bg-lavender px-4 text-sm font-medium outline-none placeholder:text-purple-gray/70 focus:ring-4 focus:ring-purple/10"
          />
          <button type="submit" disabled={sending || !draft.trim()} className="min-h-12 rounded-xl bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-50">
            {sending ? "…" : "Send"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header className="flex items-end justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-purple">Stay in the loop</p>
          <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Messages.</h1>
        </div>
        <button type="button" aria-label="New message" onClick={() => setComposerOpen(true)} className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-xl text-white shadow-lg shadow-black/10 transition-colors hover:bg-purple">＋</button>
      </header>

      {unauthorized ? (
        <div className="rounded-[1.5rem] border border-dashed border-black/15 bg-white px-5 py-12 text-center">
          <p className="text-base font-bold">Sign in to message</p>
          <p className="mt-2 text-sm leading-6 text-purple-gray">Host↔applicant threads stay on Offer, tied to a gig.</p>
          <Link href={signInHref("/messages")} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">Sign in</Link>
        </div>
      ) : null}

      {!unauthorized ? (
        <>
          <label className="flex min-h-12 items-center gap-3 rounded-full border border-black/5 bg-white px-4 shadow-sm focus-within:border-purple focus-within:ring-4 focus-within:ring-purple/10">
            <svg className="size-5 shrink-0 text-purple-gray" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4.5 4.5" /></svg>
            <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search messages" placeholder="Search messages" className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-purple-gray/70" />
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={() => setFilter("All")} className={`min-h-10 rounded-full px-5 text-sm font-bold transition-colors ${filter === "All" ? "bg-black text-white" : "bg-white text-purple-gray shadow-sm"}`}>All</button>
            <button type="button" onClick={() => setFilter("Unread")} className={`min-h-10 rounded-full px-5 text-sm font-bold transition-colors ${filter === "Unread" ? "bg-black text-white" : "bg-white text-purple-gray shadow-sm"}`}>
              Unread {unreadCount > 0 ? <span className="ml-1 rounded-full bg-purple/10 px-1.5 py-0.5 text-[10px] text-purple">{unreadCount}</span> : null}
            </button>
          </div>

          {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}

          <section className="overflow-hidden rounded-[1.75rem] bg-white p-2 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-3" aria-label="Conversations">
            <div className="divide-y divide-black/5">
              {loading ? (
                <div className="px-5 py-14 text-center"><p className="font-bold">Loading conversations…</p></div>
              ) : visibleThreads.length > 0 ? (
                visibleThreads.map((thread) => (
                  <button key={thread.id} type="button" onClick={() => openThread(thread.id)} className="flex w-full items-center gap-3 px-3 py-4 text-left transition-colors hover:bg-lavender/60 sm:gap-4 sm:px-4">
                    <Avatar thread={thread} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <strong className="truncate text-sm font-bold text-black sm:text-base">{thread.counterpartName}</strong>
                        <time className="shrink-0 text-[10px] font-semibold text-purple-gray sm:text-xs">{thread.timeLabel}</time>
                      </span>
                      <span className="mt-0.5 block truncate text-xs font-semibold text-purple">{thread.gigTitle}</span>
                      <span className={`mt-1 block truncate text-xs ${thread.unread ? "font-semibold text-black" : "text-purple-gray"}`}>{thread.preview}</span>
                    </span>
                    {thread.unread > 0 ? <span className="grid size-6 shrink-0 place-items-center rounded-full bg-purple text-[10px] font-bold text-white">{thread.unread}</span> : <span className="text-sm text-purple-gray">›</span>}
                  </button>
                ))
              ) : (
                <div className="px-5 py-14 text-center">
                  <p className="font-bold">{query || filter === "Unread" ? "No messages found" : "No conversations yet"}</p>
                  <p className="mt-2 text-sm text-purple-gray">
                    {query || filter === "Unread"
                      ? "Try another search or check all messages."
                      : "Message a host or applicant from My Gigs. Threads are 1:1 and tied to a gig."}
                  </p>
                  {!query && filter === "All" ? <Link href="/my-gigs" className="mt-5 inline-flex min-h-11 items-center rounded-full bg-black px-5 text-sm font-bold text-white">My gigs</Link> : null}
                </div>
              )}
            </div>
          </section>
        </>
      ) : null}

      <div className="rounded-2xl bg-lavender p-4 text-center">
        <p className="text-sm font-bold">Keep conversations on Offer</p>
        <p className="mt-1 text-xs leading-5 text-purple-gray">Your gig details and safety tools stay in one place when you message here.</p>
      </div>

      {composerOpen ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 p-3 backdrop-blur-sm sm:items-center" role="presentation" onClick={() => setComposerOpen(false)}>
          <section role="dialog" aria-modal="true" aria-labelledby="new-message-title" onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-[2rem] bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-purple">New message</p>
                <h2 id="new-message-title" className="mt-1 text-2xl font-bold tracking-[-0.05em]">Start a gig thread.</h2>
              </div>
              <button type="button" onClick={() => setComposerOpen(false)} className="grid size-10 place-items-center rounded-full bg-lavender text-lg" aria-label="Close">×</button>
            </div>
            {startable.length > 0 ? (
              <div className="mt-5 space-y-2">
                {startable.map((item) => (
                  <button key={item.applicationId} type="button" onClick={() => { void startConversation(item.applicationId); }} className="flex w-full items-center gap-3 rounded-2xl bg-lavender/80 p-3 text-left transition-colors hover:bg-lavender">
                    <span className={`grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br ${item.tone} text-xs font-bold text-white`}>{item.counterpartInitials}</span>
                    <span className="min-w-0 flex-1">
                      <strong className="block truncate text-sm font-bold">{item.counterpartName}</strong>
                      <span className="mt-0.5 block truncate text-xs text-purple-gray">{item.gigTitle} · {item.role}</span>
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <p className="mt-5 text-sm leading-6 text-purple-gray">Apply to a gig or review an applicant first. Offer does not open empty group chats.</p>
            )}
          </section>
        </div>
      ) : null}
    </div>
  );
}
