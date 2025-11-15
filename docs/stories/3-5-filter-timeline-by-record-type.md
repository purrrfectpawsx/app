# Story 3.5: Filter Timeline by Record Type

Status: ready-for-dev

## Story

As a pet owner,
I want to filter the health timeline by record type,
So that I can focus on specific health information (e.g., only vaccines).

## Acceptance Criteria

1. Filter chips visible above timeline: All, Vaccines, Medications, Vet Visits, Symptoms, Weight Checks
2. Clicking filter chip toggles that type on/off (multi-select)
3. Timeline updates immediately to show only selected types
4. At least one filter must be active (can't deselect all)
5. Active filters visually distinct (filled background vs outline)
6. Filter state persists during session (React state)
7. Record count shown per filter type (e.g., "Vaccines (5)")

## Tasks / Subtasks

- [ ] Task 1: Create TimelineFilters component (AC: #1, #7)
  - [ ] Create src/components/health/TimelineFilters.tsx
  - [ ] Create filter chip group with options: All, Vaccines, Medications, Vet Visits, Symptoms, Weight Checks
  - [ ] Calculate record count for each type from health records data
  - [ ] Display count badge next to each filter label (e.g., "Vaccines (5)")
  - [ ] Use shadcn/ui Toggle or custom chip components
  - [ ] Test: All filter chips render with correct labels
  - [ ] Test: Record counts display accurately for each type

- [ ] Task 2: Implement filter state management (AC: #2, #6)
  - [ ] Add filter state: const [activeFilters, setActiveFilters] = useState<string[]>(['all'])
  - [ ] Default state: 'all' filter active
  - [ ] Implement toggle handler for filter clicks
  - [ ] Support multi-select: clicking adds/removes filter from array
  - [ ] Update URL params optionally for bookmarkability
  - [ ] Test: Clicking filter toggles it on/off
  - [ ] Test: Multiple filters can be selected simultaneously
  - [ ] Test: Filter state persists during session

- [ ] Task 3: Implement "at least one filter" constraint (AC: #4)
  - [ ] When user attempts to deselect last active filter → prevent action
  - [ ] Show toast message: "At least one filter must be active"
  - [ ] If "All" is clicked when all types selected → deselect all except "All"
  - [ ] If specific type clicked when only "All" active → deselect "All", select that type
  - [ ] Test: Cannot deselect the last active filter
  - [ ] Test: Appropriate feedback shown when attempting to deselect last filter

- [ ] Task 4: Implement visual styling for active/inactive filters (AC: #5)
  - [ ] Active filters: filled background (bg-blue-500 text-white)
  - [ ] Inactive filters: outline style (border-gray-300 text-gray-700)
  - [ ] Hover state: slight opacity change
  - [ ] Smooth transition animations
  - [ ] Keyboard focus indicators for accessibility
  - [ ] Test: Active filters visually distinct from inactive
  - [ ] Test: Hover and focus states work correctly

- [ ] Task 5: Implement timeline filtering logic (AC: #3)
  - [ ] Update HealthTimeline component to accept activeFilters prop
  - [ ] Filter records based on activeFilters:
    - If 'all' in activeFilters → show all records
    - Otherwise → show only records where record_type in activeFilters
  - [ ] Update timeline immediately when filters change (no "Apply" button)
  - [ ] Maintain timeline sorting (newest first) after filtering
  - [ ] Test: Selecting "Vaccines" shows only vaccine records
  - [ ] Test: Selecting multiple types shows all selected types
  - [ ] Test: "All" filter shows all records

- [ ] Task 6: Handle "All" filter special behavior (AC: #1)
  - [ ] When "All" clicked and other filters active → deselect all others, activate only "All"
  - [ ] When any specific filter clicked and "All" active → deselect "All", activate clicked filter
  - [ ] When all specific types manually selected → automatically activate "All"
  - [ ] Test: "All" behavior works as exclusive or inclusive appropriately
  - [ ] Test: Selecting all types individually activates "All"

- [ ] Task 7: Integrate with HealthTimeline component (AC: #3)
  - [ ] Add TimelineFilters component above HealthTimeline in Health tab
  - [ ] Pass health records data to TimelineFilters for count calculation
  - [ ] Pass activeFilters state to HealthTimeline for filtering
  - [ ] Ensure proper component hierarchy and data flow
  - [ ] Test: Filters appear above timeline
  - [ ] Test: Filter changes update timeline display immediately

- [ ] Task 8: Accessibility enhancements (AC: #1, #2, #5)
  - [ ] Add ARIA labels to filter chips
  - [ ] Support keyboard navigation (Tab, Arrow keys, Enter/Space to toggle)
  - [ ] Screen reader announcements when filters change
  - [ ] Clear visual focus indicators
  - [ ] Test: Can navigate filters with keyboard only
  - [ ] Test: Screen reader announces filter state changes

- [ ] Task 9: E2E testing (All ACs)
  - [ ] Test: All filter chips display with correct counts
  - [ ] Test: Clicking filter toggles it on/off
  - [ ] Test: Timeline updates immediately to show only selected types
  - [ ] Test: Cannot deselect all filters (at least one always active)
  - [ ] Test: Active filters have distinct visual styling
  - [ ] Test: "All" filter behavior works correctly
  - [ ] Test: Filter state persists during session (page refresh clears)
  - [ ] Test: Record counts accurate for each filter type

## Dev Notes

### Technical Stack
- React with TypeScript
- State management with useState hook
- shadcn/ui Toggle or custom chip components
- Tailwind CSS for styling
- Accessibility: ARIA labels, keyboard navigation

### Implementation Approach
1. Create TimelineFilters component with chip group
2. Implement multi-select filter state management
3. Add filtering logic to HealthTimeline component
4. Handle "All" filter special behavior
5. Apply active/inactive visual styling
6. Ensure accessibility compliance

### Filter State Structure

```typescript
type FilterType = 'all' | 'vaccine' | 'medication' | 'vet_visit' | 'symptom' | 'weight_check'

const [activeFilters, setActiveFilters] = useState<FilterType[]>(['all'])
```

### Filter Logic

```typescript
const filteredRecords = useMemo(() => {
  if (activeFilters.includes('all')) {
    return healthRecords
  }
  return healthRecords.filter(record =>
    activeFilters.includes(record.record_type)
  )
}, [healthRecords, activeFilters])
```

### Count Calculation

```typescript
const counts = {
  all: healthRecords.length,
  vaccine: healthRecords.filter(r => r.record_type === 'vaccine').length,
  medication: healthRecords.filter(r => r.record_type === 'medication').length,
  vet_visit: healthRecords.filter(r => r.record_type === 'vet_visit').length,
  symptom: healthRecords.filter(r => r.record_type === 'symptom').length,
  weight_check: healthRecords.filter(r => r.record_type === 'weight_check').length
}
```

### Prerequisites
- Story 3.4 completed (HealthTimeline component exists)
- Story 3.3 completed (multiple record types exist to filter)

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 3.4: View Health Timeline - docs/stories/3-4-view-health-timeline-with-color-coding.md]
- [Architecture: Component Structure - docs/architecture.md]

## Dev Agent Record

### Context Reference

- docs/stories/3-5-filter-timeline-by-record-type.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created with comprehensive tasks and acceptance criteria (Status: ready-for-dev)
