import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import { createCheckInToken, checkInPath, parseCheckInToken } from "@/lib/check-in-token";
import {
  applicationUiStatus,
  avatarTone,
  checkInState,
  combineDateAndTime,
  coverToneFor,
  formatDateLabel,
  formatLongDateLabel,
  formatThreadTime,
  gigLifecycleStatus,
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
  CheckInContext,
  CheckInParticipant,
  CheckInRecord,
  CheckInViewerRole,
  CheckInWriteInput,
} from "@/lib/data/types";

type GigRow = Database["public"]["Tables"]["gigs"]["Row"];
type AuthUser = { id: string; email?: string | null; phone?: string | null; user_metadata?: Record<string, unknown> };
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type HostProfile = Pick<ProfileRow, "display_name" | "avatar_url">;
type RoleRow = Database["public"]["Tables"]["gig_roles"]["Row"];
type SlotRow = Database["public"]["Tables"]["gig_slots"]["Row"];

type GigWithHost = GigRow & { profiles: HostProfile | HostProfile[] | null };

const source = "supabase" as const;

function hostNameFrom(profile: GigWithHost["profiles"]) {
  const row = Array.isArray(profile) ? profile[0] : profile;
  return row?.display_name?.trim() || "Host";
}

function toListItem(gig: GigWithHost, capacity?: number | null): GigListItem {
  return {
    id: gig.id,
    slug: gig.slug,
    title: gig.title,
    hostName: hostNameFrom(gig.profiles),
    kindLabel: kindLabel(gig.kind),
    locationLabel: gig.location_label ?? "Location TBA",
    dateLabel: formatDateLabel(gig.starts_at),
    imageTone: gig.cover_tone,
    category: gig.category,
    spotsLabel: spotsLabel(capacity),
  };
}

function toDetail(gig: GigWithHost, roles: RoleRow[], slots: SlotRow[]): GigDetail {
  const capacity = slots.reduce((sum, slot) => sum + (slot.capacity ?? 0), 0) || roles.reduce((sum, role) => sum + (role.capacity ?? 0), 0);
  const list = toListItem(gig, capacity || null);
  return {
    ...list,
    summary: gig.summary,
    about: gig.summary,
    hostInitials: initialsFromName(list.hostName),
    longDateLabel: formatLongDateLabel(gig.starts_at),
    roles: roles.map((role) => role.title).filter(Boolean),
    incentive: gig.incentive ?? "",
    instructions: gig.instructions ?? "",
    verified: false,
    startsAt: gig.starts_at ?? undefined,
    endsAt: gig.ends_at ?? undefined,
    status: gig.status,
    hostUserId: gig.host_user_id,
  };
}

async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    throw Object.assign(new Error("Sign in to continue."), { status: 401 });
  }
  return { supabase, user };
}

function fallbackDisplayName(user: AuthUser) {
  const meta = user.user_metadata?.display_name;
  const fromMeta = typeof meta === "string" ? meta.trim() : "";
  return fromMeta || user.email?.split("@")[0] || "";
}

function toSessionProfile(user: AuthUser, profile: ProfileRow | null): SessionProfile {
  const displayName = profile?.display_name?.trim() || fallbackDisplayName(user) || "You";
  return {
    id: user.id,
    displayName,
    initials: initialsFromName(displayName),
    email: user.email ?? undefined,
    phone: profile?.phone ?? user.phone ?? undefined,
    bio: profile?.bio ?? undefined,
    intent: profile?.intent ?? undefined,
    avatarUrl: profile?.avatar_url ?? undefined,
  };
}

async function loadOrCreateProfile(supabase: Awaited<ReturnType<typeof createClient>>, user: AuthUser) {
  const { data: existing } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      display_name: fallbackDisplayName(user),
      phone: user.phone || null,
    })
    .select("*")
    .single();
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return created;
}

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await loadOrCreateProfile(supabase, user);
  return toSessionProfile(user, profile);
}

export async function ensureProfile(input: ProfilePatch) {
  const { supabase, user } = await requireUser();
  const existing = await loadOrCreateProfile(supabase, user);
  const patch: Database["public"]["Tables"]["profiles"]["Update"] = {};

  if (input.displayName !== undefined) {
    patch.display_name = input.displayName.trim() || existing.display_name || fallbackDisplayName(user);
  }
  if (input.bio !== undefined) patch.bio = input.bio.trim() || null;
  if (input.intent !== undefined) patch.intent = input.intent;
  if (input.phone !== undefined) patch.phone = input.phone.trim() || null;

  if (Object.keys(patch).length > 0) {
    const { error } = await supabase.from("profiles").update(patch).eq("id", user.id);
    if (error) throw Object.assign(new Error(error.message), { status: 400 });
  }

  return getSessionProfile();
}

