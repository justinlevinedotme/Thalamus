/**
 * @file index.worker.ts
 * @description Main entry point for the Cloudflare Workers API. Sets up the Hono
 * application with middleware for database injection, CORS, logging, and routes.
 * Handles both D1 (production) and SQLite (local dev) database connections.
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { setD1, resetDb, initLocalDb } from "./lib/db";
import { setAuthD1 } from "./lib/auth";

// Define env bindings type
export type Bindings = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  FRONTEND_URL: string;
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  APPLE_CLIENT_ID: string;
  APPLE_CLIENT_SECRET: string;
  GITLAB_CLIENT_ID: string;
  GITLAB_CLIENT_SECRET: string;
  ATLASSIAN_CLIENT_ID: string;
  ATLASSIAN_CLIENT_SECRET: string;
  TURNSTILE_SECRET_KEY: string;
};

// Import routes synchronously - bundler will handle code splitting
import graphs from "./routes/graphs";
import share from "./routes/share";
import profile from "./routes/profile";
import unsubscribe from "./routes/unsubscribe";

const app = new Hono<{ Bindings: Bindings }>();

// Middleware to inject D1 and env vars
app.use("*", async (c, next) => {
  // Reset DB cache for each request
  resetDb();

  // Check if D1 binding is available (production/wrangler)
  if (c.env?.DB) {
    // Production or wrangler dev: use D1 binding
    setD1(c.env.DB);
    setAuthD1(c.env.DB);

    // Polyfill process.env for libraries that expect it
    (globalThis as { process?: { env: Record<string, string> } }).process = {
      env: c.env as unknown as Record<string, string>,
    };
  } else {
    // Local dev without wrangler: use better-sqlite3
    // Database will be initialized on first getDb() call
    console.log("Running in local dev mode (no D1 binding)");
    initLocalDb();
  }

  await next();
});

app.use("*", logger());
app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env?.FRONTEND_URL || process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Auth routes - use all() to catch any method on /auth/**
app.all("/auth/*", async (c) => {
  const { auth } = await import("./lib/auth");
  return auth.handler(c.req.raw);
});

// Register routes
app.route("/graphs", graphs);
app.route("/share", share);
app.route("/profile", profile);
app.route("/unsubscribe", unsubscribe);

export default app;
