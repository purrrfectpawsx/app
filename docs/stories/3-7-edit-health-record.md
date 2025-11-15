# Story 3.7: Edit Health Record

Status: ready-for-dev

## Story

As a pet owner,
I want to update existing health records,
So that I can correct mistakes or add details I initially forgot.

## Acceptance Criteria

1. Edit button visible on expanded timeline entry
2. Edit form pre-populates with existing record data
3. All fields editable except pet_id and creation date
4. Record type cannot be changed (would require different field structure)
5. Validation enforces same rules as create
6. Save updates record and refreshes timeline
7. Cancel discards changes and collapses entry

## Tasks / Subtasks

- [ ] Task 1: Add Edit button to timeline entries (AC: #1)
  - [ ] Update HealthRecordCard component (expanded state)
  - [ ] Add Edit button with pencil icon (lucide-react Edit icon)
  - [ ] Position button in expanded view header
  - [ ] Click handler opens edit mode/modal
  - [ ] Test: Edit button visible when timeline entry expanded
  - [ ] Test: Clicking Edit button triggers edit mode

- [ ] Task 2: Implement edit mode state management (AC: #2, #7)
  - [ ] Add edit state: const [editingRecordId, setEditingRecordId] = useState<string | null>(null)
  - [ ] Track which record is being edited
  - [ ] Open CreateHealthRecordForm in edit mode
  - [ ] Pass record data to pre-populate form
  - [ ] Test: Edit state tracked correctly
  - [ ] Test: Only one record editable at a time

- [ ] Task 3: Pre-populate form with existing record data (AC: #2)
  - [ ] Update CreateHealthRecordForm to accept initialData prop
  - [ ] Detect edit mode when initialData provided
  - [ ] Pre-fill all form fields with record data:
    - Common fields: title, date, notes
    - Type-specific JSON fields: vaccine_data, medication_data, etc.
  - [ ] Parse JSON fields into individual form inputs
  - [ ] Test: Form fields pre-populated with correct data
  - [ ] Test: All record types pre-populate correctly

- [ ] Task 4: Disable record type changes in edit mode (AC: #4)
  - [ ] Disable record type selector when in edit mode
  - [ ] Display current record type as read-only text
  - [ ] Show tooltip explaining why type can't be changed
  - [ ] Test: Record type selector disabled in edit mode
  - [ ] Test: Tooltip displays explanation on hover

- [ ] Task 5: Implement save (update) functionality (AC: #3, #6)
  - [ ] Update form submit handler to detect edit mode
  - [ ] Use Supabase .update() instead of .insert() when editing
  - [ ] Update record in database: UPDATE health_records SET ... WHERE id = recordId
  - [ ] Update type-specific JSON fields with new data
  - [ ] Set updated_at timestamp (auto-handled by trigger)
  - [ ] Refetch health records after successful update
  - [ ] Close edit mode and collapse entry
  - [ ] Show success toast: "Health record updated successfully"
  - [ ] Test: Update saves to database correctly
  - [ ] Test: Timeline refreshes with updated data

- [ ] Task 6: Apply validation same as create (AC: #5)
  - [ ] Reuse same Zod schemas from create (healthRecordSchemas.ts)
  - [ ] Validate all fields before allowing save
  - [ ] Required fields: title, date
  - [ ] Type-specific validation:
    - Vaccine: expiration_date must be after date
    - Medication: end_date must be >= start_date
    - Vet Visit: cost must be positive
    - Weight Check: weight must be positive
  - [ ] Show validation errors in form
  - [ ] Test: Invalid data prevented from saving
  - [ ] Test: Validation errors displayed correctly

- [ ] Task 7: Implement cancel functionality (AC: #7)
  - [ ] Add Cancel button to edit form
  - [ ] Click handler discards changes and exits edit mode
  - [ ] Reset form to original values
  - [ ] Collapse timeline entry
  - [ ] No database changes on cancel
  - [ ] Test: Cancel button discards changes
  - [ ] Test: Timeline entry collapses on cancel

- [ ] Task 8: Optimistic UI update (AC: #6)
  - [ ] Update local state immediately on save
  - [ ] Show updated data in timeline before API response
  - [ ] Rollback changes if API fails
  - [ ] Show error message if update fails
  - [ ] Test: Timeline updates immediately on save
  - [ ] Test: Rollback occurs if API fails

- [ ] Task 9: Handle concurrent edits prevention (Best practice)
  - [ ] Close any open edit forms when new one opened
  - [ ] Prevent editing multiple records simultaneously
  - [ ] Optional: Add updated_at check for optimistic locking
  - [ ] Test: Only one record editable at a time

- [ ] Task 10: E2E testing (All ACs)
  - [ ] Test: Edit button appears on expanded timeline entry
  - [ ] Test: Form pre-populates with existing data
  - [ ] Test: Can edit all fields except record type
  - [ ] Test: Record type selector disabled in edit mode
  - [ ] Test: Validation works same as create
  - [ ] Test: Save updates record in database
  - [ ] Test: Timeline refreshes with updated data
  - [ ] Test: Cancel discards changes
  - [ ] Test: All record types editable (vaccine, medication, vet visit, symptom, weight check)
  - [ ] Test: RLS prevents editing other users' records

## Dev Notes

### Technical Stack
- Reuse CreateHealthRecordForm component with edit mode
- Supabase update operation
- React Hook Form for form management
- Zod validation schemas (reused from create)
- Optimistic UI updates

### Implementation Approach
1. Add Edit button to HealthRecordCard expanded view
2. Update CreateHealthRecordForm to support edit mode (via initialData prop)
3. Pre-populate form fields with existing record data
4. Disable record type changes in edit mode
5. Implement update (PUT) logic instead of create (POST)
6. Apply same validation as create
7. Handle cancel to discard changes
8. Optimistic UI update with rollback on error

### Edit Mode Detection

```typescript
const isEditMode = !!initialData

// In form component
useEffect(() => {
  if (initialData) {
    // Pre-populate form with initialData
    form.reset(initialData)
  }
}, [initialData])
```

### Update Query

```typescript
const { data, error } = await supabase
  .from('health_records')
  .update({
    title: formData.title,
    date: formData.date,
    notes: formData.notes,
    vaccine_data: formData.vaccine_data,
    // ... other fields
  })
  .eq('id', recordId)
  .select()
  .single()
```

### Prerequisites
- Story 3.4 completed (HealthTimeline with expandable entries exists)
- Story 3.2 completed (CreateHealthRecordForm exists)
- Story 3.3 completed (All record types supported)

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 3.4: View Health Timeline - docs/stories/3-4-view-health-timeline-with-color-coding.md]
- [Story 3.2: Create Vaccine Record - docs/stories/3-2-create-vaccine-record.md]
- [Architecture: Component Structure - docs/architecture.md]

## Dev Agent Record

### Context Reference

- docs/stories/3-7-edit-health-record.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created with comprehensive tasks and acceptance criteria (Status: ready-for-dev)
