"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { NavIcon } from "@/components/nav-icon";
import { OfferProvider, useOffer } from "@/components/offer-provider";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();

  if (pathname === "/") return children;

  return (
    <OfferProvider>
      <div className="relative min-h-dvh overflow-x-hidden bg-ink text-white">
        <div aria-hidden="true" className="pointer-events-none fixed inset-0">
          <div className="absolute -top-24 left-1/4 h-80 w-80 rounded-full bg-[#5646BC]/35 blur-3xl" />
          <div className="absolute top-40 -right-16 h-96 w-96 rounded-full bg-[#D98AB5]/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-[#8870DD]/15 blur-3xl" />
        </div>

        <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#E7E2EB]/15 bg-[#201938]/75 px-5 py-8 backdrop-blur-xl lg:flex">
          <Link href="/discover" className="flex items-center gap-2 px-3" aria-label="Offer home">
            <span className="grid size-8 place-items-center rounded-2xl bg-purple-fill text-sm font-medium text-white">O</span>
            <span className="text-xl font-normal tracking-[-0.025em] text-white">offer</span>
          </Link>
          <p className="mt-2 px-3 text-xs font-medium text-purple-gray">Volunteer first. Paid when you need it.</p>
          <nav className="mt-8 flex flex-col gap-1" aria-label="Primary">
            {navItems.map((item) => {
              const current = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={current ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition-colors duration-150 ${
                    current ? "bg-purple-fill text-white" : "text-purple-gray hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <NavIcon label={item.label} active={current} className="size-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="relative flex min-h-dvh flex-col lg:pl-64">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E7E2EB]/15 bg-[#181427]/75 px-4 py-4 backdrop-blur-xl sm:px-8 lg:hidden">
            <Link href="/discover" className="flex items-center gap-2" aria-label="Offer home">
              <span className="grid size-8 place-items-center rounded-2xl bg-purple-fill text-sm font-medium text-white">O</span>
              <span className="text-xl font-normal tracking-[-0.025em]">offer</span>
            </Link>
            <ProfileBadge />
          </header>

          <main className="mx-auto w-full max-w-[1180px] flex-1 px-4 py-8 pb-32 sm:px-8 lg:px-8 lg:pb-12">{children}</main>

          <nav
            className="fixed inset-x-0 bottom-0 z-20 border-t border-[#E7E2EB]/15 bg-[#201938]/80 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_24px_rgba(53,36,86,0.18)] backdrop-blur-xl lg:hidden"
            aria-label="Primary"
          >
            <ul className="mx-auto grid max-w-lg grid-cols-5">
              {navItems.map((item) => {
                const current = pathname === item.href;
                const post = item.label === "Post a Gig";
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? "page" : undefined}
                      className={`group flex min-h-[4.25rem] flex-col items-center justify-center gap-1 px-1 py-2 text-[11px] font-medium ${
                        current ? "text-white" : "text-purple-gray"
                      }`}
                    >
                      <span
                        className={`grid place-items-center rounded-full transition-colors duration-150 ${
                          post
                            ? "-mt-5 size-14 border-4 border-ink bg-purple-fill text-white shadow-[0_10px_22px_rgba(107,47,224,0.35)]"
                            : current
                              ? "size-8 bg-purple-fill text-white"
                              : "size-8 text-purple-gray group-hover:bg-white/10 group-hover:text-white"
                        }`}
                      >
                        <NavIcon label={item.label} active={current} className={post ? "size-6" : "size-[18px]"} />
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

function ProfileBadge() {
  const { user, source } = useOffer();
  const initials = user?.initials ?? (source === "demo-adapter" ? "MS" : "O");
  return (
    <Link
      href="/profile"
      className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-[#6B2FE0] via-[#9A3D88] to-[#5646BC] text-xs font-medium text-white"
      aria-label="Open profile"
    >
      {initials}
    </Link>
  );
}
