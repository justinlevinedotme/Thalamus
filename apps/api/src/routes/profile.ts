import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { sessionMiddleware } from "../middleware/session";

const profile = new Hono();

// All profile routes require authentication
profile.use("/*", sessionMiddleware);

// Get current user profile
profile.get("/", async (c) => {
  const user = c.get("user");
  const db = getDb();

  try {
    // Try to get profile, but handle case where profiles table may not exist yet
    let profileData: { plan?: string | null; maxGraphs?: number | null; retentionDays?: number | null } = {};
    try {
      const profiles = await db
        .select({
          plan: schema.profiles.plan,
          maxGraphs: schema.profiles.maxGraphs,
          retentionDays: schema.profiles.retentionDays,
        })
        .from(schema.profiles)
        .where(eq(schema.profiles.id, user.id));

      if (profiles.length === 0) {
        // Create default profile if it doesn't exist
        const now = new Date();
        await db
          .insert(schema.profiles)
          .values({
            id: user.id,
            createdAt: now,
            updatedAt: now,
          })
          .onConflictDoNothing();
      } else {
        profileData = profiles[0];
      }
    } catch (dbError) {
      // Profiles table might not exist yet, continue with defaults
      console.error("Error fetching profile:", dbError);
    }

    // Get linked accounts
    let linkedAccounts: Array<{ provider: string; linkedAt: Date | null }> = [];
    try {
      const accounts = await db
        .select({
          provider: schema.baAccount.providerId,
          createdAt: schema.baAccount.createdAt,
        })
        .from(schema.baAccount)
        .where(eq(schema.baAccount.userId, user.id));

      linkedAccounts = accounts.map((a) => ({
        provider: a.provider,
        linkedAt: a.createdAt,
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
      maxGraphs: profileData.maxGraphs || 20,
      retentionDays: profileData.retentionDays || 365,
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
  const db = getDb();

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
  await db
    .update(schema.baUser)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(schema.baUser.id, user.id));

  // Return updated user
  const users = await db
    .select({
      id: schema.baUser.id,
      email: schema.baUser.email,
      name: schema.baUser.name,
      image: schema.baUser.image,
    })
    .from(schema.baUser)
    .where(eq(schema.baUser.id, user.id));

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
  const db = getDb();

  try {
    const prefs = await db
      .select({
        marketingEmails: schema.emailPreferences.marketingEmails,
        productUpdates: schema.emailPreferences.productUpdates,
      })
      .from(schema.emailPreferences)
      .where(eq(schema.emailPreferences.userId, user.id));

    if (prefs.length === 0) {
      // Return defaults if no preferences exist
      return c.json({
        marketingEmails: true,
        productUpdates: true,
      });
    }

    return c.json({
      marketingEmails: prefs[0].marketingEmails,
      productUpdates: prefs[0].productUpdates,
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
  const db = getDb();

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
    const now = new Date();

    // Upsert email preferences
    await db
      .insert(schema.emailPreferences)
      .values({
        userId: user.id,
        email: user.email,
        marketingEmails: marketing,
        productUpdates: updates,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.emailPreferences.userId,
        set: {
          marketingEmails: marketing,
          productUpdates: updates,
          updatedAt: now,
        },
      });

    // Return updated preferences
    const prefs = await db
      .select({
        marketingEmails: schema.emailPreferences.marketingEmails,
        productUpdates: schema.emailPreferences.productUpdates,
      })
      .from(schema.emailPreferences)
      .where(eq(schema.emailPreferences.userId, user.id));

    return c.json({
      marketingEmails: prefs[0].marketingEmails,
      productUpdates: prefs[0].productUpdates,
    });
  } catch (error) {
    console.error("Error updating email preferences:", error);
    return c.json({ error: "Failed to update email preferences" }, 500);
  }
});

export default profile;
