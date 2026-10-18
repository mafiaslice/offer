import { and, asc, desc, eq, inArray, ne, sql } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import { getCurrentUser, type AuthUser } from "@/lib/auth/session";
import { createCheckInToken, checkInPath, parseCheckInToken } from "@/lib/check-in-token";
import { getDb } from "@/lib/db/client";
import { httpError, pgCode } from "@/lib/db/errors";
import {
  applications,
  checkIns,
  gigRoles,
  gigSlots,
  gigs,
  messageThreads,
  messages,
  profiles,
} from "@/lib/db/schema";
import {
  applicationUiStatus,
  avatarTone,
  checkInState,
  combineDateAndTime,
  coverToneFor,
  formatDateLabel,
  formatLongDateLabel,
  formatSlotLabel,
  formatThreadTime,
  gigLifecycleStatus,
  imageTone,
  initialsFromName,
  kindLabel,
  MAX_MESSAGE_LENGTH,
  normalizeCategory,
  parseKindFilter,
  slugify,
  spotsLabel,
  threadUnread,
} from "@/lib/data/format";
import type {
  ApplyInput,
  ChatMessage,
  CheckInContext,
  CheckInParticipant,
  CheckInRecord,
  CheckInViewerRole,
  CheckInWriteInput,
  CreateGigInput,
  EnsureThreadInput,
  GigDetail,
  GigListFilters,
  GigListItem,
  HostApplicant,
  InboxPayload,
  InboxThread,
  ListResult,
  MyActivity,
  MyGigCard,
  ProfilePatch,
  SessionProfile,
  StartableThread,
  ThreadMessagesPayload,
  UserApplication,
} from "@/lib/data/types";

type GigRecord = typeof gigs.$inferSelect;
type RoleRecord = typeof gigRoles.$inferSelect;
type SlotRecord = typeof gigSlots.$inferSelect;
type ProfileRecord = typeof profiles.$inferSelect;
type CheckInRow = typeof checkIns.$inferSelect;

type GigJoin = { gig: GigRecord; hostName: string | null };

const source = "postgres" as const;
const hostProfile = alias(profiles, "host_profile");
const participantProfile = alias(profiles, "participant_profile");

