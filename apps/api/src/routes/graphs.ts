import { Hono } from "hono";
import { eq, and, count, sql } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { sessionMiddleware } from "../middleware/session";

type GraphPayload = {
  nodes: unknown[];
  edges: unknown[];
  groups?: unknown[];
};

const graphs = new Hono();

// All graph routes require authentication
graphs.use("/*", sessionMiddleware);

// List user's graphs
graphs.get("/", async (c) => {
  const user = c.get("user");
  const db = getDb();

  const result = await db
    .select({
      id: schema.graphs.id,
      title: schema.graphs.title,
      data: schema.graphs.data,
      updatedAt: schema.graphs.updatedAt,
      expiresAt: schema.graphs.expiresAt,
    })
    .from(schema.graphs)
    .where(eq(schema.graphs.ownerId, user.id))
    .orderBy(sql`${schema.graphs.updatedAt} DESC`);

  return c.json(result);
});

// Get single graph
graphs.get("/:id", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");
  const db = getDb();

  const result = await db
    .select({
      id: schema.graphs.id,
      title: schema.graphs.title,
      data: schema.graphs.data,
      updatedAt: schema.graphs.updatedAt,
      expiresAt: schema.graphs.expiresAt,
    })
    .from(schema.graphs)
    .where(and(eq(schema.graphs.id, graphId), eq(schema.graphs.ownerId, user.id)));

  if (result.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  return c.json(result[0]);
});

// Create graph
graphs.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ title: string; data: GraphPayload }>();
  const db = getDb();

  // Check quota
  const countResult = await db
    .select({ count: count() })
    .from(schema.graphs)
    .where(eq(schema.graphs.ownerId, user.id));
  const currentCount = countResult[0]?.count ?? 0;

  // Get max graphs from profile (default 20)
  const profileResult = await db
    .select({ maxGraphs: schema.profiles.maxGraphs })
    .from(schema.profiles)
    .where(eq(schema.profiles.id, user.id));
  const maxGraphs = profileResult.length > 0 ? (profileResult[0].maxGraphs ?? 20) : 20;

  if (currentCount >= maxGraphs) {
    return c.json(
      { error: `Graph limit reached (${maxGraphs} graphs maximum)` },
      403
    );
  }

  const now = new Date();
  const result = await db
    .insert(schema.graphs)
    .values({
      ownerId: user.id,
      title: body.title || "Untitled Graph",
      data: body.data || { nodes: [], edges: [], groups: [] },
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: schema.graphs.id,
      title: schema.graphs.title,
      data: schema.graphs.data,
      updatedAt: schema.graphs.updatedAt,
      expiresAt: schema.graphs.expiresAt,
    });

  return c.json(result[0], 201);
});

// Update graph
graphs.put("/:id", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");
  const body = await c.req.json<{ title: string; data: GraphPayload }>();
  const db = getDb();

  const result = await db
    .update(schema.graphs)
    .set({
      title: body.title,
      data: body.data,
      updatedAt: new Date(),
    })
    .where(and(eq(schema.graphs.id, graphId), eq(schema.graphs.ownerId, user.id)))
    .returning({
      id: schema.graphs.id,
      title: schema.graphs.title,
      data: schema.graphs.data,
      updatedAt: schema.graphs.updatedAt,
      expiresAt: schema.graphs.expiresAt,
    });

  if (result.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  return c.json(result[0]);
});

// Delete graph
graphs.delete("/:id", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");
  const db = getDb();

  const result = await db
    .delete(schema.graphs)
    .where(and(eq(schema.graphs.id, graphId), eq(schema.graphs.ownerId, user.id)))
    .returning({ id: schema.graphs.id });

  if (result.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  return c.json({ success: true });
});

// Create share link for a graph
graphs.post("/:id/share", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");
  const db = getDb();

  // Verify graph ownership
  const graphResult = await db
    .select({ id: schema.graphs.id })
    .from(schema.graphs)
    .where(and(eq(schema.graphs.id, graphId), eq(schema.graphs.ownerId, user.id)));

  if (graphResult.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  const now = new Date();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const result = await db
    .insert(schema.shareLinks)
    .values({
      graphId,
      createdBy: user.id,
      createdAt: now,
      expiresAt,
    })
    .returning({
      token: schema.shareLinks.token,
      expiresAt: schema.shareLinks.expiresAt,
    });

  return c.json(result[0], 201);
});

export default graphs;
