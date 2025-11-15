# Story 3.6: Delete Health Record

Status: ready-for-dev

## Story

As a pet owner,
I want to delete health records,
So that I can remove duplicate or incorrect entries.

## Acceptance Criteria

1. Each health record has "Delete" button/icon (destructive color)
2. Clicking Delete shows confirmation dialog with record title
3. Confirmation dialog has "Cancel" and "Delete" buttons
4. Clicking Delete removes record from database
5. Timeline updates immediately to remove deleted record
6. Success message confirms deletion
7. Deleted records are permanently removed (not soft-deleted)

## Dev Notes

### Technical Stack
- Component: ConfirmDeleteDialog.tsx (reusable from Story 2.5 pattern)
- API: DELETE FROM health_records WHERE id = record_id AND user_id = auth.uid()
- Pattern: Same confirmation flow as pet deletion (Story 2.5)

### Implementation Approach
1. Add Delete button to timeline record items
2. Implement confirmation dialog (reuse pattern from pet deletion)
3. Implement Supabase delete operation
4. Handle success/error states
5. Refresh timeline after successful deletion
6. Add success toast notification

### Prerequisites
- Story 3.4 completed (timeline view exists)
- Story 2.5 pattern (confirmation dialog) available to reference

## Dev Agent Record

### Context Reference

- docs/stories/3-6-delete-health-record.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.6 requirements (Status: backlog → drafted)
