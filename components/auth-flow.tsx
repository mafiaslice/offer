"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

type Step = "phone" | "otp" | "profile";
type Role = "need" | "help" | "both";

const inputClass = "min-h-13 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-purple-gray/60 focus:border-purple focus:ring-4 focus:ring-purple/10";

export function AuthFlow() {
  const [step, setStep] = useState<Step>("phone");
  const [role, setRole] = useState<Role>("both");
  const [phone, setPhone] = useState("");
  const [complete, setComplete] = useState(false);

  function submitPhone(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("otp");
  }

  function submitOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStep("profile");
  }

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setComplete(true);
  }

  if (complete) {
    return <main className="flex min-h-[calc(100dvh-7rem)] items-center justify-center"><section className="w-full max-w-md rounded-[2rem] bg-white p-7 text-center shadow-[0_18px_42px_rgba(53,32,79,0.1)] sm:p-10"><span className="mx-auto grid size-16 place-items-center rounded-full bg-success/15 text-2xl text-[#37951a]">✓</span><h1 className="mt-6 text-3xl font-bold tracking-[-0.06em]">You&apos;re in.</h1><p className="mt-3 text-sm leading-6 text-purple-gray">Your Offer profile is ready. We&apos;ll connect the real phone verification and account creation when the backend is wired.</p><Link href="/discover" className="mt-7 flex min-h-13 items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple">Explore Offer</Link></section></main>;
  }

  return (
    <main className="mx-auto flex min-h-[calc(100dvh-7rem)] max-w-md flex-col justify-center py-4">
      <div className="mb-8 flex items-center justify-between"><Link href="/discover" className="flex items-center gap-2"><span className="grid size-8 place-items-center rounded-xl bg-black text-sm font-bold text-white">O</span><span className="text-xl font-bold tracking-[-0.05em]">offer</span></Link><span className="text-xs font-bold text-purple-gray">{step === "phone" ? "1 of 3" : step === "otp" ? "2 of 3" : "3 of 3"}</span></div>
      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-black/5"><div className={`h-full rounded-full bg-purple transition-all ${step === "phone" ? "w-1/3" : step === "otp" ? "w-2/3" : "w-full"}`} /></div>

      {step === "phone" ? <section className="space-y-7"><header className="space-y-3"><p className="text-sm font-semibold text-purple">Welcome to Offer</p><h1 className="text-[2.8rem] font-bold leading-[0.95] tracking-[-0.07em]">Good people<br />make things happen.</h1><p className="max-w-sm text-sm leading-6 text-purple-gray">Join the place for trusted hands, volunteer gigs, and people building something together.</p></header><form onSubmit={submitPhone} className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7"><label className="block space-y-2"><span className="text-sm font-bold">Phone number</span><input type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} className={inputClass} placeholder="+234 801 234 5678" required /></label><button type="submit" className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple">Continue with phone</button><p className="text-center text-xs leading-5 text-purple-gray">We&apos;ll send a one-time code. No spam, ever.</p></form><p className="text-center text-sm text-purple-gray">Already have an account? <button type="button" onClick={() => setStep("otp")} className="font-bold text-purple">Sign in</button></p></section> : null}

      {step === "otp" ? <section className="space-y-7"><header className="space-y-3"><button type="button" onClick={() => setStep("phone")} className="text-sm font-bold text-purple">← Change number</button><h1 className="text-[2.8rem] font-bold leading-[0.95] tracking-[-0.07em]">Check your<br />messages.</h1><p className="text-sm leading-6 text-purple-gray">Enter the 6-digit code we sent to <strong className="text-black">{phone || "your phone"}</strong>.</p></header><form onSubmit={submitOtp} className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7"><div className="grid grid-cols-6 gap-2">{Array.from({ length: 6 }).map((_, index) => <input key={index} aria-label={`Code digit ${index + 1}`} inputMode="numeric" maxLength={1} className="h-14 w-full rounded-xl border border-black/10 bg-lavender text-center text-lg font-bold outline-none focus:border-purple focus:ring-4 focus:ring-purple/10" required />)}</div><button type="submit" className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple">Verify number</button><button type="button" className="w-full text-center text-sm font-bold text-purple">Resend code</button></form></section> : null}

      {step === "profile" ? <section className="space-y-7"><header className="space-y-3"><h1 className="text-[2.8rem] font-bold leading-[0.95] tracking-[-0.07em]">Make it<br />feel like you.</h1><p className="text-sm leading-6 text-purple-gray">A few details help people know who they&apos;re meeting on Offer.</p></header><form onSubmit={submitProfile} className="space-y-5 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-7"><label className="block space-y-2"><span className="text-sm font-bold">Your name</span><input className={inputClass} placeholder="What should we call you?" required /></label><label className="block space-y-2"><span className="text-sm font-bold">Short bio <span className="font-normal text-purple-gray">(optional)</span></span><textarea className={`${inputClass} min-h-24 resize-none py-3`} placeholder="What do you like helping with?" /></label><div className="space-y-3"><p className="text-sm font-bold">I&apos;m here to...</p><div className="space-y-2">{([["need", "Find trusted hands", "I have a project or gig to fill"], ["help", "Show up and help", "I want to join gigs and meet people"], ["both", "Both", "I want to do both"]] as const).map(([value, title, description]) => <button key={value} type="button" onClick={() => setRole(value)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition-colors ${role === value ? "border-purple bg-purple/5 ring-2 ring-purple/10" : "border-black/10 hover:bg-lavender"}`}><span className={`grid size-5 shrink-0 place-items-center rounded-full border ${role === value ? "border-purple bg-purple text-xs text-white" : "border-black/20"}`}>{role === value ? "✓" : null}</span><span><strong className="block text-sm font-bold">{title}</strong><span className="mt-0.5 block text-xs text-purple-gray">{description}</span></span></button>)}</div></div><button type="submit" className="flex min-h-13 w-full items-center justify-center rounded-2xl bg-black text-sm font-bold text-white transition-colors hover:bg-purple">Complete profile</button></form></section> : null}
    </main>
  );
}
