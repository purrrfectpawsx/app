# Story 3.5: Edit Health Record

Status: ready-for-dev

## Story

As a pet owner,
I want to edit existing health records,
So that I can fix mistakes or add missing information.

## Acceptance Criteria

1. Each health record in timeline has "Edit" button/icon visible on hover
2. Clicking Edit opens form pre-filled with current record data
3. Form shows appropriate fields based on record type (same as create)
4. Save button updates record in database
5. Timeline refreshes to show updated record
6. Success message displayed after save
7. Cancel button discards changes and closes form

## Dev Notes

### Technical Stack
- Component: EditHealthRecordForm.tsx (reuses field components from create forms)
- API: UPDATE health_records WHERE id = record_id AND user_id = auth.uid()
- Form: React Hook Form + Zod (same schemas as create)
- State: Pre-populate form with existing record data

### Implementation Approach
1. Add Edit button to timeline record items
2. Create EditHealthRecordForm component (similar to create form)
3. Load existing record data into form on mount
4. Implement Supabase update operation
5. Handle success/error states
6. Refresh timeline after successful update

### Prerequisites
- Story 3.2 and 3.3 completed (create forms exist to reuse)
- Story 3.4 completed (timeline view exists for Edit button placement)

## Dev Agent Record

### Context Reference

- docs/stories/3-5-edit-health-record.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.5 requirements (Status: backlog → drafted)