async function loadCapacityByGig(supabase: { from: ReturnType<typeof createPublicClient>["from"] }, gigIds: string[]) {
  if (gigIds.length === 0) return new Map<string, number>();
  const { data } = await supabase.from("gig_slots").select("gig_id, capacity").in("gig_id", gigIds);
  const map = new Map<string, number>();
  for (const slot of data ?? []) {
    map.set(slot.gig_id, (map.get(slot.gig_id) ?? 0) + (slot.capacity ?? 0));
  }
  return map;
}

export async function listGigs(filters: GigListFilters = {}): Promise<ListResult<GigListItem[]>> {
  const supabase = createPublicClient();
  let query = supabase
    .from("gigs")
    .select("*, profiles!gigs_host_user_id_fkey ( display_name, avatar_url )")
    .eq("status", "open")
    .order("starts_at", { ascending: true, nullsFirst: false });

  const kind = parseKindFilter(filters.kind);
  if (kind) query = query.eq("kind", kind);
  if (filters.category && filters.category !== "all") {
    query = query.eq("category", normalizeCategory(filters.category));
  }

  const { data, error } = await query;
  if (error) throw Object.assign(new Error(error.message), { status: 500 });

  const rows = (data ?? []) as GigWithHost[];
  const capacities = await loadCapacityByGig(supabase, rows.map((row) => row.id));
  const queryText = filters.query?.trim().toLowerCase() ?? "";
  const mapped = rows
    .map((row) => toListItem(row, capacities.get(row.id) || null))
    .filter((gig) => {
      if (!queryText) return true;
      return `${gig.title} ${gig.hostName} ${gig.locationLabel} ${gig.category}`.toLowerCase().includes(queryText);
    });

  return { data: mapped, meta: { total: mapped.length, source } };
}

export async function getGigBySlug(slug: string): Promise<GigDetail | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("gigs")
    .select("*, profiles!gigs_host_user_id_fkey ( display_name, avatar_url )")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw Object.assign(new Error(error.message), { status: 500 });
  if (!data) return null;

  const gig = data as GigWithHost;
  const [{ data: roles }, { data: slots }] = await Promise.all([
    supabase.from("gig_roles").select("*").eq("gig_id", gig.id).order("sort_order"),
    supabase.from("gig_slots").select("*").eq("gig_id", gig.id),
  ]);
  return toDetail(gig, roles ?? [], slots ?? []);
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, title: string) {
  const base = slugify(title);
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data } = await supabase.from("gigs").select("id").eq("slug", candidate).maybeSingle();
    if (!data) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

export async function createGig(input: CreateGigInput): Promise<GigDetail> {
  const { supabase, user } = await requireUser();
  const category = normalizeCategory(input.category);
  const startsAt = combineDateAndTime(input.date, input.startTime);
  const slug = await uniqueSlug(supabase, input.title);
  const roles = input.roles.map((title) => title.trim()).filter(Boolean);

  const { data: gig, error } = await supabase
    .from("gigs")
    .insert({
      slug,
      host_user_id: user.id,
      title: input.title.trim(),
      summary: input.summary.trim(),
      kind: input.kind,
      category,
      location_label: input.locationLabel.trim(),
      location_type: input.locationType,
      starts_at: startsAt,
      cover_tone: coverToneFor(input.kind, category),
      status: "open",
      incentive: input.incentive?.trim() || null,
      instructions: input.instructions?.trim() || null,
    })
    .select("*, profiles!gigs_host_user_id_fkey ( display_name, avatar_url )")
    .single();

  if (error || !gig) throw Object.assign(new Error(error?.message ?? "Could not create gig."), { status: 400 });

  if (roles.length > 0) {
    const { error: roleError } = await supabase.from("gig_roles").insert(
      roles.map((title, index) => ({ gig_id: gig.id, title, sort_order: index })),
    );
    if (roleError) throw Object.assign(new Error(roleError.message), { status: 400 });
  }

  const { error: slotError } = await supabase.from("gig_slots").insert({
    gig_id: gig.id,
    starts_at: startsAt,
    capacity: input.slotCount,
  });
  if (slotError) throw Object.assign(new Error(slotError.message), { status: 400 });

  const detail = await getGigBySlug(slug);
  if (!detail) throw Object.assign(new Error("Gig was created but could not be loaded."), { status: 500 });
  return detail;
}

export async function applyToGig(input: ApplyInput): Promise<UserApplication> {
  const { supabase, user } = await requireUser();
  const { data: gig, error: gigError } = await supabase.from("gigs").select("id, slug, title, host_user_id").eq("slug", input.gigSlug).maybeSingle();
  if (gigError || !gig) throw Object.assign(new Error("Gig not found."), { status: 404 });

  const { data: role } = await supabase
    .from("gig_roles")
    .select("id, title")
    .eq("gig_id", gig.id)
    .eq("title", input.roleTitle)
    .maybeSingle();

  const { data: existing } = await supabase
    .from("applications")
    .select("id, status, created_at, note")
    .eq("gig_id", gig.id)
    .eq("applicant_user_id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      gigId: gig.id,
      gigSlug: gig.slug,
      gigTitle: gig.title,
      hostUserId: gig.host_user_id,
      role: input.roleTitle,
      status: applicationUiStatus(existing.status),
      rawStatus: existing.status,
      createdAt: existing.created_at,
      note: existing.note ?? undefined,
    };
  }

  const { data: application, error } = await supabase
    .from("applications")
    .insert({
      applicant_user_id: user.id,
      gig_id: gig.id,
      role_id: role?.id ?? null,
      note: input.note?.trim() || null,
      status: "pending",
    })
    .select("id, status, created_at, note")
    .single();

  if (error || !application) throw Object.assign(new Error(error?.message ?? "Could not apply."), { status: 400 });

  return {
    id: application.id,
    gigId: gig.id,
    gigSlug: gig.slug,
    gigTitle: gig.title,
    hostUserId: gig.host_user_id,
    role: input.roleTitle,
    status: applicationUiStatus(application.status),
    rawStatus: application.status,
    createdAt: application.created_at,
    note: application.note ?? undefined,
  };
}

