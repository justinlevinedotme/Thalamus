/**
 * @file session.ts
 * @description Hono middleware for session authentication. Provides sessionMiddleware
 * for protected routes that require authentication, and optionalSessionMiddleware for
 * routes that work with or without a session. Extends Hono context with user and session.
 */

import { Context, Next } from "hono";
import { auth, Session } from "../lib/auth";

// Type for the user returned from getSession (may not have twoFactorEnabled)
type SessionUser = Omit<Session["user"], "twoFactorEnabled"> & {
  twoFactorEnabled?: boolean | null;
};

// Extend Hono context with session
declare module "hono" {
  interface ContextVariableMap {
    session: Session["session"];
    user: SessionUser;
  }
}

export async function sessionMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!session) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("session", session.session);
  c.set("user", session.user as SessionUser);

  await next();
}

export async function optionalSessionMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set("session", session.session);
    c.set("user", session.user as SessionUser);
  }

  await next();
}