function iso(value: Date | string | null | undefined) {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function isoRequired(value: Date | string | null | undefined) {
  return iso(value) ?? new Date().toISOString();
}

function hostLabel(name: string | null | undefined) {
  return name?.trim() || "Host";
}

function toListItem(gig: GigRecord, hostName: string | null, capacity?: number | null): GigListItem {
  return {
    id: gig.id,
    slug: gig.slug,
    title: gig.title,
    hostName: hostLabel(hostName),
    kindLabel: kindLabel(gig.kind),
    locationLabel: gig.locationLabel ?? "Location TBA",
    dateLabel: formatDateLabel(iso(gig.startsAt)),
    imageTone: imageTone(gig.coverTone),
    category: gig.category,
    spotsLabel: spotsLabel(capacity),
  };
}

function toDetail(row: GigJoin, roles: RoleRecord[], slots: SlotRecord[]): GigDetail {
  const capacity = slots.reduce((sum, slot) => sum + (slot.capacity ?? 0), 0) || roles.reduce((sum, role) => sum + (role.capacity ?? 0), 0);
  const list = toListItem(row.gig, row.hostName, capacity || null);
  const roleTitleById = new Map(roles.map((role) => [role.id, role.title]));
  const roleDetails = roles
    .map((role) => ({
      title: role.title.trim(),
      description: role.description?.trim() || undefined,
      capacity: role.capacity ?? undefined,
    }))
    .filter((role) => role.title);
  const summary = row.gig.summary?.trim() ?? "";
  return {
    ...list,
    summary,
    about: summary,
    hostInitials: initialsFromName(list.hostName),
    longDateLabel: formatLongDateLabel(iso(row.gig.startsAt)),
    roles: roleDetails.map((role) => role.title),
    roleDetails,
    slots: slots.map((slot) => ({
      id: slot.id,
      startsAt: isoRequired(slot.startsAt),
      endsAt: iso(slot.endsAt),
      timeLabel: formatSlotLabel(iso(slot.startsAt), iso(slot.endsAt)),
      capacity: slot.capacity ?? undefined,
      roleTitle: (slot.roleId && roleTitleById.get(slot.roleId)) || undefined,
    })),
    incentive: row.gig.incentive ?? "",
    instructions: row.gig.instructions ?? "",
    verified: false,
    startsAt: iso(row.gig.startsAt),
    endsAt: iso(row.gig.endsAt),
    status: row.gig.status,
    hostUserId: row.gig.hostUserId,
  };
}

function toSessionProfile(user: AuthUser, profile: ProfileRecord | null): SessionProfile {
  const displayName = profile?.displayName?.trim() || user.email.split("@")[0] || "You";
  const intent = profile?.intent === "need" || profile?.intent === "help" || profile?.intent === "both" ? profile.intent : undefined;
  return {
    id: user.id,
    displayName,
    initials: initialsFromName(displayName),
    email: user.email,
    phone: profile?.phone ?? undefined,
    bio: profile?.bio ?? undefined,
    intent,
    avatarUrl: profile?.avatarUrl ?? undefined,
  };
}

async function requireUser() {
  const user = await getCurrentUser();
  if (!user) httpError("Sign in to continue.", 401);
  return user;
}

async function loadOrCreateProfile(user: AuthUser) {
  const db = getDb();
  const [existing] = await db.select().from(profiles).where(eq(profiles.id, user.id)).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(profiles)
    .values({ id: user.id, displayName: user.email.split("@")[0] || "" })
    .returning();
  return created;
}

async function gigBySlug(slug: string) {
  const [row] = await getDb()
    .select({ gig: gigs, hostName: profiles.displayName })
    .from(gigs)
    .leftJoin(profiles, eq(gigs.hostUserId, profiles.id))
    .where(eq(gigs.slug, slug))
    .limit(1);
  return row ?? null;
}

async function gigById(id: string) {
  const [row] = await getDb()
    .select({ gig: gigs, hostName: profiles.displayName })
    .from(gigs)
    .leftJoin(profiles, eq(gigs.hostUserId, profiles.id))
    .where(eq(gigs.id, id))
    .limit(1);
  return row ?? null;
}

async function canReadGig(gig: Pick<GigRecord, "id" | "status" | "hostUserId">, userId?: string) {
  if (gig.status === "open") return true;
  if (!userId) return false;
  if (gig.hostUserId === userId) return true;
  const [application] = await getDb()
    .select({ id: applications.id })
    .from(applications)
    .where(and(eq(applications.gigId, gig.id), eq(applications.applicantUserId, userId)))
    .limit(1);
  return Boolean(application);
}

async function loadRolesAndSlots(gigId: string) {
  const db = getDb();
  const [roles, slots] = await Promise.all([
    db.select().from(gigRoles).where(eq(gigRoles.gigId, gigId)).orderBy(asc(gigRoles.sortOrder)),
    db.select().from(gigSlots).where(eq(gigSlots.gigId, gigId)).orderBy(asc(gigSlots.startsAt)),
  ]);
  return { roles, slots };
}

async function loadCapacityByGig(gigIds: string[]) {
  const map = new Map<string, number>();
  if (gigIds.length === 0) return map;
  const rows = await getDb().select({ gigId: gigSlots.gigId, capacity: gigSlots.capacity }).from(gigSlots).where(inArray(gigSlots.gigId, gigIds));
  for (const slot of rows) {
    map.set(slot.gigId, (map.get(slot.gigId) ?? 0) + (slot.capacity ?? 0));
  }
  return map;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  const profile = await loadOrCreateProfile(user);
  return toSessionProfile(user, profile);
}

export async function ensureProfile(input: ProfilePatch) {
  const user = await requireUser();
  const existing = await loadOrCreateProfile(user);
  const patch: Partial<typeof profiles.$inferInsert> = {};
  if (input.displayName !== undefined) {
    patch.displayName = input.displayName.trim() || existing.displayName || user.email.split("@")[0] || "";
  }
  if (input.bio !== undefined) patch.bio = input.bio.trim() || null;
  if (input.intent !== undefined) patch.intent = input.intent;
  if (input.phone !== undefined) patch.phone = input.phone.trim() || null;
  if (Object.keys(patch).length > 0) {
    await getDb().update(profiles).set(patch).where(eq(profiles.id, user.id));
  }
  return getSessionProfile();
}

export async function listGigs(filters: GigListFilters = {}): Promise<ListResult<GigListItem[]>> {
  const conditions = [eq(gigs.status, "open")];
  const kind = parseKindFilter(filters.kind);
  if (kind) conditions.push(eq(gigs.kind, kind));
  if (filters.category && filters.category !== "all") {
    conditions.push(eq(gigs.category, normalizeCategory(filters.category)));
  }

  const rows = await getDb()
    .select({ gig: gigs, hostName: profiles.displayName })
    .from(gigs)
    .leftJoin(profiles, eq(gigs.hostUserId, profiles.id))
    .where(and(...conditions))
    .orderBy(sql`${gigs.startsAt} asc nulls last`);

  const capacities = await loadCapacityByGig(rows.map((row) => row.gig.id));
  const queryText = filters.query?.trim().toLowerCase() ?? "";
  const mapped = rows
    .map((row) => toListItem(row.gig, row.hostName, capacities.get(row.gig.id) || null))
    .filter((gig) => {
      if (!queryText) return true;
      return `${gig.title} ${gig.hostName} ${gig.locationLabel} ${gig.category}`.toLowerCase().includes(queryText);
    });

  return { data: mapped, meta: { total: mapped.length, source } };
}

export async function getGigBySlug(slug: string): Promise<GigDetail | null> {
  const row = await gigBySlug(slug);
  if (!row) return null;
  const user = await getCurrentUser();
  if (!(await canReadGig(row.gig, user?.id))) return null;
  const { roles, slots } = await loadRolesAndSlots(row.gig.id);
  return toDetail(row, roles, slots);
}

export async function createGig(input: CreateGigInput): Promise<GigDetail> {
  const user = await requireUser();
  await loadOrCreateProfile(user);
  const category = normalizeCategory(input.category);
  const startsAt = new Date(combineDateAndTime(input.date, input.startTime));
  const roles = input.roles.map((title) => title.trim()).filter(Boolean);
  const base = slugify(input.title);

  for (let attempt = 0; attempt < 7; attempt += 1) {
    const slug = attempt === 0 ? base : `${base}-${attempt === 6 ? Date.now().toString(36) : Math.random().toString(36).slice(2, 6)}`;
    try {
      await getDb().transaction(async (tx) => {
        const [taken] = await tx.select({ id: gigs.id }).from(gigs).where(eq(gigs.slug, slug)).limit(1);
        if (taken) throw Object.assign(new Error("slug-taken"), { code: "SLUG" });
        const [gig] = await tx
          .insert(gigs)
          .values({
            slug,
            hostUserId: user.id,
            title: input.title.trim(),
            summary: input.summary.trim(),
            kind: input.kind,
            category,
            locationLabel: input.locationLabel.trim(),
            locationType: input.locationType,
            startsAt,
            coverTone: coverToneFor(input.kind, category),
            status: "open",
            incentive: input.incentive?.trim() || null,
            instructions: input.instructions?.trim() || null,
          })
          .returning({ id: gigs.id });
        if (roles.length > 0) {
          await tx.insert(gigRoles).values(roles.map((title, index) => ({ gigId: gig.id, title, sortOrder: index })));
        }
        await tx.insert(gigSlots).values({ gigId: gig.id, startsAt, capacity: input.slotCount });
      });
      const detail = await getGigBySlug(slug);
      if (!detail) httpError("Gig was created but could not be loaded.", 500);
      return detail;
    } catch (error) {
      if (pgCode(error) === "23505" || (error instanceof Error && error.message === "slug-taken")) continue;
      throw error;
    }
  }
  httpError("Could not create gig.", 400);
}

function toApplication(gig: Pick<GigRecord, "id" | "slug" | "title" | "hostUserId">, row: { id: string; status: UserApplication["rawStatus"]; createdAt: Date; note: string | null }, roleTitle: string): UserApplication {
  return {
    id: row.id,
    gigId: gig.id,
    gigSlug: gig.slug,
    gigTitle: gig.title,
    hostUserId: gig.hostUserId,
    role: roleTitle,
    status: applicationUiStatus(row.status),
    rawStatus: row.status,
    createdAt: isoRequired(row.createdAt),
    note: row.note ?? undefined,
  };
}

export async function applyToGig(input: ApplyInput): Promise<UserApplication> {
  const user = await requireUser();
  const row = await gigBySlug(input.gigSlug);
  if (!row || !(await canReadGig(row.gig, user.id))) httpError("Gig not found.", 404);
  const gig = row.gig;

  const [role] = await getDb()
    .select({ id: gigRoles.id })
    .from(gigRoles)
    .where(and(eq(gigRoles.gigId, gig.id), eq(gigRoles.title, input.roleTitle)))
    .limit(1);

  const loadExisting = async () => {
    const [existing] = await getDb()
      .select()
      .from(applications)
      .where(and(eq(applications.gigId, gig.id), eq(applications.applicantUserId, user.id)))
      .limit(1);
    return existing ?? null;
  };

  const existing = await loadExisting();
  if (existing) return toApplication(gig, existing, input.roleTitle);

  try {
    const [application] = await getDb()
      .insert(applications)
      .values({
        applicantUserId: user.id,
        gigId: gig.id,
        roleId: role?.id ?? null,
        note: input.note?.trim() || null,
        status: "pending",
      })
      .returning();
    return toApplication(gig, application, input.roleTitle);
  } catch (error) {
    if (pgCode(error) === "23505") {
      const raced = await loadExisting();
      if (raced) return toApplication(gig, raced, input.roleTitle);
    }
    httpError("Could not apply.", 400);
  }
}

export async function reviewApplication(id: string, status: "accepted" | "declined" | "withdrawn") {
  const user = await requireUser();
  const [application] = await getDb()
    .select({
      id: applications.id,
      applicantUserId: applications.applicantUserId,
      gigId: applications.gigId,
    })
    .from(applications)
    .where(eq(applications.id, id))
    .limit(1);
  if (!application) httpError("Application not found.", 404);

  const [gig] = await getDb()
    .select({ slug: gigs.slug, hostUserId: gigs.hostUserId })
    .from(gigs)
    .where(eq(gigs.id, application.gigId))
    .limit(1);
  const isHost = gig?.hostUserId === user.id;
  const isApplicant = application.applicantUserId === user.id;

  if (status === "withdrawn" && !isApplicant) httpError("Only the applicant can withdraw.", 403);
  if ((status === "accepted" || status === "declined") && !isHost) httpError("Only the host can review this application.", 403);

  const [updated] = await getDb()
    .update(applications)
    .set({ status })
    .where(eq(applications.id, id))
    .returning({ id: applications.id, status: applications.status });
  if (!updated) httpError("Could not update application.", 400);
  return { id: updated.id, status: updated.status, gigSlug: gig?.slug ?? "" };
}

export async function listMyActivity(): Promise<MyActivity> {
  const profile = await getSessionProfile();
  if (!profile) return { hosted: [], joined: [], applications: [], reviewQueue: [] };

  const db = getDb();
  const [hostedRows, applicationRows] = await Promise.all([
    db
      .select({ gig: gigs, hostName: profiles.displayName })
      .from(gigs)
      .leftJoin(profiles, eq(gigs.hostUserId, profiles.id))
      .where(eq(gigs.hostUserId, profile.id))
      .orderBy(sql`${gigs.startsAt} asc nulls last`),
    db
      .select()
      .from(applications)
      .where(eq(applications.applicantUserId, profile.id))
      .orderBy(desc(applications.createdAt)),
  ]);

  const hostedIds = hostedRows.map((row) => row.gig.id);
  const allIds = [...new Set([...hostedIds, ...applicationRows.map((row) => row.gigId)])];
  const [related, roles, reviewRows, capacities] = await Promise.all([
    allIds.length
      ? db
          .select({ gig: gigs, hostName: profiles.displayName })
          .from(gigs)
          .leftJoin(profiles, eq(gigs.hostUserId, profiles.id))
          .where(inArray(gigs.id, allIds))
      : Promise.resolve([] as GigJoin[]),
    allIds.length
      ? db.select({ id: gigRoles.id, title: gigRoles.title, gigId: gigRoles.gigId }).from(gigRoles).where(inArray(gigRoles.gigId, allIds))
      : Promise.resolve([] as { id: string; title: string; gigId: string }[]),
    hostedIds.length
      ? db
          .select()
          .from(applications)
          .where(and(inArray(applications.gigId, hostedIds), ne(applications.status, "withdrawn")))
          .orderBy(asc(applications.createdAt))
      : Promise.resolve([] as (typeof applications.$inferSelect)[]),
    loadCapacityByGig(allIds),
  ]);

  const gigById = new Map(related.map((row) => [row.gig.id, row]));
  const roleById = new Map(roles.map((role) => [role.id, role.title]));
  const applicantIds = [...new Set(reviewRows.map((row) => row.applicantUserId))];
  const applicantProfiles = applicantIds.length
    ? await db.select({ id: profiles.id, displayName: profiles.displayName }).from(profiles).where(inArray(profiles.id, applicantIds))
    : [];
  const nameById = new Map(applicantProfiles.map((row) => [row.id, row.displayName]));

  const hosted: MyGigCard[] = hostedRows.map((row) => ({
    ...toListItem(row.gig, row.hostName, capacities.get(row.gig.id) || null),
    mode: "Hosted",
    status: gigLifecycleStatus(iso(row.gig.startsAt), row.gig.status),
    checkInToken: createCheckInToken(row.gig.id),
  }));

  const applicationsOut: UserApplication[] = applicationRows.flatMap((row) => {
    const gig = gigById.get(row.gigId);
    if (!gig) return [];
    return [
      {
        id: row.id,
        gigId: gig.gig.id,
        gigSlug: gig.gig.slug,
        gigTitle: gig.gig.title,
        hostUserId: gig.gig.hostUserId,
        role: (row.roleId && roleById.get(row.roleId)) || "General support",
        status: applicationUiStatus(row.status),
        rawStatus: row.status,
        createdAt: isoRequired(row.createdAt),
        note: row.note ?? undefined,
      },
    ];
  });

  const joined: MyGigCard[] = applicationRows.flatMap((row) => {
    const gig = gigById.get(row.gigId);
    if (!gig) return [];
    return [
      {
        ...toListItem(gig.gig, gig.hostName, capacities.get(gig.gig.id) || null),
        mode: "Joined",
        status: gigLifecycleStatus(iso(gig.gig.startsAt), gig.gig.status),
        applicationStatus: applicationUiStatus(row.status),
        checkInToken: createCheckInToken(gig.gig.id),
      },
    ];
  });

  const tones = ["from-[#ffcf91] to-[#8e52ff]", "from-[#bcebdc] to-[#49d7b8]", "from-[#29244b] to-[#ff4da3]"];
  const reviewQueue: HostApplicant[] = reviewRows.map((row, index) => {
    const gig = gigById.get(row.gigId);
    const name = nameById.get(row.applicantUserId)?.trim() || "Applicant";
    return {
      id: row.id,
      gigSlug: gig?.gig.slug ?? "",
      gigTitle: gig?.gig.title ?? "Gig",
      applicantUserId: row.applicantUserId,
      name,
      initials: initialsFromName(name),
      role: (row.roleId && roleById.get(row.roleId)) || "General support",
      trust: "New to Offer",
      tone: tones[index % tones.length],
      status: row.status,
    };
  });

  return { hosted, joined, applications: applicationsOut, reviewQueue };
}

type ThreadRow = {
  thread: typeof messageThreads.$inferSelect;
  gigSlug: string;
  gigTitle: string;
  hostName: string | null;
  participantName: string | null;
};

function threadBase() {
  return getDb()
    .select({
      thread: messageThreads,
      gigSlug: gigs.slug,
      gigTitle: gigs.title,
      hostName: hostProfile.displayName,
      participantName: participantProfile.displayName,
    })
    .from(messageThreads)
    .innerJoin(gigs, eq(messageThreads.gigId, gigs.id))
    .innerJoin(hostProfile, eq(messageThreads.hostUserId, hostProfile.id))
    .innerJoin(participantProfile, eq(messageThreads.participantUserId, participantProfile.id));
}

function toInboxThread(row: ThreadRow, viewerId: string): InboxThread {
  const viewerIsHost = row.thread.hostUserId === viewerId;
  const name = (viewerIsHost ? row.participantName : row.hostName)?.trim() || (viewerIsHost ? "Applicant" : "Host");
  return {
    id: row.thread.id,
    gigId: row.thread.gigId,
    gigSlug: row.gigSlug,
    gigTitle: row.gigTitle,
    counterpartName: name,
    counterpartInitials: initialsFromName(name),
    counterpartUserId: viewerIsHost ? row.thread.participantUserId : row.thread.hostUserId,
    preview: row.thread.lastMessagePreview || "No messages yet",
    lastMessageAt: isoRequired(row.thread.lastMessageAt),
    timeLabel: formatThreadTime(iso(row.thread.lastMessageAt)),
    unread: threadUnread({
      viewerId,
      hostUserId: row.thread.hostUserId,
      lastMessageSenderId: row.thread.lastMessageSenderId,
      lastMessageAt: isoRequired(row.thread.lastMessageAt),
      hostLastReadAt: iso(row.thread.hostLastReadAt) ?? null,
      participantLastReadAt: iso(row.thread.participantLastReadAt) ?? null,
    }),
    online: false,
    tone: avatarTone(name),
    role: viewerIsHost ? "host" : "participant",
  };
}

function memberClause(userId: string) {
  return sql`(${messageThreads.hostUserId} = ${userId} or ${messageThreads.participantUserId} = ${userId})`;
}

async function loadThreadById(threadId: string, userId: string) {
  const [row] = await threadBase()
    .where(and(eq(messageThreads.id, threadId), memberClause(userId)))
    .limit(1);
  if (!row) httpError("Conversation not found.", 404);
  return toInboxThread(row, userId);
}

async function upsertThread(gigId: string, hostUserId: string, participantUserId: string, userId: string): Promise<{ thread: InboxThread; created: boolean }> {
  if (hostUserId === participantUserId) httpError("You can't message yourself on this gig.", 400);
  const db = getDb();
  const [existing] = await db
    .select({ id: messageThreads.id })
    .from(messageThreads)
    .where(and(eq(messageThreads.gigId, gigId), eq(messageThreads.hostUserId, hostUserId), eq(messageThreads.participantUserId, participantUserId)))
    .limit(1);
  if (existing) return { thread: await loadThreadById(existing.id, userId), created: false };

  try {
    const [inserted] = await db
      .insert(messageThreads)
      .values({ gigId, hostUserId, participantUserId })
      .returning({ id: messageThreads.id });
    return { thread: await loadThreadById(inserted.id, userId), created: true };
  } catch (error) {
    if (pgCode(error) === "23505") {
      const [raced] = await db
        .select({ id: messageThreads.id })
        .from(messageThreads)
        .where(and(eq(messageThreads.gigId, gigId), eq(messageThreads.hostUserId, hostUserId), eq(messageThreads.participantUserId, participantUserId)))
        .limit(1);
      if (raced) return { thread: await loadThreadById(raced.id, userId), created: false };
    }
    httpError("Could not open conversation.", 400);
  }
}

async function listStartable(userId: string, rows: ThreadRow[]): Promise<StartableThread[]> {
  const existing = new Set(rows.map((row) => `${row.thread.gigId}:${row.thread.participantUserId}`));
  const db = getDb();
  const [hostedGigs, myApps] = await Promise.all([
    db.select({ id: gigs.id, slug: gigs.slug, title: gigs.title }).from(gigs).where(eq(gigs.hostUserId, userId)),
    db
      .select({ id: applications.id, gigId: applications.gigId, roleId: applications.roleId })
      .from(applications)
      .where(and(eq(applications.applicantUserId, userId), ne(applications.status, "withdrawn"))),
  ]);

  const hostedIds = hostedGigs.map((gig) => gig.id);
  const incoming = hostedIds.length
    ? await db
        .select({
          id: applications.id,
          gigId: applications.gigId,
          applicantUserId: applications.applicantUserId,
          roleId: applications.roleId,
        })
        .from(applications)
        .where(and(inArray(applications.gigId, hostedIds), ne(applications.status, "withdrawn")))
    : [];

  const allGigIds = [...new Set([...hostedIds, ...myApps.map((row) => row.gigId)])];
  const applicantIds = [...new Set(incoming.map((row) => row.applicantUserId))];
  const roleIds = [...new Set([...incoming, ...myApps].map((row) => row.roleId).filter((id): id is string => Boolean(id)))];

  const [relatedGigs, applicantProfiles, roles] = await Promise.all([
    allGigIds.length
      ? db.select({ id: gigs.id, slug: gigs.slug, title: gigs.title, hostUserId: gigs.hostUserId }).from(gigs).where(inArray(gigs.id, allGigIds))
      : Promise.resolve([]),
    applicantIds.length
      ? db.select({ id: profiles.id, displayName: profiles.displayName }).from(profiles).where(inArray(profiles.id, applicantIds))
      : Promise.resolve([]),
    roleIds.length ? db.select({ id: gigRoles.id, title: gigRoles.title }).from(gigRoles).where(inArray(gigRoles.id, roleIds)) : Promise.resolve([]),
  ]);

  const gigById = new Map(relatedGigs.map((gig) => [gig.id, gig]));
  const nameById = new Map(applicantProfiles.map((row) => [row.id, row.displayName]));
  const roleById = new Map(roles.map((role) => [role.id, role.title]));
  const hostIds = [...new Set(relatedGigs.map((gig) => gig.hostUserId).filter((id) => id !== userId))];
  const hostProfiles = hostIds.length
    ? await db.select({ id: profiles.id, displayName: profiles.displayName }).from(profiles).where(inArray(profiles.id, hostIds))
    : [];
  const hostNameById = new Map(hostProfiles.map((row) => [row.id, row.displayName]));
  const startable: StartableThread[] = [];

  for (const row of incoming) {
    if (existing.has(`${row.gigId}:${row.applicantUserId}`)) continue;
    const gig = gigById.get(row.gigId);
    const name = nameById.get(row.applicantUserId)?.trim() || "Applicant";
    startable.push({
      applicationId: row.id,
      gigSlug: gig?.slug ?? "",
      gigTitle: gig?.title ?? "Gig",
      counterpartName: name,
      counterpartInitials: initialsFromName(name),
      role: (row.roleId && roleById.get(row.roleId)) || "General support",
      tone: avatarTone(name),
    });
  }

  for (const row of myApps) {
    if (existing.has(`${row.gigId}:${userId}`)) continue;
    const gig = gigById.get(row.gigId);
    if (!gig || gig.hostUserId === userId) continue;
    const name = hostNameById.get(gig.hostUserId)?.trim() || "Host";
    startable.push({
      applicationId: row.id,
      gigSlug: gig.slug,
      gigTitle: gig.title,
      counterpartName: name,
      counterpartInitials: initialsFromName(name),
      role: (row.roleId && roleById.get(row.roleId)) || "General support",
      tone: avatarTone(name),
    });
  }

  return startable;
}

export async function listInbox(): Promise<InboxPayload> {
  const user = await requireUser();
  const rows = await threadBase().where(memberClause(user.id)).orderBy(desc(messageThreads.lastMessageAt));
  return {
    threads: rows.map((row) => toInboxThread(row, user.id)),
    startable: await listStartable(user.id, rows),
  };
}

export async function listThreadMessages(threadId: string): Promise<ThreadMessagesPayload> {
  const user = await requireUser();
  const thread = await loadThreadById(threadId, user.id);
  const data = await getDb()
    .select()
    .from(messages)
    .where(eq(messages.threadId, threadId))
    .orderBy(asc(messages.createdAt))
    .limit(200);

  await getDb()
    .update(messageThreads)
    .set(thread.role === "host" ? { hostLastReadAt: new Date() } : { participantLastReadAt: new Date() })
    .where(
      and(
        eq(messageThreads.id, threadId),
        thread.role === "host" ? eq(messageThreads.hostUserId, user.id) : eq(messageThreads.participantUserId, user.id),
      ),
    );

  const mapped: ChatMessage[] = data.map((row) => ({
    id: row.id,
    threadId: row.threadId,
    senderUserId: row.senderUserId,
    body: row.body,
    createdAt: isoRequired(row.createdAt),
    mine: row.senderUserId === user.id,
  }));
  return { thread: { ...thread, unread: 0 }, messages: mapped };
}

export async function sendThreadMessage(threadId: string, body: string): Promise<ChatMessage> {
  const user = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) httpError("Message cannot be empty.", 400);
  if (trimmed.length > MAX_MESSAGE_LENGTH) httpError("Message is too long.", 400);
  await loadThreadById(threadId, user.id);

  const [data] = await getDb()
    .insert(messages)
    .values({ threadId, senderUserId: user.id, body: trimmed })
    .returning();
  if (!data) httpError("Could not send message.", 400);
  return {
    id: data.id,
    threadId: data.threadId,
    senderUserId: data.senderUserId,
    body: data.body,
    createdAt: isoRequired(data.createdAt),
    mine: true,
  };
}

