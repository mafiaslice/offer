"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { authIntentCopy, safeNextPath } from "@/lib/auth";
import { isSmsAuthEnabled, isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/client";
import { useOffer } from "@/components/offer-provider";
import type { SessionProfile } from "@/lib/data/types";

type Step = "email" | "phone" | "otp" | "profile";
type Role = "need" | "help" | "both";
type Channel = "email" | "phone";

const inputClass = "min-h-13 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-purple-gray/60 focus:border-purple focus:ring-4 focus:ring-purple/10";

function safeNext(value: string | null) {
  return safeNextPath(value);
}

export function AuthFlow() {
  const searchParams = useSearchParams();
  const { refresh } = useOffer();
  const supabaseReady = isSupabaseConfigured();
  const smsReady = isSmsAuthEnabled();
  const next = safeNext(searchParams.get("next"));

  const initialStep = useMemo<Step>(() => {
    if (searchParams.get("step") === "profile") return "profile";
    if (searchParams.get("step") === "otp") return "otp";
    return "email";
  }, [searchParams]);

  const [step, setStep] = useState<Step>(initialStep);
  const [channel, setChannel] = useState<Channel>("email");
  const [role, setRole] = useState<Role>("both");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(searchParams.get("error") ?? "");

  const destination = channel === "phone" ? phone : email;

  async function sendCode(target: Channel, value: string) {
    if (!supabaseReady) {
      setChannel(target);
      setStep("otp");
      return;
    }
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const result =
      target === "phone"
        ? await supabase.auth.signInWithOtp({ phone: value })
        : await supabase.auth.signInWithOtp({ email: value, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
    if (result.error) throw new Error(result.error.message);
    setChannel(target);
    setStep("otp");
  }

  async function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      await sendCode("email", email.trim());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send a code.");
    } finally {
      setBusy(false);
    }
  }

  async function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!smsReady) return;
    setError("");
    setBusy(true);
    try {
      await sendCode("phone", phone.trim());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not send a code.");
    } finally {
      setBusy(false);
    }
  }

  async function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = otp.join("");
    if (token.length < 6) {
      setError("Enter the 6-digit code.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      if (supabaseReady) {
        const supabase = createClient();
        const result =
          channel === "phone"
            ? await supabase.auth.verifyOtp({ phone: phone.trim(), token, type: "sms" })
            : await supabase.auth.verifyOtp({ email: email.trim(), token, type: "email" });
        if (result.error) throw new Error(result.error.message);
        const me = await fetch("/api/me");
        const body = (await me.json()) as { data?: SessionProfile | null; error?: string };
        if (!me.ok) throw new Error(body.error ?? "Could not load your profile.");
        await refresh();
        if (body.data?.displayName?.trim()) {
          setComplete(true);
          return;
        }
      }
      setStep("profile");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That code did not work.");
    } finally {
      setBusy(false);
    }
  }

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    try {
      if (supabaseReady) {
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

  function updateDigit(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    setOtp((current) => current.map((item, itemIndex) => (itemIndex === index ? digit : item)));
    if (digit) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  }

  const progress = step === "email" || step === "phone" ? "w-1/3" : step === "otp" ? "w-2/3" : "w-full";
  const stepLabel = step === "email" || step === "phone" ? "1 of 3" : step === "otp" ? "2 of 3" : "3 of 3";

  if (complete) {
    return (
      <main className="flex min-h-[calc(100dvh-7rem)] items-center justify-center">
        <section className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-[0_18px_42px_rgba(53,32,79,0.1)] sm:p-10">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-2xl text-[#37951a]">✓</span>
          <h1 className="mt-6 text-3xl font-bold tracking-[-0.06em]">You&apos;re in.</h1>
          <p className="mt-3 text-sm leading-6 text-purple-gray">
            {supabaseReady
              ? "Your Offer profile is ready. Anyone signed in can post a gig — Host is a capability, not a separate account."
              : "Your Offer profile is ready. Connect Supabase env vars to persist accounts beyond this demo session."}
          </p>
          <Link href={next} className="mt-7 flex min-h-13 items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple">
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
          <span className="grid size-8 place-items-center rounded-xl bg-black text-sm font-bold text-white">O</span>
          <span className="text-xl font-bold tracking-[-0.05em]">offer</span>
        </Link>
        <span className="text-xs font-bold text-purple-gray">{stepLabel}</span>
      </div>
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-black/5">
        <div className={`h-full rounded-full bg-purple transition-all ${progress}`} />
      </div>
      {error ? <p className="mb-4 rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}

      {step === "email" ? (
        <section className="space-y-7">
          <header className="space-y-3">
            <p className="text-sm font-semibold text-purple">{next === "/discover" ? "Welcome to Offer" : "Sign in to continue"}</p>
            <h1 className="text-[2.8rem] font-bold leading-[0.95] tracking-[-0.07em]">Good people<br />make things happen.</h1>
            <p className="max-w-sm text-sm leading-6 text-purple-gray">{authIntentCopy(next)}</p>
          </header>
          <form onSubmit={submitEmail} className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
            <label className="block space-y-2">
              <span className="text-sm font-bold">Email</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@email.com" required />
            </label>
            <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60">
              {busy ? "Sending…" : "Continue with email"}
            </button>
            <p className="text-center text-xs leading-5 text-purple-gray">We&apos;ll email a one-time code. You can also use the magic link in that email.</p>
          </form>
          <p className="text-center text-sm text-purple-gray">
            Prefer SMS?{" "}
            <button type="button" onClick={() => setStep("phone")} className="font-bold text-purple">
              Use phone
            </button>
          </p>
        </section>
      ) : null}

      {step === "phone" ? (
        <section className="space-y-7">
          <header className="space-y-3">
            <button type="button" onClick={() => setStep("email")} className="text-sm font-bold text-purple">← Use email</button>
            <h1 className="text-[2.8rem] font-bold leading-[0.95] tracking-[-0.07em]">Your number,<br />your people.</h1>
            <p className="text-sm leading-6 text-purple-gray">Phone sign-in is optional. Email OTP is the reliable v1 path.</p>
          </header>
          <form onSubmit={submitPhone} className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
            {!smsReady ? (
              <div className="rounded-2xl bg-lavender p-4">
                <p className="text-sm font-bold text-black">SMS is not configured</p>
                <p className="mt-1 text-xs leading-5 text-purple-gray">Phone OTP needs Twilio on the Supabase project. Use email for now, or set NEXT_PUBLIC_SUPABASE_SMS_AUTH=true after SMS is enabled.</p>
              </div>
            ) : null}
            <label className="block space-y-2">
              <span className="text-sm font-bold">Phone number</span>
              <input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder="+234 801 234 5678" required={smsReady} disabled={!smsReady} />
            </label>
            <button type="submit" disabled={!smsReady || busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60">
              {smsReady ? (busy ? "Sending…" : "Continue with phone") : "SMS not configured"}
            </button>
            <button type="button" onClick={() => setStep("email")} className="w-full text-center text-sm font-bold text-purple">
              Continue with email instead
            </button>
          </form>
        </section>
      ) : null}

      {step === "otp" ? (
        <section className="space-y-7">
          <header className="space-y-3">
            <button type="button" onClick={() => setStep(channel === "phone" ? "phone" : "email")} className="text-sm font-bold text-purple">
              ← Change {channel === "phone" ? "number" : "email"}
            </button>
            <h1 className="text-[2.8rem] font-bold leading-[0.95] tracking-[-0.07em]">Check your<br />messages.</h1>
            <p className="text-sm leading-6 text-purple-gray">
              Enter the 6-digit code we sent to <strong className="text-black">{destination || (channel === "phone" ? "your phone" : "your email")}</strong>.
            </p>
          </header>
          <form onSubmit={submitOtp} className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
            <div className="grid grid-cols-6 gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  aria-label={`Code digit ${index + 1}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => updateDigit(index, event.target.value)}
                  className="h-14 w-full rounded-xl border border-black/10 bg-lavender text-center text-lg font-bold outline-none focus:border-purple focus:ring-4 focus:ring-purple/10"
                  required
                />
              ))}
            </div>
            <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60">
              {busy ? "Verifying…" : channel === "phone" ? "Verify number" : "Verify email"}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                void sendCode(channel, destination).catch((caught: unknown) => {
                  setError(caught instanceof Error ? caught.message : "Could not resend.");
                });
              }}
              className="w-full text-center text-sm font-bold text-purple"
            >
              Resend code
            </button>
          </form>
        </section>
      ) : null}

      {step === "profile" ? (
        <section className="space-y-7">
          <header className="space-y-3">
            <h1 className="text-[2.8rem] font-bold leading-[0.95] tracking-[-0.07em]">Make it<br />feel like you.</h1>
            <p className="text-sm leading-6 text-purple-gray">A few details help people know who they&apos;re meeting on Offer.</p>
          </header>
          <form onSubmit={submitProfile} className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7">
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
                {([["need", "Find trusted hands", "I have a project or gig to fill"], ["help", "Show up and help", "I want to join gigs and meet people"], ["both", "Both", "I want to do both"]] as const).map(([value, title, description]) => (
                  <button key={value} type="button" onClick={() => setRole(value)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${role === value ? "border-purple bg-purple/5 ring-2 ring-purple/10" : "border-black/10 hover:bg-lavender"}`}>
                    <span className={`grid size-5 shrink-0 place-items-center rounded-full border ${role === value ? "border-purple bg-purple text-xs text-white" : "border-black/20"}`}>{role === value ? "✓" : null}</span>
                    <span>
                      <strong className="block text-sm font-bold">{title}</strong>
                      <span className="mt-0.5 block text-xs text-purple-gray">{description}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={busy} className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60">
              {busy ? "Saving…" : "Complete profile"}
            </button>
          </form>
        </section>
      ) : null}
    </main>
  );
}
