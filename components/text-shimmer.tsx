/opt/homebrew/Library/Homebrew/cmd/shellenv.sh: line 18: /bin/ps: Operation not permitted
import type { CSSProperties } from "react";

type TextShimmerProps = {
  children: string;
  active?: boolean;
  duration?: number;
  as?: "span" | "p" | "div" | "h2" | "h3" | "h4";
  className?: string;
  id?: string;
};

/** A restrained status treatment for short, ongoing actions. */
export function TextShimmer({ children, active = true, duration = 1.8, as = "span", className, id }: TextShimmerProps) {
  const Tag = as;
  return (
    <Tag
      id={id}
      className={`text-shimmer ${active ? "text-shimmer--active" : ""} ${className ?? ""}`.trim()}
      style={{ "--shimmer-duration": `${duration}s` } as CSSProperties}
      aria-busy={active || undefined}
    >
      {children}
    </Tag>
  );
}
