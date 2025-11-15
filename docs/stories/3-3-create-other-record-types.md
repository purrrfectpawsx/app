# Story 3.3: Create Medication, Vet Visit, Symptom, and Weight Check Records

Status: ready-for-dev

## Story

As a pet owner,
I want to track different types of health events,
So that I have a complete health history beyond just vaccines.

## Acceptance Criteria

1. Record type selector allows choosing: Medication, Vet Visit, Symptom, Weight Check
2. **Medication fields:** title, date, dosage, frequency (dropdown: daily, twice daily, weekly), start date, end date, notes
3. **Vet Visit fields:** title, date, clinic, vet name, diagnosis, treatment, cost (optional), notes
4. **Symptom fields:** title, date, severity (dropdown: mild, moderate, severe), observed behaviors (textarea), notes
5. **Weight Check fields:** date, weight (number), unit (dropdown: kg, lbs), body condition (dropdown: underweight, ideal, overweight), notes
6. Form dynamically shows relevant fields based on selected record type
7. All record types save successfully and appear in timeline

## Tasks / Subtasks

- [ ] Task 1: Create MedicationFields component (AC: #2)
  - [ ] Create src/components/health/MedicationFields.tsx
  - [ ] Add title field (text input, required)
  - [ ] Add date field (date picker, required, defaults to today)
  - [ ] Add dosage field (text input, optional)
  - [ ] Add frequency dropdown (daily, twice daily, weekly, as needed)
  - [ ] Add start_date field (date picker, optional)
  - [ ] Add end_date field (date picker, optional)
  - [ ] Add notes field (textarea, optional)
  - [ ] Validate end_date >= start_date if both provided
  - [ ] Test: All medication fields render correctly
  - [ ] Test: Form validation works for medication fields

- [ ] Task 2: Create VetVisitFields component (AC: #3)
  - [ ] Create src/components/health/VetVisitFields.tsx
  - [ ] Add title field (text input, required)
  - [ ] Add date field (date picker, required, defaults to today)
  - [ ] Add clinic field (text input, optional)
  - [ ] Add vet_name field (text input, optional)
  - [ ] Add diagnosis field (textarea, optional)
  - [ ] Add treatment field (textarea, optional)
  - [ ] Add cost field (number input, optional, positive numbers only)
  - [ ] Add notes field (textarea, optional)
  - [ ] Test: All vet visit fields render correctly
  - [ ] Test: Cost validation enforces positive numbers

- [ ] Task 3: Create SymptomFields component (AC: #4)
  - [ ] Create src/components/health/SymptomFields.tsx
  - [ ] Add title field (text input, required)
  - [ ] Add date field (date picker, required, defaults to today)
  - [ ] Add severity dropdown (mild, moderate, severe)
  - [ ] Add observed_behaviors field (textarea, optional)
  - [ ] Add notes field (textarea, optional)
  - [ ] Implement visual severity indicators (colors: mild=yellow, moderate=orange, severe=red)
  - [ ] Test: All symptom fields render correctly
  - [ ] Test: Severity dropdown shows all options

- [ ] Task 4: Create WeightCheckFields component (AC: #5)
  - [ ] Create src/components/health/WeightCheckFields.tsx
  - [ ] Add date field (date picker, required, defaults to today)
  - [ ] Add weight field (number input, required, positive numbers only)
  - [ ] Add unit dropdown (kg, lbs)
  - [ ] Add body_condition dropdown (underweight, ideal, overweight)
  - [ ] Add notes field (textarea, optional)
  - [ ] Default unit based on user locale (kg for EU, lbs for US)
  - [ ] Validate weight > 0
  - [ ] Test: All weight check fields render correctly
  - [ ] Test: Weight validation enforces positive numbers

- [ ] Task 5: Update CreateHealthRecordForm to conditionally render fields (AC: #1, #6)
  - [ ] Update src/components/health/CreateHealthRecordForm.tsx
  - [ ] Add record type selector (already exists from Story 3.2)
  - [ ] Implement conditional rendering based on selected record type:
    - If "Medication" selected → render MedicationFields
    - If "Vet Visit" selected → render VetVisitFields
    - If "Symptom" selected → render SymptomFields
    - If "Weight Check" selected → render WeightCheckFields
  - [ ] Clear form data when switching record types
  - [ ] Test: Switching record types shows correct fields
  - [ ] Test: Form data clears when switching types

- [ ] Task 6: Implement save functionality for new record types (AC: #7)
  - [ ] Update form submission handler to support all record types
  - [ ] For medication: populate medication_data JSON field
  - [ ] For vet_visit: populate vet_visit_data JSON field
  - [ ] For symptom: populate symptom_data JSON field
  - [ ] For weight_check: populate weight_data JSON field
  - [ ] Insert records with appropriate record_type value
  - [ ] Test: Medication record saves successfully
  - [ ] Test: Vet visit record saves successfully
  - [ ] Test: Symptom record saves successfully
  - [ ] Test: Weight check record saves successfully

- [ ] Task 7: Create Zod validation schemas (AC: #2, #3, #4, #5)
  - [ ] Create/update src/lib/validation/healthRecordSchemas.ts
  - [ ] Create medicationSchema: validate dosage, frequency, dates
  - [ ] Create vetVisitSchema: validate cost (positive), required fields
  - [ ] Create symptomSchema: validate severity enum, required fields
  - [ ] Create weightCheckSchema: validate weight (positive), unit enum, body condition enum
  - [ ] Integrate schemas with React Hook Form
  - [ ] Test: Invalid data rejected for each record type
  - [ ] Test: Valid data passes validation for each type

- [ ] Task 8: Ensure records appear in timeline (AC: #7)
  - [ ] After successful save, refetch health records query
  - [ ] Verify all record types display in HealthTimeline (from Story 3.4)
  - [ ] Ensure correct icons and colors for each type
  - [ ] Test: Create medication → appears in timeline with purple color/pill icon
  - [ ] Test: Create vet visit → appears in timeline with green color/stethoscope icon
  - [ ] Test: Create symptom → appears in timeline with orange color/alert icon
  - [ ] Test: Create weight check → appears in timeline with teal color/scale icon

- [ ] Task 9: E2E testing (All ACs)
  - [ ] Test: Can select and create all 4 record types
  - [ ] Test: Each record type shows appropriate fields
  - [ ] Test: Form validation works for all types
  - [ ] Test: All records save to database with correct JSON data
  - [ ] Test: All records appear in timeline after creation
  - [ ] Test: Switching between record types works smoothly
  - [ ] Test: RLS prevents creating records for other users' pets

## Dev Notes

### Technical Stack
- Components: MedicationFields.tsx, VetVisitFields.tsx, SymptomFields.tsx, WeightCheckFields.tsx
- API: Same health_records table, different JSON data per type
- Conditional rendering based on recordType state
- Validation schemas from src/lib/validation/healthRecordSchemas.ts
- React Hook Form + Zod for validation
- shadcn/ui components (Form, Select, Input, Textarea)

### Implementation Approach
1. Create separate field components for each record type (separation of concerns)
2. Update CreateHealthRecordForm to conditionally render appropriate fields
3. Create type-specific Zod schemas for validation
4. Populate type-specific JSON fields on save
5. Test each record type end-to-end

### JSON Field Structures

**medication_data:**
```typescript
{
  dosage: string | null,
  frequency: 'daily' | 'twice-daily' | 'weekly' | 'as-needed' | null,
  start_date: string | null,  // ISO date
  end_date: string | null      // ISO date
}
```

**vet_visit_data:**
```typescript
{
  clinic: string | null,
  vet_name: string | null,
  diagnosis: string | null,
  treatment: string | null,
  cost: number | null
}
```

**symptom_data:**
```typescript
{
  severity: 'mild' | 'moderate' | 'severe' | null,
  observed_behaviors: string | null
}
```

**weight_data:**
```typescript
{
  weight: number | null,
  unit: 'kg' | 'lbs' | null,
  body_condition: 'underweight' | 'ideal' | 'overweight' | null
}
```

### Prerequisites
- Story 3.1 completed (health_records table with JSON fields exists)
- Story 3.2 completed (health record creation infrastructure exists)

## Dev Agent Record

### Context Reference

- docs/stories/3-3-create-other-record-types.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.3 requirements (Status: backlog → drafted)
