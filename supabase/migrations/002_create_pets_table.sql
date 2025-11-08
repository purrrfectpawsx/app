-- Create pets table
-- This table stores pet profiles for users
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
  breed TEXT,
  birth_date DATE,
  photo_url TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  spayed_neutered BOOLEAN DEFAULT FALSE,
  microchip TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for query performance
CREATE INDEX idx_pets_user_id ON pets(user_id);

-- Enable Row Level Security
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own pets
CREATE POLICY "Users can view their own pets"
  ON pets FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can create their own pets
CREATE POLICY "Users can create their own pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own pets
CREATE POLICY "Users can update their own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can delete their own pets
CREATE POLICY "Users can delete their own pets"
  ON pets FOR DELETE
  USING (auth.uid() = user_id);

-- Comments for documentation
COMMENT ON TABLE pets IS 'Pet profiles for tracking health, expenses, and documents';
COMMENT ON COLUMN pets.id IS 'Primary key (UUID)';
COMMENT ON COLUMN pets.user_id IS 'Foreign key to profiles.id (owner)';
COMMENT ON COLUMN pets.name IS 'Pet name (required)';
COMMENT ON COLUMN pets.species IS 'Pet species: dog, cat, bird, rabbit, or other';
COMMENT ON COLUMN pets.breed IS 'Pet breed (optional)';
COMMENT ON COLUMN pets.birth_date IS 'Pet birth date (optional)';
COMMENT ON COLUMN pets.photo_url IS 'URL to pet photo in Supabase Storage';
COMMENT ON COLUMN pets.gender IS 'Pet gender: male, female, or unknown';
COMMENT ON COLUMN pets.spayed_neutered IS 'Whether pet is spayed or neutered';
COMMENT ON COLUMN pets.microchip IS 'Microchip ID (optional)';
COMMENT ON COLUMN pets.notes IS 'Additional notes about the pet';
