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
        <p className="text-sm font-semibold text-purple">{kicker}</p>
        <h1 className="text-[2.15rem] font-bold leading-[0.98] tracking-[-0.06em] sm:text-5xl">{title}</h1>
        <p className="text-sm leading-6 text-purple-gray sm:text-base">{body}</p>
      </header>
      <div className="rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
        <p className="text-sm leading-6 text-purple-gray">Identity verification is not required. Payments are not part of this walkthrough.</p>
        <Link href={signInHref(next)} className="mt-5 flex min-h-12 items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple">
          {action}
        </Link>
      </div>
    </div>
  );
}
