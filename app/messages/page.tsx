import type { Metadata } from "next";
import { Suspense } from "react";
import { MessagesView } from "@/components/messages-view";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Messages",
};

function MessagesFallback() {
  return (
    <div className="mx-auto max-w-2xl space-y-7">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-purple">Stay in the loop</p>
        <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">Messages.</h1>
      </header>
      <div className="rounded-[1.75rem] bg-white px-5 py-14 text-center shadow-[0_14px_34px_rgba(53,32,79,0.08)]">
        <p className="font-bold">Loading conversations…</p>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<MessagesFallback />}>
      <MessagesView />
    </Suspense>
  );
}
