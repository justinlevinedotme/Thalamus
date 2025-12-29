/**
 * @file drizzle.config.ts
 * @description Drizzle Kit configuration for database migrations. Specifies schema
 * location, migration output directory, and SQLite database connection for local dev.
 */

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  dbCredentials: {
    url: "./local.db",
  },
});