export async function ensureThread(input: EnsureThreadInput): Promise<{ thread: InboxThread; created: boolean }> {
  const user = await requireUser();

  if (input.applicationId?.trim()) {
    const [application] = await getDb()
      .select()
      .from(applications)
      .where(eq(applications.id, input.applicationId.trim()))
      .limit(1);
    if (!application || application.status === "withdrawn") httpError("Application not found.", 404);
    const [gig] = await getDb().select({ id: gigs.id, hostUserId: gigs.hostUserId }).from(gigs).where(eq(gigs.id, application.gigId)).limit(1);
    if (!gig) httpError("Gig not found.", 404);
    if (gig.hostUserId !== user.id && application.applicantUserId !== user.id) {
      httpError("You can only message on your own applications.", 403);
    }
    return upsertThread(gig.id, gig.hostUserId, application.applicantUserId, user.id);
  }

  if (input.gigSlug?.trim()) {
    const [gig] = await getDb()
      .select({ id: gigs.id, hostUserId: gigs.hostUserId })
      .from(gigs)
      .where(eq(gigs.slug, input.gigSlug.trim()))
      .limit(1);
    if (!gig) httpError("Gig not found.", 404);
    if (gig.hostUserId === user.id) httpError("Hosts start a conversation from an application.", 400);
    const [application] = await getDb()
      .select({ id: applications.id, status: applications.status })
      .from(applications)
      .where(and(eq(applications.gigId, gig.id), eq(applications.applicantUserId, user.id)))
      .limit(1);
    if (!application || application.status === "withdrawn") httpError("Apply to this gig before messaging the host.", 403);
    return upsertThread(gig.id, gig.hostUserId, user.id, user.id);
  }

  httpError("Choose a gig or application to message.", 400);
}

