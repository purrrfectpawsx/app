-- Rollback for migration 003_add_pet_tier_limit.sql
-- Run this ONLY if you need to undo the tier limit enforcement
-- WARNING: This will remove tier limit checks

-- Drop RLS policy with tier limit check
DROP POLICY IF EXISTS "Users can create pets within tier limits" ON pets;

-- Recreate original INSERT policy (no tier limit)
CREATE POLICY "Users can insert their own pets"
  ON pets
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Optionally remove subscription_tier column from profiles
-- (Only if this column was added in migration 003)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_tier;

-- Verification queries
SELECT policyname FROM pg_policies
WHERE tablename = 'pets' AND policyname LIKE '%tier%';
-- Should return no rows if rollback successful

SELECT policyname FROM pg_policies
WHERE tablename = 'pets' AND policyname = 'Users can insert their own pets';
-- Should return one row if recreate successful
