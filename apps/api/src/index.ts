import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./lib/auth";
import graphs from "./routes/graphs";
import share from "./routes/share";
import profile from "./routes/profile";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Health check
app.get("/health", (c) => c.json({ status: "ok" }));

// Mount better-auth routes at /auth/*
app.on(["POST", "GET"], "/auth/**", (c) => auth.handler(c.req.raw));

// Mount API routes
app.route("/graphs", graphs);
app.route("/share", share);
app.route("/profile", profile);

// Start server
const port = Number(process.env.PORT) || 3001;

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
});
