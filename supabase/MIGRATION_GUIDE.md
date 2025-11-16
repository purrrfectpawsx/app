# Database Migration Guide

This guide provides comprehensive instructions for managing database migrations in the PetLog project.

## Overview

PetLog uses manual SQL migrations executed via the Supabase SQL Editor. While automated CLI migration tools exist, we use manual application for better control and visibility during MVP development.

## Quick Reference

### NPM Scripts

```bash
# View migration status
npm run db:status

# Get migration instructions
npm run db:migrate

# Create new migration
npm run db:migrate:new

# Reset database (caution!)
npm run db:reset
```

## Migration Workflow

### 1. Creating a New Migration

When implementing a new story that requires database changes:

**Step 1: Create Migration File**

```bash
# Create file following naming convention
# Format: supabase/migrations/00X_description.sql
# Example: supabase/migrations/004_create_health_records_table.sql
```

**Step 2: Write Migration SQL**

```sql
-- Migration: Create health_records table
-- Date: 2025-11-15
-- Story: 3.1
-- Description: Establishes health records database schema for Epic 3

-- Create table with idempotent check
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccine', 'medication', 'vet_visit', 'symptom', 'weight_check')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  vaccine_data JSONB DEFAULT '{}',
  medication_data JSONB DEFAULT '{}',
  vet_visit_data JSONB DEFAULT '{}',
  symptom_data JSONB DEFAULT '{}',
  weight_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_pet_date ON health_records(pet_id, date DESC);

-- Enable RLS
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own health records"
  ON health_records FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create health records for their own pets"
  ON health_records FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own health records"
  ON health_records FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own health records"
  ON health_records FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Add table comments for documentation
COMMENT ON TABLE health_records IS 'Stores pet health records with type-specific data in JSON columns';

-- ============================================================================
-- ROLLBACK SCRIPT (Keep at bottom of file, commented out)
-- ============================================================================
-- Run this ONLY if you need to undo this migration
--
-- DROP POLICY IF EXISTS "Users can view their own health records" ON health_records;
-- DROP POLICY IF EXISTS "Users can create health records for their own pets" ON health_records;
-- DROP POLICY IF EXISTS "Users can update their own health records" ON health_records;
-- DROP POLICY IF EXISTS "Users can delete their own health records" ON health_records;
-- DROP INDEX IF EXISTS idx_health_records_pet_id;
-- DROP INDEX IF EXISTS idx_health_records_user_id;
-- DROP INDEX IF EXISTS idx_health_records_pet_date;
-- DROP TABLE IF EXISTS health_records CASCADE;
```

**Step 3: Test on Test Database (Recommended)**

Before applying to production:

1. Create or use a test Supabase project
2. Apply migration to test project
3. Verify tables, indexes, and RLS policies created correctly
4. Test rollback script
5. Test application functionality

### 2. Applying Migrations

**Step 1: Open Supabase SQL Editor**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in left sidebar
4. Click **New Query**

**Step 2: Copy Migration Content**

```bash
# Copy migration file content
cat supabase/migrations/004_create_health_records_table.sql | clip  # Windows
cat supabase/migrations/004_create_health_records_table.sql | pbcopy  # macOS
cat supabase/migrations/004_create_health_records_table.sql | xclip  # Linux
```

**Step 3: Execute Migration**

1. Paste migration SQL into SQL Editor
2. Click **Run** button (or Cmd/Ctrl + Enter)
3. Verify success message: "Success. No rows returned" (for DDL)
4. Check "Messages" tab for any warnings

**Step 4: Verify Migration**

Check each component created:

```sql
-- Verify table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'health_records';

-- Verify columns
SELECT column_name, data_type FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'health_records';

-- Verify indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'health_records';

-- Verify RLS enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'health_records';

-- Verify policies
SELECT policyname FROM pg_policies
WHERE tablename = 'health_records';
```

**Step 5: Update Migration Tracking**

Update `supabase/SETUP.md` with the new migration:

```markdown
4. `migrations/004_create_health_records_table.sql` - Creates health_records table for Epic 3
```

### 3. Rolling Back Migrations

If a migration causes issues:

**Step 1: Extract Rollback SQL**

The rollback script is at the bottom of each migration file (commented section).

**Step 2: Create Rollback Script**

```bash
# Create rollback file
touch supabase/rollback/rollback_004.sql
```

**Step 3: Add Rollback SQL**

Copy the commented rollback section from the migration file into the rollback script.

**Step 4: Apply Rollback**

