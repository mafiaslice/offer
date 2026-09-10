"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { CheckInQr } from "@/components/check-in-qr";
import { checkInState, formatCheckInTime } from "@/lib/data/format";
import type { CheckInContext, CheckInParticipant, CheckInRecord } from "@/lib/data/types";

type GigCheckInPanelProps = {
  gigSlug: string;
  compact?: boolean;
};

async function readContext(gigSlug: string) {
  const response = await fetch(`/api/check-ins?gigSlug=${encodeURIComponent(gigSlug)}`);
  const body = (await response.json()) as { data?: CheckInContext; error?: string };
  if (!response.ok) throw new Error(body.error ?? "Could not load attendance.");
  if (!body.data) throw new Error("Could not load attendance.");
  return body.data;
}

async function postAttendance(path: "/api/check-ins" | "/api/check-ins/checkout", payload: { gigSlug: string; userId?: string }) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const body = (await response.json()) as { error?: string };
  if (!response.ok) throw new Error(body.error ?? "Could not update attendance.");
}

function statusLabel(record: CheckInRecord | null) {
  if (!record) return "Not in";
  if (checkInState(record) === "in") return `In · ${formatCheckInTime(record.checkedInAt)}`;
  return `Out · ${formatCheckInTime(record.checkedOutAt)}`;
}

function ParticipantRow({
  person,
  gigSlug,
  onChanged,
}: {
  person: CheckInParticipant;
  gigSlug: string;
  onChanged: () => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const present = checkInState(person.checkIn) === "in";

  async function act() {
    setBusy(true);
    setError("");
    try {
      await postAttendance(present ? "/api/check-ins/checkout" : "/api/check-ins", { gigSlug, userId: person.userId });
      await onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not update attendance.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-black/5 bg-lavender/60 p-3">
      <div className="flex items-center gap-3">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ffcf91] to-[#8e52ff] text-xs font-bold text-white">
          {person.initials}
        </span>
        <span className="min-w-0 flex-1">
          <strong className="block truncate text-sm font-bold">{person.displayName}</strong>
          <span className="mt-0.5 block truncate text-xs text-purple-gray">
            {person.roleLabel} · {statusLabel(person.checkIn)}
          </span>
        </span>
        <button
          type="button"
          disabled={busy}
          onClick={() => void act()}
          className={`min-h-10 shrink-0 rounded-xl px-3 text-xs font-bold ${present ? "border border-black/10 text-purple-gray" : "bg-black text-white"}`}
        >
          {busy ? "…" : present ? "Check out" : "Check in"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs font-semibold text-error">{error}</p> : null}
    </div>
  );
}

export function GigCheckInPanel({ gigSlug, compact }: GigCheckInPanelProps) {
  const [context, setContext] = useState<CheckInContext | null>(null);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(!compact);

  const refresh = useCallback(async () => {
    try {
      setContext(await readContext(gigSlug));
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load attendance.");
    }
  }, [gigSlug]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [open, refresh]);

  const present = context?.checkIns ?? [];

  return (
    <section className="space-y-4 rounded-[1.75rem] bg-white p-5 shadow-[0_14px_34px_rgba(53,32,79,0.08)] sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-purple">Attendance</p>
          <h2 className="mt-1 text-lg font-bold tracking-[-0.04em]">{context?.gig.title ?? "Check-in QR"}</h2>
          <p className="mt-1 text-xs leading-5 text-purple-gray">
            Show this QR at the gig. Accepted participants scan it to check in themselves. You can also check people in here.
          </p>
        </div>
        {compact ? (
          <button type="button" onClick={() => setOpen((value) => !value)} className="text-xs font-bold text-purple">
            {open ? "Hide" : "Show QR"}
          </button>
        ) : null}
      </div>

      {open ? (
        <>
          {error ? <p className="rounded-2xl bg-error/10 px-4 py-3 text-sm font-semibold text-error">{error}</p> : null}
          {context ? (
            <div className="grid gap-6 sm:grid-cols-[11rem_1fr] sm:items-start">
              <CheckInQr token={context.token} />
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wide text-purple-gray">{present.length} checked in</p>
                {present.length > 0 ? (
                  <ul className="space-y-2">
                    {present.map((row) => (
                      <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-bold">{row.displayName}</span>
                        <span className="text-xs font-semibold text-purple-gray">{formatCheckInTime(row.checkedInAt)}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm leading-6 text-purple-gray">Nobody is checked in yet.</p>
                )}
                <Link href={context.path} className="inline-flex text-sm font-bold text-purple">
                  Open check-in page
                </Link>
              </div>
            </div>
          ) : !error ? (
            <p className="text-sm text-purple-gray">Loading attendance…</p>
          ) : null}

          {context?.viewerRole === "host" && context.participants.length > 0 ? (
            <div className="space-y-3 border-t border-black/5 pt-4">
              <p className="text-sm font-bold">Accepted participants</p>
              {context.participants.map((person) => (
                <ParticipantRow key={person.userId} person={person} gigSlug={gigSlug} onChanged={refresh} />
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
