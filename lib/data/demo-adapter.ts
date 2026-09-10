import { demoChatMessages, demoGigDetails, demoInboxThreads, demoMyGigs, demoReviewQueue, demoStartable, toListItem } from "@/lib/data/demo-catalog";
import { checkInPath, createCheckInToken, parseCheckInToken } from "@/lib/check-in-token";
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
  initialsFromName,
  MAX_MESSAGE_LENGTH,
  normalizeCategory,
  slugify,
  spotsLabel,
} from "@/lib/data/format";
import type {
  ApplyInput,
  ChatMessage,
  CheckInContext,
  CheckInParticipant,
  CheckInRecord,
  CheckInWriteInput,
  CreateGigInput,
  EnsureThreadInput,
  GigDetail,
  GigListFilters,
  InboxPayload,
  InboxThread,
  ListResult,
  MyActivity,
  MyGigCard,
  SessionProfile,
  ThreadMessagesPayload,
  UserApplication,
} from "@/lib/data/types";

const source = "demo-adapter" as const;
const DEMO_USER_ID = "demo-user";
const extraGigs: GigDetail[] = [];
const extraApplications: UserApplication[] = [];

function allGigs() {
  return [...extraGigs, ...demoGigDetails];
}

function matchesFilters(gig: GigDetail, filters: GigListFilters = {}) {
  const query = filters.query?.trim().toLowerCase() ?? "";
  const searchable = `${gig.title} ${gig.hostName} ${gig.locationLabel} ${gig.category}`.toLowerCase();
  const matchesQuery = !query || searchable.includes(query);
  const matchesCategory =
    !filters.category || filters.category === "all" || gig.category.toLowerCase() === filters.category.toLowerCase();
  const matchesKind =
    !filters.kind || filters.kind === "all" || gig.kindLabel.toLowerCase() === filters.kind.toLowerCase();
  return matchesQuery && matchesCategory && matchesKind;
}

export function listGigs(filters: GigListFilters = {}): ListResult<ReturnType<typeof toListItem>[]> {
  const data = allGigs().filter((gig) => matchesFilters(gig, filters)).map(toListItem);
  return { data, meta: { total: data.length, source } };
}

export function getGigBySlug(slug: string): GigDetail | null {
  return allGigs().find((gig) => gig.slug === slug) ?? null;
}

export function getSessionProfile(): SessionProfile | null {
  return null;
}

function toHostedCard(gig: GigDetail): MyGigCard {
  return {
    ...toListItem(gig),
    mode: "Hosted",
    status: gigLifecycleStatus(gig.startsAt, gig.status),
    checkInToken: createCheckInToken(gig.id),
  };
}

export function listMyActivity(): MyActivity {
  const fixtureHosted = demoMyGigs.filter((gig) => gig.mode === "Hosted");
  const fixtureJoined = demoMyGigs.filter((gig) => gig.mode === "Joined");
  const hostedSlugs = new Set(fixtureHosted.map((gig) => gig.slug));
  const joinedSlugs = new Set(fixtureJoined.map((gig) => gig.slug));

  const hosted = [
    ...fixtureHosted.map((gig) => ({ ...gig, checkInToken: createCheckInToken(gig.id) })),
    ...extraGigs.filter((gig) => !hostedSlugs.has(gig.slug)).map(toHostedCard),
  ];

  const joinedFromApps: MyGigCard[] = extraApplications.flatMap((application) => {
    if (joinedSlugs.has(application.gigSlug)) return [];
    const gig = getGigBySlug(application.gigSlug);
    if (!gig) return [];
    joinedSlugs.add(application.gigSlug);
    return [
      {
        ...toListItem(gig),
        mode: "Joined",
        status: gigLifecycleStatus(gig.startsAt, gig.status),
        applicationStatus: application.status,
        checkInToken: createCheckInToken(gig.id),
      },
    ];
  });

  return {
    hosted,
    joined: [...fixtureJoined.map((gig) => ({ ...gig, checkInToken: createCheckInToken(gig.id) })), ...joinedFromApps],
    applications: extraApplications,
    reviewQueue: demoReviewQueue,
  };
}

