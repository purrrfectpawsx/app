# Story 3.10: Export Health Records to PDF

Status: ready-for-dev

## Story

As a pet owner,
I want to export my pet's health records to PDF,
So that I can share them with vets or boarding facilities.

## Acceptance Criteria

1. "Export PDF" button visible on pet detail Health tab
2. Clicking button generates PDF with pet name, photo, and all health records
3. PDF includes sections: Pet Info, Vaccines, Medications, Vet Visits, Symptoms, Weight History
4. Each section shows records in chronological order (newest first)
5. PDF includes generation date and app branding (footer)
6. Browser prompts to save/download PDF file named "PetName-Health-Records-YYYY-MM-DD.pdf"
7. Loading state shown during PDF generation

## Dev Notes

### Technical Stack
- PDF library: jsPDF or react-pdf (research best option for our needs)
- Alternative: Browser print API with custom print stylesheet (simpler, no dependency)
- Component: ExportHealthRecordsPDF.tsx
- Data: Fetch all health_records for current pet, group by type

### Implementation Approach
1. Add "Export PDF" button to Health tab
2. Research PDF library options (jsPDF vs react-pdf vs browser print)
3. Implement PDF generation function with sections for each record type
4. Format records in clean, printable layout
5. Include pet photo, name, basic info at top
6. Add branding footer with generation date
7. Handle loading state during generation
8. Trigger browser download with formatted filename

### Prerequisites
- Story 3.4 completed (timeline with all record types exists)
- All health record types (3.2, 3.3) completed
- Decision needed: Which PDF library to use?

## Dev Agent Record

### Context Reference

- docs/stories/3-10-export-health-records-pdf.context.xml

## Change Log

- **2025-11-15:** Story created from Epic 3.10 requirements (Status: backlog → drafted)
