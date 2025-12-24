import { Hono } from "hono";
import { sql } from "../lib/db";
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

  const result = await sql`
    SELECT id, title, data, updated_at, expires_at
    FROM graphs
    WHERE owner_id = ${user.id}
    ORDER BY updated_at DESC
  `;

  return c.json(result);
});

// Get single graph
graphs.get("/:id", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");

  const result = await sql`
    SELECT id, title, data, updated_at, expires_at
    FROM graphs
    WHERE id = ${graphId} AND owner_id = ${user.id}
  `;

  if (result.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  return c.json(result[0]);
});

// Create graph
graphs.post("/", async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ title: string; data: GraphPayload }>();

  // Check quota
  const countResult = await sql`
    SELECT COUNT(*) as count FROM graphs WHERE owner_id = ${user.id}
  `;
  const currentCount = Number(countResult[0].count);

  // Get max graphs from profile (default 20)
  const profileResult = await sql`
    SELECT max_graphs FROM profiles WHERE id = ${user.id}
  `;
  const maxGraphs = profileResult.length > 0 ? profileResult[0].max_graphs : 20;

  if (currentCount >= maxGraphs) {
    return c.json(
      { error: `Graph limit reached (${maxGraphs} graphs maximum)` },
      403
    );
  }

  const result = await sql`
    INSERT INTO graphs (owner_id, title, data)
    VALUES (${user.id}, ${body.title || "Untitled Graph"}, ${JSON.stringify(body.data || { nodes: [], edges: [], groups: [] })})
    RETURNING id, title, data, updated_at, expires_at
  `;

  return c.json(result[0], 201);
});

// Update graph
graphs.put("/:id", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");
  const body = await c.req.json<{ title: string; data: GraphPayload }>();

  const result = await sql`
    UPDATE graphs
    SET title = ${body.title}, data = ${JSON.stringify(body.data)}, updated_at = NOW()
    WHERE id = ${graphId} AND owner_id = ${user.id}
    RETURNING id, title, data, updated_at, expires_at
  `;

  if (result.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  return c.json(result[0]);
});

// Delete graph
graphs.delete("/:id", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");

  const result = await sql`
    DELETE FROM graphs
    WHERE id = ${graphId} AND owner_id = ${user.id}
    RETURNING id
  `;

  if (result.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  return c.json({ success: true });
});

// Create share link for a graph
graphs.post("/:id/share", async (c) => {
  const user = c.get("user");
  const graphId = c.req.param("id");

  // Verify graph ownership
  const graphResult = await sql`
    SELECT id FROM graphs WHERE id = ${graphId} AND owner_id = ${user.id}
  `;

  if (graphResult.length === 0) {
    return c.json({ error: "Graph not found" }, 404);
  }

  const result = await sql`
    INSERT INTO share_links (graph_id, created_by)
    VALUES (${graphId}, ${user.id})
    RETURNING token, expires_at
  `;

  return c.json(result[0], 201);
});

export default graphs;
