"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { NavIcon } from "@/components/nav-icon";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-dvh bg-lavender">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-48 bg-linear-to-b from-purple/15 to-transparent" />

      <aside className="fixed inset-y-0 left-0 z-20 hidden w-56 border-r border-border bg-white/80 p-6 backdrop-blur-sm md:flex md:flex-col">
        <p className="text-lg font-semibold tracking-tight text-black">Offer</p>
        <p className="mt-1 text-sm text-purple-gray">Trusted hands</p>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Primary">
          {navItems.map((item) => {
            const current = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={current ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  current
                    ? "bg-purple text-white"
                    : "text-black hover:bg-lavender"
                }`}
              >
                <NavIcon label={item.label} className="size-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="relative flex min-h-dvh flex-col md:pl-56">
        <header className="sticky top-0 z-10 border-b border-border bg-lavender/80 px-4 py-3 backdrop-blur-sm md:hidden">
          <p className="text-base font-semibold tracking-tight">Offer</p>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-28 md:pb-10">
          {children}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-sm md:hidden"
          aria-label="Primary"
        >
          <ul className="grid grid-cols-5">
            {navItems.map((item) => {
              const current = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current ? "page" : undefined}
                    className={`flex flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium ${
                      current ? "text-purple" : "text-purple-gray"
                    }`}
                  >
                    <NavIcon label={item.label} className="size-5" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </div>
  );
}
