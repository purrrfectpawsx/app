-- Rollback for migration 002_create_pets_table.sql
-- Run this ONLY if you need to undo the pets table migration
-- WARNING: This will delete ALL pet data and related records

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their own pets" ON pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON pets;

-- Drop indexes
DROP INDEX IF EXISTS idx_pets_user_id;
DROP INDEX IF EXISTS idx_pets_created_at;

-- Drop trigger
DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;

-- Drop table (CASCADE will drop foreign key constraints)
DROP TABLE IF EXISTS pets CASCADE;

-- Verification query
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'pets';
-- Should return no rows if rollback successful
