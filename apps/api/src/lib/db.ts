/**
 * @file db.ts
 * @description Database connection factory for Drizzle ORM. Provides a unified interface
 * that auto-detects the environment and uses Cloudflare D1 in production or better-sqlite3
 * for local development. Handles database initialization and migration for local dev.
 */

import { drizzle as drizzleD1, DrizzleD1Database } from "drizzle-orm/d1";
import { drizzle as drizzleSqlite, BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// Use D1 database type for consistent API across both drivers
// Both D1 and better-sqlite3 are SQLite-based and share the same query interface
export type Database = DrizzleD1Database<typeof schema>;

// Check if we're in local development mode
// Local mode: when running outside Cloudflare Workers (no D1 binding available)
export function isLocalDev(): boolean {
  return typeof globalThis.process !== "undefined" && !_d1;
}

// Store the D1 binding globally for the request (production only)
let _d1: D1Database | null = null;

// Store the local SQLite database (local dev only)
let _localDb: BetterSQLite3Database<typeof schema> | null = null;

// Set the D1 binding (called from middleware in production)
export function setD1(d1: D1Database) {
  _d1 = d1;
}

// Get the D1 binding (production only)
export function getD1(): D1Database {
  if (!_d1) {
    throw new Error("D1 database not initialized. Make sure setD1() is called in middleware.");
  }
  return _d1;
}

// Initialize local SQLite database for development
export function initLocalDb(): BetterSQLite3Database<typeof schema> {
  if (_localDb) return _localDb;

  // Dynamic import to avoid bundling better-sqlite3 in production
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Database = require("better-sqlite3");
  const path = require("path");
  const fs = require("fs");

  // Database file path relative to api directory
  const dbPath = path.resolve(process.cwd(), "local.db");

  // Check if migrations need to be applied
  const isNewDb = !fs.existsSync(dbPath);

  const sqlite = new Database(dbPath);

  // Enable WAL mode for better performance
  sqlite.pragma("journal_mode = WAL");

  _localDb = drizzleSqlite(sqlite, { schema });

  // Apply migrations if this is a new database
  if (isNewDb) {
    console.log("New local database detected. Applying migrations...");
    applyMigrations(sqlite);
  }

  return _localDb;
}

// Apply SQL migrations to local database
function applyMigrations(sqlite: ReturnType<typeof import("better-sqlite3")>) {
  const fs = require("fs");
  const path = require("path");

  const migrationsDir = path.resolve(process.cwd(), "migrations");

  if (!fs.existsSync(migrationsDir)) {
    console.warn("No migrations directory found at:", migrationsDir);
    return;
  }

  // Create migrations tracking table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      applied_at TEXT DEFAULT (datetime('now'))
    )
  `);

  // Get already applied migrations
  const applied = (sqlite.prepare("SELECT name FROM _migrations").all() as { name: string }[]).map(
    (row) => row.name
  );

  // Get all migration files, sorted
  const migrationFiles = fs
    .readdirSync(migrationsDir)
    .filter((f: string) => f.endsWith(".sql"))
    .sort();

  for (const file of migrationFiles) {
    if (applied.includes(file)) {
      continue;
    }

    console.log(`Applying migration: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

    try {
      sqlite.exec(sql);
      sqlite.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
      console.log(`  ✓ Applied: ${file}`);
    } catch (error) {
      console.error(`  ✗ Failed to apply ${file}:`, error);
      throw error;
    }
  }
}

// Create a Drizzle instance - auto-detects environment
export function createDb(): Database {
  if (_d1) {
    // Production: use D1
    return drizzleD1(getD1(), { schema });
  } else {
    // Local dev: use better-sqlite3
    // Cast to Database type - both share compatible SQLite query interface
    return initLocalDb() as unknown as Database;
  }
}

// Cached database instance
let _db: Database | null = null;

// Get database instance (auto-detects environment)
export function getDb(): Database {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Reset cached db (call this at the start of each request in production)
export function resetDb() {
  _db = null;
  // Note: Don't reset _localDb as it should persist across requests in local dev
}

// Export schema for convenience
export { schema };