export async function reviewApplication(id: string, status: "accepted" | "declined" | "withdrawn") {
  const { supabase, user } = await requireUser();
  const { data: application, error: loadError } = await supabase
    .from("applications")
    .select("id, applicant_user_id, gig_id, status")
    .eq("id", id)
    .maybeSingle();
  if (loadError || !application) throw Object.assign(new Error("Application not found."), { status: 404 });

  const { data: gig } = await supabase.from("gigs").select("slug, host_user_id").eq("id", application.gig_id).maybeSingle();
  const isHost = gig?.host_user_id === user.id;
  const isApplicant = application.applicant_user_id === user.id;

  if (status === "withdrawn" && !isApplicant) {
    throw Object.assign(new Error("Only the applicant can withdraw."), { status: 403 });
  }
  if ((status === "accepted" || status === "declined") && !isHost) {
    throw Object.assign(new Error("Only the host can review this application."), { status: 403 });
  }

  const { data: updated, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", id)
    .select("id, status")
    .single();
  if (error || !updated) throw Object.assign(new Error(error?.message ?? "Could not update application."), { status: 400 });

  return { id: updated.id, status: updated.status, gigSlug: gig?.slug ?? "" };
}

export async function listMyActivity(): Promise<MyActivity> {
  const profile = await getSessionProfile();
  if (!profile) {
    return { hosted: [], joined: [], applications: [], reviewQueue: [] };
  }

  const supabase = await createClient();
  const [{ data: hostedRows }, { data: applicationRows }] = await Promise.all([
    supabase
      .from("gigs")
      .select("*, profiles!gigs_host_user_id_fkey ( display_name, avatar_url )")
      .eq("host_user_id", profile.id)
      .order("starts_at", { ascending: true, nullsFirst: false }),
    supabase
      .from("applications")
      .select("id, status, created_at, note, role_id, gig_id")
      .eq("applicant_user_id", profile.id)
      .order("created_at", { ascending: false }),
  ]);

  const hostedGigs = (hostedRows ?? []) as GigWithHost[];
  const hostedIds = hostedGigs.map((gig) => gig.id);
  const joinedGigIds = (applicationRows ?? []).map((row) => row.gig_id);
  const allIds = [...new Set([...hostedIds, ...joinedGigIds])];

  const [{ data: relatedGigs }, { data: roles }, { data: reviewRows }, capacities] = await Promise.all([
    allIds.length
      ? supabase.from("gigs").select("*, profiles!gigs_host_user_id_fkey ( display_name, avatar_url )").in("id", allIds)
      : Promise.resolve({ data: [] as never[] }),
    allIds.length ? supabase.from("gig_roles").select("id, title, gig_id").in("gig_id", allIds) : Promise.resolve({ data: [] as never[] }),
    hostedIds.length
      ? supabase
          .from("applications")
          .select("id, status, created_at, note, role_id, gig_id, applicant_user_id")
          .in("gig_id", hostedIds)
          .neq("status", "withdrawn")
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [] as never[] }),
    loadCapacityByGig(supabase, allIds),
  ]);

  const gigById = new Map(((relatedGigs ?? []) as GigWithHost[]).map((gig) => [gig.id, gig]));
  const roleById = new Map((roles ?? []).map((role) => [role.id, role.title]));
  const applicantIds = [...new Set((reviewRows ?? []).map((row) => row.applicant_user_id))];
  const { data: applicantProfiles } = applicantIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", applicantIds)
    : { data: [] };

  const nameById = new Map((applicantProfiles ?? []).map((row) => [row.id, row.display_name]));

  const hosted: MyGigCard[] = hostedGigs.map((gig) => ({
    ...toListItem(gig, capacities.get(gig.id) || null),
    mode: "Hosted",
    status: gigLifecycleStatus(gig.starts_at, gig.status),
    checkInToken: createCheckInToken(gig.id),
  }));

  const applications: UserApplication[] = (applicationRows ?? []).flatMap((row) => {
    const gig = gigById.get(row.gig_id);
    if (!gig) return [];
    return [
      {
        id: row.id,
        gigId: gig.id,
        gigSlug: gig.slug,
        gigTitle: gig.title,
        hostUserId: gig.host_user_id,
        role: (row.role_id && roleById.get(row.role_id)) || "General support",
        status: applicationUiStatus(row.status),
        rawStatus: row.status,
        createdAt: row.created_at,
        note: row.note ?? undefined,
      },
    ];
  });

  const joined: MyGigCard[] = (applicationRows ?? []).flatMap((row) => {
    const gig = gigById.get(row.gig_id);
    if (!gig) return [];
    return [
      {
        ...toListItem(gig, capacities.get(gig.id) || null),
        mode: "Joined",
        status: gigLifecycleStatus(gig.starts_at, gig.status),
        applicationStatus: applicationUiStatus(row.status),
        checkInToken: createCheckInToken(gig.id),
      },
    ];
  });

  const reviewQueue: HostApplicant[] = (reviewRows ?? []).map((row, index) => {
    const gig = gigById.get(row.gig_id);
    const name = nameById.get(row.applicant_user_id)?.trim() || "Applicant";
    const tones = ["from-[#ffcf91] to-[#8e52ff]", "from-[#bcebdc] to-[#49d7b8]", "from-[#29244b] to-[#ff4da3]"];
    return {
      id: row.id,
      gigSlug: gig?.slug ?? "",
      gigTitle: gig?.title ?? "Gig",
      applicantUserId: row.applicant_user_id,
      name,
      initials: initialsFromName(name),
      role: (row.role_id && roleById.get(row.role_id)) || "General support",
      trust: "New to Offer",
      tone: tones[index % tones.length],
      status: row.status,
    };
  });

  return { hosted, joined, applications, reviewQueue };
}

