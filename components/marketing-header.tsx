"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const groups = [
  { title: "Explore Offer", links: [{ label: "Find a gig", href: "/discover" }, { label: "How it works", href: "/#how-it-works" }] },
  { title: "Take part", links: [{ label: "Post a Gig", href: "/post" }, { label: "Your activity", href: "/my-gigs" }] },
];

export function MarketingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 14);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`marketing-header ${scrolled ? "marketing-header--solid" : ""}`}>
      <Link href="/" className="offer-wordmark" aria-label="Offer home">
        <span className="offer-mark" aria-hidden="true">O</span>
        <span>offer</span>
      </Link>

      <nav className="marketing-header__desktop" aria-label="Main navigation">
        <button type="button" className="marketing-header__menu-trigger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          Explore <span aria-hidden="true">⌄</span>
        </button>
        <Link href="/discover">Find a gig</Link>
        <Link href="/post" className="marketing-header__cta">Post a Gig</Link>
      </nav>

      <button type="button" className="marketing-header__mobile-trigger" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
        <span aria-hidden="true">{open ? "×" : "☰"}</span>
      </button>

      {open && (
        <div className="mega-menu" role="dialog" aria-label="Offer navigation">
          <div className="mega-menu__intro">
            <p className="eyebrow">Offer</p>
            <p>Trusted hands for the work that brings people together.</p>
          </div>
          <div className="mega-menu__groups">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="mega-menu__label">{group.title}</p>
                <div className="mega-menu__links">
                  {group.links.map((link) => (
                    <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
                      {link.label}<span aria-hidden="true">↗</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
