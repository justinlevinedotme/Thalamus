import { drizzle, DrizzleD1Database } from "drizzle-orm/d1";
import * as schema from "./schema";

// Store the D1 binding globally for the request
let _d1: D1Database | null = null;

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

// Create a Drizzle instance from the D1 binding
export function createDb(): DrizzleD1Database<typeof schema> {
  return drizzle(getD1(), { schema });
}

// Lazy getter for backwards compatibility
let _db: DrizzleD1Database<typeof schema> | null = null;

export function getDb(): DrizzleD1Database<typeof schema> {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Reset cached db (call this at the start of each request)
export function resetDb() {
  _db = null;
}

// Export schema for convenience
export { schema };
