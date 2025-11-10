# Story 2.5: Delete Pet with Confirmation

Status: ready

## Story

As a user,
I want to delete a pet profile when no longer needed,
So that I can keep my account clean (e.g., pet passed away or transferred ownership).

## Acceptance Criteria

1. Delete button visible on pet detail page with destructive styling (red)
2. Clicking delete shows confirmation dialog with warning message
3. Dialog explains: "This will permanently delete [Pet Name] and all associated health records, expenses, reminders, and documents. This cannot be undone."
4. Dialog shows count of items to be deleted (e.g., "12 health records, 45 expenses")
5. Confirmation requires typing pet name or clicking "Yes, delete" button
6. Successful deletion redirects to pets grid with success message
7. Deletion cascades to all related data (health_records, expenses, reminders, documents)
8. Deleted pet photos removed from storage

## Tasks / Subtasks

- [ ] Task 1: Create DeletePetDialog component (AC: #2, #3)
  - [ ] Create src/components/pets/DeletePetDialog.tsx component
  - [ ] Use shadcn/ui AlertDialog component for confirmation UI
  - [ ] Accept props: pet (pet data), onSuccess (callback), onCancel (callback)
  - [ ] Display warning message with pet name interpolated
  - [ ] Warning text: "This will permanently delete {pet.name} and all associated health records, expenses, reminders, and documents. This cannot be undone."
  - [ ] Use destructive color scheme (red) for dialog
  - [ ] Test: Verify dialog opens on Delete button click
  - [ ] Test: Verify warning message displays pet name
  - [ ] Test: Verify destructive styling applied

- [ ] Task 2: Fetch and display deletion counts (AC: #4)
  - [ ] Query health_records count: SELECT COUNT(*) FROM health_records WHERE pet_id = $1
  - [ ] Query expenses count: SELECT COUNT(*) FROM expenses WHERE pet_id = $1
  - [ ] Query reminders count: SELECT COUNT(*) FROM reminders WHERE pet_id = $1
  - [ ] Query documents count: SELECT COUNT(*) FROM documents WHERE pet_id = $1
  - [ ] Display counts in dialog: "This will delete: X health records, Y expenses, Z reminders, W documents"
  - [ ] Handle case: Table doesn't exist yet (graceful fallback, show 0 or skip)
  - [ ] Show loading state while fetching counts
  - [ ] Test: Verify counts display correctly
  - [ ] Test: Verify graceful handling if tables not implemented yet
  - [ ] Test: Verify loading state displays

- [ ] Task 3: Implement deletion confirmation input (AC: #5)
  - [ ] Option 1: Type pet name to confirm (more secure)
  - [ ] Option 2: "Yes, delete" button click (simpler)
  - [ ] Recommendation: Option 2 for MVP (simpler UX, less friction)
  - [ ] Future enhancement: Option 1 for added safety
  - [ ] Add "Cancel" button to close dialog without deleting
  - [ ] Add "Yes, delete {pet.name}" button with destructive variant
  - [ ] Disable delete button until user explicitly clicks
  - [ ] Test: Verify delete button requires explicit click
  - [ ] Test: Verify cancel button closes dialog without deleting
  - [ ] Test: Verify delete button has destructive styling

- [ ] Task 4: Implement cascade deletion API (AC: #7)
  - [ ] Ensure foreign key constraints set to CASCADE DELETE in database schema
  - [ ] Pets table foreign keys: health_records, expenses, reminders, documents all CASCADE
  - [ ] Check schema from Story 2.1 (may need migration to add CASCADE)
  - [ ] Delete query: DELETE FROM pets WHERE id = $1 AND user_id = auth.uid()
  - [ ] RLS enforcement: user_id = auth.uid() prevents deleting other users' pets
  - [ ] Cascade should auto-delete related records via foreign key constraints
  - [ ] Test: Verify pet deletion triggers cascade delete
  - [ ] Test: Verify health_records deleted (if any exist)
  - [ ] Test: Verify RLS prevents deleting other users' pets
  - [ ] Test: Verify deletion succeeds even if no related records exist

- [ ] Task 5: Delete pet photos from storage (AC: #8)
  - [ ] Before deleting pet record, extract photo_url from pet data
  - [ ] If photo_url exists, delete from Supabase Storage
  - [ ] Query: supabase.storage.from('pets-photos').remove([photoPath])
  - [ ] Extract storage path from photo_url (parse URL)
  - [ ] Handle case: Pet has no photo (skip storage deletion)
  - [ ] Handle case: Storage deletion fails (log error but continue with DB deletion)
  - [ ] Test: Verify photo deleted from storage
  - [ ] Test: Verify no error if pet has no photo
  - [ ] Test: Verify DB deletion proceeds even if storage deletion fails

- [ ] Task 6: Delete associated documents from storage (AC: #7, #8)
  - [ ] Query documents table: SELECT storage_path FROM documents WHERE pet_id = $1
  - [ ] Delete all document files from Supabase Storage
  - [ ] Query: supabase.storage.from('documents').remove(storagePaths)
  - [ ] Handle case: Documents table doesn't exist yet (skip)
  - [ ] Handle case: Storage deletion fails (log error but continue)
  - [ ] Note: Document storage may not be implemented until Epic 6
  - [ ] Test: Verify documents deleted from storage (once Epic 6 implemented)
  - [ ] Test: Verify graceful handling if documents table doesn't exist

- [ ] Task 7: Implement success handling and redirect (AC: #6)
  - [ ] On successful deletion: Close dialog, show success toast, redirect to /pets
  - [ ] Success message: "{Pet name} has been deleted"
  - [ ] Use React Router's navigate() to redirect to pets grid
  - [ ] Pass success message via location state or toast
  - [ ] Show toast on pets grid after redirect
  - [ ] Test: Verify redirect to /pets after deletion
  - [ ] Test: Verify success toast displays
  - [ ] Test: Verify deleted pet no longer appears in grid

- [ ] Task 8: Implement error handling (AC: #2, #6)
  - [ ] Handle API errors: Network failure, RLS denial, constraint violations
  - [ ] Show error toast if deletion fails
  - [ ] Error message: "Failed to delete {pet.name}. Please try again."
  - [ ] Keep dialog open on error (allow retry)
  - [ ] Log error to console for debugging
  - [ ] Test: Verify error toast on API failure
  - [ ] Test: Verify dialog stays open on error
  - [ ] Test: Verify error handling for RLS denial

- [ ] Task 9: Integrate with PetDetailPage (AC: #1)
  - [ ] Add Delete button to PetDetailPage header
  - [ ] Use shadcn/ui Button with variant="destructive"
  - [ ] Button text: "Delete" with Trash icon
  - [ ] Open DeletePetDialog on button click
  - [ ] Pass current pet data to dialog
  - [ ] Test: Verify Delete button displays in header
  - [ ] Test: Verify destructive styling (red color)
  - [ ] Test: Verify clicking Delete opens confirmation dialog

- [ ] Task 10: Testing and edge cases (All ACs)
  - [ ] Test: Click Delete button → Dialog opens
  - [ ] Test: Dialog shows pet name in warning message
  - [ ] Test: Dialog shows counts of items to be deleted
  - [ ] Test: Click Cancel → Dialog closes, pet not deleted
  - [ ] Test: Click "Yes, delete" → Pet deleted, redirects to /pets, success toast
  - [ ] Test: Deleted pet no longer appears in pets grid
  - [ ] Test: Related health records deleted (if any exist)
  - [ ] Test: Pet photo deleted from storage
  - [ ] Test: Deletion with API error → Error toast, dialog stays open
  - [ ] Test: RLS enforcement → Cannot delete another user's pet
  - [ ] Test: Delete pet with no photo → No storage error
  - [ ] Test: Delete pet with no related records → Deletion succeeds
  - [ ] Test: Responsive layout (mobile and desktop)

## Dev Notes

### Technical Stack
- React 19 + Vite
- TypeScript 5.9.3 with strict mode
- Supabase PostgreSQL for database deletion
- Supabase Storage for file deletion
- React Router v6 for navigation/redirect
- shadcn/ui components (AlertDialog, Button)
- lucide-react for icons (Trash icon)
- Tailwind CSS for styling

### Implementation Approach
1. Create DeletePetDialog component with AlertDialog
2. Fetch counts of related records (health_records, expenses, etc.)
3. Display warning with counts in confirmation dialog
4. On confirm: Delete pet photo from storage → Delete pet from DB (cascade)
5. Redirect to /pets with success toast
6. Handle errors gracefully with error toast
7. Test complete deletion flow end-to-end

### Prerequisites
- Story 2.1 completed (pets table schema)
- Story 2.3 completed (PetDetailPage provides Delete button entry point)
- Database foreign keys configured with CASCADE DELETE
- Supabase Storage bucket: pets-photos

### Database Schema Requirements

**Ensure CASCADE DELETE on foreign keys:**

Story 2.1 may have created the pets table, but CASCADE constraints might need to be added via migration:

```sql
-- Health records (Epic 3)
ALTER TABLE health_records
DROP CONSTRAINT IF EXISTS health_records_pet_id_fkey,
ADD CONSTRAINT health_records_pet_id_fkey
  FOREIGN KEY (pet_id)
  REFERENCES pets(id)
  ON DELETE CASCADE;

-- Expenses (Epic 4)
ALTER TABLE expenses
DROP CONSTRAINT IF EXISTS expenses_pet_id_fkey,
ADD CONSTRAINT expenses_pet_id_fkey
  FOREIGN KEY (pet_id)
  REFERENCES pets(id)
  ON DELETE CASCADE;

-- Reminders (Epic 5)
ALTER TABLE reminders
DROP CONSTRAINT IF EXISTS reminders_pet_id_fkey,
ADD CONSTRAINT reminders_pet_id_fkey
  FOREIGN KEY (pet_id)
  REFERENCES pets(id)
  ON DELETE CASCADE;

-- Documents (Epic 6)
ALTER TABLE documents
DROP CONSTRAINT IF EXISTS documents_pet_id_fkey,
ADD CONSTRAINT documents_pet_id_fkey
  FOREIGN KEY (pet_id)
  REFERENCES pets(id)
  ON DELETE CASCADE;
```

**Note:** For MVP (Epic 2), only pets table exists. Other tables will be created in future epics. Deletion will work for pets without related records initially.

### Deletion Flow

**Step 1: Fetch counts for confirmation dialog:**
```typescript
const fetchDeletionCounts = async (petId: string) => {
  // Health records count
  const { count: healthCount } = await supabase
    .from('health_records')
    .select('*', { count: 'exact', head: true })
    .eq('pet_id', petId)

  // Expenses count
  const { count: expensesCount } = await supabase
    .from('expenses')
    .select('*', { count: 'exact', head: true })
    .eq('pet_id', petId)

  // Reminders count
  const { count: remindersCount } = await supabase
    .from('reminders')
    .select('*', { count: 'exact', head: true })
    .eq('pet_id', petId)

  // Documents count
  const { count: documentsCount } = await supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('pet_id', petId)

  return {
    healthRecords: healthCount || 0,
    expenses: expensesCount || 0,
    reminders: remindersCount || 0,
    documents: documentsCount || 0,
  }
}
```

**Step 2: Delete pet photo from storage:**
```typescript
const deleteStorageFiles = async (pet: Pet) => {
  const filesToDelete: string[] = []

  // Add pet photo if exists
  if (pet.photo_url) {
    const photoPath = extractStoragePath(pet.photo_url)
    filesToDelete.push(photoPath)
  }

  // Add documents if exist (Epic 6)
  const { data: documents } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('pet_id', pet.id)

  if (documents) {
    filesToDelete.push(...documents.map(d => d.storage_path))
  }

  // Delete from storage
  if (filesToDelete.length > 0) {
    const { error } = await supabase.storage
      .from('pets-photos') // or appropriate bucket
      .remove(filesToDelete)

    if (error) {
      console.error('Failed to delete files from storage:', error)
      // Non-blocking error, continue with DB deletion
    }
  }
}
```

**Step 3: Delete pet from database (cascade):**
```typescript
const deletePet = async (petId: string) => {
  const { error } = await supabase
    .from('pets')
    .delete()
    .eq('id', petId)
    .eq('user_id', userId) // RLS enforcement

  if (error) {
    throw error
  }

  // CASCADE DELETE will automatically delete:
  // - health_records
  // - expenses
  // - reminders
  // - documents
}
```

**Step 4: Redirect with success message:**
```typescript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()

// After successful deletion
navigate('/pets', {
  state: { message: `${pet.name} has been deleted` }
})

// In PetsGrid, show toast if state message exists
useEffect(() => {
  const state = location.state as { message?: string }
  if (state?.message) {
    showToast({
      title: 'Success',
      description: state.message,
    })
    // Clear state
    navigate('/pets', { replace: true })
  }
}, [location])
```

### DeletePetDialog Component

```typescript
interface DeletePetDialogProps {
  pet: Pet
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export const DeletePetDialog = ({
  pet,
  open,
  onOpenChange,
  onSuccess,
}: DeletePetDialogProps) => {
  const [counts, setCounts] = useState<DeletionCounts | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Fetch counts when dialog opens
  useEffect(() => {
    if (open) {
      fetchDeletionCounts(pet.id).then(setCounts)
    }
  }, [open, pet.id])

  const handleDelete = async () => {
    setIsDeleting(true)

    try {
      // Delete storage files
      await deleteStorageFiles(pet)

      // Delete pet (cascade to related records)
      await deletePet(pet.id)

      // Success
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to delete pet:', error)
      showToast({
        variant: 'destructive',
        title: 'Failed to delete pet',
        description: 'Please try again',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {pet.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete {pet.name} and all associated data.
            This action cannot be undone.

            {counts && (
              <div className="mt-4 text-sm">
                <p className="font-semibold">This will delete:</p>
                <ul className="list-disc list-inside mt-2">
                  {counts.healthRecords > 0 && (
                    <li>{counts.healthRecords} health records</li>
                  )}
                  {counts.expenses > 0 && (
                    <li>{counts.expenses} expenses</li>
                  )}
                  {counts.reminders > 0 && (
                    <li>{counts.reminders} reminders</li>
                  )}
                  {counts.documents > 0 && (
                    <li>{counts.documents} documents</li>
                  )}
                </ul>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Deleting...' : `Yes, delete ${pet.name}`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
```

### Integration with PetDetailPage

```tsx
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const navigate = useNavigate()

const handleDeleteSuccess = () => {
  navigate('/pets', {
    state: { message: `${pet.name} has been deleted` }
  })
}

// Delete button in header
<Button
  variant="destructive"
  onClick={() => setDeleteDialogOpen(true)}
>
  <Trash className="mr-2 h-4 w-4" />
  Delete
</Button>

// Dialog
<DeletePetDialog
  pet={pet}
  open={deleteDialogOpen}
  onOpenChange={setDeleteDialogOpen}
  onSuccess={handleDeleteSuccess}
/>
```

### Component Structure

```
src/
├── components/
│   ├── pets/
│   │   ├── DeletePetDialog.tsx (NEW)
│   │   ├── CreatePetForm.tsx
│   │   └── (other pet components)
│   └── ui/ (shadcn/ui components)
├── lib/
│   ├── supabase.ts
│   └── storageUtils.ts (extractStoragePath helper)
├── pages/
│   ├── PetDetailPage.tsx (MODIFIED - add Delete button and dialog)
│   └── PetsGrid.tsx (MODIFIED - show success toast from redirect state)
└── App.tsx
```

### Storage Path Extraction

```typescript
// lib/storageUtils.ts
export function extractStoragePath(url: string): string {
  // Example URL: https://xxx.supabase.co/storage/v1/object/public/pets-photos/userId/petId.jpg
  // Extract: userId/petId.jpg

  const match = url.match(/\/pets-photos\/(.+)$/)
  return match ? match[1] : ''
}
```

### Error Handling

**Possible errors and handling:**

1. **RLS Denial (user trying to delete another user's pet):**
   - Error: "new row violates row-level security policy"
   - Handling: Show error toast "You don't have permission to delete this pet"

2. **Network failure:**
   - Error: Network error or timeout
   - Handling: Show error toast "Failed to delete pet. Check your connection."

3. **Storage deletion failure:**
   - Error: Storage file not found or permission denied
   - Handling: Log error, continue with DB deletion (non-blocking)

4. **Foreign key constraint violation (shouldn't happen with CASCADE):**
   - Error: "violates foreign key constraint"
   - Handling: Show error toast "Failed to delete pet. Please try again."

### Testing Approach

**Manual Testing Checklist:**
1. Open PetDetailPage and click Delete button → Dialog opens
2. Verify dialog shows pet name in title and warning
3. Verify dialog shows counts of related items (if any exist)
4. Click Cancel → Dialog closes, pet not deleted
5. Click "Yes, delete" → Loading state shows, deletion succeeds
6. Verify redirect to /pets with success toast
7. Verify deleted pet no longer in pets grid
8. Verify pet photo deleted from storage (check Supabase Storage)
9. Delete pet with health records → Verify cascade delete
10. Delete pet with no related records → Deletion succeeds
11. Delete pet with no photo → No storage errors
12. Simulate API error → Error toast displays, dialog stays open
13. Try deleting another user's pet → RLS error
14. Test responsive layout (mobile and desktop)

**Edge Cases:**
- Pet with no photo → No storage deletion, DB deletion succeeds
- Pet with no related records → Counts show 0 or hidden, deletion succeeds
- Pet with many related records → All cascade deleted
- Multiple rapid clicks on Delete button → Prevent duplicate deletions (disable button)
- Network error during deletion → Error handling, allow retry

### Learnings from Previous Story (2-4)

**From Story 2-4-edit-pet-profile (Status: drafted)**

Since Story 2.4 is drafted but not yet implemented, this story will need to:
- Ensure Delete button styled consistently with Edit button (both in header)
- Use similar dialog/modal pattern as EditPetForm
- Maintain consistent error handling and toast notifications
- Follow same RLS enforcement patterns

**Key integration points:**
- Delete button positioned near Edit button in PetDetailPage header
- Both use shadcn/ui components for consistency
- Both handle success/error with toast notifications
- Both enforce RLS for security

**Design Consistency:**
- Use same button styling patterns (destructive variant for Delete)
- Use same toast notification styling
- Maintain consistent spacing and layout
- Follow same error handling patterns

### Future Enhancements (Post-MVP)

1. **Type pet name to confirm:**
   - Require user to type exact pet name before deletion
   - Prevents accidental deletions
   - More secure for pets with many records

2. **Soft delete (archive):**
   - Instead of permanent deletion, mark as archived
   - Allow restoration within 30 days
   - Permanent deletion after 30 days

3. **Bulk deletion:**
   - Select multiple pets to delete at once
   - Useful for users with many pets

4. **Export before delete:**
   - Prompt user to export pet data before deletion
   - Download PDF or JSON backup

### References

- [Epic 2: Pet Profile Management - docs/epics.md#Epic-2]
- [Story 2.1: Create Pet Profile - docs/stories/2-1-create-pet-profile-with-basic-info.md]
- [Story 2.3: Pet Detail Page - docs/stories/2-3-pet-detail-page-with-full-info.md]
- [Story 2.4: Edit Pet Profile - docs/stories/2-4-edit-pet-profile.md]
- [Architecture: Database Schema - docs/architecture.md]
- [Supabase Foreign Keys Documentation](https://supabase.com/docs/guides/database/foreign-keys)
- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [shadcn/ui AlertDialog Component](https://ui.shadcn.com/docs/components/alert-dialog)
- [React Router Navigation](https://reactrouter.com/en/main/hooks/use-navigate)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-08:** Story drafted from Epic 2.5 requirements (Status: backlog → drafted)
