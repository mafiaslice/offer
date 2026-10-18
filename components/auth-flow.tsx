"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { authIntentCopy, safeNextPath } from "@/lib/auth";
import { Icon } from "@/components/icon";
import { useOffer } from "@/components/offer-provider";
import type { SessionProfile } from "@/lib/data/types";

type Step = "email" | "phone" | "profile";
type Role = "need" | "help" | "both";
type Mode = "sign-in" | "sign-up";

const inputClass = "field min-h-13 rounded-2xl";

function safeNext(value: string | null) {
  return safeNextPath(value);
}

export function AuthFlow() {
  const searchParams = useSearchParams();
  const { refresh, source } = useOffer();
  const liveAuth = source === "postgres";
  const next = safeNext(searchParams.get("next"));

  const initialStep = useMemo<Step>(() => {
    if (searchParams.get("step") === "profile") return "profile";
    return "email";
  }, [searchParams]);

  const [step, setStep] = useState<Step>(initialStep);
  const [mode, setMode] = useState<Mode>("sign-up");
  const [role, setRole] = useState<Role>("both");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");

  async function submitCredentials(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (!liveAuth) {
        setStep("profile");
        return;
      }
      const response = await fetch(mode === "sign-up" ? "/api/auth/sign-up" : "/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const body = (await response.json()) as { data?: SessionProfile | null; needsProfile?: boolean; error?: string };
      if (!response.ok) throw new Error(body.error ?? "Could not sign in.");
      await refresh();
      if (body.needsProfile) {
        setName(body.data?.displayName?.trim() && body.data.displayName !== email.split("@")[0] ? body.data.displayName : "");
        setStep("profile");
        return;
      }
      setComplete(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (liveAuth) {
        const response = await fetch("/api/me", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ displayName: name.trim(), bio: bio.trim(), intent: role, phone: phone.trim() || undefined }),
        });
        const body = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(body.error ?? "Could not save your profile.");
        await refresh();
      }
      setComplete(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }

  const progress = step === "email" || step === "phone" ? "w-1/2" : "w-full";
  const stepLabel = step === "email" || step === "phone" ? "1 of 2" : "2 of 2";

  if (complete) {
    return (
      <main className="flex min-h-[calc(100dvh-7rem)] items-center justify-center">
        <section className="w-full max-w-md rounded-[2rem] glass p-7 text-center shadow-card sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-2xl text-success"><Icon name="check" className="size-7" /></span>
          <h1 className="mt-6 text-3xl font-normal tracking-[-0.025em]">You&apos;re in.</h1>
          <p className="mt-3 text-sm leading-6 text-purple-gray">
            {liveAuth
              ? "Your Offer profile is ready. Anyone signed in can post a gig — Host is a capability, not a separate account."
              : "Your Offer profile is ready for this demo session. Set DATABASE_URL to persist accounts."}
          </p>
          <Link href={next} className="mt-7 flex min-h-13 items-center justify-center rounded-2xl bg-purple-fill text-sm font-bold text-white transition-colors hover:bg-[#7A3FF0]">
            Explore Offer
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-md flex-col justify-center py-4">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/discover" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-xl bg-purple-fill text-sm font-bold text-white">O</span>
          <span className="text-xl font-normal tracking-[-0.025em]">offer</span>
        </Link>
        <span className="text-xs font-bold text-purple-gray">{stepLabel}</span>
      </div>
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div className={`h-full rounded-full bg-purple-fill transition-all ${progress}`} />
      </div>
      {error ? <p className="mb-4 rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}

      {step === "email" ? (
        <section className="space-y-7">
          <header className="space-y-3">
            <p className="text-sm font-semibold text-purple-ink">{next === "/discover" ? "Welcome to Offer" : "Sign in to continue"}</p>
            <h1 className="text-[2.8rem] font-normal leading-[1.02] tracking-[-0.025em]">Good people<br />make things happen.</h1>
            <p className="max-w-sm text-sm leading-6 text-purple-gray">{authIntentCopy(next)}</p>
          </header>
          <form onSubmit={submitCredentials} className="space-y-4 rounded-[1.75rem] glass p-5 shadow-card sm:p-7">
            <label className="block space-y-2">
              <span className="text-sm font-bold">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@email.com" autoComplete="email" required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className={inputClass}
                placeholder="At least 8 characters"
                autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
                minLength={liveAuth ? 8 : undefined}
                required={liveAuth}
              />
            </label>
            <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-purple-fill text-sm font-bold text-white transition-colors hover:bg-[#7A3FF0] disabled:opacity-60">
              {busy ? "Saving…" : mode === "sign-up" ? "Create account" : "Sign in"}
            </button>
            <p className="text-center text-xs leading-5 text-purple-gray">Email and password stay on Offer. No separate login service.</p>
            <button
              type="button"
              onClick={() => {
                setError("");
                setMode((current) => (current === "sign-up" ? "sign-in" : "sign-up"));
              }}
              className="w-full text-center text-sm font-bold text-purple-ink"
            >
              {mode === "sign-up" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </form>
          <p className="text-center text-sm text-purple-gray">
            Prefer SMS?{" "}
            <button type="button" onClick={() => setStep("phone")} className="font-bold text-purple-ink">
              Use phone
            </button>
          </p>
        </section>
      ) : null}

      {step === "phone" ? (
        <section className="space-y-7">
          <header className="space-y-3">
            <button type="button" onClick={() => setStep("email")} className="inline-flex items-center gap-1.5 text-sm font-bold text-purple-ink"><Icon name="arrow-left" className="size-4" /> Use email</button>
            <h1 className="text-[2.8rem] font-normal leading-[1.02] tracking-[-0.025em]">Your number,<br />your people.</h1>
            <p className="text-sm leading-6 text-purple-gray">Phone sign-in is optional. Email and password are the v1 path.</p>
          </header>
          <form className="space-y-4 rounded-[1.75rem] glass p-5 shadow-card sm:p-7" onSubmit={(event) => event.preventDefault()}>
            <div className="rounded-2xl bg-white/10 p-4">
              <p className="text-sm font-bold text-white">SMS is not configured</p>
              <p className="mt-1 text-xs leading-5 text-purple-gray">Phone codes need an SMS provider. Offer runs without one. Use email and password.</p>
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-bold">Phone number</span>
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder="+234 801 234 5678" disabled />
            </label>
            <button type="button" disabled className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-purple-fill text-sm font-bold text-white opacity-60">
              SMS not configured
            </button>
            <button type="button" onClick={() => setStep("email")} className="w-full text-center text-sm font-bold text-purple-ink">
              Continue with email instead
            </button>
          </form>
        </section>
      ) : null}

      {step === "profile" ? (
        <section className="space-y-7">
          <header className="space-y-3">
            <h1 className="text-[2.8rem] font-normal leading-[1.02] tracking-[-0.025em]">Make it<br />feel like you.</h1>
            <p className="text-sm leading-6 text-purple-gray">A few details help people know who they&apos;re meeting on Offer.</p>
          </header>
          <form onSubmit={submitProfile} className="space-y-5 rounded-[1.75rem] glass p-5 shadow-card sm:p-7">
            <label className="block space-y-2">
              <span className="text-sm font-bold">Your name</span>
              <input className={inputClass} placeholder="What should we call you?" value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="block space-y-2">
              <span className="text-sm font-bold">Short bio <span className="font-normal text-purple-gray">(optional)</span></span>
              <textarea className={`${inputClass} min-h-24 resize-none py-3`} placeholder="What do you like helping with?" value={bio} onChange={(event) => setBio(event.target.value)} />
            </label>
            <div className="space-y-3">
              <p className="text-sm font-bold">I&apos;m here to...</p>
              <div className="space-y-2">
                {([["help", "I want to volunteer on gigs"], ["need", "I host gigs and need volunteers"], ["both", "Both"]] as const).map(([value, title]) => (
                  <button key={value} type="button" onClick={() => setRole(value)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${role === value ? "border-purple bg-purple/5 ring-2 ring-purple/10" : "border-white/15 hover:bg-white/10"}`}>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${role === value ? "border-purple bg-purple-fill text-xs text-white" : "border-white/25"}`}>{role === value ? <Icon name="check" className="size-3" /> : null}</span>
                    <strong className="block text-sm font-bold">{title}</strong>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-purple-fill text-sm font-bold text-white transition-colors hover:bg-[#7A3FF0] disabled:opacity-60">
              {busy ? "Saving…" : "Complete profile"}
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
