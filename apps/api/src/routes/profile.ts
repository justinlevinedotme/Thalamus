/**
 * @file profile.ts
 * @description API routes for user profile management. Handles GET/PATCH /profile for
 * viewing and updating user info (name, image), and GET/PATCH /profile/email-preferences
 * for managing email subscription settings. All routes require authentication.
 */

import { Hono } from "hono";
import { eq, and, desc } from "drizzle-orm";
import * as OTPAuth from "otpauth";
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
    let profileData: {
      plan?: string | null;
      maxGraphs?: number | null;
      retentionDays?: number | null;
    } = {};
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
    const now = new Date();

    // Get existing preferences first
    const existing = await db
      .select({
        marketingEmails: schema.emailPreferences.marketingEmails,
        productUpdates: schema.emailPreferences.productUpdates,
      })
      .from(schema.emailPreferences)
      .where(eq(schema.emailPreferences.userId, user.id));

    // Use provided values or fall back to existing values or defaults
    const marketing = marketingEmails ?? existing[0]?.marketingEmails ?? true;
    const updates = productUpdates ?? existing[0]?.productUpdates ?? true;

    if (existing.length > 0) {
      // Update existing preferences
      await db
        .update(schema.emailPreferences)
        .set({
          marketingEmails: marketing,
          productUpdates: updates,
          updatedAt: now,
        })
        .where(eq(schema.emailPreferences.userId, user.id));
    } else {
      // Insert new preferences
      await db.insert(schema.emailPreferences).values({
        userId: user.id,
        email: user.email,
        marketingEmails: marketing,
        productUpdates: updates,
        createdAt: now,
        updatedAt: now,
      });
    }

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

// Get existing deletion request (if any)
profile.get("/deletion-request", async (c) => {
  const user = c.get("user");
  const db = getDb();

  try {
    const requests = await db
      .select({
        id: schema.accountDeletionRequests.id,
        reason: schema.accountDeletionRequests.reason,
        status: schema.accountDeletionRequests.status,
        createdAt: schema.accountDeletionRequests.createdAt,
      })
      .from(schema.accountDeletionRequests)
      .where(eq(schema.accountDeletionRequests.userId, user.id))
      .orderBy(desc(schema.accountDeletionRequests.createdAt));

    // Return the most recent pending request if exists
    const pendingRequest = requests.find((r) => r.status === "pending");

    if (pendingRequest) {
      return c.json({
        hasPendingRequest: true,
        request: pendingRequest,
      });
    }

    return c.json({ hasPendingRequest: false });
  } catch (error) {
    console.error("Error fetching deletion request:", error);
    return c.json({ error: "Failed to fetch deletion request" }, 500);
  }
});