type ThreadEmbed = Database["public"]["Tables"]["message_threads"]["Row"] & {
  gigs: { id: string; slug: string; title: string } | { id: string; slug: string; title: string }[] | null;
  host: { id: string; display_name: string } | { id: string; display_name: string }[] | null;
  participant: { id: string; display_name: string } | { id: string; display_name: string }[] | null;
};

const THREAD_SELECT =
  "id, gig_id, host_user_id, participant_user_id, created_at, last_message_at, last_message_preview, last_message_sender_id, host_last_read_at, participant_last_read_at, gigs!message_threads_gig_id_fkey ( id, slug, title ), host:profiles!message_threads_host_user_id_fkey ( id, display_name ), participant:profiles!message_threads_participant_user_id_fkey ( id, display_name )";

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toInboxThread(row: ThreadEmbed, viewerId: string): InboxThread {
  const gig = one(row.gigs);
  const host = one(row.host);
  const participant = one(row.participant);
  const viewerIsHost = row.host_user_id === viewerId;
  const counterpart = viewerIsHost ? participant : host;
  const name = counterpart?.display_name?.trim() || (viewerIsHost ? "Applicant" : "Host");
  return {
    id: row.id,
    gigId: row.gig_id,
    gigSlug: gig?.slug ?? "",
    gigTitle: gig?.title ?? "Gig",
    counterpartName: name,
    counterpartInitials: initialsFromName(name),
    counterpartUserId: viewerIsHost ? row.participant_user_id : row.host_user_id,
    preview: row.last_message_preview || "No messages yet",
    lastMessageAt: row.last_message_at,
    timeLabel: formatThreadTime(row.last_message_at),
    unread: threadUnread({
      viewerId,
      hostUserId: row.host_user_id,
      lastMessageSenderId: row.last_message_sender_id,
      lastMessageAt: row.last_message_at,
      hostLastReadAt: row.host_last_read_at,
      participantLastReadAt: row.participant_last_read_at,
    }),
    online: false,
    tone: avatarTone(name),
    role: viewerIsHost ? "host" : "participant",
  };
}

async function loadThreadById(supabase: Awaited<ReturnType<typeof createClient>>, threadId: string, userId: string) {
  const { data, error } = await supabase.from("message_threads").select(THREAD_SELECT).eq("id", threadId).maybeSingle();
  if (error || !data) throw Object.assign(new Error("Conversation not found."), { status: 404 });
  return toInboxThread(data as ThreadEmbed, userId);
}

async function upsertThread(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gigId: string,
  hostUserId: string,
  participantUserId: string,
  userId: string,
): Promise<{ thread: InboxThread; created: boolean }> {
  const { data: existing } = await supabase
    .from("message_threads")
    .select("id")
    .eq("gig_id", gigId)
    .eq("host_user_id", hostUserId)
    .eq("participant_user_id", participantUserId)
    .maybeSingle();
  if (existing) {
    return { thread: await loadThreadById(supabase, existing.id, userId), created: false };
  }

  const { data: inserted, error } = await supabase
    .from("message_threads")
    .insert({ gig_id: gigId, host_user_id: hostUserId, participant_user_id: participantUserId })
    .select("id")
    .single();

  if (error || !inserted) {
    const { data: raced } = await supabase
      .from("message_threads")
      .select("id")
      .eq("gig_id", gigId)
      .eq("host_user_id", hostUserId)
      .eq("participant_user_id", participantUserId)
      .maybeSingle();
    if (raced) return { thread: await loadThreadById(supabase, raced.id, userId), created: false };
    throw Object.assign(new Error(error?.message ?? "Could not open conversation."), { status: 400 });
  }

  return { thread: await loadThreadById(supabase, inserted.id, userId), created: true };
}

