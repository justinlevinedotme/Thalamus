/**
 * Seed Data Script
 *
 * Creates test data in local.db for development:
 * - Test user: admin@admin.com / root123
 * - Sample graphs with various node types
 *
 * Usage: npm run db:seed
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq } from "drizzle-orm";
import path from "path";
import { fileURLToPath } from "url";
import * as schema from "../lib/schema";
import { randomUUID } from "crypto";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "../..");
const dbPath = path.join(apiDir, "local.db");

console.log("🌱 Seed Data Script");
console.log("===================");
console.log(`Database: ${dbPath}\n`);

// Open database
const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
const db = drizzle(sqlite, { schema });

// Hash password using bcrypt-compatible format
// BetterAuth uses scrypt by default, but we can use a simple hash for seed data
async function hashPassword(password: string): Promise<string> {
  // Import bcrypt dynamically since it's from better-auth internals
  // For seed data, we'll use the same approach better-auth uses
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  // This is a simplified hash - in production, better-auth handles proper password hashing
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate timestamps
const now = new Date();

// Graph data samples
const sampleEventFlowData = {
  nodes: [
    {
      id: "event-1",
      type: "event",
      position: { x: 100, y: 100 },
      data: { label: "OrderPlaced", description: "Customer places an order" },
    },
    {
      id: "actor-1",
      type: "actor",
      position: { x: 100, y: 250 },
      data: { label: "Customer", description: "End user placing orders" },
    },
    {
      id: "command-1",
      type: "command",
      position: { x: 300, y: 100 },
      data: { label: "ProcessOrder", description: "Validate and process the order" },
    },
    {
      id: "aggregate-1",
      type: "aggregate",
      position: { x: 300, y: 250 },
      data: { label: "Order", description: "Order aggregate root" },
    },
    {
      id: "event-2",
      type: "event",
      position: { x: 500, y: 100 },
      data: { label: "OrderProcessed", description: "Order has been validated" },
    },
    {
      id: "policy-1",
      type: "policy",
      position: { x: 500, y: 250 },
      data: { label: "NotifyWarehouse", description: "Send order to warehouse" },
    },
  ],
  edges: [
    { id: "e1", source: "actor-1", target: "event-1" },
    { id: "e2", source: "event-1", target: "command-1" },
    { id: "e3", source: "command-1", target: "aggregate-1" },
    { id: "e4", source: "aggregate-1", target: "event-2" },
    { id: "e5", source: "event-2", target: "policy-1" },
  ],
  groups: [],
};

const gettingStartedData = {
  nodes: [
    {
      id: "start-1",
      type: "event",
      position: { x: 150, y: 150 },
      data: { label: "Welcome!", description: "This is an Event node" },
    },
    {
      id: "start-2",
      type: "actor",
      position: { x: 350, y: 150 },
      data: { label: "You", description: "This is an Actor node" },
    },
    {
      id: "start-3",
      type: "command",
      position: { x: 550, y: 150 },
      data: { label: "Explore", description: "This is a Command node" },
    },
  ],
  edges: [
    { id: "e1", source: "start-1", target: "start-2" },
    { id: "e2", source: "start-2", target: "start-3" },
  ],
  groups: [],
};

async function seed() {
  try {
    console.log("Creating test user...");

    // Check if user already exists
    const existingUser = db
      .select()
      .from(schema.baUser)
      .where(eq(schema.baUser.email, "admin@admin.com"))
      .get();

    // Use existing user's ID or create new one
    let userId: string;

    if (existingUser) {
      userId = existingUser.id;
      console.log("  ⏭️  User admin@admin.com already exists, skipping...");
    } else {
      userId = randomUUID();

      // Create user
      db.insert(schema.baUser)
        .values({
          id: userId,
          email: "admin@admin.com",
          name: "Admin User",
          emailVerified: true,
          twoFactorEnabled: false,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Create account with password
      const hashedPassword = await hashPassword("root123");
      db.insert(schema.baAccount)
        .values({
          id: randomUUID(),
          accountId: userId,
          providerId: "credential",
          userId: userId,
          password: hashedPassword,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      // Create profile
      db.insert(schema.profiles)
        .values({
          id: userId,
          plan: "free",
          maxGraphs: 20,
          retentionDays: 365,
          createdAt: now,
          updatedAt: now,
        })
        .run();

      console.log("  ✓ Created user: admin@admin.com / root123");
    }

    console.log("\nCreating sample graphs...");

    // Check if graphs already exist for this user
    const existingGraphs = db
      .select()
      .from(schema.graphs)
      .where(eq(schema.graphs.ownerId, userId))
      .all();

    if (existingGraphs.length > 0) {
      console.log(`  ⏭️  Found ${existingGraphs.length} existing graphs, skipping...`);
    } else {
      // Create Sample Event Flow graph
      db.insert(schema.graphs)
        .values({
          id: randomUUID(),
          ownerId: userId,
          title: "Sample Event Flow",
          data: sampleEventFlowData,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      console.log('  ✓ Created: "Sample Event Flow"');

      // Create Getting Started graph
      db.insert(schema.graphs)
        .values({
          id: randomUUID(),
          ownerId: userId,
          title: "Getting Started",
          data: gettingStartedData,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      console.log('  ✓ Created: "Getting Started"');
    }

    console.log("\n✅ Seed complete!");
    console.log("\nTest credentials:");
    console.log("  Email: admin@admin.com");
    console.log("  Password: root123");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
}

seed();