// Submit account deletion request and delete user content immediately
profile.post("/deletion-request", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const db = getDb();

  const { reason, additionalFeedback, totpCode } = body as {
    reason?: string;
    additionalFeedback?: string;
    totpCode?: string;
  };

  try {
    // Check if user has 2FA enabled
    if (user.twoFactorEnabled) {
      if (!totpCode) {
        return c.json({ error: "2FA code required", requires2FA: true }, 400);
      }

      // Get the user's TOTP secret from ba_two_factor table
      const twoFactorRecords = await db
        .select({ secret: schema.baTwoFactor.secret })
        .from(schema.baTwoFactor)
        .where(eq(schema.baTwoFactor.userId, user.id));

      if (twoFactorRecords.length === 0) {
        return c.json({ error: "2FA not configured properly" }, 400);
      }

      // Verify the TOTP code
      const totp = new OTPAuth.TOTP({
        issuer: "Thalamus",
        label: user.email,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: twoFactorRecords[0].secret,
      });

      const isValid = totp.validate({ token: totpCode, window: 1 }) !== null;
      if (!isValid) {
        return c.json({ error: "Invalid 2FA code" }, 400);
      }
    }

    // Combine reason and additional feedback
    const fullReason = [reason, additionalFeedback].filter(Boolean).join(" - ");

    // Check if there's already a pending request
    const existing = await db
      .select({ id: schema.accountDeletionRequests.id })
      .from(schema.accountDeletionRequests)
      .where(
        and(
          eq(schema.accountDeletionRequests.userId, user.id),
          eq(schema.accountDeletionRequests.status, "pending")
        )
      );

    if (existing.length > 0) {
      return c.json({ error: "You already have a pending deletion request" }, 400);
    }

    // Delete user's graphs immediately (share_links will cascade delete)
    await db.delete(schema.graphs).where(eq(schema.graphs.ownerId, user.id));

    // Delete email preferences
    await db.delete(schema.emailPreferences).where(eq(schema.emailPreferences.userId, user.id));

    // Create deletion request record (for audit trail and account deletion processing)
    const now = new Date();
    await db.insert(schema.accountDeletionRequests).values({
      userId: user.id,
      email: user.email,
      reason: fullReason?.trim() || null,
      status: "pending",
      createdAt: now,
    });

    return c.json({
      success: true,
      message: "Your content has been deleted. Your account will be fully removed within 30 days.",
    });
  } catch (error) {
    console.error("Error submitting deletion request:", error);
    return c.json({ error: "Failed to submit deletion request" }, 500);
  }
});

// Cancel account deletion request
profile.delete("/deletion-request", async (c) => {
  const user = c.get("user");
  const db = getDb();

  try {
    await db
      .update(schema.accountDeletionRequests)
      .set({ status: "cancelled" })
      .where(
        and(
          eq(schema.accountDeletionRequests.userId, user.id),
          eq(schema.accountDeletionRequests.status, "pending")
        )
      );

    return c.json({ success: true, message: "Deletion request cancelled" });
  } catch (error) {
    console.error("Error cancelling deletion request:", error);
    return c.json({ error: "Failed to cancel deletion request" }, 500);
  }
});

// Unlink an OAuth account
profile.post("/unlink-account", async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const db = getDb();

  const { provider } = body as { provider?: string };

  if (!provider) {
    return c.json({ error: "Provider is required" }, 400);
  }

  // Can't unlink credential (password) - use password reset instead
  if (provider === "credential") {
    return c.json({ error: "Cannot unlink password authentication" }, 400);
  }

  try {
    // Get all linked accounts for this user
    const accounts = await db
      .select({
        id: schema.baAccount.id,
        provider: schema.baAccount.providerId,
      })
      .from(schema.baAccount)
      .where(eq(schema.baAccount.userId, user.id));

    // Check if user has at least 2 auth methods before unlinking
    if (accounts.length <= 1) {
      return c.json({ error: "Cannot unlink your only authentication method" }, 400);
    }

    // Find the account to unlink
    const accountToUnlink = accounts.find((a) => a.provider === provider);
    if (!accountToUnlink) {
      return c.json({ error: "Account not found" }, 404);
    }

    // Delete the account
    await db
      .delete(schema.baAccount)
      .where(
        and(eq(schema.baAccount.id, accountToUnlink.id), eq(schema.baAccount.userId, user.id))
      );

    return c.json({ success: true, message: "Account unlinked" });
  } catch (error) {
    console.error("Error unlinking account:", error);
    return c.json({ error: "Failed to unlink account" }, 500);
  }
});

