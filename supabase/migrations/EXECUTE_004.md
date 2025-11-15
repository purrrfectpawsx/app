# Migration 004: Execute Instructions

## Story
3.1 - Create Health Record Database Schema

## Files Created
- `supabase/migrations/004_create_health_records_table.sql` - Main migration
- `supabase/rollback/rollback_004.sql` - Rollback script
- `src/types/healthRecords.ts` - TypeScript types

## Execution Steps

### 1. Open Supabase SQL Editor
1. Go to https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in left sidebar
4. Click **New Query**

### 2. Execute Migration
```bash
# Copy migration content to clipboard
cat supabase/migrations/004_create_health_records_table.sql | clip  # Windows
```

Or manually copy the contents of `supabase/migrations/004_create_health_records_table.sql`

1. Paste the migration SQL into the SQL Editor
2. Click **Run** button (or press Ctrl/Cmd + Enter)
3. Verify success message appears
4. Check for any errors in the Messages tab

### 3. Verify Migration
Run these verification queries in the SQL Editor:

```sql
-- Verify table exists
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'health_records';

-- Verify all columns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'health_records'
ORDER BY ordinal_position;

-- Verify indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'health_records';

-- Verify RLS enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'health_records';

-- Verify RLS policies (should show 4 policies)
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'health_records';

-- Verify foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'health_records' AND tc.constraint_type = 'FOREIGN KEY';

-- Verify trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'health_records';
```

Expected results:
- Table `health_records` exists ✓
- 15 columns (id, pet_id, user_id, record_type, title, date, notes, vaccine_data, medication_data, vet_visit_data, symptom_data, weight_data, created_at, updated_at, plus constraints) ✓
- 5 indexes (pet_id, user_id, pet_date, type, pet_type) ✓
- RLS enabled (rowsecurity = true) ✓
- 4 RLS policies (SELECT, INSERT, UPDATE, DELETE) ✓
- 2 foreign key constraints (pet_id → pets, user_id → profiles) ✓
- 1 trigger (update_health_records_updated_at) ✓

### 4. Test Migration (Optional but Recommended)
```sql
-- Test 1: Insert a vaccine record (should succeed)
INSERT INTO health_records (
  pet_id,
  user_id,
  record_type,
  title,
  date,
  vaccine_data
) VALUES (
  (SELECT id FROM pets LIMIT 1),  -- Use an existing pet
  auth.uid(),
  'vaccine',
  'Test Rabies Vaccine',
  CURRENT_DATE,
  '{"expiration_date": "2026-11-15", "vet_clinic": "Test Clinic", "dose": "1ml"}'::jsonb
);

-- Test 2: Query the record (should return the inserted record)
SELECT * FROM health_records WHERE title = 'Test Rabies Vaccine';

-- Test 3: Update the record (should succeed and update updated_at)
UPDATE health_records
SET notes = 'Test note added'
WHERE title = 'Test Rabies Vaccine';

-- Test 4: Verify updated_at was auto-updated
SELECT title, created_at, updated_at
FROM health_records
WHERE title = 'Test Rabies Vaccine';
-- created_at and updated_at should be different

-- Test 5: Delete the test record (cleanup)
DELETE FROM health_records WHERE title = 'Test Rabies Vaccine';

-- Test 6: Try invalid record_type (should fail with constraint violation)
INSERT INTO health_records (
  pet_id,
  user_id,
  record_type,
  title,
  date
) VALUES (
  (SELECT id FROM pets LIMIT 1),
  auth.uid(),
  'invalid_type',  -- This should fail
  'Test',
  CURRENT_DATE
);
-- Expected: ERROR: new row for relation "health_records" violates check constraint
```

### 5. Update Documentation
After successful execution, update `supabase/SETUP.md`:

Add to the migrations list:
```markdown
4. `migrations/004_create_health_records_table.sql` - Creates health_records table for Epic 3 health tracking
```

## Rollback (If Needed)
If the migration needs to be rolled back, execute `supabase/rollback/rollback_004.sql` in the SQL Editor.

## Success Criteria
- [ ] Migration executed without errors
- [ ] All verification queries return expected results
- [ ] Test inserts/updates/deletes work correctly
- [ ] Invalid record_type is rejected
- [ ] RLS policies prevent cross-user access
- [ ] Trigger auto-updates updated_at timestamp
- [ ] Documentation updated in SETUP.md