async function listStartable(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  rows: ThreadEmbed[],
): Promise<StartableThread[]> {
  const existing = new Set(rows.map((row) => `${row.gig_id}:${row.participant_user_id}`));
  const [{ data: hostedGigs }, { data: myApps }] = await Promise.all([
    supabase.from("gigs").select("id, slug, title").eq("host_user_id", userId),
    supabase.from("applications").select("id, gig_id, role_id, status").eq("applicant_user_id", userId).neq("status", "withdrawn"),
  ]);

  const hosted = hostedGigs ?? [];
  const hostedIds = hosted.map((gig) => gig.id);
  const { data: incoming } = hostedIds.length
    ? await supabase.from("applications").select("id, gig_id, applicant_user_id, role_id, status").in("gig_id", hostedIds).neq("status", "withdrawn")
    : { data: [] as { id: string; gig_id: string; applicant_user_id: string; role_id: string | null; status: string }[] };

  const outgoingGigIds = [...new Set((myApps ?? []).map((row) => row.gig_id))];
  const allGigIds = [...new Set([...hostedIds, ...outgoingGigIds])];
  const applicantIds = [...new Set((incoming ?? []).map((row) => row.applicant_user_id))];
  const roleIds = [...new Set([...(incoming ?? []), ...(myApps ?? [])].map((row) => row.role_id).filter((id): id is string => Boolean(id)))];

  const [{ data: relatedGigs }, { data: applicantProfiles }, { data: roles }] = await Promise.all([
    allGigIds.length ? supabase.from("gigs").select("id, slug, title, host_user_id").in("id", allGigIds) : Promise.resolve({ data: [] as never[] }),
    applicantIds.length ? supabase.from("profiles").select("id, display_name").in("id", applicantIds) : Promise.resolve({ data: [] as never[] }),
    roleIds.length ? supabase.from("gig_roles").select("id, title").in("id", roleIds) : Promise.resolve({ data: [] as never[] }),
  ]);

  const gigById = new Map((relatedGigs ?? []).map((gig) => [gig.id, gig]));
  const nameById = new Map((applicantProfiles ?? []).map((row) => [row.id, row.display_name]));
  const roleById = new Map((roles ?? []).map((role) => [role.id, role.title]));
  const hostIds = [...new Set((relatedGigs ?? []).map((gig) => gig.host_user_id).filter((id) => id !== userId))];
  const { data: hostProfiles } = hostIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", hostIds)
    : { data: [] };
  const hostNameById = new Map((hostProfiles ?? []).map((row) => [row.id, row.display_name]));

  const startable: StartableThread[] = [];

  for (const row of incoming ?? []) {
    if (existing.has(`${row.gig_id}:${row.applicant_user_id}`)) continue;
    const gig = gigById.get(row.gig_id);
    const name = nameById.get(row.applicant_user_id)?.trim() || "Applicant";
    startable.push({
      applicationId: row.id,
      gigSlug: gig?.slug ?? "",
      gigTitle: gig?.title ?? "Gig",
      counterpartName: name,
      counterpartInitials: initialsFromName(name),
      role: (row.role_id && roleById.get(row.role_id)) || "General support",
      tone: avatarTone(name),
    });
  }

  for (const row of myApps ?? []) {
    if (existing.has(`${row.gig_id}:${userId}`)) continue;
    const gig = gigById.get(row.gig_id);
    if (!gig || gig.host_user_id === userId) continue;
    const name = hostNameById.get(gig.host_user_id)?.trim() || "Host";
    startable.push({
      applicationId: row.id,
      gigSlug: gig.slug,
      gigTitle: gig.title,
      counterpartName: name,
      counterpartInitials: initialsFromName(name),
      role: (row.role_id && roleById.get(row.role_id)) || "General support",
      tone: avatarTone(name),
    });
  }

  return startable;
}

export async function listInbox(): Promise<InboxPayload> {
  const { supabase, user } = await requireUser();
  const { data, error } = await supabase.from("message_threads").select(THREAD_SELECT).order("last_message_at", { ascending: false });
  if (error) throw Object.assign(new Error(error.message), { status: 500 });
  const rows = (data ?? []) as ThreadEmbed[];
  const threads = rows.map((row) => toInboxThread(row, user.id));
  return { threads, startable: await listStartable(supabase, user.id, rows) };
}

