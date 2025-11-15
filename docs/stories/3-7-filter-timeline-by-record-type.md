# Story 3.7: Filter Timeline by Record Type

Status: ready-for-dev

## Story

As a pet owner,
I want to filter the health timeline by record type,
So that I can focus on specific types of health events (e.g., only vaccines).

## Acceptance Criteria

1. Filter bar above timeline with checkboxes for each record type
2. Record type options: All, Vaccine, Medication, Vet Visit, Symptom, Weight Check
3. "All" checkbox selected by default (shows all records)
4. Selecting specific types filters timeline to show only those types
5. Multiple types can be selected simultaneously
6. Filter state persists during session (cleared on page reload)
7. Record count badge shows number of filtered results

## Dev Notes

### Technical Stack
- Component: HealthTimelineFilters.tsx
- State: useState for selected filters
- Filtering: Client-side array filter (simple, fast for typical dataset sizes)
- UI: Checkbox group with shadcn/ui Checkbox component

### Implementation Approach
1. Create filter bar component with checkboxes
2. Add state for selected record types
3. Implement filter logic in timeline component
4. Add result count indicator
5. Style active filters with type-specific colors
6. Handle "All" checkbox logic (deselects others, or all selected = All)

### Prerequisites
- Story 3.4 completed (timeline view exists to filter)

## Dev Agent Record

### Context Reference

- docs/stories/3-7-filter-timeline-by-record-type.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.7 requirements (Status: backlog → drafted)
