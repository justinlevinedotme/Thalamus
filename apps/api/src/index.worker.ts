import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

// Define env bindings type
export type Bindings = {
  DATABASE_URL: string;
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

// Middleware to inject env vars into process.env for compatibility
app.use("*", async (c, next) => {
  // Polyfill process.env for libraries that expect it
  (globalThis as { process?: { env: Record<string, string> } }).process = {
    env: c.env as unknown as Record<string, string>,
  };
  await next();
});

app.use("*", logger());
app.use("*", async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  });
  return corsMiddleware(c, next);
});

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Auth routes - use dynamic import for better-auth which needs process.env at runtime
app.on(["POST", "GET"], "/auth/*", async (c) => {
  const { auth } = await import("./lib/auth");
  return auth.handler(c.req.raw);
});

// Register routes
app.route("/graphs", graphs);
app.route("/share", share);
app.route("/profile", profile);
app.route("/unsubscribe", unsubscribe);

export default app;
