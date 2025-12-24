import { Hono } from "hono";
import { sql } from "../lib/db";

const share = new Hono();

// Get shared graph by token (public - no auth required)
share.get("/:token", async (c) => {
  const token = c.req.param("token");

  const result = await sql`
    SELECT g.id, g.title, g.data, g.updated_at
    FROM share_links s
    JOIN graphs g ON g.id = s.graph_id
    WHERE s.token = ${token}
      AND s.expires_at > NOW()
  `;

  if (result.length === 0) {
    return c.json({ error: "Share link not found or expired" }, 404);
  }

  return c.json(result[0]);
});

export default share;
