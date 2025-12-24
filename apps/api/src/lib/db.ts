import postgres from "postgres";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";

// Get connection string - uses Hyperdrive in production, DATABASE_URL in dev
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return connectionString;
}

// Create a fresh database connection
// In Workers with Hyperdrive, connections should be created per-request
export function createDb(): PostgresJsDatabase {
  const client = postgres(getConnectionString(), {
    prepare: false, // Required for Hyperdrive compatibility
  });
  return drizzle(client);
}

// For backwards compatibility - lazily creates connection
// Note: In production Workers, prefer using createDb() directly per request
let _db: PostgresJsDatabase | null = null;

export function getDb(): PostgresJsDatabase {
  if (!_db) {
    _db = createDb();
  }
  return _db;
}

// Export sql client for direct queries (legacy support)
export const sql = new Proxy({} as ReturnType<typeof postgres>, {
  get(_target, prop) {
    const client = postgres(getConnectionString(), { prepare: false });
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
  apply(_target, _thisArg, args) {
    const client = postgres(getConnectionString(), { prepare: false });
    return (client as unknown as (...args: unknown[]) => unknown)(...args);
  },
});
