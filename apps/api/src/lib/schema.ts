/**
 * @file schema.ts
 * @description Drizzle ORM schema definitions for all database tables. Includes BetterAuth
 * tables (ba_user, ba_session, ba_account, ba_verification, ba_two_factor) and application
 * tables (graphs, share_links, profiles, email_preferences) with their relations.
 */

import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";
import { relations, sql } from "drizzle-orm";

// Helper for timestamps
const timestamp = (name: string) =>
  integer(name, { mode: "timestamp" }).$defaultFn(() => new Date());

// BetterAuth tables
export const baUser = sqliteTable("ba_user", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).default(false),
  image: text("image"),
  twoFactorEnabled: integer("twoFactorEnabled", { mode: "boolean" }).default(false),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const baSession = sqliteTable("ba_session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => baUser.id, { onDelete: "cascade" }),
});

export const baAccount = sqliteTable("ba_account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => baUser.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull(),
  updatedAt: timestamp("updatedAt").notNull(),
});

export const baVerification = sqliteTable("ba_verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt"),
});

export const baTwoFactor = sqliteTable("ba_two_factor", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backupCodes").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => baUser.id, { onDelete: "cascade" }),
});

// BetterAuth relations (required for drizzle adapter)
export const baUserRelations = relations(baUser, ({ many }) => ({
  sessions: many(baSession),
  accounts: many(baAccount),
  twoFactors: many(baTwoFactor),
}));

export const baSessionRelations = relations(baSession, ({ one }) => ({
  user: one(baUser, {
    fields: [baSession.userId],
    references: [baUser.id],
  }),
}));

export const baAccountRelations = relations(baAccount, ({ one }) => ({
  user: one(baUser, {
    fields: [baAccount.userId],
    references: [baUser.id],
  }),
}));

export const baTwoFactorRelations = relations(baTwoFactor, ({ one }) => ({
  user: one(baUser, {
    fields: [baTwoFactor.userId],
    references: [baUser.id],
  }),
}));

// Application tables
export const graphs = sqliteTable("graphs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  ownerId: text("owner_id")
    .notNull()
    .references(() => baUser.id, { onDelete: "cascade" }),
  title: text("title").notNull().default("Untitled Graph"),
  data: text("data", { mode: "json" }).$type<{
    nodes: unknown[];
    edges: unknown[];
    groups?: unknown[];
  }>(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }),
});

export const shareLinks = sqliteTable("share_links", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  token: text("token")
    .notNull()
    .unique()
    .$defaultFn(() => crypto.randomUUID()),
  graphId: text("graph_id")
    .notNull()
    .references(() => graphs.id, { onDelete: "cascade" }),
  createdBy: text("created_by")
    .notNull()
    .references(() => baUser.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days default
  createdAt: timestamp("created_at").notNull(),
});

export const profiles = sqliteTable("profiles", {
  id: text("id")
    .primaryKey()
    .references(() => baUser.id, { onDelete: "cascade" }),
  plan: text("plan").default("free"),
  maxGraphs: integer("max_graphs").default(20),
  retentionDays: integer("retention_days").default(365),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const emailPreferences = sqliteTable("email_preferences", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => baUser.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  marketingEmails: integer("marketing_emails", { mode: "boolean" }).default(true),
  productUpdates: integer("product_updates", { mode: "boolean" }).default(true),
  unsubscribedAt: integer("unsubscribed_at", { mode: "timestamp" }),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const accountDeletionRequests = sqliteTable("account_deletion_requests", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => baUser.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // pending, processed, cancelled
  createdAt: timestamp("created_at").notNull(),
  processedAt: integer("processed_at", { mode: "timestamp" }),
});
