/**
 * @file index.worker.ts
 * @description Main entry point for the Cloudflare Workers API. Sets up the Hono
 * application with middleware for database injection, CORS, logging, and routes.
 * Uses Cloudflare D1 for database (wrangler handles local simulation).
 */

import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { setD1, resetDb } from "./lib/db";
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

// Import routes
import graphs from "./routes/graphs";
import profile from "./routes/profile";
import savedNodes from "./routes/saved-nodes";
import sessions from "./routes/sessions";
import share from "./routes/share";
import shareLinks from "./routes/share-links";
import unsubscribe from "./routes/unsubscribe";

const app = new Hono<{ Bindings: Bindings }>();

// Middleware to inject D1 and env vars
app.use("*", async (c, next) => {
  // Reset DB cache for each request
  resetDb();

  // Set D1 binding
  setD1(c.env.DB);
  setAuthD1(c.env.DB);

  // Polyfill process.env for libraries that expect it
  (globalThis as { process?: { env: Record<string, string> } }).process = {
    env: c.env as unknown as Record<string, string>,
  };

  await next();
});

app.use("*", logger());
app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env?.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Auth routes
app.all("/auth/*", async (c) => {
  const { auth } = await import("./lib/auth");
  return auth.handler(c.req.raw);
});

// Register routes
app.route("/graphs", graphs);
app.route("/profile", profile);
app.route("/saved-nodes", savedNodes);
app.route("/sessions", sessions);
app.route("/share", share);
app.route("/share-links", shareLinks);
app.route("/unsubscribe", unsubscribe);

export default app;
