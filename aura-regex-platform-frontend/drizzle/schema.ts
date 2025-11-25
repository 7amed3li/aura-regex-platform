import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Folders table for organizing rules
export const folders = mysqlTable("folders", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Folder = typeof folders.$inferSelect;
export type InsertFolder = typeof folders.$inferInsert;

// Rules table for storing generated regex patterns
export const rules = mysqlTable("rules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  folderId: int("folderId"),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  pattern: text("pattern").notNull(),
  naturalLanguageInput: text("naturalLanguageInput"),
  flags: varchar("flags", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rule = typeof rules.$inferSelect;
export type InsertRule = typeof rules.$inferInsert;

// Test cases table for storing test cases associated with rules
export const testCases = mysqlTable("testCases", {
  id: int("id").autoincrement().primaryKey(),
  ruleId: int("ruleId").notNull(),
  userId: int("userId").notNull(),
  input: text("input").notNull(),
  expectedMatches: int("expectedMatches"),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TestCase = typeof testCases.$inferSelect;
export type InsertTestCase = typeof testCases.$inferInsert;

// Generation logs table for tracking AI-generated regex patterns
export const generationLogs = mysqlTable("generationLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  input: text("input").notNull(),
  output: text("output"),
  userFeedback: varchar("userFeedback", { length: 20 }),
  ruleId: int("ruleId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type GenerationLog = typeof generationLogs.$inferSelect;
export type InsertGenerationLog = typeof generationLogs.$inferInsert;