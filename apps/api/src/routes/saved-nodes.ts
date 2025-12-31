/**
 * @file saved-nodes.ts
 * @description API routes for saved node templates. Provides CRUD operations for user-created
 * node templates with per-plan quotas (free: 20, plus: 50). All routes require authentication.
 */

import { Hono } from "hono";
import { eq, and, count, desc } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { sessionMiddleware } from "../middleware/session";

const savedNodes = new Hono();

// All saved-nodes routes require authentication
savedNodes.use("/*", sessionMiddleware);

// Get max saved nodes based on plan
const getMaxSavedNodes = (plan: string | null | undefined): number => {
  return plan === "plus" ? 50 : 20;
};

// List user's saved nodes with pagination
savedNodes.get("/", async (c) => {
  const user = c.get("user");
  const db = getDb();

  // Parse pagination params
  const limit = Math.min(Math.max(Number(c.req.query("limit")) || 50, 1), 100);
  const offset = Math.max(Number(c.req.query("offset")) || 0, 0);

  // Get user's plan for quota info
  let plan: string | null = "free";
  try {
    const profileResult = await db
      .select({ plan: schema.profiles.plan })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, user.id));
    if (profileResult.length > 0) {
      plan = profileResult[0].plan;
    }
  } catch {
    // Continue with default plan
  }

  // Run data query and count in parallel
  const [result, countResult] = await Promise.all([
    db
      .select({
        id: schema.savedNodes.id,
        name: schema.savedNodes.name,
        description: schema.savedNodes.description,
        layout: schema.savedNodes.layout,
        createdAt: schema.savedNodes.createdAt,
        updatedAt: schema.savedNodes.updatedAt,
      })
      .from(schema.savedNodes)
      .where(eq(schema.savedNodes.userId, user.id))
      .orderBy(desc(schema.savedNodes.updatedAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ total: count() })
      .from(schema.savedNodes)
      .where(eq(schema.savedNodes.userId, user.id)),
  ]);

  const total = countResult[0]?.total ?? 0;
  const maxNodes = getMaxSavedNodes(plan);

  return c.json({
    items: result.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      layout: item.layout,
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    })),
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + result.length < total,
    },
    quota: {
      used: total,
      max: maxNodes,
      plan: plan || "free",
    },
  });
});

// Get single saved node
savedNodes.get("/:id", async (c) => {
  const user = c.get("user");
  const nodeId = c.req.param("id");
  const db = getDb();

  const result = await db
    .select({
      id: schema.savedNodes.id,
      name: schema.savedNodes.name,
      description: schema.savedNodes.description,
      layout: schema.savedNodes.layout,
      createdAt: schema.savedNodes.createdAt,
      updatedAt: schema.savedNodes.updatedAt,
    })
    .from(schema.savedNodes)
    .where(and(eq(schema.savedNodes.id, nodeId), eq(schema.savedNodes.userId, user.id)));

  if (result.length === 0) {
    return c.json({ error: "Saved node not found" }, 404);
  }

  const item = result[0];
  return c.json({
    id: item.id,
    name: item.name,
    description: item.description,
    layout: item.layout,
    createdAt: item.createdAt?.toISOString() ?? null,
    updatedAt: item.updatedAt?.toISOString() ?? null,
  });
});

// Create saved node
savedNodes.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{
    name: string;
    description?: string;
    layout: Record<string, unknown>;
  }>();
  const db = getDb();

  // Validate required fields
  if (!body.name || !body.layout) {
    return c.json({ error: "Name and layout are required" }, 400);
  }

  // Check quota
  const [countResult, profileResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(schema.savedNodes)
      .where(eq(schema.savedNodes.userId, user.id)),
    db
      .select({ plan: schema.profiles.plan })
      .from(schema.profiles)
      .where(eq(schema.profiles.id, user.id)),
  ]);

  const currentCount = countResult[0]?.count ?? 0;
  const plan = profileResult.length > 0 ? profileResult[0].plan : "free";
  const maxNodes = getMaxSavedNodes(plan);

  if (currentCount >= maxNodes) {
    return c.json(
      {
        error: `Saved node limit reached (${maxNodes} maximum)`,
        quota: { used: currentCount, max: maxNodes, plan: plan || "free" },
      },
      403
    );
  }

  const now = new Date();
  const result = await db
    .insert(schema.savedNodes)
    .values({
      userId: user.id,
      name: body.name,
      description: body.description || null,
      layout: body.layout,
      createdAt: now,
      updatedAt: now,
    })
    .returning({
      id: schema.savedNodes.id,
      name: schema.savedNodes.name,
      description: schema.savedNodes.description,
      layout: schema.savedNodes.layout,
      createdAt: schema.savedNodes.createdAt,
      updatedAt: schema.savedNodes.updatedAt,
    });

  const item = result[0];
  return c.json(
    {
      id: item.id,
      name: item.name,
      description: item.description,
      layout: item.layout,
      createdAt: item.createdAt?.toISOString() ?? null,
      updatedAt: item.updatedAt?.toISOString() ?? null,
    },
    201
  );
});

// Update saved node
savedNodes.patch("/:id", async (c) => {
  const user = c.get("user");
  const nodeId = c.req.param("id");
  const body = await c.req.json<{
    name?: string;
    description?: string;
    layout?: Record<string, unknown>;
  }>();
  const db = getDb();

  // Check ownership
  const existing = await db
    .select({ id: schema.savedNodes.id })
    .from(schema.savedNodes)
    .where(and(eq(schema.savedNodes.id, nodeId), eq(schema.savedNodes.userId, user.id)));

  if (existing.length === 0) {
    return c.json({ error: "Saved node not found" }, 404);
  }

  // Build update object
  const updates: Record<string, unknown> = {
    updatedAt: new Date(),
  };
  if (body.name !== undefined) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.layout !== undefined) updates.layout = body.layout;

  const result = await db
    .update(schema.savedNodes)
    .set(updates)
    .where(and(eq(schema.savedNodes.id, nodeId), eq(schema.savedNodes.userId, user.id)))
    .returning({
      id: schema.savedNodes.id,
      name: schema.savedNodes.name,
      description: schema.savedNodes.description,
      layout: schema.savedNodes.layout,
      createdAt: schema.savedNodes.createdAt,
      updatedAt: schema.savedNodes.updatedAt,
    });

  const item = result[0];
  return c.json({
    id: item.id,
    name: item.name,
    description: item.description,
    layout: item.layout,
    createdAt: item.createdAt?.toISOString() ?? null,
    updatedAt: item.updatedAt?.toISOString() ?? null,
  });
});

// Delete saved node
savedNodes.delete("/:id", async (c) => {
  const user = c.get("user");
  const nodeId = c.req.param("id");
  const db = getDb();

  // Check ownership
  const existing = await db
    .select({ id: schema.savedNodes.id })
    .from(schema.savedNodes)
    .where(and(eq(schema.savedNodes.id, nodeId), eq(schema.savedNodes.userId, user.id)));

  if (existing.length === 0) {
    return c.json({ error: "Saved node not found" }, 404);
  }

  await db
    .delete(schema.savedNodes)
    .where(and(eq(schema.savedNodes.id, nodeId), eq(schema.savedNodes.userId, user.id)));

  return c.json({ success: true, message: "Saved node deleted" });
});

export default savedNodes;
