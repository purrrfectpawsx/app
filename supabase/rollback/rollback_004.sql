-- Rollback: Drop health_records table
-- Date: 2025-11-15
-- Story: 3.1
-- Description: Rollback script for health_records table migration

-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their own health records" ON health_records;
DROP POLICY IF EXISTS "Users can create health records for their own pets" ON health_records;
DROP POLICY IF EXISTS "Users can update their own health records" ON health_records;
DROP POLICY IF EXISTS "Users can delete their own health records" ON health_records;

-- Drop trigger
DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;

-- Drop indexes
DROP INDEX IF EXISTS idx_health_records_pet_id;
DROP INDEX IF EXISTS idx_health_records_user_id;
DROP INDEX IF EXISTS idx_health_records_pet_date;
DROP INDEX IF EXISTS idx_health_records_type;
DROP INDEX IF EXISTS idx_health_records_pet_type;

-- Drop table (cascade will drop foreign key constraints)
DROP TABLE IF EXISTS health_records CASCADE;

-- Optionally drop the trigger function if no other tables use it
-- DROP FUNCTION IF EXISTS update_updated_at_column();
