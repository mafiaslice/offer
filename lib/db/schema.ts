import { integer, pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const profiles = pgTable("profiles", {
  id: uuid("id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull().default(""),
  phone: text("phone"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  intent: text("intent").$type<"need" | "help" | "both" | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const gigs = pgTable("gigs", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  hostUserId: uuid("host_user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  summary: text("summary").notNull().default(""),
  kind: text("kind").$type<"volunteer" | "paid">().notNull(),
  category: text("category").$type<"Events" | "Community" | "Hospitality" | "Projects">().notNull(),
  locationLabel: text("location_label"),
  locationType: text("location_type").$type<"in-person" | "remote" | null>(),
  startsAt: timestamp("starts_at", { withTimezone: true }),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  coverImageUrl: text("cover_image_url"),
  coverTone: text("cover_tone").$type<"sunset" | "mint" | "night">().notNull().default("sunset"),
  status: text("status").$type<"draft" | "open" | "filled" | "completed" | "cancelled">().notNull().default("open"),
  instructions: text("instructions"),
  incentive: text("incentive"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const gigRoles = pgTable("gig_roles", {
  id: uuid("id").primaryKey().defaultRandom(),
  gigId: uuid("gig_id")
    .notNull()
    .references(() => gigs.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  capacity: integer("capacity"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const gigSlots = pgTable("gig_slots", {
  id: uuid("id").primaryKey().defaultRandom(),
  gigId: uuid("gig_id")
    .notNull()
    .references(() => gigs.id, { onDelete: "cascade" }),
  roleId: uuid("role_id").references(() => gigRoles.id, { onDelete: "set null" }),
  startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
  endsAt: timestamp("ends_at", { withTimezone: true }),
  capacity: integer("capacity"),
});

export const applications = pgTable(
  "applications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    applicantUserId: uuid("applicant_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    gigId: uuid("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    roleId: uuid("role_id").references(() => gigRoles.id, { onDelete: "set null" }),
    slotId: uuid("slot_id").references(() => gigSlots.id, { onDelete: "set null" }),
    status: text("status").$type<"pending" | "accepted" | "declined" | "withdrawn">().notNull().default("pending"),
    note: text("note"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [unique("applications_applicant_gig_key").on(table.applicantUserId, table.gigId)],
);

export const messageThreads = pgTable(
  "message_threads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gigId: uuid("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    hostUserId: uuid("host_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    participantUserId: uuid("participant_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
    lastMessagePreview: text("last_message_preview").notNull().default(""),
    lastMessageSenderId: uuid("last_message_sender_id").references(() => profiles.id, { onDelete: "set null" }),
    hostLastReadAt: timestamp("host_last_read_at", { withTimezone: true }),
    participantLastReadAt: timestamp("participant_last_read_at", { withTimezone: true }),
  },
  (table) => [unique("message_threads_gig_host_participant_key").on(table.gigId, table.hostUserId, table.participantUserId)],
);

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  threadId: uuid("thread_id")
    .notNull()
    .references(() => messageThreads.id, { onDelete: "cascade" }),
  senderUserId: uuid("sender_user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const checkIns = pgTable(
  "check_ins",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    gigId: uuid("gig_id")
      .notNull()
      .references(() => gigs.id, { onDelete: "cascade" }),
    slotId: uuid("slot_id").references(() => gigSlots.id, { onDelete: "set null" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }).notNull().defaultNow(),
    checkedOutAt: timestamp("checked_out_at", { withTimezone: true }),
  },
  (table) => [unique("check_ins_gig_user_key").on(table.gigId, table.userId)],
);
