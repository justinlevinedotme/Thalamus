import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { getDb, schema } from "./db";

// Lazy-initialize Resend client for Workers compatibility
let _resend: Resend | null = null;
const getResend = () => {
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
};

// Lazy getters for env vars
const getEmailFrom = () => process.env.EMAIL_FROM || "Thalamus <noreply@thalamus.app>";
const getFrontendUrl = () => process.env.FRONTEND_URL || "http://localhost:5173";

export type EmailCategory = "transactional" | "marketing" | "product_updates";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  category?: EmailCategory;
  userId?: string;
}

/**
 * Generate an unsubscribe token for a user
 * Uses a simple base64 encoding of the email - in production you might want signed tokens
 */
function generateUnsubscribeToken(email: string): string {
  return Buffer.from(email).toString("base64url");
}

/**
 * Decode an unsubscribe token back to email
 */
export function decodeUnsubscribeToken(token: string): string {
  return Buffer.from(token, "base64url").toString("utf-8");
}

/**
 * Send an email with proper unsubscribe headers
 * Transactional emails (password reset, verification) don't include unsubscribe
 * Marketing and product update emails include List-Unsubscribe headers
 */
export async function sendEmail({
  to,
  subject,
  html,
  category = "transactional",
  userId,
}: SendEmailOptions): Promise<void> {
  const db = getDb();

  // Check if user has unsubscribed from this category
  if (category !== "transactional" && userId) {
    const prefs = await db
      .select({
        marketingEmails: schema.emailPreferences.marketingEmails,
        productUpdates: schema.emailPreferences.productUpdates,
      })
      .from(schema.emailPreferences)
      .where(eq(schema.emailPreferences.userId, userId));

    if (prefs.length > 0) {
      if (category === "marketing" && !prefs[0].marketingEmails) {
        console.log(`User ${userId} has unsubscribed from marketing emails`);
        return;
      }
      if (category === "product_updates" && !prefs[0].productUpdates) {
        console.log(`User ${userId} has unsubscribed from product updates`);
        return;
      }
    }
  }

  // Build headers for non-transactional emails
  const headers: Record<string, string> = {};
  if (category !== "transactional") {
    const unsubscribeToken = generateUnsubscribeToken(to);
    const unsubscribeUrl = `${getFrontendUrl()}/unsubscribe?token=${unsubscribeToken}&category=${category}`;
    headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  await getResend().emails.send({
    from: getEmailFrom(),
    to,
    subject,
    html,
    headers: Object.keys(headers).length > 0 ? headers : undefined,
  });
}

/**
 * Unsubscribe a user from a specific email category
 */
export async function unsubscribeUser(
  email: string,
  category: EmailCategory
): Promise<boolean> {
  try {
    const db = getDb();

    // Find user by email
    const users = await db
      .select({ id: schema.baUser.id })
      .from(schema.baUser)
      .where(eq(schema.baUser.email, email));

    if (users.length === 0) {
      return false;
    }

    const userId = users[0].id;
    const now = new Date();

    // Upsert email preferences
    if (category === "marketing") {
      await db
        .insert(schema.emailPreferences)
        .values({
          userId,
          email,
          marketingEmails: false,
          unsubscribedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.emailPreferences.userId,
          set: {
            marketingEmails: false,
            updatedAt: now,
          },
        });
    } else if (category === "product_updates") {
      await db
        .insert(schema.emailPreferences)
        .values({
          userId,
          email,
          productUpdates: false,
          unsubscribedAt: now,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: schema.emailPreferences.userId,
          set: {
            productUpdates: false,
            updatedAt: now,
          },
        });
    }

    return true;
  } catch (error) {
    console.error("Failed to unsubscribe user:", error);
    return false;
  }
}

/**
 * Resubscribe a user to a specific email category
 */
export async function resubscribeUser(
  email: string,
  category: EmailCategory
): Promise<boolean> {
  try {
    const db = getDb();

    const users = await db
      .select({ id: schema.baUser.id })
      .from(schema.baUser)
      .where(eq(schema.baUser.email, email));

    if (users.length === 0) {
      return false;
    }

    const userId = users[0].id;
    const now = new Date();

    if (category === "marketing") {
      await db
        .update(schema.emailPreferences)
        .set({
          marketingEmails: true,
          updatedAt: now,
        })
        .where(eq(schema.emailPreferences.userId, userId));
    } else if (category === "product_updates") {
      await db
        .update(schema.emailPreferences)
        .set({
          productUpdates: true,
          updatedAt: now,
        })
        .where(eq(schema.emailPreferences.userId, userId));
    }

    return true;
  } catch (error) {
    console.error("Failed to resubscribe user:", error);
    return false;
  }
}
