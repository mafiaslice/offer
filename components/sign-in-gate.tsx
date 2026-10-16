import Link from "next/link";
import { signInHref } from "@/lib/auth";

type SignInGateProps = {
  next: string;
  kicker: string;
  title: string;
  body: string;
  action?: string;
};

export function SignInGate({ next, kicker, title, body, action = "Sign in to continue" }: SignInGateProps) {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-purple-ink">{kicker}</p>
        <h1 className="text-[2.15rem] font-normal leading-[1.05] tracking-[-0.025em] sm:text-5xl">{title}</h1>
        <p className="text-sm leading-6 text-purple-gray sm:text-base">{body}</p>
      </header>
      <div className="rounded-[1.75rem] glass p-5 shadow-card sm:p-7">
        <p className="text-sm leading-6 text-purple-gray">Identity verification is not required. Payments are not part of this walkthrough.</p>
        <Link href={signInHref(next)} className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-purple-fill text-sm font-bold text-white transition-colors hover:bg-[#7A3FF0]">
          {action}
        </Link>
      </div>
    </div>
  );
}
