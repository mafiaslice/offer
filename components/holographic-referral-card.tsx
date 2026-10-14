"use client";

import { cn } from "@/lib/utils";
import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import { useState, type PointerEvent } from "react";

export type HolographicReferralCardProps = {
  name: string;
  gigsCompleted: number | null;
  className?: string;
};

const springOptions = { stiffness: 220, damping: 28, mass: 0.8 };

export function HolographicReferralCard({ name, gigsCompleted, className }: HolographicReferralCardProps) {
  const reduce = Boolean(useReducedMotion());
  const [copied, setCopied] = useState(false);
  const rotateX = useSpring(useMotionValue(0), springOptions);
  const rotateY = useSpring(useMotionValue(0), springOptions);
  const glowX = useMotionValue(50);
  const glowY = useMotionValue(50);
  const glowOpacity = useSpring(useMotionValue(0), { stiffness: 220, damping: 30 });
  const cardTransform = useMotionTemplate`perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  const glowBackground = useMotionTemplate`radial-gradient(circle at ${glowX}% ${glowY}%, rgba(255,255,255,0.78) 0%, rgba(142,82,255,0.42) 32%, rgba(142,82,255,0) 72%)`;
  const completedLabel = gigsCompleted == null ? "—" : String(gigsCompleted);

  function resetTilt() {
    glowOpacity.set(0);
    rotateX.set(0);
    rotateY.set(0);
    glowX.set(50);
    glowY.set(50);
  }

  function onPointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || reduce) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    const xProgress = (event.clientX - bounds.left) / bounds.width;
    const yProgress = (event.clientY - bounds.top) / bounds.height;
    glowX.set(xProgress * 100);
    glowY.set(yProgress * 100);
    glowOpacity.set(1);
    rotateX.set((yProgress - 0.5) * -8);
    rotateY.set((xProgress - 0.5) * 8);
  }

  async function share() {
    const url = `${window.location.origin}/discover`;
    const text = `${name} invited you to volunteer on Offer.`;
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: "Volunteer on Offer", text, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={cn("w-full [perspective:900px]", className)}>
      <motion.article
        aria-label={`${name}'s volunteer card`}
        className="relative overflow-hidden rounded-[1.75rem] bg-black p-3 text-white shadow-[0_16px_36px_rgba(0,0,0,0.16)] outline-none focus-visible:ring-2 focus-visible:ring-purple focus-visible:ring-offset-2 focus-visible:ring-offset-lavender sm:p-4"
        onPointerEnter={(event) => {
          if (event.pointerType !== "touch" && !reduce) glowOpacity.set(0.85);
        }}
        onPointerLeave={resetTilt}
        onPointerMove={onPointerMove}
        onFocus={() => {
          if (!reduce) glowOpacity.set(0.7);
        }}
        onBlur={resetTilt}
        style={{ transform: reduce ? "none" : cardTransform }}
        tabIndex={0}
      >
        <div className="flex items-center justify-between px-2 pt-1 pb-3">
          <span className="text-xs font-bold tracking-[0.14em] text-white/70 uppercase">Volunteer</span>
          <span className="text-xs font-semibold text-white/50">Offer</span>
        </div>

        <div className="relative mx-1 aspect-[5/3] overflow-hidden rounded-2xl bg-gradient-to-br from-purple via-white to-lavender sm:aspect-[2/1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,255,255,0.7),transparent_36%),radial-gradient(circle_at_80%_80%,rgba(142,82,255,0.45),transparent_40%)]" />
          <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
            <div>
              <p className="text-[11px] font-bold tracking-wide text-white/80 uppercase">Gigs completed</p>
              <p className="mt-1 text-4xl font-bold tracking-[-0.06em] text-white">{completedLabel}</p>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 px-2 pt-4 pb-2">
          <div className="min-w-0">
            <h2 className="truncate text-xl font-bold tracking-[-0.04em]">{name}</h2>
            <p className="mt-1 text-xs text-white/60">Your volunteer card</p>
          </div>
          <button
            type="button"
            onClick={() => {
              void share();
            }}
            className="min-h-11 shrink-0 rounded-full bg-white px-4 text-sm font-bold text-black transition-colors hover:bg-lavender"
          >
            {copied ? "Link copied" : "Invite"}
          </button>
        </div>
        <p className="sr-only" role="status">
          {copied ? "Invite link copied." : ""}
        </p>

        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] mix-blend-screen"
          style={{ background: glowBackground, opacity: reduce ? 0 : glowOpacity }}
        />
      </motion.article>
    </div>
  );
}

export default HolographicReferralCard;
