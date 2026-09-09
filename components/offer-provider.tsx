"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type LocalApplication = {
  gigSlug: string;
  role: string;
  status: "Applied" | "Accepted";
  createdAt: string;
};

type OfferContextValue = {
  applications: LocalApplication[];
  applyToGig: (gigSlug: string, role: string) => void;
  hasApplied: (gigSlug: string) => boolean;
};

const STORAGE_KEY = "offer:applications";
const OfferContext = createContext<OfferContextValue | null>(null);

export function OfferProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<LocalApplication[]>([]);

  useEffect(() => {
    let timer: number | undefined;
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as LocalApplication[];
        timer = window.setTimeout(() => setApplications(parsed), 0);
      }
    } catch {
      // Local storage is optional; the UI remains usable if it is unavailable.
    }
    return () => {
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  function applyToGig(gigSlug: string, role: string) {
    setApplications((current) => {
      if (current.some((application) => application.gigSlug === gigSlug)) return current;
      const next = [...current, { gigSlug, role, status: "Applied" as const, createdAt: new Date().toISOString() }];
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Persistence is best effort until the backend is connected.
      }
      return next;
    });
  }

  const value = useMemo(() => ({ applications, applyToGig, hasApplied: (gigSlug: string) => applications.some((application) => application.gigSlug === gigSlug) }), [applications]);

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
}

export function useOffer() {
  const context = useContext(OfferContext);
  if (!context) throw new Error("useOffer must be used within OfferProvider");
  return context;
}