function toCheckInRecord(row: CheckInRow, gig: { id: string; slug: string; title: string }, name: string, roleLabel: string): CheckInRecord {
  return {
    id: row.id,
    gigId: gig.id,
    gigSlug: gig.slug,
    gigTitle: gig.title,
    slotId: row.slotId ?? undefined,
    userId: row.userId,
    displayName: name,
    initials: initialsFromName(name),
    roleLabel,
    checkedInAt: isoRequired(row.checkedInAt),
    checkedOutAt: iso(row.checkedOutAt),
  };
}

async function loadGigForCheckIn(input: { token?: string; gigSlug?: string; slotId?: string }, userId?: string) {
  const parsed = input.token?.trim() ? parseCheckInToken(input.token.trim()) : null;
  if (input.token?.trim() && !parsed) httpError("Check-in code is not valid.", 404);
  const row = parsed ? await gigById(parsed.gigId) : input.gigSlug?.trim() ? await gigBySlug(input.gigSlug.trim()) : null;
  if (!row || !(await canReadGig(row.gig, userId))) httpError("Gig not found.", 404);

  const slotId = input.slotId?.trim() || parsed?.slotId;
  if (slotId) {
    const [slot] = await getDb().select({ id: gigSlots.id, gigId: gigSlots.gigId }).from(gigSlots).where(eq(gigSlots.id, slotId)).limit(1);
    if (!slot || slot.gigId !== row.gig.id) httpError("That slot is not on this gig.", 400);
  }
  return { ...row, slotId, token: createCheckInToken(row.gig.id, slotId) };
}

