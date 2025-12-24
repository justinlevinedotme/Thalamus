import postgres, { Sql } from "postgres";

let _sql: Sql | null = null;

// Lazy-initialize the database connection
// This is needed for Workers where env vars are set per-request
function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  return connectionString;
}

// Export a getter that lazily creates the connection
export const sql = new Proxy({} as Sql, {
  get(_target, prop) {
    if (!_sql) {
      _sql = postgres(getConnectionString(), {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false, // Required for Workers compatibility
      });
    }
    const value = (_sql as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(_sql);
    }
    return value;
  },
  apply(_target, _thisArg, args) {
    if (!_sql) {
      _sql = postgres(getConnectionString(), {
        max: 10,
        idle_timeout: 20,
        connect_timeout: 10,
        prepare: false,
      });
    }
    return (_sql as unknown as (...args: unknown[]) => unknown)(...args);
  },
});
