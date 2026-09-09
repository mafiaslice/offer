"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { NavIcon } from "@/components/nav-icon";
import { OfferProvider } from "@/components/offer-provider";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <OfferProvider>
      <div className="min-h-dvh overflow-x-hidden bg-lavender">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_75%_0%,rgba(142,82,255,0.14),transparent_55%)]" />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 border-r border-black/5 bg-white/70 px-5 py-7 backdrop-blur-xl lg:flex lg:flex-col">
        <Link href="/discover" className="flex items-center gap-2 px-3" aria-label="Offer home">
          <span className="grid size-8 place-items-center rounded-xl bg-black text-sm font-bold text-white">O</span>
          <span className="text-xl font-bold tracking-[-0.04em] text-black">offer</span>
        </Link>
        <p className="mt-2 px-3 text-xs font-medium text-purple-gray">Find your people.</p>
        <nav className="mt-12 flex flex-col gap-1.5" aria-label="Primary">
          {navItems.map((item) => {
            const current = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-3.5 text-sm font-semibold transition-colors ${
                  current
                    ? "bg-black text-white shadow-lg shadow-black/10"
                    : "text-purple-gray hover:bg-white hover:text-black"
                }`}
              >
                <NavIcon label={item.label} className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="relative flex min-h-dvh flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-lavender/80 px-5 py-4 backdrop-blur-xl lg:hidden">
          <Link href="/discover" className="flex items-center gap-2" aria-label="Offer home">
            <span className="grid size-8 place-items-center rounded-xl bg-black text-sm font-bold text-white">O</span>
            <span className="text-xl font-bold tracking-[-0.05em]">offer</span>
          </Link>
          <Link href="/profile" className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#f5cc00] via-[#ff4da3] to-purple text-xs font-bold text-white shadow-sm" aria-label="Open profile">
            MS
          </Link>
        </header>

        <main className="mx-auto w-full max-w-[1180px] flex-1 px-5 py-6 pb-28 sm:px-8 lg:px-12 lg:py-10 lg:pb-12">
          {children}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_30px_rgba(55,36,76,0.07)] backdrop-blur-xl lg:hidden"
          aria-label="Primary"
        >
          <ul className="mx-auto grid max-w-lg grid-cols-5">
            {navItems.map((item) => {
              const current = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`group flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[10px] font-semibold ${
                      current ? "text-black" : "text-purple-gray"
                    }`}
                  >
                    <span className={`grid size-8 place-items-center rounded-full transition-all ${item.label === "Post" ? "-mt-5 size-14 border-4 border-lavender bg-purple text-white shadow-[0_10px_22px_rgba(142,82,255,0.32)]" : current ? "bg-black text-white" : "group-hover:bg-lavender"}`}>
                      <NavIcon label={item.label} className={item.label === "Post" ? "size-6" : "size-[18px]"} />
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      </div>
    </OfferProvider>
  );
}
