# Story 3.9: Attach Documents to Health Records

Status: ready-for-dev

## Story

As a pet owner,
I want to attach photos/PDFs to health records,
So that I can include vet records, vaccine cards, and lab results.

## Acceptance Criteria

1. Health record form includes "Attach Documents" section
2. File upload supports: PDF, JPG, PNG, HEIC up to 10MB per file
3. Multiple files can be attached (up to 5 per record)
4. Attached files show thumbnail preview with filename
5. Files stored in Supabase Storage with path: `health-documents/{pet_id}/{record_id}/{filename}`
6. Viewing record shows attached documents with preview/download buttons
7. Deleting record deletes associated documents from storage

## Tasks / Subtasks

- [ ] Task 1: Add "Attach Documents" section to health record form (AC: #1)
  - [ ] Update CreateHealthRecordForm component
  - [ ] Add "Attach Documents" section below notes field
  - [ ] Create DocumentUploader component for file selection
  - [ ] Display section in both create and edit modes
  - [ ] Test: "Attach Documents" section visible in form

- [ ] Task 2: Create DocumentUploader component (AC: #2, #3)
  - [ ] Create src/components/health/DocumentUploader.tsx
  - [ ] Implement file input with drag-and-drop support
  - [ ] Accept file types: .pdf, .jpg, .jpeg, .png, .heic
  - [ ] Validate file size: max 10MB per file
  - [ ] Support multiple file selection (up to 5 files)
  - [ ] Show file count: "3/5 documents attached"
  - [ ] Test: File input accepts only allowed file types
  - [ ] Test: Files > 10MB rejected with error message
  - [ ] Test: Can select up to 5 files

- [ ] Task 3: Implement file validation (AC: #2, #3)
  - [ ] Create validateDocumentFile utility function
  - [ ] Check file type in allowed list
  - [ ] Check file size <= 10MB (10,485,760 bytes)
  - [ ] Check total files <= 5
  - [ ] Show error toast for invalid files
  - [ ] Error messages:
    - "File type not supported. Please upload PDF, JPG, PNG, or HEIC files."
    - "File size exceeds 10MB limit."
    - "Maximum 5 documents can be attached."
  - [ ] Test: Invalid file types rejected
  - [ ] Test: Large files rejected
  - [ ] Test: 6th file rejected with error

- [ ] Task 4: Display attached files with preview (AC: #4)
  - [ ] Create AttachedDocuments component
  - [ ] Show thumbnail previews for images
  - [ ] Show PDF icon for PDF files
  - [ ] Display filename below thumbnail
  - [ ] Show file size
  - [ ] Add remove button (X icon) for each file
  - [ ] Test: Attached files displayed with thumbnails
  - [ ] Test: Can remove individual files before upload

- [ ] Task 5: Upload documents to Supabase Storage (AC: #5)
  - [ ] Create Supabase Storage bucket: `health-documents`
  - [ ] Configure bucket: private (RLS required)
  - [ ] Implement upload function: uploadHealthRecordDocuments
  - [ ] Upload path: `health-documents/{pet_id}/{record_id}/{filename}`
  - [ ] Generate unique filenames to prevent conflicts (UUID + original name)
  - [ ] Upload files sequentially or in parallel (max 3 concurrent)
  - [ ] Show upload progress indicator
  - [ ] Test: Files upload to correct storage path
  - [ ] Test: Upload progress shown during upload

- [ ] Task 6: Store document URLs in health record (AC: #5)
  - [ ] Add document_urls column to health_records table (JSONB array)
  - [ ] After upload, get public/signed URLs from storage
  - [ ] Store URLs array in document_urls field:
    ```json
    [
      {
        "filename": "vaccine-card.jpg",
        "storage_path": "health-documents/pet-123/record-456/uuid-vaccine-card.jpg",
        "url": "https://...",
        "size": 1234567,
        "type": "image/jpeg"
      }
    ]
    ```
  - [ ] Update health record with document_urls on save
  - [ ] Test: document_urls stored correctly in database

- [ ] Task 7: Display attached documents in timeline view (AC: #6)
  - [ ] Update HealthRecordCard expanded view
  - [ ] Show "Attached Documents" section if document_urls exists
  - [ ] Display document thumbnails/icons
  - [ ] Add "Preview" button for images (opens lightbox)
  - [ ] Add "Download" button for all files
  - [ ] Test: Attached documents visible in timeline
  - [ ] Test: Preview button opens image in lightbox
  - [ ] Test: Download button downloads file

- [ ] Task 8: Implement document preview (AC: #6)
  - [ ] Create DocumentPreview component
  - [ ] For images: show in lightbox with zoom/pan
  - [ ] For PDFs: open in new tab or use PDF viewer
  - [ ] Support navigation between multiple documents
  - [ ] Add close button
  - [ ] Test: Image preview works with zoom/pan
  - [ ] Test: PDF opens in new tab

- [ ] Task 9: Implement document download (AC: #6)
  - [ ] Create downloadDocument function
  - [ ] Fetch file from Supabase Storage
  - [ ] Trigger browser download with original filename
  - [ ] Show download progress for large files
  - [ ] Test: Document downloads with correct filename

- [ ] Task 10: Delete documents when record deleted (AC: #7)
  - [ ] Update deleteHealthRecord function (from Story 3.8)
  - [ ] Before deleting record: delete all associated documents from storage
  - [ ] Iterate through document_urls array
  - [ ] Delete each file: supabase.storage.from('health-documents').remove([path])
  - [ ] Then delete health record
  - [ ] Handle errors gracefully (log but don't block deletion)
  - [ ] Test: Deleting record also deletes documents from storage
  - [ ] Test: Record deletion succeeds even if storage delete fails

- [ ] Task 11: Configure Supabase Storage RLS policies (AC: #5)
  - [ ] Create RLS policy: Users can upload to their own pet folders
  - [ ] CREATE POLICY: Users can view their own health documents
  - [ ] CREATE POLICY: Users can delete their own health documents
  - [ ] Policy uses path matching: storage.foldername(name)[1] matches user's pet_id
  - [ ] Test: User can upload documents to their pet's folder
  - [ ] Test: User cannot access other users' documents
  - [ ] Test: User can delete their own documents

- [ ] Task 12: E2E testing (All ACs)
  - [ ] Test: "Attach Documents" section visible in form
  - [ ] Test: Can upload PDF, JPG, PNG, HEIC files
  - [ ] Test: Files > 10MB rejected
  - [ ] Test: Can attach up to 5 files
  - [ ] Test: Attached files show thumbnail previews
  - [ ] Test: Files upload to Supabase Storage
  - [ ] Test: Document URLs stored in health record
  - [ ] Test: Documents visible in timeline view
  - [ ] Test: Preview button opens image
  - [ ] Test: Download button downloads file
  - [ ] Test: Deleting record deletes documents
  - [ ] Test: RLS prevents accessing other users' documents

## Dev Notes

### Technical Stack
- Supabase Storage for file storage
- React Hook Form for form management
- File input with drag-and-drop
- Image lightbox for preview
- JSONB column for document_urls storage

### Implementation Approach
1. Add "Attach Documents" section to health record form
2. Create DocumentUploader component with validation
3. Upload files to Supabase Storage
4. Store document URLs in health_records.document_urls (JSONB)
5. Display attached documents in timeline view
6. Implement preview and download functionality
7. Delete documents when health record deleted
8. Configure Supabase Storage RLS policies

### Supabase Storage Bucket Configuration

**Create bucket:**
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('health-documents', 'health-documents', false);
```

**RLS Policies:**
```sql
-- Users can upload to their own pet folders
CREATE POLICY "Users can upload health documents for their pets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'health-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM pets WHERE user_id = auth.uid()
  )
);

-- Users can view their own documents
CREATE POLICY "Users can view their own health documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'health-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM pets WHERE user_id = auth.uid()
  )
);

-- Users can delete their own documents
CREATE POLICY "Users can delete their own health documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'health-documents'
  AND (storage.foldername(name))[1] IN (
    SELECT id::text FROM pets WHERE user_id = auth.uid()
  )
);
```

### Database Schema Update

Add column to health_records table:
```sql
ALTER TABLE health_records
ADD COLUMN document_urls JSONB DEFAULT '[]'::jsonb;
```

### Upload Function Example

```typescript
const uploadHealthRecordDocuments = async (
  petId: string,
  recordId: string,
  files: File[]
): Promise<DocumentMetadata[]> => {
  const uploadedDocs: DocumentMetadata[] = []

  for (const file of files) {
    const uniqueFilename = `${uuidv4()}-${file.name}`
    const path = `${petId}/${recordId}/${uniqueFilename}`

    const { data, error } = await supabase.storage
      .from('health-documents')
      .upload(path, file)

    if (error) throw error

    const { data: urlData } = supabase.storage
      .from('health-documents')
      .getPublicUrl(path)

    uploadedDocs.push({
      filename: file.name,
      storage_path: path,
      url: urlData.publicUrl,
      size: file.size,
      type: file.type
    })
  }

  return uploadedDocs
}
```

### Prerequisites
- Story 3.2 completed (CreateHealthRecordForm exists)
- Story 3.4 completed (HealthTimeline with viewing exists)
- Story 3.8 completed (Delete health record functionality)

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 3.2: Create Vaccine Record - docs/stories/3-2-create-vaccine-record.md]
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Architecture: Component Structure - docs/architecture.md]

## Dev Agent Record

### Context Reference

- docs/stories/3-9-attach-documents-to-health-records.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created with comprehensive tasks and acceptance criteria (Status: ready-for-dev)