export function createGig(input: CreateGigInput): GigDetail {
  const slug = slugify(input.title);
  const category = normalizeCategory(input.category);
  const startsAt = combineDateAndTime(input.date, input.startTime);
  const roles = input.roles.map((title) => title.trim()).filter(Boolean);
  const gig: GigDetail = {
    id: `demo-${slug}`,
    slug,
    title: input.title,
    hostName: "You",
    hostInitials: "YO",
    hostUserId: DEMO_USER_ID,
    kindLabel: input.kind === "paid" ? "Paid gig" : "Volunteer",
    locationLabel: input.locationLabel,
    dateLabel: formatDateLabel(startsAt),
    longDateLabel: formatLongDateLabel(startsAt),
    imageTone: coverToneFor(input.kind, category),
    category,
    spotsLabel: spotsLabel(input.slotCount),
    summary: input.summary,
    about: input.summary,
    roles,
    roleDetails: roles.map((title) => ({ title })),
    slots: [
      {
        startsAt,
        timeLabel: formatSlotLabel(startsAt),
        capacity: input.slotCount,
      },
    ],
    incentive: input.incentive ?? "",
    instructions: input.instructions ?? "",
    verified: false,
    startsAt,
    status: "open",
  };
  extraGigs.unshift(gig);
  return gig;
}

export function applyToGig(input: ApplyInput): UserApplication {
  const gig = getGigBySlug(input.gigSlug);
  const existing = extraApplications.find((application) => application.gigSlug === input.gigSlug);
  if (existing) return existing;
  const application: UserApplication = {
    id: `demo-app-${input.gigSlug}`,
    gigId: gig?.id ?? `demo-${input.gigSlug}`,
    gigSlug: input.gigSlug,
    gigTitle: gig?.title ?? input.gigSlug,
    hostUserId: gig?.hostUserId,
    role: input.roleTitle,
    status: applicationUiStatus("pending"),
    rawStatus: "pending",
    createdAt: new Date().toISOString(),
    note: input.note,
  };
  extraApplications.unshift(application);
  return application;
}

export function reviewApplication(id: string, status: "accepted" | "declined") {
  const applicant = demoReviewQueue.find((item) => item.id === id);
  return { id, status, gigSlug: applicant?.gigSlug ?? "" };
}

export function listInbox(): InboxPayload {
  return { threads: demoInboxThreads, startable: demoStartable };
}

export function listThreadMessages(threadId: string): ThreadMessagesPayload {
  const thread = demoInboxThreads.find((item) => item.id === threadId);
  if (!thread) throw Object.assign(new Error("Conversation not found."), { status: 404 });
  return { thread, messages: demoChatMessages[threadId] ?? [] };
}

export function sendThreadMessage(threadId: string, body: string): ChatMessage {
  const trimmed = body.trim();
  if (!trimmed) throw Object.assign(new Error("Message cannot be empty."), { status: 400 });
  if (trimmed.length > MAX_MESSAGE_LENGTH) {
    throw Object.assign(new Error("Message is too long."), { status: 400 });
  }
  const known = demoInboxThreads.some((item) => item.id === threadId) || threadId.startsWith("demo-thread-");
  if (!known) throw Object.assign(new Error("Conversation not found."), { status: 404 });
  return {
    id: `demo-msg-${Date.now()}`,
    threadId,
    senderUserId: DEMO_USER_ID,
    body: trimmed,
    createdAt: new Date().toISOString(),
    mine: true,
  };
}

