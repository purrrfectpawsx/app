# Story 3.8: Vaccine Expiration Reminders

Status: ready-for-dev

## Story

As a pet owner,
I want to see which vaccines are expiring soon,
So that I never miss vaccine renewals.

## Acceptance Criteria

1. Health tab shows "Upcoming Renewals" section above timeline
2. Section displays vaccines expiring within next 30 days
3. Each reminder shows: vaccine name, expiration date, days until expiration
4. Visual urgency indicators: red (0-7 days), orange (8-14 days), yellow (15-30 days)
5. Clicking reminder scrolls to vaccine record in timeline
6. Section hidden when no vaccines expiring in next 30 days
7. Expired vaccines (past expiration date) marked with "EXPIRED" badge in timeline

## Dev Notes

### Technical Stack
- Component: VaccineExpirationReminders.tsx
- Logic: Filter vaccine records where expiration_date within 30 days
- Date calculation: date-fns (differenceInDays, isBefore, isAfter)
- Sorting: Sort by expiration date (soonest first)

### Implementation Approach
1. Query vaccine records with expiration dates
2. Calculate days until expiration using date-fns
3. Filter vaccines expiring in next 30 days
4. Sort by expiration date (ascending)
5. Apply color coding based on urgency
6. Implement scroll-to-record functionality
7. Add "EXPIRED" badge to timeline items with past expiration dates

### Prerequisites
- Story 3.2 completed (vaccine records with expiration dates exist)
- Story 3.4 completed (timeline view exists)
- date-fns package installed (check package.json)

## Dev Agent Record

### Context Reference

- docs/stories/3-8-vaccine-expiration-reminders.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.8 requirements (Status: backlog → drafted)
