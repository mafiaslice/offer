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
  gigSlug: string;
  gigTitle: string;
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
  name: string;
  initials: string;
  role: string;
  trust: string;
  tone: string;
  status: ApplicationStatus;
};

export type MyGigCard = GigListItem & {
  mode: "Joined" | "Hosted";
  status: "Upcoming" | "Completed";
  applicationStatus?: ApplicationUiStatus;
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
