-- Create profiles table
-- This table stores additional user information beyond what Supabase Auth provides
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'))
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Create index on email for faster lookups
CREATE INDEX profiles_email_idx ON profiles(email);

-- Comments for documentation
COMMENT ON TABLE profiles IS 'User profiles complementary to auth.users table';
COMMENT ON COLUMN profiles.id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN profiles.email IS 'User email address (duplicated from auth for easier access)';
COMMENT ON COLUMN profiles.name IS 'User display name';
COMMENT ON COLUMN profiles.subscription_tier IS 'Subscription level: free or premium';
