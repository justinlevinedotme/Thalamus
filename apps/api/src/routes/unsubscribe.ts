import { Hono } from "hono";
import {
  decodeUnsubscribeToken,
  unsubscribeUser,
  resubscribeUser,
  type EmailCategory,
} from "../lib/email";

const unsubscribe = new Hono();

// GET /unsubscribe - Show unsubscribe confirmation page
// This is called when clicking the unsubscribe link in emails
unsubscribe.get("/", async (c) => {
  const token = c.req.query("token");
  const category = c.req.query("category") as EmailCategory | undefined;

  if (!token) {
    return c.json({ error: "Missing token" }, 400);
  }

  try {
    const email = decodeUnsubscribeToken(token);

    // Return a simple HTML page for confirmation
    // The frontend will handle displaying a proper unsubscribe page
    return c.json({
      email: email.replace(/(.{2}).*(@.*)/, "$1***$2"), // Mask email
      category: category || "all",
      message: "Click confirm to unsubscribe from these emails",
    });
  } catch {
    return c.json({ error: "Invalid token" }, 400);
  }
});

// POST /unsubscribe - Process the unsubscribe request
// This handles both one-click unsubscribe (from email client) and form submission
unsubscribe.post("/", async (c) => {
  const token = c.req.query("token");
  const category = c.req.query("category") as EmailCategory | undefined;

  // Also check body for form submissions
  let bodyToken: string | undefined;
  let bodyCategory: EmailCategory | undefined;

  try {
    const body = await c.req.json();
    bodyToken = body.token;
    bodyCategory = body.category;
  } catch {
    // Body might be empty for one-click unsubscribe
  }

  const finalToken = token || bodyToken;
  const finalCategory = category || bodyCategory || "marketing";

  if (!finalToken) {
    return c.json({ error: "Missing token" }, 400);
  }

  try {
    const email = decodeUnsubscribeToken(finalToken);
    const success = await unsubscribeUser(email, finalCategory);

    if (success) {
      return c.json({
        success: true,
        message: `Successfully unsubscribed from ${finalCategory} emails`,
      });
    } else {
      return c.json({ error: "User not found" }, 404);
    }
  } catch {
    return c.json({ error: "Invalid token" }, 400);
  }
});

// POST /resubscribe - Allow users to resubscribe
unsubscribe.post("/resubscribe", async (c) => {
  const body = await c.req.json();
  const { token, category } = body as {
    token?: string;
    category?: EmailCategory;
  };

  if (!token) {
    return c.json({ error: "Missing token" }, 400);
  }

  try {
    const email = decodeUnsubscribeToken(token);
    const success = await resubscribeUser(email, category || "marketing");

    if (success) {
      return c.json({
        success: true,
        message: `Successfully resubscribed to ${category || "marketing"} emails`,
      });
    } else {
      return c.json({ error: "User not found" }, 404);
    }
  } catch {
    return c.json({ error: "Invalid token" }, 400);
  }
});

export default unsubscribe;