async function viewerRoleForGig(gigId: string, hostUserId: string, userId: string): Promise<{ role: CheckInViewerRole; applicationRole: string }> {
  if (hostUserId === userId) return { role: "host", applicationRole: "Host" };
  const [application] = await getDb()
    .select({ status: applications.status, roleId: applications.roleId })
    .from(applications)
    .where(and(eq(applications.gigId, gigId), eq(applications.applicantUserId, userId)))
    .limit(1);
  if (!application || application.status === "withdrawn") return { role: "none", applicationRole: "General support" };
  let applicationRole = "General support";
  if (application.roleId) {
    const [role] = await getDb().select({ title: gigRoles.title }).from(gigRoles).where(eq(gigRoles.id, application.roleId)).limit(1);
    applicationRole = role?.title || "General support";
  }
  if (application.status === "accepted") return { role: "accepted", applicationRole };
  if (application.status === "pending") return { role: "pending", applicationRole };
  return { role: "none", applicationRole };
}

async function displayNameFor(userId: string) {
  const [row] = await getDb().select({ displayName: profiles.displayName }).from(profiles).where(eq(profiles.id, userId)).limit(1);
  return row?.displayName?.trim() || "Participant";
}

export async function getCheckInContext(input: CheckInWriteInput): Promise<CheckInContext> {
  const user = await getCurrentUser();
  const loaded = await loadGigForCheckIn(input, user?.id);
  const viewer = user
    ? await viewerRoleForGig(loaded.gig.id, loaded.gig.hostUserId, user.id)
    : { role: "unsigned" as const, applicationRole: "" };
  const isHost = viewer.role === "host";
  const db = getDb();

  const checkInRows = !user
    ? []
    : await db
        .select()
        .from(checkIns)
        .where(isHost ? eq(checkIns.gigId, loaded.gig.id) : and(eq(checkIns.gigId, loaded.gig.id), eq(checkIns.userId, user.id)))
        .orderBy(asc(checkIns.checkedInAt));

  const summary = {
    id: loaded.gig.id,
    slug: loaded.gig.slug,
    title: loaded.gig.title,
    hostName: hostLabel(loaded.hostName),
    hostUserId: loaded.gig.hostUserId,
    dateLabel: formatDateLabel(iso(loaded.gig.startsAt)),
    locationLabel: loaded.gig.locationLabel ?? "Location TBA",
    kindLabel: kindLabel(loaded.gig.kind),
  };

  if (isHost && user) {
    const accepted = await db
      .select()
      .from(applications)
      .where(and(eq(applications.gigId, loaded.gig.id), eq(applications.status, "accepted")));
    const applicantIds = [...new Set(accepted.map((row) => row.applicantUserId))];
    const roleIds = [...new Set(accepted.map((row) => row.roleId).filter((id): id is string => Boolean(id)))];
    const [people, roles] = await Promise.all([
      applicantIds.length
        ? db.select({ id: profiles.id, displayName: profiles.displayName }).from(profiles).where(inArray(profiles.id, applicantIds))
        : Promise.resolve([]),
      roleIds.length ? db.select({ id: gigRoles.id, title: gigRoles.title }).from(gigRoles).where(inArray(gigRoles.id, roleIds)) : Promise.resolve([]),
    ]);
    const nameById = new Map(people.map((row) => [row.id, row.displayName]));
    const titleByRole = new Map(roles.map((role) => [role.id, role.title]));
    const roleByUser = new Map(accepted.map((row) => [row.applicantUserId, (row.roleId && titleByRole.get(row.roleId)) || "General support"]));
    const records = checkInRows.map((row) =>
      toCheckInRecord(row, loaded.gig, nameById.get(row.userId)?.trim() || "Participant", roleByUser.get(row.userId) || "General support"),
    );
    const recordByUser = new Map(records.map((row) => [row.userId, row]));
    const participants: CheckInParticipant[] = accepted.map((row) => {
      const displayName = nameById.get(row.applicantUserId)?.trim() || "Participant";
      return {
        userId: row.applicantUserId,
        displayName,
        initials: initialsFromName(displayName),
        roleLabel: roleByUser.get(row.applicantUserId) || "General support",
        applicationId: row.id,
        checkIn: recordByUser.get(row.applicantUserId) ?? null,
      };
    });
    return {
      token: loaded.token,
      path: checkInPath(loaded.token),
      slotId: loaded.slotId,
      gig: summary,
      viewerRole: "host",
      ownCheckIn: records.find((row) => row.userId === user.id) ?? null,
      checkIns: records.filter((row) => checkInState(row) === "in"),
      participants,
    };
  }

  const ownName = user ? (await getSessionProfile())?.displayName || "You" : "You";
  const records = checkInRows.map((row) => toCheckInRecord(row, loaded.gig, ownName, viewer.applicationRole || "General support"));
  return {
    token: loaded.token,
    path: checkInPath(loaded.token),
    slotId: loaded.slotId,
    gig: summary,
    viewerRole: viewer.role,
    ownCheckIn: records[0] ?? null,
    checkIns: records.filter((row) => checkInState(row) === "in"),
    participants: [],
  };
}

