import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type GradientShellProps = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
};

/** Hairline gradient frame: outer gradient, inset surface, slightly smaller radius. */
export function GradientShell({ children, className, innerClassName }: GradientShellProps) {
  return (
    <div
      className={cn(
        "rounded-3xl bg-[linear-gradient(135deg,#5646BC_0%,#8870DD_55%,#D98AB5_100%)] p-px shadow-[0_20px_25px_-5px_rgba(53,36,86,0.15),0_8px_10px_-6px_rgba(53,36,86,0.12)]",
        className,
      )}
    >
      <div className={cn("h-full rounded-[23px] bg-[#211A35]/92 backdrop-blur-xl", innerClassName)}>{children}</div>
    </div>
  );
}