export function ensureThread(input: EnsureThreadInput): InboxThread {
  if (input.applicationId) {
    const applicant = demoReviewQueue.find((item) => item.id === input.applicationId);
    if (!applicant) throw Object.assign(new Error("Application not found."), { status: 404 });
    const existing = demoInboxThreads.find((thread) => thread.counterpartUserId === applicant.applicantUserId);
    if (existing) return existing;
    const gig = getGigBySlug(applicant.gigSlug);
    return {
      id: `demo-thread-${applicant.id}`,
      gigId: gig?.id ?? `demo-${applicant.gigSlug}`,
      gigSlug: applicant.gigSlug,
      gigTitle: applicant.gigTitle,
      counterpartName: applicant.name,
      counterpartInitials: applicant.initials,
      counterpartUserId: applicant.applicantUserId,
      preview: "",
      lastMessageAt: new Date().toISOString(),
      timeLabel: formatThreadTime(new Date().toISOString()),
      unread: 0,
      online: false,
      tone: applicant.tone,
      role: "host",
    };
  }

  if (input.gigSlug) {
    const existing = demoInboxThreads.find((thread) => thread.gigSlug === input.gigSlug && thread.role === "participant");
    if (existing) return existing;
    const gig = getGigBySlug(input.gigSlug);
    if (!gig) throw Object.assign(new Error("Gig not found."), { status: 404 });
    return {
      id: `demo-thread-${gig.slug}`,
      gigId: gig.id,
      gigSlug: gig.slug,
      gigTitle: gig.title,
      counterpartName: gig.hostName,
      counterpartInitials: gig.hostInitials,
      counterpartUserId: gig.hostUserId ?? `demo-host-${gig.slug}`,
      preview: "",
      lastMessageAt: new Date().toISOString(),
      timeLabel: formatThreadTime(new Date().toISOString()),
      unread: 0,
      online: false,
      tone: avatarTone(gig.hostName),
      role: "participant",
    };
  }

  throw Object.assign(new Error("Choose a gig or application to message."), { status: 400 });
}

const DEMO_SELF_ID = "demo-user";

type DemoCheckIn = CheckInRecord;

const demoCheckIns: DemoCheckIn[] = [
  {
    id: "demo-ci-nia",
    gigId: "demo-hangout-with-slice",
    gigSlug: "hangout-with-slice",
    gigTitle: "Hangout with Slice",
    userId: "demo-user-nia",
    displayName: "Nia Okafor",
    initials: "NO",
    roleLabel: "Setup & coordination",
    checkedInAt: "2026-09-10T09:12:00.000Z",
  },
];

function demoGigSummary(gig: GigDetail) {
  return {
    id: gig.id,
    slug: gig.slug,
    title: gig.title,
    hostName: gig.hostName,
    hostUserId: gig.hostUserId,
    dateLabel: gig.dateLabel,
    locationLabel: gig.locationLabel,
    kindLabel: gig.kindLabel,
  };
}

function resolveDemoGig(input: CheckInWriteInput) {
  const parsed = input.token?.trim() ? parseCheckInToken(input.token.trim()) : null;
  if (input.token?.trim() && !parsed) {
    throw Object.assign(new Error("Check-in code is not valid."), { status: 404 });
  }
  const gig = parsed
    ? allGigs().find((item) => item.id === parsed.gigId) ?? demoMyGigs.find((item) => item.id === parsed.gigId)
    : allGigs().find((item) => item.slug === input.gigSlug) ?? demoMyGigs.find((item) => item.slug === input.gigSlug);
  if (!gig) throw Object.assign(new Error("Gig not found."), { status: 404 });
  const detail = "summary" in gig ? gig : allGigs().find((item) => item.slug === gig.slug) ?? demoGigDetails[0];
  const slotId = input.slotId?.trim() || parsed?.slotId;
  const token = createCheckInToken(gig.id, slotId);
  return { gig: detail, slotId, token, viaToken: Boolean(parsed) };
}

