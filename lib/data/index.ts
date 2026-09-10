import { isSupabaseConfigured } from "@/lib/supabase/env";
import * as demo from "@/lib/data/demo-adapter";
import * as supabase from "@/lib/data/supabase-adapter";
import type {
  ApplyInput,
  CreateGigInput,
  DataSource,
  GigDetail,
  GigListFilters,
  GigListItem,
  ListResult,
  MyActivity,
  SessionProfile,
  UserApplication,
} from "@/lib/data/types";

export type { DataSource, GigDetail, GigListItem, MyActivity, SessionProfile } from "@/lib/data/types";

export function dataSource(): DataSource {
  return isSupabaseConfigured() ? "supabase" : "demo-adapter";
}

export async function listGigs(filters: GigListFilters = {}): Promise<ListResult<GigListItem[]>> {
  if (isSupabaseConfigured()) return supabase.listGigs(filters);
  return demo.listGigs(filters);
}

export async function getGigBySlug(slug: string): Promise<GigDetail | null> {
  if (isSupabaseConfigured()) return supabase.getGigBySlug(slug);
  return demo.getGigBySlug(slug);
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  if (isSupabaseConfigured()) return supabase.getSessionProfile();
  return demo.getSessionProfile();
}

export async function ensureProfile(input: {
  displayName?: string;
  bio?: string;
  intent?: "need" | "help" | "both";
  phone?: string;
}): Promise<SessionProfile | null> {
  if (isSupabaseConfigured()) return supabase.ensureProfile(input);
  return {
    id: "demo-user",
    displayName: input.displayName?.trim() || "You",
    initials: "YO",
    bio: input.bio,
    intent: input.intent,
    phone: input.phone,
  };
}

export async function listMyActivity(): Promise<MyActivity> {
  if (isSupabaseConfigured()) return supabase.listMyActivity();
  return demo.listMyActivity();
}

export async function createGig(input: CreateGigInput): Promise<{ gig: GigDetail; source: DataSource; persisted: boolean }> {
  if (isSupabaseConfigured()) {
    return { gig: await supabase.createGig(input), source: "supabase", persisted: true };
  }
  return { gig: demo.createGig(input), source: "demo-adapter", persisted: false };
}

export async function applyToGig(input: ApplyInput): Promise<{ application: UserApplication; source: DataSource; persisted: boolean }> {
  if (isSupabaseConfigured()) {
    return { application: await supabase.applyToGig(input), source: "supabase", persisted: true };
  }
  return { application: demo.applyToGig(input), source: "demo-adapter", persisted: false };
}

export async function reviewApplication(id: string, status: "accepted" | "declined" | "withdrawn") {
  if (isSupabaseConfigured()) {
    return { ...(await supabase.reviewApplication(id, status)), source: "supabase" as const, persisted: true };
  }
  return { ...demo.reviewApplication(id, status as "accepted" | "declined"), source: "demo-adapter" as const, persisted: false };
}

export function httpStatus(error: unknown, fallback = 500) {
  if (error && typeof error === "object" && "status" in error && typeof error.status === "number") {
    return error.status;
  }
  return fallback;
}

export function errorMessage(error: unknown, fallback = "Something went wrong.") {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
