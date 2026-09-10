"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { DataSource, SessionProfile, UserApplication } from "@/lib/data/types";

export type LocalApplication = {
  id?: string;
  gigSlug: string;
  role: string;
  status: "Applied" | "Accepted" | "Declined";
  createdAt: string;
};

type OfferContextValue = {
  source: DataSource;
  user: SessionProfile | null;
  applications: LocalApplication[];
  applyToGig: (gigSlug: string, role: string, note?: string) => Promise<{ ok: boolean; status?: number; error?: string }>;
  reviewApplication: (id: string, status: "accepted" | "declined") => Promise<{ ok: boolean; error?: string }>;
  hasApplied: (gigSlug: string) => boolean;
  refresh: () => Promise<void>;
};

const STORAGE_KEY = "offer:applications";
const OfferContext = createContext<OfferContextValue | null>(null);

function toLocal(application: UserApplication): LocalApplication {
  return {
    id: application.id,
    gigSlug: application.gigSlug,
    role: application.role,
    status: application.status,
    createdAt: application.createdAt,
  };
}

export function OfferProvider({ children }: { children: ReactNode }) {
  const source: DataSource = isSupabaseConfigured() ? "supabase" : "demo-adapter";
  const [user, setUser] = useState<SessionProfile | null>(null);
  const [applications, setApplications] = useState<LocalApplication[]>([]);

  const persistDemo = useCallback((next: LocalApplication[]) => {
    if (source !== "demo-adapter") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Best effort until Supabase is configured.
    }
  }, [source]);

  const refresh = useCallback(async () => {
    if (source !== "supabase") return;
    const [me, mine] = await Promise.all([fetch("/api/me"), fetch("/api/my-gigs")]);
    if (me.ok) {
      const body = (await me.json()) as { data: SessionProfile | null };
      setUser(body.data);
    }
    if (mine.ok) {
      const body = (await mine.json()) as { data: { applications?: UserApplication[] } };
      setApplications((body.data.applications ?? []).map(toLocal));
    }
  }, [source]);

  useEffect(() => {
    let timer: number | undefined;
    if (source === "supabase") {
      timer = window.setTimeout(() => {
        void refresh();
      }, 0);
      return () => {
        if (timer) window.clearTimeout(timer);
      };
    }
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
  }, [refresh, source]);

  const applyToGig = useCallback(
    async (gigSlug: string, role: string, note?: string) => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gigSlug, roleTitle: role, note }),
      });
      const body = (await response.json()) as { data?: UserApplication; error?: string };
      if (!response.ok) {
        return { ok: false, status: response.status, error: body.error ?? "Could not send application." };
      }
      if (body.data) {
        setApplications((current) => {
          if (current.some((application) => application.gigSlug === gigSlug)) return current;
          const next = [...current, toLocal(body.data!)];
          persistDemo(next);
          return next;
        });
      }
      return { ok: true };
    },
    [persistDemo],
  );

  const reviewApplication = useCallback(async (id: string, status: "accepted" | "declined") => {
    const response = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      return { ok: false, error: body.error ?? "Could not update application." };
    }
    return { ok: true };
  }, []);

  const value = useMemo(
    () => ({
      source,
      user,
      applications,
      applyToGig,
      reviewApplication,
      hasApplied: (gigSlug: string) => applications.some((application) => application.gigSlug === gigSlug),
      refresh,
    }),
    [applications, applyToGig, refresh, reviewApplication, source, user],
  );

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
}

export function useOffer() {
  const context = useContext(OfferContext);
  if (!context) throw new Error("useOffer must be used within OfferProvider");
  return context;
}
