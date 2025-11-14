-- Migration: Add subscription tier limit enforcement for pets
-- Story 2.6: Free Tier Enforcement - 1 Pet Limit

-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can create their own pets" ON pets;

-- Create new policy with tier limit check
CREATE POLICY "Users can insert pets based on tier limit"
ON pets
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    -- Premium users: no limit
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) = 'premium'
    OR
    -- Free users: max 1 pet
    (
      (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) = 'free'
      AND (SELECT COUNT(*) FROM pets WHERE user_id = auth.uid()) < 1
    )
  )
);

-- Add comment for documentation
COMMENT ON POLICY "Users can insert pets based on tier limit" ON pets IS 'Allows premium users unlimited pets, free users max 1 pet';
