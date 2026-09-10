import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import {
  applicationUiStatus,
  combineDateAndTime,
  coverToneFor,
  formatDateLabel,
  formatLongDateLabel,
  gigLifecycleStatus,
  initialsFromName,
  kindLabel,
  normalizeCategory,
  parseKindFilter,
  slugify,
  spotsLabel,
} from "@/lib/data/format";
import type {
  ApplyInput,
  CreateGigInput,
  GigDetail,
  GigListFilters,
  GigListItem,
  HostApplicant,
  ListResult,
  MyActivity,
  MyGigCard,
  SessionProfile,
  UserApplication,
} from "@/lib/data/types";

type GigRow = Database["public"]["Tables"]["gigs"]["Row"];
type ProfileRow = Pick<Database["public"]["Tables"]["profiles"]["Row"], "display_name" | "avatar_url">;
type RoleRow = Database["public"]["Tables"]["gig_roles"]["Row"];
type SlotRow = Database["public"]["Tables"]["gig_slots"]["Row"];

type GigWithHost = GigRow & { profiles: ProfileRow | ProfileRow[] | null };

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

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();

  const displayName = profile?.display_name?.trim() || user.email?.split("@")[0] || "You";
  return {
    id: user.id,
    displayName,
    initials: initialsFromName(displayName),
    email: user.email,
    phone: profile?.phone ?? user.phone ?? undefined,
    bio: profile?.bio ?? undefined,
    intent: profile?.intent ?? undefined,
    avatarUrl: profile?.avatar_url ?? undefined,
  };
}

export async function ensureProfile(input: { displayName?: string; bio?: string; intent?: "need" | "help" | "both"; phone?: string }) {
  const { supabase, user } = await requireUser();
  const displayName = input.displayName?.trim() || user.email?.split("@")[0] || "";
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    display_name: displayName,
    bio: input.bio?.trim() || null,
    intent: input.intent ?? null,
    phone: input.phone?.trim() || user.phone || null,
  });
  if (error) throw Object.assign(new Error(error.message), { status: 400 });
  return getSessionProfile();
}

async function loadCapacityByGig(supabase: Awaited<ReturnType<typeof createClient>>, gigIds: string[]) {
  if (gigIds.length === 0) return new Map<string, number>();
  const { data } = await supabase.from("gig_slots").select("gig_id, capacity").in("gig_id", gigIds);
  const map = new Map<string, number>();
  for (const slot of data ?? []) {
    map.set(slot.gig_id, (map.get(slot.gig_id) ?? 0) + (slot.capacity ?? 0));
  }
  return map;
}

export async function listGigs(filters: GigListFilters = {}): Promise<ListResult<GigListItem[]>> {
  const supabase = await createClient();
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
  const supabase = await createClient();
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
  const { data: gig, error: gigError } = await supabase.from("gigs").select("id, slug, title").eq("slug", input.gigSlug).maybeSingle();
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
      gigSlug: gig.slug,
      gigTitle: gig.title,
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
    gigSlug: gig.slug,
    gigTitle: gig.title,
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
  }));

  const applications: UserApplication[] = (applicationRows ?? []).flatMap((row) => {
    const gig = gigById.get(row.gig_id);
    if (!gig) return [];
    return [
      {
        id: row.id,
        gigSlug: gig.slug,
        gigTitle: gig.title,
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
