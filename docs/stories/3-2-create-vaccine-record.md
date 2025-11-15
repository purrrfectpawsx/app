# Story 3.2: Create Vaccine Record

Status: ready-for-dev

## Story

As a pet owner,
I want to record vaccine information with expiration dates,
So that I never miss vaccine renewals and have proof for boarding/travel.

## Acceptance Criteria

1. "Add Health Record" button visible on pet detail Health tab
2. Record type selector shows: Vaccine, Medication, Vet Visit, Symptom, Weight Check
3. Selecting "Vaccine" shows form fields: title (required), date (required), expiration date (optional), vet clinic (optional), dose (optional), notes (optional)
4. Date defaults to today with calendar picker
5. Expiration date validates must be after vaccine date
6. Successful save shows success message and adds record to timeline
7. Form validation prevents submission without required fields

## Tasks / Subtasks

- [ ] Task 1: Create "Add Health Record" button on pet detail Health tab
  - [ ] Add button component to Health tab
  - [ ] Position button prominently (top-right or floating action button)
  - [ ] Click handler opens create health record modal/drawer
  - [ ] Test: Button visible and clickable

- [ ] Task 2: Create health record type selector
  - [ ] Add record type dropdown/radio group: Vaccine, Medication, Vet Visit, Symptom, Weight Check
  - [ ] Default selection: Vaccine
  - [ ] Update form fields based on selection
  - [ ] Test: All types selectable

- [ ] Task 3: Create VaccineFields component with form fields
  - [ ] Title field (text input, required)
  - [ ] Date field (date picker, required, defaults to today)
  - [ ] Expiration date field (date picker, optional)
  - [ ] Vet clinic field (text input, optional)
  - [ ] Dose field (text input, optional)
  - [ ] Notes field (textarea, optional)
  - [ ] Test: All fields render correctly

- [ ] Task 4: Implement form validation with React Hook Form + Zod
  - [ ] Create vaccine schema with Zod
  - [ ] Validate title (required, max 200 chars)
  - [ ] Validate date (required, valid date)
  - [ ] Validate expiration_date > date
  - [ ] Integrate with React Hook Form
  - [ ] Test: Validation errors display correctly

- [ ] Task 5: Implement save functionality
  - [ ] Collect form data
  - [ ] Insert into health_records table with record_type='vaccine'
  - [ ] Populate vaccine_data JSON field
  - [ ] Handle Supabase errors
  - [ ] Test: Record saves successfully

- [ ] Task 6: Success feedback and UI updates
  - [ ] Show success toast message
  - [ ] Close modal/drawer
  - [ ] Refetch health records to update timeline
  - [ ] Test: Timeline updates with new record

## Dev Notes

### Technical Stack
- React Hook Form + Zod for validation
- Supabase for database operations
- shadcn/ui components (Dialog, Form, DatePicker)
- Validation schemas from src/lib/validation/commonSchemas.ts

### Implementation Approach
1. Create CreateHealthRecordForm component with record type selector
2. Create VaccineFields component for vaccine-specific fields
3. Implement form validation with Zod schema
4. Implement Supabase insert operation
5. Add success handling and UI updates

### Prerequisites
- Story 3.1 completed (health_records table exists)
- Story 2.3 completed (pet detail page with Health tab exists)

## Dev Agent Record

### Context Reference

- docs/stories/3-2-create-vaccine-record.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created from Epic 3.2 requirements (Status: backlog → drafted)
