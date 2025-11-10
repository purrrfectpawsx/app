# Story 3.1: Create Health Record Database Schema

Status: drafted

## Story

As a developer,
I want to establish the health records database schema,
So that we can store multiple health record types with type-specific fields.

## Acceptance Criteria

1. `health_records` table created with columns: id (uuid), pet_id (FK to pets), user_id (FK to profiles for RLS), record_type (enum), title, date, notes, created_at, updated_at
2. Record type enum includes: vaccine, medication, vet_visit, symptom, weight_check
3. Type-specific JSON fields: vaccine_data (expiration_date, vet_clinic, dose), medication_data (dosage, frequency, start_date, end_date), vet_visit_data (clinic, vet_name, diagnosis, treatment, cost), symptom_data (severity, observed_behaviors), weight_data (weight, unit, body_condition)
4. Foreign key constraints with CASCADE DELETE (delete pet → delete all health records)
5. RLS policies ensure users only access their own health records
6. Database indexes on: pet_id, user_id, date, record_type for query performance

## Tasks / Subtasks

- [ ] Task 1: Create health_records table schema (AC: #1, #2, #3)
  - [ ] Write SQL migration file or execute via Supabase SQL editor
  - [ ] Create table: health_records with UUID primary key
  - [ ] Add columns: id, pet_id, user_id, record_type, title, date, notes
  - [ ] Add JSON columns: vaccine_data, medication_data, vet_visit_data, symptom_data, weight_data
  - [ ] Add timestamps: created_at, updated_at (auto-managed by triggers)
  - [ ] Create record_type CHECK constraint or ENUM type
  - [ ] Test: Verify table exists in Supabase
  - [ ] Test: Verify all columns created with correct types

- [ ] Task 2: Create record_type enum or constraint (AC: #2)
  - [ ] Option 1: Create PostgreSQL ENUM type
  - [ ] Option 2: Use TEXT with CHECK constraint
  - [ ] Recommendation: Option 2 (CHECK constraint) for flexibility
  - [ ] Constraint values: 'vaccine', 'medication', 'vet_visit', 'symptom', 'weight_check'
  - [ ] Add constraint: CHECK (record_type IN ('vaccine', 'medication', 'vet_visit', 'symptom', 'weight_check'))
  - [ ] Test: Verify valid record_type values accepted
  - [ ] Test: Verify invalid record_type rejected with error

- [ ] Task 3: Add foreign key constraints (AC: #4)
  - [ ] Add FK: pet_id REFERENCES pets(id) ON DELETE CASCADE
  - [ ] Add FK: user_id REFERENCES profiles(id) ON DELETE CASCADE
  - [ ] Ensure CASCADE DELETE: Deleting pet deletes all its health records
  - [ ] Ensure CASCADE DELETE: Deleting user deletes all their health records
  - [ ] Test: Create health record for pet
  - [ ] Test: Delete pet → Verify health records deleted (cascade)
  - [ ] Test: Verify FK constraint prevents invalid pet_id

- [ ] Task 4: Create RLS policies (AC: #5)
  - [ ] Enable RLS on health_records table: ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;
  - [ ] Create SELECT policy: Users can view their own health records (user_id = auth.uid())
  - [ ] Create INSERT policy: Users can insert health records for their own pets
  - [ ] Create UPDATE policy: Users can update their own health records (user_id = auth.uid())
  - [ ] Create DELETE policy: Users can delete their own health records (user_id = auth.uid())
  - [ ] Test: User can SELECT their own health records
  - [ ] Test: User cannot SELECT other users' health records
  - [ ] Test: User can INSERT health record for their own pet
  - [ ] Test: User cannot INSERT health record for another user's pet

- [ ] Task 5: Create database indexes (AC: #6)
  - [ ] Create index on pet_id: CREATE INDEX idx_health_records_pet_id ON health_records(pet_id);
  - [ ] Create composite index on pet_id + date (DESC): CREATE INDEX idx_health_records_pet_date ON health_records(pet_id, date DESC);
  - [ ] Create index on user_id: CREATE INDEX idx_health_records_user_id ON health_records(user_id);
  - [ ] Create index on record_type: CREATE INDEX idx_health_records_type ON health_records(record_type);
  - [ ] Create composite index on pet_id + record_type: CREATE INDEX idx_health_records_pet_type ON health_records(pet_id, record_type);
  - [ ] Test: Verify indexes exist via EXPLAIN ANALYZE on queries
  - [ ] Test: Verify query performance improvements

- [ ] Task 6: Add timestamp triggers (AC: #1)
  - [ ] Create trigger to auto-set created_at on INSERT
  - [ ] Create trigger to auto-update updated_at on UPDATE
  - [ ] Option 1: Use PostgreSQL DEFAULT now() for created_at
  - [ ] Option 2: Use trigger function for both timestamps
  - [ ] Recommendation: Use Supabase's default timestamp pattern
  - [ ] Test: Insert record → Verify created_at auto-populated
  - [ ] Test: Update record → Verify updated_at auto-updated

- [ ] Task 7: Define JSON schema for type-specific data (AC: #3)
  - [ ] Document JSON schema for vaccine_data: { expiration_date: Date | null, vet_clinic: string | null, dose: string | null }
  - [ ] Document JSON schema for medication_data: { dosage: string | null, frequency: string | null, start_date: Date | null, end_date: Date | null }
  - [ ] Document JSON schema for vet_visit_data: { clinic: string | null, vet_name: string | null, diagnosis: string | null, treatment: string | null, cost: number | null }
  - [ ] Document JSON schema for symptom_data: { severity: 'mild' | 'moderate' | 'severe' | null, observed_behaviors: string | null }
  - [ ] Document JSON schema for weight_data: { weight: number | null, unit: 'kg' | 'lbs' | null, body_condition: string | null }
  - [ ] Note: JSON columns allow null or empty {} for records that don't use specific type
  - [ ] Create TypeScript types matching JSON schemas (for frontend)
  - [ ] Test: Insert records with JSON data → Verify data stored correctly
  - [ ] Test: Query JSON fields → Verify data retrievable

- [ ] Task 8: Create migration file (AC: #1-#6)
  - [ ] Create migration file: migrations/003_create_health_records_table.sql
  - [ ] Include all SQL statements: CREATE TABLE, ALTER TABLE, CREATE INDEX, RLS policies
  - [ ] Ensure migration is idempotent (IF NOT EXISTS checks)
  - [ ] Document rollback steps (DROP TABLE, DROP INDEX, etc.)
  - [ ] Test: Run migration on local Supabase instance
  - [ ] Test: Verify rollback script works
  - [ ] Execute migration on production Supabase

- [ ] Task 9: Create TypeScript types for health records (AC: #1, #2, #3)
  - [ ] Create src/types/healthRecords.ts file
  - [ ] Define HealthRecordType enum or union type
  - [ ] Define base HealthRecord interface with common fields
  - [ ] Define type-specific data interfaces: VaccineData, MedicationData, etc.
  - [ ] Define discriminated union type for complete HealthRecord
  - [ ] Export types for use in components and hooks
  - [ ] Test: Verify TypeScript compilation with types
  - [ ] Test: Verify type safety in IDE (autocomplete, errors)

- [ ] Task 10: Testing and validation (All ACs)
  - [ ] Test: Create health_records table via Supabase SQL editor
  - [ ] Test: Insert record with record_type='vaccine' → Success
  - [ ] Test: Insert record with record_type='invalid' → Error (constraint violation)
  - [ ] Test: Insert record with vaccine_data JSON → Success
  - [ ] Test: Query health records for specific pet → Returns correct records
  - [ ] Test: Delete pet → Cascade deletes health records
  - [ ] Test: RLS policy prevents cross-user data access
  - [ ] Test: Indexes improve query performance (EXPLAIN ANALYZE)
  - [ ] Test: created_at and updated_at timestamps auto-populate
  - [ ] Test: TypeScript types compile and provide type safety

## Dev Notes

### Technical Stack
- Supabase PostgreSQL for database
- SQL for schema migrations
- TypeScript for type definitions
- RLS (Row Level Security) for authorization
- PostgreSQL indexes for query optimization

### Implementation Approach
1. Design health_records table schema with all columns
2. Create record_type constraint with valid values
3. Add foreign key constraints with CASCADE DELETE
4. Enable RLS and create policies for all operations
5. Create database indexes for common query patterns
6. Add timestamp triggers for created_at/updated_at
7. Document JSON schemas for type-specific data
8. Create TypeScript types for frontend usage
9. Write migration file and execute on Supabase
10. Test schema, constraints, RLS, and indexes

### Prerequisites
- Story 2.1 completed (pets table exists for foreign key)
- Epic 1 completed (profiles table exists for user_id FK)
- Supabase project configured and accessible

### Database Schema

**Complete migration SQL:**

```sql
-- Migration: Create health_records table
-- Date: 2025-11-08
-- Story: 3.1

-- Create health_records table
CREATE TABLE IF NOT EXISTS health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL,
  user_id UUID NOT NULL,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccine', 'medication', 'vet_visit', 'symptom', 'weight_check')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,

  -- Type-specific JSON data fields
  vaccine_data JSONB DEFAULT '{}',
  medication_data JSONB DEFAULT '{}',
  vet_visit_data JSONB DEFAULT '{}',
  symptom_data JSONB DEFAULT '{}',
  weight_data JSONB DEFAULT '{}',

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Foreign key constraints with CASCADE DELETE
  CONSTRAINT health_records_pet_id_fkey
    FOREIGN KEY (pet_id)
    REFERENCES pets(id)
    ON DELETE CASCADE,

  CONSTRAINT health_records_user_id_fkey
    FOREIGN KEY (user_id)
    REFERENCES profiles(id)
    ON DELETE CASCADE
);

-- Create indexes for query performance
CREATE INDEX IF NOT EXISTS idx_health_records_pet_id ON health_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_health_records_user_id ON health_records(user_id);
CREATE INDEX IF NOT EXISTS idx_health_records_pet_date ON health_records(pet_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_pet_type ON health_records(pet_id, record_type);

-- Create trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view their own health records
CREATE POLICY "Users can view their own health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: INSERT - Users can create health records for their own pets
CREATE POLICY "Users can create health records for their own pets"
  ON health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- RLS Policy: UPDATE - Users can update their own health records
CREATE POLICY "Users can update their own health records"
  ON health_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: DELETE - Users can delete their own health records
CREATE POLICY "Users can delete their own health records"
  ON health_records
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE health_records IS 'Stores pet health records with type-specific data in JSON columns';
COMMENT ON COLUMN health_records.record_type IS 'Type of health record: vaccine, medication, vet_visit, symptom, weight_check';
COMMENT ON COLUMN health_records.vaccine_data IS 'JSON: { expiration_date, vet_clinic, dose }';
COMMENT ON COLUMN health_records.medication_data IS 'JSON: { dosage, frequency, start_date, end_date }';
COMMENT ON COLUMN health_records.vet_visit_data IS 'JSON: { clinic, vet_name, diagnosis, treatment, cost }';
COMMENT ON COLUMN health_records.symptom_data IS 'JSON: { severity, observed_behaviors }';
COMMENT ON COLUMN health_records.weight_data IS 'JSON: { weight, unit, body_condition }';
```

### JSON Schema Documentation

**vaccine_data:**
```typescript
{
  expiration_date: string | null,  // ISO date string
  vet_clinic: string | null,
  dose: string | null
}
```

**medication_data:**
```typescript
{
  dosage: string | null,
  frequency: string | null,  // e.g., "twice daily", "every 8 hours"
  start_date: string | null,  // ISO date string
  end_date: string | null      // ISO date string
}
```

**vet_visit_data:**
```typescript
{
  clinic: string | null,
  vet_name: string | null,
  diagnosis: string | null,
  treatment: string | null,
  cost: number | null
}
```

**symptom_data:**
```typescript
{
  severity: 'mild' | 'moderate' | 'severe' | null,
  observed_behaviors: string | null
}
```

**weight_data:**
```typescript
{
  weight: number | null,
  unit: 'kg' | 'lbs' | null,
  body_condition: string | null  // e.g., "underweight", "ideal", "overweight"
}
```

### TypeScript Types

**Create src/types/healthRecords.ts:**

```typescript
// Health record types enum
export type HealthRecordType =
  | 'vaccine'
  | 'medication'
  | 'vet_visit'
  | 'symptom'
  | 'weight_check'

// Type-specific data interfaces
export interface VaccineData {
  expiration_date?: string | null
  vet_clinic?: string | null
  dose?: string | null
}

export interface MedicationData {
  dosage?: string | null
  frequency?: string | null
  start_date?: string | null
  end_date?: string | null
}

export interface VetVisitData {
  clinic?: string | null
  vet_name?: string | null
  diagnosis?: string | null
  treatment?: string | null
  cost?: number | null
}

export interface SymptomData {
  severity?: 'mild' | 'moderate' | 'severe' | null
  observed_behaviors?: string | null
}

export interface WeightData {
  weight?: number | null
  unit?: 'kg' | 'lbs' | null
  body_condition?: string | null
}

// Base health record interface
export interface BaseHealthRecord {
  id: string
  pet_id: string
  user_id: string
  record_type: HealthRecordType
  title: string
  date: string
  notes?: string | null
  created_at: string
  updated_at: string
}

// Discriminated union for complete health record
export type HealthRecord = BaseHealthRecord & {
  vaccine_data?: VaccineData
  medication_data?: MedicationData
  vet_visit_data?: VetVisitData
  symptom_data?: SymptomData
  weight_data?: WeightData
}

// Type guards for checking record type
export function isVaccineRecord(record: HealthRecord): record is HealthRecord & { vaccine_data: VaccineData } {
  return record.record_type === 'vaccine'
}

export function isMedicationRecord(record: HealthRecord): record is HealthRecord & { medication_data: MedicationData } {
  return record.record_type === 'medication'
}

export function isVetVisitRecord(record: HealthRecord): record is HealthRecord & { vet_visit_data: VetVisitData } {
  return record.record_type === 'vet_visit'
}

export function isSymptomRecord(record: HealthRecord): record is HealthRecord & { symptom_data: SymptomData } {
  return record.record_type === 'symptom'
}

export function isWeightCheckRecord(record: HealthRecord): record is HealthRecord & { weight_data: WeightData } {
  return record.record_type === 'weight_check'
}

// Database insert type (without auto-generated fields)
export type HealthRecordInsert = Omit<HealthRecord, 'id' | 'created_at' | 'updated_at'>

// Database update type (partial fields)
export type HealthRecordUpdate = Partial<Omit<HealthRecord, 'id' | 'pet_id' | 'user_id' | 'created_at' | 'updated_at'>>
```

### Database Queries

**Insert health record:**
```typescript
const { data, error } = await supabase
  .from('health_records')
  .insert({
    pet_id: petId,
    user_id: userId,
    record_type: 'vaccine',
    title: 'Rabies vaccine',
    date: '2025-11-08',
    notes: 'Annual rabies booster',
    vaccine_data: {
      expiration_date: '2026-11-08',
      vet_clinic: 'Happy Paws Veterinary',
      dose: '1ml'
    }
  })
  .select()
  .single()
```

**Query health records for pet:**
```typescript
const { data: records, error } = await supabase
  .from('health_records')
  .select('*')
  .eq('pet_id', petId)
  .order('date', { ascending: false })
```

**Query by record type:**
```typescript
const { data: vaccines, error } = await supabase
  .from('health_records')
  .select('*')
  .eq('pet_id', petId)
  .eq('record_type', 'vaccine')
  .order('date', { ascending: false })
```

**Update health record:**
```typescript
const { data, error } = await supabase
  .from('health_records')
  .update({
    title: 'Updated vaccine',
    vaccine_data: {
      expiration_date: '2027-01-01',
      vet_clinic: 'New Clinic',
      dose: '1ml'
    }
  })
  .eq('id', recordId)
  .select()
  .single()
```

**Delete health record:**
```typescript
const { error } = await supabase
  .from('health_records')
  .delete()
  .eq('id', recordId)
```

### Index Performance Testing

**Test query performance with EXPLAIN ANALYZE:**

```sql
-- Test query: Get all health records for a pet, ordered by date
EXPLAIN ANALYZE
SELECT * FROM health_records
WHERE pet_id = 'some-uuid'
ORDER BY date DESC;

-- Expected: Index scan on idx_health_records_pet_date

-- Test query: Get all vaccines for a pet
EXPLAIN ANALYZE
SELECT * FROM health_records
WHERE pet_id = 'some-uuid'
  AND record_type = 'vaccine'
ORDER BY date DESC;

-- Expected: Index scan on idx_health_records_pet_type or idx_health_records_pet_date
```

### RLS Testing

**Test RLS policies:**

```sql
-- As User A: Insert health record for their own pet
-- Should succeed
INSERT INTO health_records (pet_id, user_id, record_type, title, date)
VALUES ('user-a-pet-id', 'user-a-id', 'vaccine', 'Test', '2025-11-08');

-- As User A: Query health records
-- Should only see their own records
SELECT * FROM health_records;

-- As User A: Try to insert health record for User B's pet
-- Should fail (RLS policy check)
INSERT INTO health_records (pet_id, user_id, record_type, title, date)
VALUES ('user-b-pet-id', 'user-a-id', 'vaccine', 'Test', '2025-11-08');

-- As User A: Try to view User B's health records via direct query
-- Should return empty (RLS policy using)
SELECT * FROM health_records WHERE user_id = 'user-b-id';
```

### Rollback Script

**Rollback migration (if needed):**

```sql
-- Drop RLS policies
DROP POLICY IF EXISTS "Users can view their own health records" ON health_records;
DROP POLICY IF EXISTS "Users can create health records for their own pets" ON health_records;
DROP POLICY IF EXISTS "Users can update their own health records" ON health_records;
DROP POLICY IF EXISTS "Users can delete their own health records" ON health_records;

-- Drop trigger
DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop indexes
DROP INDEX IF EXISTS idx_health_records_pet_id;
DROP INDEX IF EXISTS idx_health_records_user_id;
DROP INDEX IF EXISTS idx_health_records_pet_date;
DROP INDEX IF EXISTS idx_health_records_type;
DROP INDEX IF EXISTS idx_health_records_pet_type;

-- Drop table (cascade will drop foreign key constraints)
DROP TABLE IF EXISTS health_records CASCADE;
```

### Testing Approach

**Manual Testing Checklist:**
1. Execute migration SQL in Supabase SQL editor → Table created
2. Verify table structure in Supabase Table Editor → All columns present
3. Insert health record with record_type='vaccine' → Success
4. Insert health record with record_type='invalid' → Error (constraint violation)
5. Insert vaccine with vaccine_data JSON → Success, JSON stored correctly
6. Query health records for specific pet → Returns correct records
7. Create pet with health records, then delete pet → Cascade deletes health records
8. Test RLS: User A cannot see User B's health records
9. Test RLS: User A cannot insert health record for User B's pet
10. Run EXPLAIN ANALYZE on queries → Verify indexes used
11. Verify created_at auto-populated on insert
12. Update health record → Verify updated_at auto-updated
13. Compile TypeScript with new types → No errors
14. Test type guards in code → Correct type narrowing

**Edge Cases:**
- Insert health record with empty JSON fields (default {}) → Success
- Insert health record with null notes → Success
- Query pet with no health records → Returns empty array
- Delete health record → Success, no cascade (leaf entity)
- Insert health record for deleted pet → Error (FK violation)

### Future Enhancements (Post-MVP)

1. **Document attachments:**
   - Add documents_ids JSONB column linking to documents table
   - Allow attaching multiple documents to health record

2. **Reminder integration:**
   - Add reminder_id FK column
   - Link health records to reminders (e.g., vaccine expiration reminder)

3. **Audit trail:**
   - Add audit log table tracking all changes to health records
   - Store who changed what and when

4. **Validation rules:**
   - Add CHECK constraints for JSON field structure
   - Use PostgreSQL JSON schema validation (jsonschema extension)

5. **Full-text search:**
   - Add GIN index on notes for full-text search
   - Enable searching health records by keywords

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 2.1: Create Pet Profile - docs/stories/2-1-create-pet-profile-with-basic-info.md]
- [Architecture: Database Schema - docs/architecture.md]
- [PRD: Health Tracking Requirements - docs/PRD.md#FR-3]
- [Supabase Tables Documentation](https://supabase.com/docs/guides/database/tables)
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL JSONB Documentation](https://www.postgresql.org/docs/current/datatype-json.html)
- [PostgreSQL Indexes Documentation](https://www.postgresql.org/docs/current/indexes.html)
- [PostgreSQL Foreign Keys Documentation](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-08:** Story drafted from Epic 3.1 requirements (Status: backlog → drafted)
