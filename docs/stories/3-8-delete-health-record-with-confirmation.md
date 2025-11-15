# Story 3.8: Delete Health Record with Confirmation

Status: ready-for-dev

## Story

As a pet owner,
I want to delete health records I added by mistake,
So that my timeline stays accurate.

## Acceptance Criteria

1. Delete button visible on expanded timeline entry (destructive styling)
2. Confirmation dialog: "Are you sure you want to delete this [record type]?"
3. Dialog shows record title and date for confirmation
4. Successful deletion removes from timeline immediately
5. Success message: "[Record type] deleted successfully"
6. No cascade effects (deleting record doesn't affect other data)

## Tasks / Subtasks

- [ ] Task 1: Add Delete button to timeline entries (AC: #1)
  - [ ] Update HealthRecordCard component (expanded state)
  - [ ] Add Delete button with trash icon (lucide-react Trash2 icon)
  - [ ] Apply destructive styling (red color: text-red-600 hover:bg-red-50)
  - [ ] Position button next to Edit button
  - [ ] Click handler opens confirmation dialog
  - [ ] Test: Delete button visible when timeline entry expanded
  - [ ] Test: Button has destructive (red) styling

- [ ] Task 2: Create DeleteHealthRecordDialog component (AC: #2, #3)
  - [ ] Create src/components/health/DeleteHealthRecordDialog.tsx
  - [ ] Use shadcn/ui AlertDialog component
  - [ ] Dialog title: "Delete [Record Type]?"
  - [ ] Dialog message: "Are you sure you want to delete this [record type]?"
  - [ ] Display record details: title and date
  - [ ] Add warning: "This action cannot be undone."
  - [ ] Cancel button: "Cancel" (default style)
  - [ ] Delete button: "Delete" (destructive red style)
  - [ ] Test: Dialog displays with correct content
  - [ ] Test: Record details shown accurately

- [ ] Task 3: Implement delete confirmation state management (AC: #2)
  - [ ] Add state: const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  - [ ] Add state: const [recordToDelete, setRecordToDelete] = useState<HealthRecord | null>(null)
  - [ ] Delete button click sets recordToDelete and opens dialog
  - [ ] Cancel button closes dialog without deleting
  - [ ] Test: Dialog opens when Delete button clicked
  - [ ] Test: Dialog shows correct record to delete

- [ ] Task 4: Implement delete functionality (AC: #4, #5, #6)
  - [ ] Create deleteHealthRecord async function
  - [ ] Use Supabase .delete() operation: DELETE FROM health_records WHERE id = recordId
  - [ ] Ensure RLS policies allow deletion (user owns record)
  - [ ] On success: close dialog, refetch health records, show success toast
  - [ ] On error: show error toast, keep dialog open
  - [ ] Success message format: "Vaccine deleted successfully" (use record type)
  - [ ] Test: Delete removes record from database
  - [ ] Test: Success toast displays with correct message
  - [ ] Test: Error handling works if delete fails

- [ ] Task 5: Update timeline after deletion (AC: #4)
  - [ ] Refetch health records after successful delete
  - [ ] Timeline updates automatically with new data
  - [ ] Deleted record no longer appears
  - [ ] Alternative: Optimistic UI update (remove from local state immediately)
  - [ ] Test: Timeline updates immediately after deletion
  - [ ] Test: Deleted record removed from timeline

- [ ] Task 6: Verify no cascade effects (AC: #6)
  - [ ] Confirm health_records is leaf table (no dependent records)
  - [ ] Deleting health record does NOT delete:
    - Associated pet
    - Associated documents (if attached later)
    - Any other data
  - [ ] Only the specific health record deleted
  - [ ] Test: Deleting record doesn't affect other records
  - [ ] Test: Pet still exists after deleting health record

- [ ] Task 7: Handle deletion errors gracefully (Best practice)
  - [ ] Catch and display Supabase errors
  - [ ] Possible errors:
    - RLS policy violation (trying to delete other user's record)
    - Network errors
    - Database errors
  - [ ] Show user-friendly error messages
  - [ ] Keep dialog open on error for retry
  - [ ] Test: RLS prevents deleting other users' records
  - [ ] Test: Network error handled gracefully

- [ ] Task 8: Optimistic UI update with rollback (AC: #4)
  - [ ] Remove record from local state immediately on delete click
  - [ ] Timeline updates instantly (optimistic)
  - [ ] If delete fails, rollback: re-add record to timeline
  - [ ] Show error message on rollback
  - [ ] Test: Optimistic update makes deletion feel instant
  - [ ] Test: Rollback works if deletion fails

- [ ] Task 9: Accessibility enhancements (AC: #1, #2)
  - [ ] ARIA labels for Delete button and dialog
  - [ ] Focus management: trap focus in dialog when open
  - [ ] Escape key closes dialog
  - [ ] Enter key in dialog confirms deletion (dangerous, optional)
  - [ ] Screen reader announces deletion success
  - [ ] Test: Keyboard navigation works (Tab, Escape)
  - [ ] Test: Screen reader announces dialog content

- [ ] Task 10: E2E testing (All ACs)
  - [ ] Test: Delete button appears on expanded timeline entry
  - [ ] Test: Button has destructive (red) styling
  - [ ] Test: Clicking Delete opens confirmation dialog
  - [ ] Test: Dialog shows correct record title and date
  - [ ] Test: Cancel button closes dialog without deleting
  - [ ] Test: Delete button removes record from database
  - [ ] Test: Timeline updates immediately after deletion
  - [ ] Test: Success toast displays
  - [ ] Test: No cascade effects (pet still exists)
  - [ ] Test: RLS prevents deleting other users' records

## Dev Notes

### Technical Stack
- shadcn/ui AlertDialog component for confirmation
- Supabase delete operation
- React state for dialog management
- Optimistic UI updates
- Toast notifications for feedback

### Implementation Approach
1. Add Delete button to HealthRecordCard expanded view
2. Create DeleteHealthRecordDialog component
3. Implement delete confirmation state management
4. Execute delete operation via Supabase
5. Update timeline after deletion (refetch or optimistic UI)
6. Show success/error feedback
7. Ensure no cascade effects

### Delete Operation

```typescript
const deleteHealthRecord = async (recordId: string) => {
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', recordId)

  if (error) throw error
}
```

### Optimistic UI Pattern

```typescript
const handleDelete = async (recordId: string) => {
  // Optimistic: remove from UI immediately
  setHealthRecords(prev => prev.filter(r => r.id !== recordId))

  try {
    await deleteHealthRecord(recordId)
    toast.success('Health record deleted successfully')
  } catch (error) {
    // Rollback: re-fetch data
    refetchHealthRecords()
    toast.error('Failed to delete health record')
  }
}
```

### Prerequisites
- Story 3.4 completed (HealthTimeline with expandable entries exists)
- Story 3.2 completed (Health records can be created to delete)

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 3.4: View Health Timeline - docs/stories/3-4-view-health-timeline-with-color-coding.md]
- [Architecture: Component Structure - docs/architecture.md]

## Dev Agent Record

### Context Reference

- docs/stories/3-8-delete-health-record-with-confirmation.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created with comprehensive tasks and acceptance criteria (Status: ready-for-dev)
