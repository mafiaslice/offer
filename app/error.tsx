"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-purple-ink">Something went wrong</p>
        <h1 className="text-[2.15rem] font-normal leading-[1.05] tracking-[-0.025em]">This page hit a snag.</h1>
        <p className="text-sm leading-6 text-purple-gray">Offer couldn&apos;t finish loading this screen. Try again, or head back to Discover.</p>
      </header>
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => retry()} className="flex min-h-12 items-center rounded-2xl bg-purple-fill px-5 text-sm font-bold text-white">
          Try again
        </button>
        <Link href="/discover" className="flex min-h-12 items-center rounded-2xl bg-white px-5 text-sm font-bold text-ink shadow-sm">
          Back to Discover
        </Link>
      </div>
    </div>
  );
}