// Export user data (GDPR-style data export)
profile.get("/data-export", async (c) => {
  const user = c.get("user");
  const db = getDb();

  try {
    // Get profile data
    let profileData: {
      plan?: string | null;
      maxGraphs?: number | null;
      retentionDays?: number | null;
    } = {};
    try {
      const profiles = await db
        .select({
          plan: schema.profiles.plan,
          maxGraphs: schema.profiles.maxGraphs,
          retentionDays: schema.profiles.retentionDays,
        })
        .from(schema.profiles)
        .where(eq(schema.profiles.id, user.id));

      if (profiles.length > 0) {
        profileData = profiles[0];
      }
    } catch {
      // Continue with defaults if profiles table doesn't exist
    }

    // Get email preferences
    let emailPrefs: {
      marketingEmails?: boolean | null;
      productUpdates?: boolean | null;
    } = {};
    try {
      const prefs = await db
        .select({
          marketingEmails: schema.emailPreferences.marketingEmails,
          productUpdates: schema.emailPreferences.productUpdates,
        })
        .from(schema.emailPreferences)
        .where(eq(schema.emailPreferences.userId, user.id));

      if (prefs.length > 0) {
        emailPrefs = prefs[0];
      }
    } catch {
      // Continue with defaults
    }

    // Get linked accounts (exclude sensitive data like tokens)
    let linkedAccounts: Array<{ provider: string; linkedAt: string | null }> = [];
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
        linkedAt: a.createdAt?.toISOString() ?? null,
      }));
    } catch {
      // Continue without linked accounts
    }

    // Get all graphs with full data
    let graphs: Array<{
      id: string;
      title: string;
      data: unknown;
      createdAt: string | null;
      updatedAt: string | null;
      expiresAt: string | null;
    }> = [];
    try {
      const userGraphs = await db
        .select({
          id: schema.graphs.id,
          title: schema.graphs.title,
          data: schema.graphs.data,
          createdAt: schema.graphs.createdAt,
          updatedAt: schema.graphs.updatedAt,
          expiresAt: schema.graphs.expiresAt,
        })
        .from(schema.graphs)
        .where(eq(schema.graphs.ownerId, user.id))
        .orderBy(desc(schema.graphs.updatedAt));

      graphs = userGraphs.map((g) => ({
        id: g.id,
        title: g.title,
        data: g.data,
        createdAt: g.createdAt?.toISOString() ?? null,
        updatedAt: g.updatedAt?.toISOString() ?? null,
        expiresAt: g.expiresAt?.toISOString() ?? null,
      }));
    } catch {
      // Continue without graphs
    }

    // Get share links
    let shareLinks: Array<{
      id: string;
      token: string;
      graphId: string;
      createdAt: string | null;
      expiresAt: string | null;
    }> = [];
    try {
      const links = await db
        .select({
          id: schema.shareLinks.id,
          token: schema.shareLinks.token,
          graphId: schema.shareLinks.graphId,
          createdAt: schema.shareLinks.createdAt,
          expiresAt: schema.shareLinks.expiresAt,
        })
        .from(schema.shareLinks)
        .where(eq(schema.shareLinks.createdBy, user.id))
        .orderBy(desc(schema.shareLinks.createdAt));

      shareLinks = links.map((l) => ({
        id: l.id,
        token: l.token,
        graphId: l.graphId,
        createdAt: l.createdAt?.toISOString() ?? null,
        expiresAt: l.expiresAt?.toISOString() ?? null,
      }));
    } catch {
      // Continue without share links
    }

    // Build export payload
    const exportData = {
      exportedAt: new Date().toISOString(),
      profile: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        emailVerified: user.emailVerified,
        plan: profileData.plan || "free",
        maxGraphs: profileData.maxGraphs || 20,
        retentionDays: profileData.retentionDays || 365,
      },
      emailPreferences: {
        marketingEmails: emailPrefs.marketingEmails ?? true,
        productUpdates: emailPrefs.productUpdates ?? true,
      },
      linkedAccounts,
      graphs,
      shareLinks,
    };

    // Generate filename with current date
    const dateStr = new Date().toISOString().split("T")[0];
    const filename = `thalamus-data-export-${dateStr}.json`;

    return c.json(exportData, 200, {
      "Content-Disposition": `attachment; filename="${filename}"`,
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return c.json({ error: "Failed to export data" }, 500);
  }
});

export default profile;
