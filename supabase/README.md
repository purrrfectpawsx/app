# Supabase Database Migrations

This directory contains SQL migration files for the Supabase database schema.

## Setup Instructions

1. Create a new Supabase project at https://supabase.com/dashboard
2. Copy the SQL content from each migration file in numerical order
3. Execute them in the Supabase SQL Editor (Database → SQL Editor)
4. Copy your project URL and anon key to `.env` file:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

## Migration Files

- `001_create_profiles_table.sql` - Creates profiles table with RLS policies

## Testing RLS Policies

After running the migrations, you can test the RLS policies:

```sql
-- Test as authenticated user (should succeed)
SELECT auth.uid(); -- Should return your user ID
SELECT * FROM profiles WHERE id = auth.uid();

-- Test inserting your own profile (should succeed)
INSERT INTO profiles (id, email, name)
VALUES (auth.uid(), 'test@example.com', 'Test User');

-- Test reading another user's profile (should return empty)
SELECT * FROM profiles WHERE id != auth.uid();
```

## Important Notes

- Row Level Security (RLS) is ENABLED on all tables
- Users can only access their own data
- The profiles.id must match auth.users.id (enforced by foreign key and RLS)
- Subscription tier defaults to 'free' for new users
