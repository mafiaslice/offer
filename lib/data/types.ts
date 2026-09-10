export type DataSource = "demo-adapter" | "supabase";

export type GigCategory = "Events" | "Community" | "Hospitality" | "Projects";
export type GigKindLabel = "Volunteer" | "Paid gig";
export type ImageTone = "sunset" | "mint" | "night";
export type ApplicationStatus = "pending" | "accepted" | "declined" | "withdrawn";
export type ApplicationUiStatus = "Applied" | "Accepted" | "Declined";

export type GigListItem = {
  id: string;
  slug: string;
  title: string;
  hostName: string;
  kindLabel: GigKindLabel;
  locationLabel: string;
  dateLabel: string;
  imageTone: ImageTone;
  category: GigCategory;
  spotsLabel: string;
};

export type GigDetail = GigListItem & {
  summary: string;
  about: string;
  hostInitials: string;
  longDateLabel: string;
  roles: string[];
  incentive: string;
  instructions: string;
  verified: boolean;
  startsAt?: string;
  endsAt?: string;
  status: string;
  hostUserId?: string;
};

export type SessionProfile = {
  id: string;
  displayName: string;
  initials: string;
  email?: string;
  phone?: string;
  bio?: string;
  intent?: "need" | "help" | "both";
  avatarUrl?: string;
};

export type ProfilePatch = {
  displayName?: string;
  bio?: string;
  intent?: "need" | "help" | "both";
  phone?: string;
};

export type UserApplication = {
  id: string;
  gigId: string;
  gigSlug: string;
  gigTitle: string;
  hostUserId?: string;
  role: string;
  status: ApplicationUiStatus;
  rawStatus: ApplicationStatus;
  createdAt: string;
  note?: string;
};

export type HostApplicant = {
  id: string;
  gigSlug: string;
  gigTitle: string;
  applicantUserId: string;
  name: string;
  initials: string;
  role: string;
  trust: string;
  tone: string;
  status: ApplicationStatus;
};

export type InboxThread = {
  id: string;
  gigId: string;
  gigSlug: string;
  gigTitle: string;
  counterpartName: string;
  counterpartInitials: string;
  counterpartUserId: string;
  preview: string;
  lastMessageAt: string;
  timeLabel: string;
  unread: number;
  online: boolean;
  tone: string;
  role: "host" | "participant";
};

export type StartableThread = {
  applicationId: string;
  gigSlug: string;
  gigTitle: string;
  counterpartName: string;
  counterpartInitials: string;
  role: string;
  tone: string;
};

export type ChatMessage = {
  id: string;
  threadId: string;
  senderUserId: string;
  body: string;
  createdAt: string;
  mine: boolean;
};

export type InboxPayload = {
  threads: InboxThread[];
  startable: StartableThread[];
};

export type ThreadMessagesPayload = {
  thread: InboxThread;
  messages: ChatMessage[];
};

export type EnsureThreadInput = {
  applicationId?: string;
  gigSlug?: string;
};

export type MyGigCard = GigListItem & {
  mode: "Joined" | "Hosted";
  status: "Upcoming" | "Completed";
  applicationStatus?: ApplicationUiStatus;
  checkInToken?: string;
};

export type CheckInViewerRole = "host" | "accepted" | "pending" | "none" | "unsigned";

export type CheckInRecord = {
  id: string;
  gigId: string;
  gigSlug: string;
  gigTitle: string;
  slotId?: string;
  userId: string;
  displayName: string;
  initials: string;
  roleLabel: string;
  checkedInAt: string;
  checkedOutAt?: string;
};

export type CheckInParticipant = {
  userId: string;
  displayName: string;
  initials: string;
  roleLabel: string;
  applicationId: string;
  checkIn: CheckInRecord | null;
};

export type CheckInGigSummary = {
  id: string;
  slug: string;
  title: string;
  hostName: string;
  hostUserId?: string;
  dateLabel: string;
  locationLabel: string;
  kindLabel: GigKindLabel;
};

export type CheckInContext = {
  token: string;
  path: string;
  slotId?: string;
  gig: CheckInGigSummary;
  viewerRole: CheckInViewerRole;
  ownCheckIn: CheckInRecord | null;
  checkIns: CheckInRecord[];
  participants: CheckInParticipant[];
};

export type CheckInWriteInput = {
  token?: string;
  gigSlug?: string;
  userId?: string;
  slotId?: string;
};

export type CreateGigInput = {
  title: string;
  summary: string;
  kind: "volunteer" | "paid";
  category: string;
  locationLabel: string;
  locationType: "in-person" | "remote";
  date: string;
  startTime: string;
  slotCount: number;
  roles: string[];
  incentive?: string;
  instructions?: string;
};

export type ApplyInput = {
  gigSlug: string;
  roleTitle: string;
  note?: string;
};

export type GigListFilters = {
  query?: string;
  category?: string;
  kind?: string;
};

export type ListResult<T> = {
  data: T;
  meta: { total: number; source: DataSource };
};

export type MyActivity = {
  hosted: MyGigCard[];
  joined: MyGigCard[];
  applications: UserApplication[];
  reviewQueue: HostApplicant[];
};
