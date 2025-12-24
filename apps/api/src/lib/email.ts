import { Resend } from "resend";
import { sql } from "./db";

const resend = new Resend(process.env.RESEND_API_KEY);
const emailFrom = process.env.EMAIL_FROM || "Thalamus <noreply@thalamus.app>";
const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

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
  // Check if user has unsubscribed from this category
  if (category !== "transactional" && userId) {
    const prefs = await sql`
      SELECT marketing_emails, product_updates
      FROM email_preferences
      WHERE user_id = ${userId}
    `;

    if (prefs.length > 0) {
      const pref = prefs[0] as {
        marketing_emails: boolean;
        product_updates: boolean;
      };
      if (category === "marketing" && !pref.marketing_emails) {
        console.log(`User ${userId} has unsubscribed from marketing emails`);
        return;
      }
      if (category === "product_updates" && !pref.product_updates) {
        console.log(`User ${userId} has unsubscribed from product updates`);
        return;
      }
    }
  }

  // Build headers for non-transactional emails
  const headers: Record<string, string> = {};
  if (category !== "transactional") {
    const unsubscribeToken = generateUnsubscribeToken(to);
    const unsubscribeUrl = `${frontendUrl}/unsubscribe?token=${unsubscribeToken}&category=${category}`;
    headers["List-Unsubscribe"] = `<${unsubscribeUrl}>`;
    headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
  }

  await resend.emails.send({
    from: emailFrom,
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
    // Find user by email
    const users = await sql`
      SELECT id FROM ba_user WHERE email = ${email}
    `;

    if (users.length === 0) {
      return false;
    }

    const userId = (users[0] as { id: string }).id;

    // Upsert email preferences
    if (category === "marketing") {
      await sql`
        INSERT INTO email_preferences (user_id, email, marketing_emails, unsubscribed_at)
        VALUES (${userId}, ${email}, false, now())
        ON CONFLICT (user_id) DO UPDATE SET
          marketing_emails = false,
          unsubscribed_at = COALESCE(email_preferences.unsubscribed_at, now()),
          updated_at = now()
      `;
    } else if (category === "product_updates") {
      await sql`
        INSERT INTO email_preferences (user_id, email, product_updates, unsubscribed_at)
        VALUES (${userId}, ${email}, false, now())
        ON CONFLICT (user_id) DO UPDATE SET
          product_updates = false,
          unsubscribed_at = COALESCE(email_preferences.unsubscribed_at, now()),
          updated_at = now()
      `;
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
    const users = await sql`
      SELECT id FROM ba_user WHERE email = ${email}
    `;

    if (users.length === 0) {
      return false;
    }

    const userId = (users[0] as { id: string }).id;

    if (category === "marketing") {
      await sql`
        UPDATE email_preferences
        SET marketing_emails = true, updated_at = now()
        WHERE user_id = ${userId}
      `;
    } else if (category === "product_updates") {
      await sql`
        UPDATE email_preferences
        SET product_updates = true, updated_at = now()
        WHERE user_id = ${userId}
      `;
    }

    return true;
  } catch (error) {
    console.error("Failed to resubscribe user:", error);
    return false;
  }
}
