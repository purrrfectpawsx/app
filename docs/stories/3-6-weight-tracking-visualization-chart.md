# Story 3.6: Weight Tracking Visualization Chart

Status: ready-for-dev

## Story

As a pet owner,
I want to see my pet's weight trends over time in a chart,
So that I can monitor if they're maintaining a healthy weight.

## Acceptance Criteria

1. "Weight Chart" section visible on Health tab below/above timeline
2. Line chart displays all Weight Check records over time (x-axis: date, y-axis: weight)
3. Chart shows ideal weight range as shaded area (based on species/breed defaults)
4. Date range selector: 1 month, 3 months, 6 months, 1 year, All time
5. Chart requires minimum 2 weight records to display (otherwise shows empty state)
6. Chart responsive to screen size (mobile-friendly)
7. Hover shows exact weight and date for each data point

## Tasks / Subtasks

- [ ] Task 1: Create WeightChart component structure (AC: #1, #6)
  - [ ] Create src/components/health/WeightChart.tsx
  - [ ] Add section container with title "Weight Chart"
  - [ ] Make component responsive using Recharts ResponsiveContainer
  - [ ] Set appropriate aspect ratio for mobile and desktop
  - [ ] Test: Component renders on Health tab
  - [ ] Test: Responsive layout works on mobile and desktop

- [ ] Task 2: Fetch and prepare weight check data (AC: #2, #5)
  - [ ] Query health_records table filtering for record_type = 'weight_check'
  - [ ] Extract weight_data.weight, weight_data.unit, and date fields
  - [ ] Sort by date ascending (oldest to newest for chart)
  - [ ] Convert weights to single unit (kg) for consistent charting
  - [ ] If < 2 weight records → show empty state
  - [ ] Test: Weight data fetched correctly
  - [ ] Test: Empty state shows when < 2 records

- [ ] Task 3: Implement line chart with Recharts (AC: #2, #7)
  - [ ] Install/import Recharts library (LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip)
  - [ ] Create LineChart with weight data
  - [ ] X-axis: date (formatted as MMM DD, YYYY)
  - [ ] Y-axis: weight (with unit label)
  - [ ] Add CartesianGrid for readability
  - [ ] Implement Tooltip to show exact weight and date on hover
  - [ ] Style line with blue color (stroke="#3b82f6")
  - [ ] Test: Chart displays weight data points correctly
  - [ ] Test: Tooltip shows on hover with accurate data

- [ ] Task 4: Add ideal weight range shaded area (AC: #3)
  - [ ] Create idealWeightRanges constant with defaults per species:
    - Dog: 10-30 kg
    - Cat: 3-6 kg
    - Bird: 0.1-1 kg
    - Rabbit: 2-5 kg
    - Other: no default range
  - [ ] Use ReferenceArea component to shade ideal range
  - [ ] Shade color: green with low opacity (fill="#22c55e" fillOpacity={0.1})
  - [ ] Test: Ideal range displays as shaded area on chart
  - [ ] Test: Range appropriate for pet's species

- [ ] Task 5: Implement date range selector (AC: #4)
  - [ ] Create WeightChartControls component
  - [ ] Add date range buttons: 1M, 3M, 6M, 1Y, All
  - [ ] Implement active state styling for selected range
  - [ ] Filter weight data based on selected range
  - [ ] Default to "All" range
  - [ ] Test: Clicking range button filters chart data
  - [ ] Test: Chart updates immediately when range changes

- [ ] Task 6: Implement date range filtering logic (AC: #4)
  - [ ] Calculate date threshold based on selected range
  - [ ] Filter weight records where date >= threshold
  - [ ] Use date-fns for date calculations (subMonths, subYears)
  - [ ] Update chart data when filter changes
  - [ ] Test: 1 month range shows last 30 days
  - [ ] Test: "All" range shows all weight records

- [ ] Task 7: Create empty state for insufficient data (AC: #5)
  - [ ] Design empty state component with message
  - [ ] Message: "Add at least 2 weight records to see chart"
  - [ ] Include CTA button to add weight check
  - [ ] Show empty state conditionally (< 2 records)
  - [ ] Test: Empty state shows when 0-1 weight records
  - [ ] Test: Chart shows when >= 2 weight records

- [ ] Task 8: Handle mixed weight units (AC: #2)
  - [ ] Check if records use different units (kg vs lbs)
  - [ ] Convert all weights to single unit (default: kg)
  - [ ] Conversion formula: lbs * 0.453592 = kg
  - [ ] Display unit in Y-axis label
  - [ ] If mixed units, show "(converted to kg)" in chart title
  - [ ] Test: Mixed unit records display correctly on chart
  - [ ] Test: Y-axis label shows correct unit

- [ ] Task 9: Add body condition indicators to data points (AC: #2)
  - [ ] Extract body_condition from weight_data
  - [ ] Color-code data point dots based on body condition:
    - Underweight: blue (#3b82f6)
    - Ideal: green (#22c55e)
    - Overweight: yellow (#eab308)
    - No condition: gray (#6b7280)
  - [ ] Use Recharts dot prop to customize point colors
  - [ ] Add legend explaining color coding
  - [ ] Test: Data points colored correctly based on body condition

- [ ] Task 10: E2E testing (All ACs)
  - [ ] Test: Weight chart section displays on Health tab
  - [ ] Test: Line chart shows all weight check records
  - [ ] Test: Ideal weight range shaded area displays
  - [ ] Test: Date range selector filters data correctly
  - [ ] Test: Empty state shows when < 2 weight records
  - [ ] Test: Chart responsive on mobile and desktop
  - [ ] Test: Hover tooltip shows exact weight and date
  - [ ] Test: Mixed unit records handled correctly
  - [ ] Test: Body condition color coding works

## Dev Notes

### Technical Stack
- Recharts library for data visualization
- React with TypeScript
- date-fns for date calculations
- Tailwind CSS for styling
- shadcn/ui components (Button, Card)

### Implementation Approach
1. Create WeightChart component with Recharts LineChart
2. Fetch and prepare weight check data
3. Implement date range filtering
4. Add ideal weight range shaded area
5. Handle mixed units and body condition indicators
6. Create empty state for insufficient data
7. Ensure responsive design

### Recharts Implementation Example

```typescript
<ResponsiveContainer width="100%" aspect={2}>
  <LineChart data={weightData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="date" tickFormatter={formatDate} />
    <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
    <Tooltip content={<CustomTooltip />} />
    <ReferenceArea y1={idealMin} y2={idealMax} fill="#22c55e" fillOpacity={0.1} />
    <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={<CustomDot />} />
  </LineChart>
</ResponsiveContainer>
```

### Ideal Weight Ranges (Default)

```typescript
const idealWeightRanges = {
  dog: { min: 10, max: 30, unit: 'kg' },
  cat: { min: 3, max: 6, unit: 'kg' },
  bird: { min: 0.1, max: 1, unit: 'kg' },
  rabbit: { min: 2, max: 5, unit: 'kg' },
  other: null  // No default range
}
```

### Prerequisites
- Story 3.3 completed (Weight Check records can be created)
- Story 3.4 completed (Health timeline exists for integration)

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 3.3: Create Other Record Types - docs/stories/3-3-create-other-record-types.md]
- [Architecture: Component Structure - docs/architecture.md]
- [Recharts Documentation](https://recharts.org)

## Dev Agent Record

### Context Reference

- docs/stories/3-6-weight-tracking-visualization-chart.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created with comprehensive tasks and acceptance criteria (Status: ready-for-dev)