export async function listThreadMessages(threadId: string): Promise<ThreadMessagesPayload> {
  const { supabase, user } = await requireUser();
  const thread = await loadThreadById(supabase, threadId, user.id);
  const { data, error } = await supabase
    .from("messages")
    .select("id, thread_id, sender_user_id, body, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true })
    .limit(200);
  if (error) throw Object.assign(new Error(error.message), { status: 500 });

  const readAt = new Date().toISOString();
  await supabase
    .from("message_threads")
    .update(thread.role === "host" ? { host_last_read_at: readAt } : { participant_last_read_at: readAt })
    .eq("id", threadId);

  const messages: ChatMessage[] = (data ?? []).map((row) => ({
    id: row.id,
    threadId: row.thread_id,
    senderUserId: row.sender_user_id,
    body: row.body,
    createdAt: row.created_at,
    mine: row.sender_user_id === user.id,
  }));

  return { thread: { ...thread, unread: 0 }, messages };
}

export async function sendThreadMessage(threadId: string, body: string): Promise<ChatMessage> {
  const { supabase, user } = await requireUser();
  const trimmed = body.trim();
  if (!trimmed) throw Object.assign(new Error("Message cannot be empty."), { status: 400 });
  if (trimmed.length > MAX_MESSAGE_LENGTH) throw Object.assign(new Error("Message is too long."), { status: 400 });
  await loadThreadById(supabase, threadId, user.id);

  const { data, error } = await supabase
    .from("messages")
    .insert({ thread_id: threadId, sender_user_id: user.id, body: trimmed })
    .select("id, thread_id, sender_user_id, body, created_at")
    .single();
  if (error || !data) throw Object.assign(new Error(error?.message ?? "Could not send message."), { status: 400 });

  return {
    id: data.id,
    threadId: data.thread_id,
    senderUserId: data.sender_user_id,
    body: data.body,
    createdAt: data.created_at,
    mine: true,
  };
}

export async function ensureThread(input: EnsureThreadInput): Promise<{ thread: InboxThread; created: boolean }> {
  const { supabase, user } = await requireUser();

  if (input.applicationId?.trim()) {
    const { data: application } = await supabase
      .from("applications")
      .select("id, applicant_user_id, gig_id, status")
      .eq("id", input.applicationId.trim())
      .maybeSingle();
    if (!application || application.status === "withdrawn") {
      throw Object.assign(new Error("Application not found."), { status: 404 });
    }
    const { data: gig } = await supabase.from("gigs").select("id, host_user_id").eq("id", application.gig_id).maybeSingle();
    if (!gig) throw Object.assign(new Error("Gig not found."), { status: 404 });
    if (gig.host_user_id !== user.id && application.applicant_user_id !== user.id) {
      throw Object.assign(new Error("You can only message on your own applications."), { status: 403 });
    }
    return upsertThread(supabase, gig.id, gig.host_user_id, application.applicant_user_id, user.id);
  }

  if (input.gigSlug?.trim()) {
    const { data: gig } = await supabase.from("gigs").select("id, slug, host_user_id").eq("slug", input.gigSlug.trim()).maybeSingle();
    if (!gig) throw Object.assign(new Error("Gig not found."), { status: 404 });
    if (gig.host_user_id === user.id) {
      throw Object.assign(new Error("Hosts start a conversation from an application."), { status: 400 });
    }
    const { data: application } = await supabase
      .from("applications")
      .select("id, status")
      .eq("gig_id", gig.id)
      .eq("applicant_user_id", user.id)
      .maybeSingle();
    if (!application || application.status === "withdrawn") {
      throw Object.assign(new Error("Apply to this gig before messaging the host."), { status: 403 });
    }
    return upsertThread(supabase, gig.id, gig.host_user_id, user.id, user.id);
  }

  throw Object.assign(new Error("Choose a gig or application to message."), { status: 400 });
}

type CheckInRow = Database["public"]["Tables"]["check_ins"]["Row"];

function toCheckInRecord(
  row: CheckInRow,
  gig: { id: string; slug: string; title: string },
  name: string,
  roleLabel: string,
): CheckInRecord {
  return {
    id: row.id,
    gigId: gig.id,
    gigSlug: gig.slug,
    gigTitle: gig.title,
    slotId: row.slot_id ?? undefined,
    userId: row.user_id,
    displayName: name,
    initials: initialsFromName(name),
    roleLabel,
    checkedInAt: row.checked_in_at,
    checkedOutAt: row.checked_out_at ?? undefined,
  };
}

async function loadGigForCheckIn(
  supabase: Awaited<ReturnType<typeof createClient>>,
  input: { token?: string; gigSlug?: string; slotId?: string },
) {
  const parsed = input.token?.trim() ? parseCheckInToken(input.token.trim()) : null;
  if (input.token?.trim() && !parsed) {
    throw Object.assign(new Error("Check-in code is not valid."), { status: 404 });
  }

  let gig: GigWithHost | null = null;
  if (parsed) {
    const { data, error } = await supabase
      .from("gigs")
      .select("*, profiles!gigs_host_user_id_fkey ( display_name, avatar_url )")
      .eq("id", parsed.gigId)
      .maybeSingle();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    gig = (data as GigWithHost | null) ?? null;
  } else if (input.gigSlug?.trim()) {
    const { data, error } = await supabase
      .from("gigs")
      .select("*, profiles!gigs_host_user_id_fkey ( display_name, avatar_url )")
      .eq("slug", input.gigSlug.trim())
      .maybeSingle();
    if (error) throw Object.assign(new Error(error.message), { status: 500 });
    gig = (data as GigWithHost | null) ?? null;
  }

  if (!gig) throw Object.assign(new Error("Gig not found."), { status: 404 });

  const slotId = input.slotId?.trim() || parsed?.slotId;
  if (slotId) {
    const { data: slot } = await supabase.from("gig_slots").select("id, gig_id").eq("id", slotId).maybeSingle();
    if (!slot || slot.gig_id !== gig.id) {
      throw Object.assign(new Error("That slot is not on this gig."), { status: 400 });
    }
  }

  const token = createCheckInToken(gig.id, slotId);
  return { gig, slotId, token };
}

async function viewerRoleForGig(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gigId: string,
  hostUserId: string,
  userId: string,
): Promise<{ role: CheckInViewerRole; applicationRole: string }> {
  if (hostUserId === userId) return { role: "host", applicationRole: "Host" };
  const { data: application } = await supabase
    .from("applications")
    .select("status, role_id")
    .eq("gig_id", gigId)
    .eq("applicant_user_id", userId)
    .maybeSingle();
  if (!application || application.status === "withdrawn") return { role: "none", applicationRole: "General support" };
  const { data: role } = application.role_id
    ? await supabase.from("gig_roles").select("title").eq("id", application.role_id).maybeSingle()
    : { data: null };
  const applicationRole = role?.title || "General support";
  if (application.status === "accepted") return { role: "accepted", applicationRole };
  if (application.status === "pending") return { role: "pending", applicationRole };
  return { role: "none", applicationRole };
}

export async function getCheckInContext(input: CheckInWriteInput): Promise<CheckInContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { gig, slotId, token } = await loadGigForCheckIn(supabase, input);

  const viewer = user
    ? await viewerRoleForGig(supabase, gig.id, gig.host_user_id, user.id)
    : { role: "unsigned" as const, applicationRole: "" };
  const isHost = viewer.role === "host";

  const { data: checkInRows, error: checkInError } = user
    ? await supabase.from("check_ins").select("*").eq("gig_id", gig.id).order("checked_in_at", { ascending: true })
    : { data: [] as CheckInRow[], error: null };
  if (checkInError) throw Object.assign(new Error(checkInError.message), { status: 500 });

  const roleByUser = new Map<string, string>();
  const nameById = new Map<string, string>();
  let participants: CheckInParticipant[] = [];

  if (isHost) {
    const { data: accepted } = await supabase
      .from("applications")
      .select("id, applicant_user_id, role_id, status")
      .eq("gig_id", gig.id)
      .eq("status", "accepted");
    const applicantIds = [...new Set((accepted ?? []).map((row) => row.applicant_user_id))];
    const roleIds = [...new Set((accepted ?? []).map((row) => row.role_id).filter((id): id is string => Boolean(id)))];
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      applicantIds.length
        ? supabase.from("profiles").select("id, display_name").in("id", applicantIds)
        : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
      roleIds.length
        ? supabase.from("gig_roles").select("id, title").in("id", roleIds)
        : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    ]);
    const titleByRole = new Map((roles ?? []).map((role) => [role.id, role.title]));
    for (const row of profiles ?? []) nameById.set(row.id, row.display_name);
    for (const row of accepted ?? []) {
      roleByUser.set(row.applicant_user_id, (row.role_id && titleByRole.get(row.role_id)) || "General support");
    }

    const records = (checkInRows ?? []).map((row) =>
      toCheckInRecord(row, gig, nameById.get(row.user_id)?.trim() || "Participant", roleByUser.get(row.user_id) || "General support"),
    );
    const recordByUser = new Map(records.map((row) => [row.userId, row]));
    participants = (accepted ?? []).map((row) => {
      const displayName = nameById.get(row.applicant_user_id)?.trim() || "Participant";
      return {
        userId: row.applicant_user_id,
        displayName,
        initials: initialsFromName(displayName),
        roleLabel: roleByUser.get(row.applicant_user_id) || "General support",
        applicationId: row.id,
        checkIn: recordByUser.get(row.applicant_user_id) ?? null,
      };
    });

    return {
      token,
      path: checkInPath(token),
      slotId,
      gig: {
        id: gig.id,
        slug: gig.slug,
        title: gig.title,
        hostName: hostNameFrom(gig.profiles),
        hostUserId: gig.host_user_id,
        dateLabel: formatDateLabel(gig.starts_at),
        locationLabel: gig.location_label ?? "Location TBA",
        kindLabel: kindLabel(gig.kind),
      },
      viewerRole: "host",
      ownCheckIn: user ? (records.find((row) => row.userId === user.id) ?? null) : null,
      checkIns: records.filter((row) => checkInState(row) === "in"),
      participants,
    };
  }

  const visibleRows = (checkInRows ?? []).filter((row) => user && row.user_id === user.id);
  const ownName = user ? ((await getSessionProfile())?.displayName || "You") : "You";
  if (user) nameById.set(user.id, ownName);
  if (user) roleByUser.set(user.id, viewer.applicationRole);
  const records = visibleRows.map((row) =>
    toCheckInRecord(row, gig, nameById.get(row.user_id)?.trim() || "You", roleByUser.get(row.user_id) || "General support"),
  );

  return {
    token,
    path: checkInPath(token),
    slotId,
    gig: {
      id: gig.id,
      slug: gig.slug,
      title: gig.title,
      hostName: hostNameFrom(gig.profiles),
      hostUserId: gig.host_user_id,
      dateLabel: formatDateLabel(gig.starts_at),
      locationLabel: gig.location_label ?? "Location TBA",
      kindLabel: kindLabel(gig.kind),
    },
    viewerRole: viewer.role,
    ownCheckIn: records[0] ?? null,
    checkIns: records.filter((row) => checkInState(row) === "in"),
    participants: [],
  };
}

