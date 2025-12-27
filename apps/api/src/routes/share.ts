import { Hono } from "hono";
import { eq, and, gt } from "drizzle-orm";
import { getDb, schema } from "../lib/db";

const share = new Hono();

// Get shared graph by token (public - no auth required)
share.get("/:token", async (c) => {
  const token = c.req.param("token");
  const db = getDb();

  const result = await db
    .select({
      id: schema.graphs.id,
      title: schema.graphs.title,
      data: schema.graphs.data,
      updatedAt: schema.graphs.updatedAt,
    })
    .from(schema.shareLinks)
    .innerJoin(schema.graphs, eq(schema.graphs.id, schema.shareLinks.graphId))
    .where(and(eq(schema.shareLinks.token, token), gt(schema.shareLinks.expiresAt, new Date())));

  if (result.length === 0) {
    return c.json({ error: "Share link not found or expired" }, 404);
  }

  return c.json(result[0]);
});

export default share;
