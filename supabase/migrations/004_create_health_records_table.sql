-- Migration: Create health_records table
-- Date: 2025-11-15
-- Story: 3.1
-- Description: Establishes health records database schema for Epic 3

-- Create trigger function for updated_at if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

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
DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- RLS Policy: SELECT - Users can view their own health records
DROP POLICY IF EXISTS "Users can view their own health records" ON health_records;
CREATE POLICY "Users can view their own health records"
  ON health_records
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policy: INSERT - Users can create health records for their own pets
DROP POLICY IF EXISTS "Users can create health records for their own pets" ON health_records;
CREATE POLICY "Users can create health records for their own pets"
  ON health_records
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND pet_id IN (SELECT id FROM pets WHERE user_id = auth.uid())
  );

-- RLS Policy: UPDATE - Users can update their own health records
DROP POLICY IF EXISTS "Users can update their own health records" ON health_records;
CREATE POLICY "Users can update their own health records"
  ON health_records
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- RLS Policy: DELETE - Users can delete their own health records
DROP POLICY IF EXISTS "Users can delete their own health records" ON health_records;
CREATE POLICY "Users can delete their own health records"
  ON health_records
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Comments for documentation
COMMENT ON TABLE health_records IS 'Stores pet health records with type-specific data in JSON columns';
COMMENT ON COLUMN health_records.id IS 'Primary key (UUID)';
COMMENT ON COLUMN health_records.pet_id IS 'Foreign key to pets.id (pet owner)';
COMMENT ON COLUMN health_records.user_id IS 'Foreign key to profiles.id (user owner) for RLS';
COMMENT ON COLUMN health_records.record_type IS 'Type of health record: vaccine, medication, vet_visit, symptom, weight_check';
COMMENT ON COLUMN health_records.title IS 'Title/name of the health record';
COMMENT ON COLUMN health_records.date IS 'Date of the health event';
COMMENT ON COLUMN health_records.notes IS 'Additional notes about the health record';
COMMENT ON COLUMN health_records.vaccine_data IS 'JSON: { expiration_date, vet_clinic, dose }';
COMMENT ON COLUMN health_records.medication_data IS 'JSON: { dosage, frequency, start_date, end_date }';
COMMENT ON COLUMN health_records.vet_visit_data IS 'JSON: { clinic, vet_name, diagnosis, treatment, cost }';
COMMENT ON COLUMN health_records.symptom_data IS 'JSON: { severity, observed_behaviors }';
COMMENT ON COLUMN health_records.weight_data IS 'JSON: { weight, unit, body_condition }';
COMMENT ON COLUMN health_records.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN health_records.updated_at IS 'Timestamp when record was last updated (auto-updated by trigger)';

-- ============================================================================
-- ROLLBACK SCRIPT (Keep at bottom of file, commented out)
-- ============================================================================
-- Run this ONLY if you need to undo this migration
--
-- DROP POLICY IF EXISTS "Users can view their own health records" ON health_records;
-- DROP POLICY IF EXISTS "Users can create health records for their own pets" ON health_records;
-- DROP POLICY IF EXISTS "Users can update their own health records" ON health_records;
-- DROP POLICY IF EXISTS "Users can delete their own health records" ON health_records;
-- DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
-- DROP INDEX IF EXISTS idx_health_records_pet_id;
-- DROP INDEX IF EXISTS idx_health_records_user_id;
-- DROP INDEX IF EXISTS idx_health_records_pet_date;
-- DROP INDEX IF EXISTS idx_health_records_type;
-- DROP INDEX IF EXISTS idx_health_records_pet_type;
-- DROP TABLE IF EXISTS health_records CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column();
