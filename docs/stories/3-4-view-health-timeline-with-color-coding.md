# Story 3.4: View Health Timeline with Color Coding

Status: ready-for-dev

## Story

As a pet owner,
I want to see all health records in a chronological timeline,
So that I can quickly review my pet's health history.

## Acceptance Criteria

1. Health tab on pet detail page shows timeline of all health records (newest first)
2. Each timeline entry displays: icon (based on type), title, date, key details preview
3. Color-coded by type: Vaccine (blue), Medication (purple), Vet Visit (green), Symptom (orange), Weight Check (teal)
4. Overdue vaccines highlighted with red border/background (expiration_date < today)
5. Clicking timeline entry expands to show full details
6. Timeline loads in <3 seconds for 100+ records
7. Empty state shows "Add your first health record" with CTA button

## Tasks / Subtasks

- [ ] Task 1: Create HealthTimeline component structure (AC: #1, #7)
  - [ ] Create src/components/health/HealthTimeline.tsx
  - [ ] Add timeline container with scrollable area
  - [ ] Fetch health records from Supabase: SELECT * FROM health_records WHERE pet_id = $1 ORDER BY date DESC
  - [ ] Implement loading state during data fetch
  - [ ] Create empty state component with "Add your first health record" message and CTA button
  - [ ] Test: Timeline container renders correctly
  - [ ] Test: Empty state displays when no records exist

- [ ] Task 2: Create HealthRecordCard component for timeline entries (AC: #2, #3)
  - [ ] Create src/components/health/HealthRecordCard.tsx
  - [ ] Display record icon based on type using lucide-react (Syringe, Pill, Stethoscope, AlertCircle, Scale)
  - [ ] Display title, date, and key details preview
  - [ ] Implement color coding using Tailwind CSS classes:
    - Vaccine: blue-500 border, blue-50 background
    - Medication: purple-500 border, purple-50 background
    - Vet Visit: green-500 border, green-50 background
    - Symptom: orange-500 border, orange-50 background
    - Weight Check: teal-500 border, teal-50 background
  - [ ] Format date using date-fns library
  - [ ] Extract and display key details per record type from JSON fields
  - [ ] Test: Card renders with correct icon for each record type
  - [ ] Test: Color coding applied correctly for all types

- [ ] Task 3: Implement overdue vaccine highlighting (AC: #4)
  - [ ] Check if record_type === 'vaccine' AND vaccine_data.expiration_date exists
  - [ ] Parse expiration_date and compare with current date
  - [ ] If expiration_date < today: apply red border (border-red-500) and red background (bg-red-50)
  - [ ] Add "OVERDUE" badge with red styling
  - [ ] Test: Vaccine with past expiration date shows red highlighting
  - [ ] Test: Future vaccines show normal blue styling
  - [ ] Test: Vaccines without expiration_date show normal styling

- [ ] Task 4: Implement expandable timeline entries (AC: #5)
  - [ ] Add click handler to HealthRecordCard
  - [ ] Implement expand/collapse state (useState)
  - [ ] Show full details when expanded:
    - All fields from record (title, date, notes)
    - Type-specific fields from JSON data
    - Edit and Delete buttons (placeholders for now)
  - [ ] Add expand/collapse icon (ChevronDown/ChevronUp)
  - [ ] Smooth transition animation using Tailwind
  - [ ] Test: Clicking card toggles expanded state
  - [ ] Test: Expanded view shows all record details

- [ ] Task 5: Optimize timeline performance (AC: #6)
  - [ ] Implement pagination or infinite scroll (load 50 records initially)
  - [ ] Use React.memo for HealthRecordCard to prevent unnecessary re-renders
  - [ ] Optimize Supabase query with proper indexes (already created in Story 3.1)
  - [ ] Add loading skeleton during initial load
  - [ ] Test: Timeline loads in <3 seconds with 100+ records
  - [ ] Test: Scroll performance smooth with many records

- [ ] Task 6: Integration with Pet Detail page (AC: #1)
  - [ ] Update PetDetail.tsx to include Health tab
  - [ ] Add HealthTimeline component to Health tab
  - [ ] Pass pet_id prop to HealthTimeline
  - [ ] Ensure timeline refreshes when new health record added
  - [ ] Test: Health tab displays timeline correctly
  - [ ] Test: Timeline shows records for correct pet only (RLS verification)

- [ ] Task 7: Create type-specific detail formatters (AC: #2)
  - [ ] Create utils/healthRecordFormatters.ts
  - [ ] Implement formatVaccineDetails(vaccine_data): format expiration date, vet clinic, dose
  - [ ] Implement formatMedicationDetails(medication_data): format dosage, frequency, date range
  - [ ] Implement formatVetVisitDetails(vet_visit_data): format clinic, vet name, diagnosis, cost
  - [ ] Implement formatSymptomDetails(symptom_data): format severity, observed behaviors
  - [ ] Implement formatWeightDetails(weight_data): format weight with unit, body condition
  - [ ] Test: Each formatter returns correctly formatted preview text
  - [ ] Test: Handles null/undefined fields gracefully

- [ ] Task 8: E2E testing (All ACs)
  - [ ] Test: Create health records of each type → All appear in timeline
  - [ ] Test: Timeline sorted newest first (most recent at top)
  - [ ] Test: Color coding correct for each record type
  - [ ] Test: Overdue vaccine displays with red highlighting
  - [ ] Test: Click to expand shows full details
  - [ ] Test: Empty timeline shows empty state with CTA
  - [ ] Test: Timeline loads quickly with 100+ test records
  - [ ] Test: RLS prevents viewing other users' health records

## Dev Notes

### Technical Stack
- React components with TypeScript
- Supabase for data fetching (health_records table)
- lucide-react for icons
- date-fns for date formatting
- Tailwind CSS for styling and color coding
- shadcn/ui components (Card, Button, Skeleton)

### Implementation Approach
1. Create HealthTimeline parent component to manage data fetching and state
2. Create HealthRecordCard component for individual timeline entries
3. Implement color coding system using Tailwind CSS utility classes
4. Add expand/collapse functionality with smooth animations
5. Optimize for performance with pagination and memoization
6. Create type-specific formatters for displaying record details

### Prerequisites
- Story 3.1 completed (health_records table exists with indexes)
- Story 3.2 completed (health record creation exists to display records)
- Story 3.3 completed (multiple record types exist to display)
- Story 2.3 completed (Pet Detail page exists for Health tab)

### Color Coding System

**Record Types and Colors:**
- Vaccine: `border-blue-500 bg-blue-50 text-blue-700`
- Medication: `border-purple-500 bg-purple-50 text-purple-700`
- Vet Visit: `border-green-500 bg-green-50 text-green-700`
- Symptom: `border-orange-500 bg-orange-50 text-orange-700`
- Weight Check: `border-teal-500 bg-teal-50 text-teal-700`
- Overdue Vaccine: `border-red-500 bg-red-50 text-red-700`

### Icons Mapping

```typescript
const iconMap = {
  vaccine: Syringe,
  medication: Pill,
  vet_visit: Stethoscope,
  symptom: AlertCircle,
  weight_check: Scale
}
```

### Performance Optimization

**Pagination Strategy:**
- Initial load: 50 most recent records
- Infinite scroll: Load 25 more when user scrolls to bottom
- Cache loaded records to prevent refetching

**Query Optimization:**
```typescript
const { data: records, error } = await supabase
  .from('health_records')
  .select('*')
  .eq('pet_id', petId)
  .order('date', { ascending: false })
  .range(0, 49) // First 50 records
```

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 3.1: Health Record Database Schema - docs/stories/3-1-create-health-record-database-schema.md]
- [Story 3.2: Create Vaccine Record - docs/stories/3-2-create-vaccine-record.md]
- [Story 3.3: Create Other Record Types - docs/stories/3-3-create-other-record-types.md]
- [Architecture: Component Structure - docs/architecture.md]
- [PRD: Health Tracking Requirements - docs/PRD.md]

## Dev Agent Record

### Context Reference

- docs/stories/3-4-view-health-timeline-with-color-coding.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created with comprehensive tasks and acceptance criteria (Status: ready-for-dev)
