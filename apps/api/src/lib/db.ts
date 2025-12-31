/**
 * @file db.ts
 * @description Database connection factory for Drizzle ORM with Cloudflare D1.
 * Wrangler handles local D1 simulation automatically during development.
 */

import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

export type Database = DrizzleD1Database<typeof schema>;

// Store the D1 binding for the current request
let _d1: D1Database | null = null;

// Cached database instance
let _db: Database | null = null;

// Set the D1 binding (called from middleware)
export function setD1(d1: D1Database) {
  _d1 = d1;
}

// Get the D1 binding
export function getD1(): D1Database {
  if (!_d1) {
    throw new Error("D1 database not initialized. Make sure setD1() is called in middleware.");
  }
  return _d1;
}

// Get database instance
export function getDb(): Database {
  if (!_db) {
    _db = drizzle(getD1(), { schema });
  }
  return _db;
}

// Reset cached db (call at the start of each request)
export function resetDb() {
  _db = null;
}

// Export schema for convenience
export { schema };
