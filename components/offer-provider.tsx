"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { DataSource, ProfilePatch, SessionProfile, UserApplication } from "@/lib/data/types";

export type LocalApplication = {
  id?: string;
  gigSlug: string;
  role: string;
  status: "Applied" | "Accepted" | "Declined";
  createdAt: string;
};

type OfferContextValue = {
  source: DataSource;
  ready: boolean;
  user: SessionProfile | null;
  applications: LocalApplication[];
  applyToGig: (gigSlug: string, role: string, note?: string) => Promise<{ ok: boolean; status?: number; error?: string }>;
  reviewApplication: (id: string, status: "accepted" | "declined") => Promise<{ ok: boolean; status?: number; error?: string }>;
  updateProfile: (input: ProfilePatch) => Promise<{ ok: boolean; status?: number; error?: string }>;
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
  const [ready, setReady] = useState(source !== "supabase");
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
    const me = await fetch("/api/me");
    if (me.ok) {
      const body = (await me.json()) as { data: SessionProfile | null };
      if (source === "supabase" || body.data) {
        setUser(body.data);
      }
    }
    if (source === "supabase") {
      const mine = await fetch("/api/my-gigs");
      if (mine.ok) {
        const body = (await mine.json()) as { data: { applications?: UserApplication[] } };
        setApplications((body.data.applications ?? []).map(toLocal));
      }
    }
    setReady(true);
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
      return { ok: false, status: response.status, error: body.error ?? "Could not update application." };
    }
    return { ok: true, status: response.status };
  }, []);

  const updateProfile = useCallback(async (input: ProfilePatch) => {
    const response = await fetch("/api/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const body = (await response.json()) as { data?: SessionProfile | null; error?: string };
    if (!response.ok) {
      return { ok: false, status: response.status, error: body.error ?? "Could not save your profile." };
    }
    if (body.data) setUser(body.data);
    return { ok: true, status: response.status };
  }, []);

  const value = useMemo(
    () => ({
      source,
      ready,
      user,
      applications,
      applyToGig,
      reviewApplication,
      updateProfile,
      hasApplied: (gigSlug: string) => applications.some((application) => application.gigSlug === gigSlug),
      refresh,
    }),
    [applications, applyToGig, ready, refresh, reviewApplication, source, updateProfile, user],
  );

  return <OfferContext.Provider value={value}>{children}</OfferContext.Provider>;
}

export function useOffer() {
  const context = useContext(OfferContext);
  if (!context) throw new Error("useOffer must be used within OfferProvider");
  return context;
}