1. Open Supabase SQL Editor
2. Paste rollback SQL
3. Execute
4. Verify rollback successful

**Step 5: Document Rollback**

Update migration tracking to indicate migration was rolled back.

## Migration Best Practices

### 1. Idempotent Migrations

Always use `IF NOT EXISTS` / `IF EXISTS` checks:

```sql
-- Good: Idempotent
CREATE TABLE IF NOT EXISTS pets (...);
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON pets(user_id);
DROP TABLE IF EXISTS old_table;

-- Bad: Not idempotent (fails if run twice)
CREATE TABLE pets (...);
CREATE INDEX idx_pets_user_id ON pets(user_id);
DROP TABLE old_table;
```

### 2. Foreign Key Constraints

Always specify ON DELETE behavior:

```sql
-- Good: Explicit cascade behavior
pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE

-- Bad: Undefined behavior on delete
pet_id UUID NOT NULL REFERENCES pets(id)
```

### 3. RLS Policies

Always enable RLS and create policies:

```sql
-- Enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Create policies for all operations
CREATE POLICY "select_policy" ON pets FOR SELECT USING (...);
CREATE POLICY "insert_policy" ON pets FOR INSERT WITH CHECK (...);
CREATE POLICY "update_policy" ON pets FOR UPDATE USING (...);
CREATE POLICY "delete_policy" ON pets FOR DELETE USING (...);
```

### 4. Indexes for Performance

Always create indexes on:
- Foreign keys
- Columns used in WHERE clauses
- Columns used in ORDER BY
- Composite indexes for common query patterns

```sql
-- Single column indexes
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);

-- Composite indexes (order matters!)
CREATE INDEX IF NOT EXISTS idx_health_records_pet_date
  ON health_records(pet_id, date DESC);
```

### 5. Timestamps

Always include created_at and updated_at:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

-- Create trigger for updated_at
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

## Migration Naming Convention

Format: `00X_description.sql`

Examples:
- `001_create_profiles_table.sql` - Foundation (already applied)
- `002_create_pets_table.sql` - Core feature
- `003_add_pet_tier_limit.sql` - Enhancement
- `004_create_health_records_table.sql` - New feature
- `005_add_health_records_indexes.sql` - Performance
- `006_create_expenses_table.sql` - New feature

## Migration Checklist

Before applying a migration:

- [ ] Migration file follows naming convention (`00X_description.sql`)
- [ ] Migration includes header comment (date, story, description)
- [ ] Migration uses idempotent checks (`IF NOT EXISTS`)
- [ ] Foreign keys specify `ON DELETE` behavior
- [ ] RLS enabled on all tables
- [ ] RLS policies created for SELECT, INSERT, UPDATE, DELETE
- [ ] Indexes created on foreign keys and query columns
- [ ] Timestamps (created_at, updated_at) included
- [ ] Rollback SQL included at bottom (commented)
- [ ] Migration tested on test database
- [ ] Verification queries run successfully
- [ ] Migration documented in SETUP.md

## Troubleshooting

### Migration Fails with "already exists"

**Cause:** Migration not idempotent or already applied

**Solution:** Use `IF NOT EXISTS` / `IF EXISTS` checks

### RLS Policy Errors

**Cause:** RLS policy references invalid column or function

**Solution:** Verify column names and RLS functions exist

### Foreign Key Constraint Fails

**Cause:** Referenced table doesn't exist or has different column type

**Solution:** Apply migrations in correct order, verify column types match

### Slow Query Performance

**Cause:** Missing indexes on frequently queried columns

**Solution:** Add indexes, use `EXPLAIN ANALYZE` to verify

## Advanced Topics

### Testing Migrations Locally

For complex migrations, consider using Supabase CLI for local development:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize local Supabase (optional)
supabase init

# Start local Supabase (optional)
supabase start

# Apply migration locally (optional)
supabase db reset

# Generate TypeScript types (optional)
supabase gen types typescript --local > src/types/supabase.ts
```

Note: Local Supabase is optional for MVP. Manual migration via SQL Editor is sufficient.

### Database Migration Version Tracking

For larger projects, consider creating a migrations table:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- After applying migration 004
INSERT INTO schema_migrations (version, name)
VALUES (4, 'create_health_records_table');
```

## Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database Migrations Best Practices](https://www.postgresql.org/docs/current/ddl.html)

---

**Last Updated:** 2025-11-15
**Version:** 1.0
**Epic 2 Retrospective Action Item:** Integrate Supabase CLI migrations
