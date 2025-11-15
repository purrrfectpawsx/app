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

## Dev Notes

### Technical Stack
- Components: MedicationFields.tsx, VetVisitFields.tsx, SymptomFields.tsx, WeightCheckFields.tsx
- API: Same health_records table, different JSON data per type
- Conditional rendering based on recordType state
- Validation schemas from src/lib/validation/commonSchemas.ts

### Prerequisites
- Story 3.2 completed (health record creation infrastructure exists)

## Dev Agent Record

### Context Reference

- docs/stories/3-3-create-other-record-types.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.3 requirements (Status: backlog → drafted)
