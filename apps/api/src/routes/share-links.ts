/**
 * @file share-links.ts
 * @description API routes for managing share links. Provides endpoints to list
 * all share links for the authenticated user and to revoke (delete) specific links.
 * All routes require authentication.
 */

import { Hono } from "hono";
import { eq, and } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { sessionMiddleware } from "../middleware/session";

const shareLinksRoute = new Hono();

// All share-links routes require authentication
shareLinksRoute.use("/*", sessionMiddleware);

// List all share links for the authenticated user
shareLinksRoute.get("/", async (c) => {
  const user = c.get("user");
  const db = getDb();

  try {
    const links = await db
      .select({
        id: schema.shareLinks.id,
        token: schema.shareLinks.token,
        graphId: schema.shareLinks.graphId,
        graphTitle: schema.graphs.title,
        expiresAt: schema.shareLinks.expiresAt,
        createdAt: schema.shareLinks.createdAt,
      })
      .from(schema.shareLinks)
      .innerJoin(schema.graphs, eq(schema.graphs.id, schema.shareLinks.graphId))
      .where(eq(schema.shareLinks.createdBy, user.id))
      .orderBy(schema.shareLinks.createdAt);

    return c.json(
      links.map((link) => ({
        id: link.id,
        token: link.token,
        graphId: link.graphId,
        graphTitle: link.graphTitle,
        expiresAt: link.expiresAt?.toISOString() ?? null,
        createdAt: link.createdAt?.toISOString() ?? null,
      }))
    );
  } catch (error) {
    console.error("Error listing share links:", error);
    return c.json({ error: "Failed to list share links" }, 500);
  }
});

// Revoke (delete) a share link
shareLinksRoute.delete("/:id", async (c) => {
  const user = c.get("user");
  const linkId = c.req.param("id");
  const db = getDb();

  try {
    // Verify the link belongs to the user before deleting
    const existing = await db
      .select({ id: schema.shareLinks.id })
      .from(schema.shareLinks)
      .where(and(eq(schema.shareLinks.id, linkId), eq(schema.shareLinks.createdBy, user.id)));

    if (existing.length === 0) {
      return c.json({ error: "Share link not found" }, 404);
    }

    await db
      .delete(schema.shareLinks)
      .where(and(eq(schema.shareLinks.id, linkId), eq(schema.shareLinks.createdBy, user.id)));

    return c.json({ success: true, message: "Share link revoked" });
  } catch (error) {
    console.error("Error revoking share link:", error);
    return c.json({ error: "Failed to revoke share link" }, 500);
  }
});

export default shareLinksRoute;
