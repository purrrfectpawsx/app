# Story 3.9: Weight Tracking Chart

Status: ready-for-dev

## Story

As a pet owner,
I want to see my pet's weight history in a visual chart,
So that I can monitor growth patterns and detect weight issues early.

## Acceptance Criteria

1. Health tab includes "Weight Chart" section below timeline
2. Line chart displays weight over time (x-axis: date, y-axis: weight)
3. Chart shows all weight check records for current pet
4. Data points are clickable to show full weight check details
5. Chart adapts to weight unit (kg or lbs) - shows mixed units if both used
6. Body condition markers: color-coded dots (green=ideal, yellow=overweight, blue=underweight)
7. Empty state when no weight records exist (message + CTA to add weight check)

## Dev Notes

### Technical Stack
- Charting library: Recharts (already used in app, confirmed in package.json)
- Component: WeightTrackingChart.tsx
- Data source: Filter health_records WHERE record_type = 'weight_check'
- Styling: Responsive chart with Tailwind CSS

### Implementation Approach
1. Query weight_check records for current pet
2. Transform data for Recharts format (array of {date, weight, unit, bodyCondition})
3. Implement ResponsiveContainer + LineChart with Line, XAxis, YAxis, Tooltip
4. Add color-coded dots for body condition using CustomizedDot
5. Handle mixed units (show unit label on each data point)
6. Implement click handler to show weight check details
7. Add empty state component

### Prerequisites
- Story 3.3 completed (weight check records can be created)
- Story 3.4 completed (Health tab structure exists)
- Recharts package installed (verify in package.json)

## Dev Agent Record

### Context Reference

- docs/stories/3-9-weight-tracking-chart.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.9 requirements (Status: backlog → drafted)
