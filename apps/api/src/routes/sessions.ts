/**
 * @file sessions.ts
 * @description API routes for session management. Provides endpoints to list
 * all active sessions for the authenticated user and to revoke (delete) specific
 * sessions. All routes require authentication.
 */

import { Hono } from "hono";
import { eq, and, gt, ne } from "drizzle-orm";
import { getDb, schema } from "../lib/db";
import { sessionMiddleware } from "../middleware/session";

const sessions = new Hono();

// All session routes require authentication
sessions.use("/*", sessionMiddleware);

// Simple in-memory cache for IP geolocation (to avoid hitting rate limits)
const geoCache = new Map<string, { location: string; timestamp: number }>();
const GEO_CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

async function getLocationFromIP(ip: string | null): Promise<string | null> {
  if (!ip) return null;

  // Skip private/local IPs
  if (
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.") ||
    ip.startsWith("172.16.")
  ) {
    return "Local Network";
  }

  // Check cache
  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.timestamp < GEO_CACHE_TTL) {
    return cached.location;
  }

  try {
    // Use ip-api.com (free, no API key required, 45 requests/minute limit)
    const response = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,regionName,country`
    );
    if (!response.ok) return null;

    const data = (await response.json()) as {
      status: string;
      city?: string;
      regionName?: string;
      country?: string;
    };

    if (data.status !== "success") return null;

    const parts = [data.city, data.regionName, data.country].filter(Boolean);
    const location = parts.length > 0 ? parts.join(", ") : null;

    // Cache the result
    if (location) {
      geoCache.set(ip, { location, timestamp: Date.now() });
    }

    return location;
  } catch {
    return null;
  }
}

// List all active sessions for the authenticated user
sessions.get("/", async (c) => {
  const user = c.get("user");
  const session = c.get("session");
  const db = getDb();

  try {
    const now = new Date();
    const activeSessions = await db
      .select({
        id: schema.baSession.id,
        createdAt: schema.baSession.createdAt,
        updatedAt: schema.baSession.updatedAt,
        expiresAt: schema.baSession.expiresAt,
        ipAddress: schema.baSession.ipAddress,
        userAgent: schema.baSession.userAgent,
      })
      .from(schema.baSession)
      .where(and(eq(schema.baSession.userId, user.id), gt(schema.baSession.expiresAt, now)))
      .orderBy(schema.baSession.createdAt);

    // Fetch locations for all unique IPs in parallel
    const uniqueIPs = [...new Set(activeSessions.map((s) => s.ipAddress).filter(Boolean))];
    const locationMap = new Map<string, string | null>();

    await Promise.all(
      uniqueIPs.map(async (ip) => {
        if (ip) {
          const location = await getLocationFromIP(ip);
          locationMap.set(ip, location);
        }
      })
    );

    // Build response with locations
    const sessionsWithDetails = activeSessions.map((s) => ({
      id: s.id,
      createdAt: s.createdAt?.toISOString() ?? null,
      updatedAt: s.updatedAt?.toISOString() ?? null,
      expiresAt: s.expiresAt?.toISOString() ?? null,
      ipAddress: s.ipAddress,
      location: s.ipAddress ? (locationMap.get(s.ipAddress) ?? null) : null,
      userAgent: s.userAgent,
      isCurrent: s.id === session.id,
    }));

    return c.json(sessionsWithDetails);
  } catch (error) {
    console.error("Error listing sessions:", error);
    return c.json({ error: "Failed to list sessions" }, 500);
  }
});

// Revoke (delete) a specific session
sessions.delete("/:id", async (c) => {
  const user = c.get("user");
  const currentSession = c.get("session");
  const sessionId = c.req.param("id");
  const db = getDb();

  // Prevent revoking the current session (use signOut instead)
  if (sessionId === currentSession.id) {
    return c.json({ error: "Cannot revoke current session. Use sign out instead." }, 400);
  }

  try {
    // Verify the session belongs to the user before deleting
    const existing = await db
      .select({ id: schema.baSession.id })
      .from(schema.baSession)
      .where(and(eq(schema.baSession.id, sessionId), eq(schema.baSession.userId, user.id)));

    if (existing.length === 0) {
      return c.json({ error: "Session not found" }, 404);
    }

    await db
      .delete(schema.baSession)
      .where(and(eq(schema.baSession.id, sessionId), eq(schema.baSession.userId, user.id)));

    return c.json({ success: true, message: "Session revoked" });
  } catch (error) {
    console.error("Error revoking session:", error);
    return c.json({ error: "Failed to revoke session" }, 500);
  }
});

// Revoke all sessions except the current one
sessions.delete("/", async (c) => {
  const user = c.get("user");
  const currentSession = c.get("session");
  const db = getDb();

  try {
    await db
      .delete(schema.baSession)
      .where(and(eq(schema.baSession.userId, user.id), ne(schema.baSession.id, currentSession.id)));

    return c.json({
      success: true,
      message: "All other sessions revoked",
    });
  } catch (error) {
    console.error("Error revoking all sessions:", error);
    return c.json({ error: "Failed to revoke sessions" }, 500);
  }
});

export default sessions;
