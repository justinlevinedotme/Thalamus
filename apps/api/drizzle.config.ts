/**
 * @file drizzle.config.ts
 * @description Drizzle Kit configuration for database migrations and studio.
 * Points to wrangler's local D1 simulation for Drizzle Studio.
 */

import { defineConfig } from "drizzle-kit";
import { readdirSync } from "fs";
import { join } from "path";

// Find the wrangler D1 local sqlite file
function getLocalD1Path(): string {
  const d1Dir = "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject";
  try {
    const files = readdirSync(d1Dir);
    const sqliteFile = files.find((f) => f.endsWith(".sqlite"));
    if (sqliteFile) {
      return join(d1Dir, sqliteFile);
    }
  } catch {
    // Directory doesn't exist yet - wrangler dev needs to run first
  }
  // Return a placeholder path - studio will show an error if file doesn't exist
  return "./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/local.sqlite";
}

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: getLocalD1Path(),
  },
});
