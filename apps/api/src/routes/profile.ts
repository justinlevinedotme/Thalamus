import { Hono } from "hono";
import { sql } from "../lib/db";
import { sessionMiddleware } from "../middleware/session";

const profile = new Hono();

// All profile routes require authentication
profile.use("/*", sessionMiddleware);

// Get current user profile
profile.get("/", async (c) => {
  const user = c.get("user");

  try {
    // Try to get profile, but handle case where profiles table may not exist yet
    let profileData: { plan?: string; max_graphs?: number; retention_days?: number } = {};
    try {
      const profiles = await sql`
        SELECT plan, max_graphs, retention_days
        FROM profiles
        WHERE id = ${user.id}
      `;

      if (profiles.length === 0) {
        // Create default profile if it doesn't exist
        await sql`
          INSERT INTO profiles (id)
          VALUES (${user.id})
          ON CONFLICT (id) DO NOTHING
        `;
      } else {
        profileData = profiles[0] as typeof profileData;
      }
    } catch (dbError) {
      // Profiles table might not exist yet, continue with defaults
      console.error("Error fetching profile:", dbError);
    }

    // Get linked accounts
    let linkedAccounts: Array<{ provider: string; linkedAt: Date }> = [];
    try {
      const accounts = await sql`
        SELECT "providerId" as provider, "createdAt"
        FROM ba_account
        WHERE "userId" = ${user.id}
      `;
      linkedAccounts = accounts.map((a) => ({
        provider: (a as { provider: string; createdAt: Date }).provider,
        linkedAt: (a as { provider: string; createdAt: Date }).createdAt,
      }));
    } catch (dbError) {
      console.error("Error fetching linked accounts:", dbError);
    }

    return c.json({
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      emailVerified: user.emailVerified,
      plan: profileData.plan || "free",
      maxGraphs: profileData.max_graphs || 20,
      retentionDays: profileData.retention_days || 365,
      linkedAccounts,
    });
  } catch (error) {
    console.error("Profile error:", error);
    return c.json({ error: "Failed to load profile" }, 500);
  }
});

// Update user profile (name, image)
profile.patch("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const updates: { name?: string; image?: string } = {};

  if (typeof body.name === "string") {
    updates.name = body.name.trim();
  }

  if (typeof body.image === "string") {
    // Validate URL format
    try {
      new URL(body.image);
      updates.image = body.image;
    } catch {
      return c.json({ error: "Invalid image URL" }, 400);
    }
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No valid updates provided" }, 400);
  }

  // Update ba_user table
  if (updates.name !== undefined && updates.image !== undefined) {
    await sql`
      UPDATE ba_user
      SET name = ${updates.name}, image = ${updates.image}, "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;
  } else if (updates.name !== undefined) {
    await sql`
      UPDATE ba_user
      SET name = ${updates.name}, "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;
  } else if (updates.image !== undefined) {
    await sql`
      UPDATE ba_user
      SET image = ${updates.image}, "updatedAt" = NOW()
      WHERE id = ${user.id}
    `;
  }

  // Return updated user
  const users = await sql`
    SELECT id, email, name, image, "emailVerified"
    FROM ba_user
    WHERE id = ${user.id}
  `;

  return c.json({
    id: users[0].id,
    email: users[0].email,
    name: users[0].name,
    image: users[0].image,
  });
});

// Get email preferences
profile.get("/email-preferences", async (c) => {
  const user = c.get("user");

  try {
    const prefs = await sql`
      SELECT marketing_emails, product_updates
      FROM email_preferences
      WHERE user_id = ${user.id}
    `;

    if (prefs.length === 0) {
      // Return defaults if no preferences exist
      return c.json({
        marketingEmails: true,
        productUpdates: true,
      });
    }

    const pref = prefs[0] as { marketing_emails: boolean; product_updates: boolean };
    return c.json({
      marketingEmails: pref.marketing_emails,
      productUpdates: pref.product_updates,
    });
  } catch (error) {
    console.error("Error fetching email preferences:", error);
    return c.json({ error: "Failed to load email preferences" }, 500);
  }
});

// Update email preferences
profile.patch("/email-preferences", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  const { marketingEmails, productUpdates } = body as {
    marketingEmails?: boolean;
    productUpdates?: boolean;
  };

  if (marketingEmails === undefined && productUpdates === undefined) {
    return c.json({ error: "No valid updates provided" }, 400);
  }

  try {
    const marketing = marketingEmails ?? true;
    const updates = productUpdates ?? true;

    // Upsert email preferences
    await sql`
      INSERT INTO email_preferences (user_id, email, marketing_emails, product_updates)
      VALUES (
        ${user.id},
        ${user.email},
        ${marketing},
        ${updates}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        marketing_emails = ${marketing},
        product_updates = ${updates},
        updated_at = NOW()
    `;

    // Return updated preferences
    const prefs = await sql`
      SELECT marketing_emails, product_updates
      FROM email_preferences
      WHERE user_id = ${user.id}
    `;

    const pref = prefs[0] as { marketing_emails: boolean; product_updates: boolean };
    return c.json({
      marketingEmails: pref.marketing_emails,
      productUpdates: pref.product_updates,
    });
  } catch (error) {
    console.error("Error updating email preferences:", error);
    return c.json({ error: "Failed to update email preferences" }, 500);
  }
});

export default profile;