function demoParticipantsFor(gigId: string, gigSlug: string): CheckInParticipant[] {
  const applicants = demoReviewQueue.filter((item) => item.gigSlug === gigSlug);
  const people = applicants.length
    ? applicants
    : [
        {
          id: "demo-self",
          applicantUserId: DEMO_SELF_ID,
          name: "You",
          initials: "YO",
          role: "General support",
        },
      ];
  return people.map((person) => {
    const checkIn = demoCheckIns.find((row) => row.gigId === gigId && row.userId === person.applicantUserId) ?? null;
    return {
      userId: person.applicantUserId,
      displayName: person.name,
      initials: person.initials,
      roleLabel: person.role,
      applicationId: person.id,
      checkIn,
    };
  });
}

export function getCheckInContext(input: CheckInWriteInput): CheckInContext {
  const { gig, token, slotId, viaToken } = resolveDemoGig(input);
  const hostedSlugs = new Set([
    ...demoMyGigs.filter((item) => item.mode === "Hosted").map((item) => item.slug),
    ...extraGigs.map((item) => item.slug),
  ]);
  const viewerRole = viaToken ? "accepted" : hostedSlugs.has(gig.slug) ? "host" : "unsigned";
  const participants = viewerRole === "host" ? demoParticipantsFor(gig.id, gig.slug) : [];
  const records = demoCheckIns.filter((row) => row.gigId === gig.id);
  const ownCheckIn = records.find((row) => row.userId === DEMO_SELF_ID) ?? null;

  return {
    token,
    path: checkInPath(token),
    slotId,
    gig: demoGigSummary(gig),
    viewerRole,
    ownCheckIn,
    checkIns: records.filter((row) => checkInState(row) === "in"),
    participants,
  };
}

function upsertDemoCheckIn(gig: GigDetail, userId: string, displayName: string, initials: string, roleLabel: string, slotId?: string): CheckInRecord {
  const existing = demoCheckIns.find((row) => row.gigId === gig.id && row.userId === userId);
  const now = new Date().toISOString();
  if (existing && checkInState(existing) === "in") return existing;
  if (existing) {
    existing.checkedInAt = now;
    existing.checkedOutAt = undefined;
    if (slotId) existing.slotId = slotId;
    return existing;
  }
  const record: CheckInRecord = {
    id: `demo-ci-${gig.id}-${userId}`,
    gigId: gig.id,
    gigSlug: gig.slug,
    gigTitle: gig.title,
    slotId,
    userId,
    displayName,
    initials,
    roleLabel,
    checkedInAt: now,
  };
  demoCheckIns.push(record);
  return record;
}

export function checkIn(input: CheckInWriteInput): CheckInRecord {
  const { gig, slotId, viaToken } = resolveDemoGig(input);
  if (viaToken && !input.userId) {
    return upsertDemoCheckIn(gig, DEMO_SELF_ID, "You", initialsFromName("You"), "General support", slotId);
  }
  if (input.userId) {
    const person = demoReviewQueue.find((item) => item.applicantUserId === input.userId);
    return upsertDemoCheckIn(
      gig,
      input.userId,
      person?.name ?? "Participant",
      person?.initials ?? initialsFromName(person?.name ?? "Participant"),
      person?.role ?? "General support",
      slotId,
    );
  }
  return upsertDemoCheckIn(gig, DEMO_SELF_ID, "You", initialsFromName("You"), "General support", slotId);
}

export function checkOut(input: CheckInWriteInput): CheckInRecord {
  const { gig, viaToken } = resolveDemoGig(input);
  const userId = input.userId?.trim() || (viaToken ? DEMO_SELF_ID : DEMO_SELF_ID);
  const existing = demoCheckIns.find((row) => row.gigId === gig.id && row.userId === userId);
  if (!existing || checkInState(existing) !== "in") {
    throw Object.assign(new Error("This participant is not checked in."), { status: 400 });
  }
  existing.checkedOutAt = new Date().toISOString();
  return existing;
}

