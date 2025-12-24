import { sql } from "../src/lib/db";

async function runMigration() {
  console.log("Running incremental migration...\n");

  try {
    // Add two_factor_enabled column if missing
    console.log("1. Adding two_factor_enabled column to ba_user...");
    await sql`
      ALTER TABLE public.ba_user
      ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE
    `;
    console.log("   Done.\n");

    // Create ba_two_factor table if not exists
    console.log("2. Creating ba_two_factor table...");
    await sql`
      CREATE TABLE IF NOT EXISTS public.ba_two_factor (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES public.ba_user(id) ON DELETE CASCADE,
        secret TEXT NOT NULL,
        backup_codes TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log("   Done.\n");

    // Create profiles table if not exists
    console.log("3. Creating profiles table...");
    await sql`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id TEXT PRIMARY KEY REFERENCES public.ba_user(id) ON DELETE CASCADE,
        plan TEXT NOT NULL DEFAULT 'free',
        max_graphs INTEGER NOT NULL DEFAULT 20,
        retention_days INTEGER NOT NULL DEFAULT 365,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    console.log("   Done.\n");

    // Disable RLS on new tables
    console.log("4. Disabling RLS on tables...");
    await sql`ALTER TABLE public.ba_two_factor DISABLE ROW LEVEL SECURITY`;
    await sql`ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY`;
    console.log("   Done.\n");

    // Create updated_at trigger for profiles if not exists
    console.log("5. Creating triggers...");
    await sql`
      CREATE OR REPLACE FUNCTION public.set_updated_at()
      RETURNS TRIGGER
      LANGUAGE plpgsql
      AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$
    `;

    // Drop and recreate trigger to avoid conflicts
    await sql`DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles`;
    await sql`
      CREATE TRIGGER set_profiles_updated_at
      BEFORE UPDATE ON public.profiles
      FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at()
    `;
    console.log("   Done.\n");

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

runMigration();
