/**
 * Local Migration Runner
 *
 * Applies SQL migrations from the migrations/ directory to local.db
 * Tracks applied migrations in a _migrations table to prevent re-running.
 *
 * Usage: npm run db:migrate:local
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const apiDir = path.resolve(__dirname, "../..");
const dbPath = path.join(apiDir, "local.db");
const migrationsDir = path.join(apiDir, "migrations");

console.log("🗄️  Local Migration Runner");
console.log("==========================");
console.log(`Database: ${dbPath}`);
console.log(`Migrations: ${migrationsDir}\n`);

// Check if migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  console.error("❌ Migrations directory not found:", migrationsDir);
  process.exit(1);
}

// Open or create database
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Create migrations tracking table
db.exec(`
  CREATE TABLE IF NOT EXISTS _migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    applied_at TEXT DEFAULT (datetime('now'))
  )
`);

// Get already applied migrations
const applied = db
  .prepare("SELECT name FROM _migrations")
  .all()
  .map((row) => (row as { name: string }).name);

console.log(`✓ Already applied: ${applied.length} migration(s)`);

// Get all migration files, sorted
const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

console.log(`📁 Found: ${migrationFiles.length} migration file(s)\n`);

let appliedCount = 0;

for (const file of migrationFiles) {
  if (applied.includes(file)) {
    console.log(`⏭️  Skipping (already applied): ${file}`);
    continue;
  }

  console.log(`📝 Applying: ${file}`);
  const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");

  try {
    db.exec(sql);
    db.prepare("INSERT INTO _migrations (name) VALUES (?)").run(file);
    console.log(`   ✓ Applied successfully`);
    appliedCount++;
  } catch (error) {
    console.error(`   ✗ Failed to apply:`, error);
    db.close();
    process.exit(1);
  }
}

db.close();

console.log(`\n✅ Done! Applied ${appliedCount} new migration(s).`);