async function resolveCheckInTarget(
  supabase: Awaited<ReturnType<typeof createClient>>,
  gig: GigRow,
  actorId: string,
  requestedUserId?: string,
) {
  const actor = await viewerRoleForGig(supabase, gig.id, gig.host_user_id, actorId);
  const targetId = requestedUserId?.trim() && actor.role === "host" ? requestedUserId.trim() : actorId;

  if (requestedUserId?.trim() && actor.role !== "host") {
    throw Object.assign(new Error("Only the host can check someone else in."), { status: 403 });
  }

  const target = targetId === actorId ? actor : await viewerRoleForGig(supabase, gig.id, gig.host_user_id, targetId);
  if (targetId === gig.host_user_id && actor.role === "host") {
    throw Object.assign(new Error("Hosts record attendance for accepted participants."), { status: 400 });
  }
  if (target.role !== "accepted") {
    if (target.role === "pending") {
      throw Object.assign(new Error("The host needs to accept this application before check-in."), { status: 403 });
    }
    throw Object.assign(new Error("Only accepted participants can check in on this gig."), { status: 403 });
  }

  return { targetId, roleLabel: target.applicationRole };
}

export async function checkIn(input: CheckInWriteInput): Promise<CheckInRecord> {
  const { supabase, user } = await requireUser();
  const { gig, slotId } = await loadGigForCheckIn(supabase, input);
  const { targetId, roleLabel } = await resolveCheckInTarget(supabase, gig, user.id, input.userId);

  const { data: existing } = await supabase.from("check_ins").select("*").eq("gig_id", gig.id).eq("user_id", targetId).maybeSingle();
  if (existing && !existing.checked_out_at) {
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", targetId).maybeSingle();
    return toCheckInRecord(existing, gig, profile?.display_name?.trim() || "Participant", roleLabel);
  }

  const now = new Date().toISOString();
  if (existing) {
    const { data: updated, error } = await supabase
      .from("check_ins")
      .update({ checked_in_at: now, checked_out_at: null, slot_id: slotId ?? existing.slot_id })
      .eq("id", existing.id)
      .select("*")
      .single();
    if (error || !updated) throw Object.assign(new Error(error?.message ?? "Could not check in."), { status: 400 });
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", targetId).maybeSingle();
    return toCheckInRecord(updated, gig, profile?.display_name?.trim() || "Participant", roleLabel);
  }

  const { data: inserted, error } = await supabase
    .from("check_ins")
    .insert({
      gig_id: gig.id,
      user_id: targetId,
      slot_id: slotId ?? null,
      checked_in_at: now,
    })
    .select("*")
    .single();
  if (error || !inserted) throw Object.assign(new Error(error?.message ?? "Could not check in."), { status: 400 });
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", targetId).maybeSingle();
  return toCheckInRecord(inserted, gig, profile?.display_name?.trim() || "Participant", roleLabel);
}

export async function checkOut(input: CheckInWriteInput): Promise<CheckInRecord> {
  const { supabase, user } = await requireUser();
  const { gig } = await loadGigForCheckIn(supabase, input);
  const { targetId, roleLabel } = await resolveCheckInTarget(supabase, gig, user.id, input.userId);

  const { data: existing } = await supabase.from("check_ins").select("*").eq("gig_id", gig.id).eq("user_id", targetId).maybeSingle();
  if (!existing || existing.checked_out_at) {
    throw Object.assign(new Error("This participant is not checked in."), { status: 400 });
  }

  const { data: updated, error } = await supabase
    .from("check_ins")
    .update({ checked_out_at: new Date().toISOString() })
    .eq("id", existing.id)
    .select("*")
    .single();
  if (error || !updated) throw Object.assign(new Error(error?.message ?? "Could not check out."), { status: 400 });
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", targetId).maybeSingle();
  return toCheckInRecord(updated, gig, profile?.display_name?.trim() || "Participant", roleLabel);
}
