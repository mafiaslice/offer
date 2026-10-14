"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useId, type ButtonHTMLAttributes } from "react";

export type StatusButtonState = "idle" | "loading" | "success";

type StatusButtonProps = {
  status: StatusButtonState;
  idleLabel: string;
  loadingLabel: string;
  successLabel: string;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

function labelFor(status: StatusButtonState, idleLabel: string, loadingLabel: string, successLabel: string) {
  if (status === "loading") return loadingLabel;
  if (status === "success") return successLabel;
  return idleLabel;
}

export function StatusButton({
  status,
  idleLabel,
  loadingLabel,
  successLabel,
  className,
  disabled,
  type = "button",
  ...props
}: StatusButtonProps) {
  const reduce = Boolean(useReducedMotion());
  const text = labelFor(status, idleLabel, loadingLabel, successLabel);
  const statusId = useId();
  const letterTransition = reduce
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 500, damping: 30, mass: 1 };

  return (
    <div className="relative inline-flex w-full">
      <button
        type={type}
        {...props}
        aria-busy={status === "loading"}
        aria-describedby={status === "idle" ? undefined : statusId}
        disabled={disabled || status === "loading"}
        className={cn(
          "relative flex min-h-12 w-full items-center justify-center rounded-2xl bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-100",
          status === "loading" && "cursor-wait",
          status === "success" && "bg-black hover:bg-black",
          className,
        )}
      >
        <span className="flex items-center justify-center">
          {reduce ? (
            text
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              {text.split("").map((char, index) => (
                <motion.span
                  key={`${status}-${char}-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={letterTransition}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </AnimatePresence>
          )}
        </span>
      </button>

      <div className="pointer-events-none absolute -top-1 -right-1 z-10">
        <AnimatePresence mode="wait">
          {status !== "idle" ? (
            <motion.div
              key={status}
              id={statusId}
              role="status"
              initial={reduce ? false : { opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.6 }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 24 }}
              className={cn(
                "flex size-6 items-center justify-center rounded-full text-white ring-2 ring-lavender",
                status === "success" ? "bg-success" : "bg-purple",
              )}
            >
              {status === "loading" ? (
                <span className="size-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white motion-reduce:animate-none" />
              ) : (
                <svg viewBox="0 0 24 24" className="size-3.5" aria-hidden="true">
                  <path d="M5 12.5 9.2 17 19 7" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span className="sr-only">{text}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Registry name is save-button: the idle, loading, and success status control. */
export const SaveButton = StatusButton;
