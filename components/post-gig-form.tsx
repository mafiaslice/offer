"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactNode } from "react";
import { signInHref } from "@/lib/auth";
import { useOffer } from "@/components/offer-provider";
import { MultiStepForm, type MultiStep } from "@/components/multi-step-form";

type GigKind = "volunteer" | "paid";

const inputClass = "min-h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition placeholder:text-purple-gray/60 focus:border-purple focus:ring-4 focus:ring-purple/10";
const labelClass = "text-sm font-bold text-black";

const steps: MultiStep[] = [
  { title: "Basics", description: "Give your gig a clear shape." },
  { title: "Roles and slots", description: "Set expectations and keep slots visible." },
  { title: "Details and incentives", description: "Clear instructions make good gigs feel safe." },
  { title: "Review", description: "Check everything before you publish." },
];

const categoryLabels: Record<string, string> = {
  events: "Events",
  community: "Community",
  hospitality: "Hospitality",
  projects: "Projects",
};

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className={labelClass}>{label}</span>
      {children}
    </label>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-lavender px-4 py-3">
      <p className="text-[11px] font-bold tracking-wide text-purple uppercase">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-black">{value || "—"}</p>
    </div>
  );
}

export function PostGigForm() {
  const router = useRouter();
  const { source, user, ready } = useOffer();
  const [step, setStep] = useState(0);
  const [kind, setKind] = useState<GigKind>("volunteer");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [category, setCategory] = useState("events");
  const [locationType, setLocationType] = useState("in-person");
  const [locationLabel, setLocationLabel] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("10:00");
  const [slotCount, setSlotCount] = useState("5");
  const [roles, setRoles] = useState(["Guest welcome & check-in"]);
  const [incentive, setIncentive] = useState("");
  const [instructions, setInstructions] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [slug, setSlug] = useState<string | null>(null);
  const [persisted, setPersisted] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function addRole() {
    setRoles((current) => [...current, ""]);
  }

  function updateRole(index: number, value: string) {
    setRoles((current) => current.map((role, roleIndex) => (roleIndex === index ? value : role)));
  }

  function basicsError() {
    if (!title.trim()) return "Add a gig name to continue.";
    if (!summary.trim()) return "Tell people about the gig to continue.";
    if (!locationLabel.trim()) return "Add a place to continue.";
    if (!date) return "Add a date to continue.";
    if (!startTime) return "Add a start time to continue.";
    return "";
  }

  function slotsError() {
    const count = Number(slotCount);
    if (!slotCount || Number.isNaN(count) || count < 1) return "Add at least one slot to continue.";
    return "";
  }

  function validate(target: number) {
    if (target > 0) {
      const basics = basicsError();
      if (basics) return { step: 0, message: basics };
    }
    if (target > 1) {
      const slots = slotsError();
      if (slots) return { step: 1, message: slots };
    }
    return null;
  }

  function continueStep() {
    const problem = validate(step + 1);
    if (problem) {
      setError(problem.message);
      setStep(problem.step);
      return;
    }
    setError("");
    setStep((current) => Math.min(current + 1, steps.length - 1));
  }

  async function submit() {
    setError("");
    const problem = validate(steps.length);
    if (problem) {
      setError(problem.message);
      setStep(problem.step);
      return;
    }
    if (source === "supabase" && ready && !user) {
      router.push(signInHref("/post"));
      return;
    }

    setBusy(true);
    const response = await fetch("/api/gigs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        summary: summary.trim(),
        kind,
        category,
        locationType,
        locationLabel: locationLabel.trim(),
        date,
        startTime,
        slotCount: Number(slotCount),
        roles: roles.map((role) => role.trim()).filter(Boolean),
        incentive: incentive.trim(),
        instructions: instructions.trim(),
      }),
    });
    const body = (await response.json()) as { data?: { slug: string }; meta?: { persisted?: boolean }; error?: string };
    setBusy(false);

    if (!response.ok) {
      if (response.status === 401) {
        router.push(signInHref("/post"));
        return;
      }
      setError(body.error ?? "Could not create this gig.");
      return;
    }

    setSlug(body.data?.slug ?? null);
    setPersisted(Boolean(body.meta?.persisted));
    setSubmitted(true);
    router.push("/my-gigs");
    router.refresh();
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < steps.length - 1) {
      continueStep();
      return;
    }
    void submit();
  }

  const trimmedRoles = roles.map((role) => role.trim()).filter(Boolean);

  return (
    <form onSubmit={onSubmit} className="pb-5">
      <MultiStepForm
        steps={steps}
        step={step}
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setError("");
                setStep((current) => Math.max(current - 1, 0));
              }}
              disabled={step === 0}
              className="min-h-11 rounded-full bg-lavender px-4 text-sm font-bold text-black transition-colors hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-lavender disabled:hover:text-black"
            >
              Back
            </button>
            {step < steps.length - 1 ? (
              <button type="button" onClick={continueStep} className="min-h-11 rounded-full bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-purple">
                Continue
              </button>
            ) : (
              <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-black px-5 text-sm font-bold text-white transition-colors hover:bg-purple disabled:opacity-60">
                {busy ? "Creating…" : kind === "volunteer" ? "Create volunteer gig" : "Create paid gig"}
              </button>
            )}
          </>
        }
      >
        {step === 0 ? (
          <div className="flex flex-col gap-5">
            <div className="flex rounded-2xl bg-lavender p-1.5">
              {(["volunteer", "paid"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setKind(option)}
                  className={`min-h-11 flex-1 rounded-xl text-sm font-bold transition-all ${kind === option ? "bg-black text-white shadow-sm" : "text-purple-gray hover:text-black"}`}
                >
                  {option === "volunteer" ? "Volunteer gig" : "Paid gig"}
                </button>
              ))}
            </div>
            <div className="rounded-2xl bg-lavender p-4">
              <p className="text-sm font-bold text-black">{kind === "volunteer" ? "What do you need volunteers for?" : "A paid opportunity"}</p>
              <p className="mt-1 text-xs leading-5 text-purple-gray">
                {kind === "volunteer"
                  ? "Volunteers give their time. Be clear about the role, the shift, the incentives and the dress code."
                  : "Be clear about the work, time commitment, and payment. Paid gigs will be surfaced after volunteer opportunities."}
              </p>
            </div>
            <Field label="Gig name">
              <input name="title" value={title} onChange={(event) => setTitle(event.target.value)} className={inputClass} placeholder="e.g. Hangout with Slice" required />
            </Field>
            <Field label="Tell people about it">
              <textarea name="summary" value={summary} onChange={(event) => setSummary(event.target.value)} className={`${inputClass} min-h-32 resize-none py-3`} placeholder="What are you bringing people together to do?" required />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Category">
                <select name="category" value={category} onChange={(event) => setCategory(event.target.value)} className={inputClass}>
                  <option value="events">Events</option>
                  <option value="community">Community</option>
                  <option value="hospitality">Hospitality</option>
                  <option value="projects">Projects</option>
                </select>
              </Field>
              <Field label="Gig type">
                <select name="locationType" value={locationType} onChange={(event) => setLocationType(event.target.value)} className={inputClass}>
                  <option value="in-person">In-person</option>
                  <option value="remote">Remote</option>
                </select>
              </Field>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-bold tracking-[-0.03em]">When and where</h3>
              <p className="text-sm text-purple-gray">Help people know what showing up looks like.</p>
            </div>
            <Field label="Place">
              <div className="relative">
                <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-purple-gray">⌖</span>
                <input name="locationLabel" value={locationLabel} onChange={(event) => setLocationLabel(event.target.value)} className={`${inputClass} pl-10`} placeholder="Search for a place or add an address" required />
              </div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date">
                <input name="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} className={inputClass} required />
              </Field>
              <Field label="Start time">
                <input name="startTime" type="time" value={startTime} onChange={(event) => setStartTime(event.target.value)} className={inputClass} required />
              </Field>
            </div>
          </div>
        ) : null}

        {step === 1 ? (
          <div className="flex flex-col gap-5">
            <Field label="Total slots">
              <input name="slotCount" type="number" min={1} value={slotCount} onChange={(event) => setSlotCount(event.target.value)} className={inputClass} required />
            </Field>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className={labelClass}>Roles needed</span>
                <span className="text-xs font-semibold text-purple-gray">
                  {roles.length} role{roles.length === 1 ? "" : "s"}
                </span>
              </div>
              {roles.map((role, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    className={inputClass}
                    value={role}
                    onChange={(event) => updateRole(index, event.target.value)}
                    placeholder="e.g. Guest welcome & check-in"
                    aria-label={`Role ${index + 1}`}
                  />
                  <button
                    type="button"
                    onClick={() => setRoles((current) => current.filter((_, roleIndex) => roleIndex !== index))}
                    className="grid size-12 shrink-0 place-items-center rounded-2xl border border-black/10 text-lg text-purple-gray transition-colors hover:border-error hover:text-error"
                    aria-label={`Remove role ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button type="button" onClick={addRole} className="min-h-11 rounded-full border border-dashed border-purple px-4 text-sm font-bold text-purple transition-colors hover:bg-lavender">
                + Add another role
              </button>
            </div>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="flex flex-col gap-5">
            {kind === "volunteer" ? (
              <Field label="Incentive or support">
                <input name="incentive" value={incentive} onChange={(event) => setIncentive(event.target.value)} className={inputClass} placeholder="e.g. Transport support and breakfast provided" />
              </Field>
            ) : (
              <Field label="Payment">
                <input name="incentive" value={incentive} onChange={(event) => setIncentive(event.target.value)} className={inputClass} placeholder="e.g. ₦35,000 per person" />
              </Field>
            )}
            <Field label="Instructions">
              <textarea name="instructions" value={instructions} onChange={(event) => setInstructions(event.target.value)} className={`${inputClass} min-h-28 resize-none py-3`} placeholder="Dress code, arrival time, what to bring..." />
            </Field>
            <button type="button" className="flex min-h-28 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-lavender text-center transition-colors hover:border-purple">
              <span className="text-2xl text-purple">＋</span>
              <span className="mt-1 text-sm font-bold">Add photos or a cover</span>
              <span className="mt-1 text-xs text-purple-gray">Show people what they&apos;re joining</span>
            </button>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="flex flex-col gap-3">
            <ReviewRow label="Kind" value={kind === "volunteer" ? "Volunteer gig" : "Paid gig"} />
            <ReviewRow label="Gig name" value={title.trim()} />
            <ReviewRow label="About" value={summary.trim()} />
            <ReviewRow label="Category" value={categoryLabels[category] ?? category} />
            <ReviewRow label="Gig type" value={locationType === "remote" ? "Remote" : "In-person"} />
            <ReviewRow label="Place" value={locationLabel.trim()} />
            <ReviewRow label="Date" value={date} />
            <ReviewRow label="Start time" value={startTime} />
            <ReviewRow label="Total slots" value={slotCount} />
            <ReviewRow label="Roles" value={trimmedRoles.join(", ")} />
            <ReviewRow label={kind === "volunteer" ? "Incentive or support" : "Payment"} value={incentive.trim()} />
            <ReviewRow label="Instructions" value={instructions.trim()} />
            {error ? (
              <div role="alert" className="rounded-2xl bg-error/10 p-4 text-sm font-semibold text-error">
                {error}
              </div>
            ) : null}
            {submitted ? (
              <div role="status" className="rounded-2xl bg-success/15 p-4 text-sm font-semibold text-[#328e1c]">
                {persisted
                  ? "Your gig is live. Anyone signed in can host — no separate Host account."
                  : "Your gig draft is ready. Publishing persists once Supabase env vars are set."}
                {persisted && slug ? (
                  <button type="button" onClick={() => router.push(`/gigs/${slug}`)} className="mt-3 block text-sm font-bold text-black underline">
                    View gig
                  </button>
                ) : null}
              </div>
            ) : null}
            <p className="text-center text-xs leading-5 text-purple-gray">v1 publishes the gig as open so people can find it. Offer does not take payment.</p>
          </div>
        ) : null}

        {step < 3 && error ? (
          <div role="alert" className="mt-4 rounded-2xl bg-error/10 p-4 text-sm font-semibold text-error">
            {error}
          </div>
        ) : null}
      </MultiStepForm>
    </form>
  );
}
