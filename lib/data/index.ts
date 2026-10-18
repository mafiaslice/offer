import { isDatabaseConfigured } from "@/lib/db/env";
import * as demo from "@/lib/data/demo-adapter";
import * as postgres from "@/lib/data/postgres-adapter";
import { initialsFromName } from "@/lib/data/format";
import type {
  ApplyInput,
  CheckInWriteInput,
  CreateGigInput,
  DataSource,
  EnsureThreadInput,
  GigDetail,
  GigListFilters,
  GigListItem,
  InboxPayload,
  ListResult,
  MyActivity,
  ProfilePatch,
  SessionProfile,
  UserApplication,
} from "@/lib/data/types";

export type {
  ChatMessage,
  CheckInContext,
  CheckInParticipant,
  CheckInRecord,
  CheckInViewerRole,
  CheckInWriteInput,
  DataSource,
  EnsureThreadInput,
  GigDetail,
  GigListItem,
  GigRoleView,
  GigSlotView,
  InboxPayload,
  InboxThread,
  MyActivity,
  ProfilePatch,
  SessionProfile,
  StartableThread,
  ThreadMessagesPayload,
} from "@/lib/data/types";

export function dataSource(): DataSource {
  return isDatabaseConfigured() ? "postgres" : "demo-adapter";
}

export async function listGigs(filters: GigListFilters = {}): Promise<ListResult<GigListItem[]>> {
  if (isDatabaseConfigured()) return postgres.listGigs(filters);
  return demo.listGigs(filters);
}

export async function getGigBySlug(slug: string): Promise<GigDetail | null> {
  if (isDatabaseConfigured()) return postgres.getGigBySlug(slug);
  return demo.getGigBySlug(slug);
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  if (isDatabaseConfigured()) return postgres.getSessionProfile();
  return demo.getSessionProfile();
}

export async function ensureProfile(input: ProfilePatch): Promise<SessionProfile | null> {
  if (isDatabaseConfigured()) return postgres.ensureProfile(input);
  const displayName = input.displayName?.trim() || "You";
  return {
    id: "demo-user",
    displayName,
    initials: initialsFromName(displayName),
    bio: input.bio,
    intent: input.intent,
    phone: input.phone,
  };
}

export async function listMyActivity(): Promise<MyActivity> {
  if (isDatabaseConfigured()) return postgres.listMyActivity();
  return demo.listMyActivity();
}

export async function createGig(input: CreateGigInput): Promise<{ gig: GigDetail; source: DataSource; persisted: boolean }> {
  if (isDatabaseConfigured()) {
    return { gig: await postgres.createGig(input), source: "postgres", persisted: true };
  }
  return { gig: demo.createGig(input), source: "demo-adapter", persisted: false };
}

export async function applyToGig(input: ApplyInput): Promise<{ application: UserApplication; source: DataSource; persisted: boolean }> {
  if (isDatabaseConfigured()) {
    return { application: await postgres.applyToGig(input), source: "postgres", persisted: true };
  }
  return { application: demo.applyToGig(input), source: "demo-adapter", persisted: false };
}

export async function reviewApplication(id: string, status: "accepted" | "declined" | "withdrawn") {
  if (isDatabaseConfigured()) {
    return { ...(await postgres.reviewApplication(id, status)), source: "postgres" as const, persisted: true };
  }
  return { ...demo.reviewApplication(id, status as "accepted" | "declined"), source: "demo-adapter" as const, persisted: false };
}

export async function listInbox(): Promise<{ data: InboxPayload; source: DataSource }> {
  if (isDatabaseConfigured()) {
    return { data: await postgres.listInbox(), source: "postgres" };
  }
  return { data: demo.listInbox(), source: "demo-adapter" };
}

export async function listThreadMessages(threadId: string) {
  if (isDatabaseConfigured()) {
    return { data: await postgres.listThreadMessages(threadId), source: "postgres" as const, persisted: true };
  }
  return { data: demo.listThreadMessages(threadId), source: "demo-adapter" as const, persisted: false };
}

export async function sendThreadMessage(threadId: string, body: string) {
  if (isDatabaseConfigured()) {
    return { data: await postgres.sendThreadMessage(threadId, body), source: "postgres" as const, persisted: true };
  }
  return { data: demo.sendThreadMessage(threadId, body), source: "demo-adapter" as const, persisted: false };
}

export async function ensureThread(input: EnsureThreadInput) {
  if (isDatabaseConfigured()) {
    const result = await postgres.ensureThread(input);
    return { data: result.thread, created: result.created, source: "postgres" as const, persisted: true };
  }
  return { data: demo.ensureThread(input), created: false, source: "demo-adapter" as const, persisted: false };
}

export async function getCheckInContext(input: CheckInWriteInput) {
  if (isDatabaseConfigured()) {
    return { data: await postgres.getCheckInContext(input), source: "postgres" as const, persisted: true };
  }
  return { data: demo.getCheckInContext(input), source: "demo-adapter" as const, persisted: false };
}

export async function checkIn(input: CheckInWriteInput) {
  if (isDatabaseConfigured()) {
    return { data: await postgres.checkIn(input), source: "postgres" as const, persisted: true };
  }
  return { data: demo.checkIn(input), source: "demo-adapter" as const, persisted: false };
}

export async function checkOut(input: CheckInWriteInput) {
  if (isDatabaseConfigured()) {
    return { data: await postgres.checkOut(input), source: "postgres" as const, persisted: true };
  }
  return { data: demo.checkOut(input), source: "demo-adapter" as const, persisted: false };
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
