# Supabase Setup Instructions

This document contains manual setup steps required for the Supabase project.

## Database Migrations

Run the following migrations in order via the Supabase SQL Editor:

1. `migrations/001_create_profiles_table.sql` - Creates profiles table (already applied)
2. `migrations/002_create_pets_table.sql` - Creates pets table for pet profiles
3. `migrations/003_add_pet_tier_limit.sql` - Adds tier-based limit enforcement for pets

To apply migrations:
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the migration content and execute it

## Storage Buckets

### pets-photos Bucket

Create a storage bucket for pet photos with the following configuration:

**Bucket Settings:**
- **Name:** `pets-photos`
- **Public:** Yes (required for browser <img> tags to load photos)
- **File size limit:** 5MB
- **Allowed MIME types:** image/jpeg, image/png, image/heic

**RLS Policies:**

1. **Allow users to upload their own pet photos:**
```sql
CREATE POLICY "Users can upload own pet photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'pets-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

2. **Allow users to view their own pet photos:**
```sql
CREATE POLICY "Users can view own pet photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'pets-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

3. **Allow users to update their own pet photos:**
```sql
CREATE POLICY "Users can update own pet photos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'pets-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

4. **Allow users to delete their own pet photos:**
```sql
CREATE POLICY "Users can delete own pet photos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'pets-photos'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**File Path Pattern:**
Photos should be uploaded with the path format: `{userId}/{petId}.{ext}`

Example: `123e4567-e89b-12d3-a456-426614174000/abc12345-6789-0def-1234-567890abcdef.jpg`

This ensures:
- User isolation (each user has their own folder)
- Easy cleanup on account deletion
- RLS policies work correctly