async function resolveCheckInTarget(gig: GigRecord, actorId: string, requestedUserId?: string) {
  const actor = await viewerRoleForGig(gig.id, gig.hostUserId, actorId);
  const targetId = requestedUserId?.trim() && actor.role === "host" ? requestedUserId.trim() : actorId;
  if (requestedUserId?.trim() && actor.role !== "host") httpError("Only the host can check someone else in.", 403);
  const target = targetId === actorId ? actor : await viewerRoleForGig(gig.id, gig.hostUserId, targetId);
  if (targetId === gig.hostUserId && actor.role === "host") httpError("Hosts record attendance for accepted participants.", 400);
  if (target.role !== "accepted") {
    if (target.role === "pending") httpError("The host needs to accept this application before check-in.", 403);
    httpError("Only accepted participants can check in on this gig.", 403);
  }
  return { targetId, roleLabel: target.applicationRole };
}

export async function checkIn(input: CheckInWriteInput): Promise<CheckInRecord> {
  const user = await requireUser();
  const loaded = await loadGigForCheckIn(input, user.id);
  const { targetId, roleLabel } = await resolveCheckInTarget(loaded.gig, user.id, input.userId);
  const db = getDb();
  const [existing] = await db
    .select()
    .from(checkIns)
    .where(and(eq(checkIns.gigId, loaded.gig.id), eq(checkIns.userId, targetId)))
    .limit(1);
  const name = await displayNameFor(targetId);
  if (existing && !existing.checkedOutAt) return toCheckInRecord(existing, loaded.gig, name, roleLabel);

  const now = new Date();
  if (existing) {
    const [updated] = await db
      .update(checkIns)
      .set({ checkedInAt: now, checkedOutAt: null, slotId: loaded.slotId ?? existing.slotId })
      .where(and(eq(checkIns.id, existing.id), eq(checkIns.userId, targetId)))
      .returning();
    if (!updated) httpError("Could not check in.", 400);
    return toCheckInRecord(updated, loaded.gig, name, roleLabel);
  }

  const [inserted] = await db
    .insert(checkIns)
    .values({
      gigId: loaded.gig.id,
      userId: targetId,
      slotId: loaded.slotId ?? null,
      checkedInAt: now,
    })
    .returning();
  if (!inserted) httpError("Could not check in.", 400);
  return toCheckInRecord(inserted, loaded.gig, name, roleLabel);
}

export async function checkOut(input: CheckInWriteInput): Promise<CheckInRecord> {
  const user = await requireUser();
  const loaded = await loadGigForCheckIn(input, user.id);
  const { targetId, roleLabel } = await resolveCheckInTarget(loaded.gig, user.id, input.userId);
  const [existing] = await getDb()
    .select()
    .from(checkIns)
    .where(and(eq(checkIns.gigId, loaded.gig.id), eq(checkIns.userId, targetId)))
    .limit(1);
  if (!existing || existing.checkedOutAt) httpError("This participant is not checked in.", 400);

  const [updated] = await getDb()
    .update(checkIns)
    .set({ checkedOutAt: new Date() })
    .where(and(eq(checkIns.id, existing.id), eq(checkIns.userId, targetId)))
    .returning();
  if (!updated) httpError("Could not check out.", 400);
  return toCheckInRecord(updated, loaded.gig, await displayNameFor(targetId), roleLabel);
}
