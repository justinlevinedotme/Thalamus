/**
 * @file admin.ts
 * @description Admin API routes for privileged operations. All routes require
 * X-Admin-Key header matching ADMIN_API_KEY environment variable.
 */

import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import type { Bindings } from "../index.worker";

const admin = new Hono<{ Bindings: Bindings }>();

// Admin auth middleware - validates X-Admin-Key header
admin.use("/*", async (c, next) => {
  const adminKey = c.req.header("X-Admin-Key");
  const expectedKey = c.env.ADMIN_API_KEY;

  if (!expectedKey) {
    return c.json({ error: "Admin API not configured" }, 503);
  }

  if (!adminKey || adminKey !== expectedKey) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});

// List pending deletion requests
admin.get("/deletion-requests", async (c) => {
  const db = getDb();

  const requests = await db
    .select({
      id: schema.accountDeletionRequests.id,
      userId: schema.accountDeletionRequests.userId,
      email: schema.accountDeletionRequests.email,
      reason: schema.accountDeletionRequests.reason,
      status: schema.accountDeletionRequests.status,
      createdAt: schema.accountDeletionRequests.createdAt,
      processedAt: schema.accountDeletionRequests.processedAt,
    })
    .from(schema.accountDeletionRequests)
    .orderBy(schema.accountDeletionRequests.createdAt);

  return c.json({
    requests: requests.map((r) => ({
      ...r,
      createdAt: r.createdAt?.toISOString() ?? null,
      processedAt: r.processedAt?.toISOString() ?? null,
    })),
  });
});

// Process a deletion request - fully deletes the user account
admin.post("/deletion-requests/:id/process", async (c) => {
  const requestId = c.req.param("id");
  const db = getDb();

  // Get the deletion request
  const requests = await db
    .select({
      id: schema.accountDeletionRequests.id,
      userId: schema.accountDeletionRequests.userId,
      email: schema.accountDeletionRequests.email,
      status: schema.accountDeletionRequests.status,
    })
    .from(schema.accountDeletionRequests)
    .where(eq(schema.accountDeletionRequests.id, requestId));

  if (requests.length === 0) {
    return c.json({ error: "Deletion request not found" }, 404);
  }

  const request = requests[0];

  if (request.status !== "pending") {
    return c.json({ error: `Request already ${request.status}`, status: request.status }, 400);
  }

  if (!request.userId) {
    // User already deleted somehow, just mark as processed
    await db
      .update(schema.accountDeletionRequests)
      .set({
        status: "processed",
        processedAt: new Date(),
      })
      .where(eq(schema.accountDeletionRequests.id, requestId));

    return c.json({
      success: true,
      message: "Request marked as processed (user already deleted)",
    });
  }

  try {
    // Delete the user - cascades will handle:
    // - ba_session (cascade)
    // - ba_account (cascade)
    // - ba_two_factor (cascade)
    // - graphs (cascade) -> share_links (cascade)
    // - profiles (cascade)
    // - email_preferences (cascade)
    // - saved_nodes (cascade)
    // - account_deletion_requests.user_id -> SET NULL (preserves record)
    await db.delete(schema.baUser).where(eq(schema.baUser.id, request.userId));

    // Mark request as processed
    await db
      .update(schema.accountDeletionRequests)
      .set({
        status: "processed",
        processedAt: new Date(),
      })
      .where(eq(schema.accountDeletionRequests.id, requestId));

    return c.json({
      success: true,
      message: "User account deleted and request processed",
      email: request.email,
    });
  } catch (error) {
    console.error("Error processing deletion request:", error);
    return c.json({ error: "Failed to process deletion request" }, 500);
  }
});

export default admin;
