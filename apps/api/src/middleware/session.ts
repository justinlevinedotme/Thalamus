import { Context, Next } from "hono";
import { auth, Session } from "../lib/auth";

// Extend Hono context with session
declare module "hono" {
  interface ContextVariableMap {
    session: Session["session"];
    user: Session["user"];
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
  c.set("user", session.user);

  await next();
}

export async function optionalSessionMiddleware(c: Context, next: Next) {
  const session = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (session) {
    c.set("session", session.session);
    c.set("user", session.user);
  }

  await next();
}
