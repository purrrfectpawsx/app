# Field Clarifications for Epic 3+

**Created:** 2025-11-15
**Purpose:** Epic 2 Retrospective Action Item - Review Epic 3+ ACs for field ambiguities
**Context:** Story 2.3 had weight field ambiguity (mentioned in AC but not implemented, as weight belongs to health records)

## Overview

This document clarifies which fields belong to which tables/entities to prevent implementation confusion across epics.

## Field Ownership Matrix

### Pet Profile Fields (Epic 2 - pets table)

**Core Identity:**
- `name` ✅ - Pet's name
- `species` ✅ - Dog, cat, bird, rabbit, other
- `breed` ✅ - Optional breed information
- `birth_date` ✅ - Date of birth (used to calculate age)
- `photo_url` ✅ - Profile photo from Supabase Storage

**Optional Details:**
- `gender` ✅ - Male, female, unknown (pets table)
- `spayed_neutered` ✅ - Boolean or string (pets table)
- `microchip` ✅ - Microchip number (pets table)
- `notes` ✅ - General notes about pet (pets table)

**NOT in pets table:**
- ❌ `weight` - Belongs to health records (weight_check type)
- ❌ `current_medications` - Belongs to health records (medication type)
- ❌ `allergies` - Belongs to health records (notes or symptom records)
- ❌ `vet_clinic` - Belongs to vet visit records (vet_visit_data)
- ❌ `expenses_total` - Calculated from expenses table
- ❌ `last_checkup` - Calculated from health_records table

### Health Record Fields (Epic 3 - health_records table)

**Base Fields (all record types):**
- `record_type` ✅ - vaccine, medication, vet_visit, symptom, weight_check
- `title` ✅ - User-friendly title/name of record
- `date` ✅ - Date of event/record
- `notes` ✅ - General notes for any record type

**Type-Specific Fields (JSONB columns):**

**vaccine_data:**
- `expiration_date` ✅ - When vaccine expires
- `vet_clinic` ✅ - Clinic where vaccine given
- `dose` ✅ - Dosage information

**medication_data:**
- `dosage` ✅ - How much medication
- `frequency` ✅ - How often (daily, twice daily, etc.)
- `start_date` ✅ - When medication started
- `end_date` ✅ - When medication ends

**vet_visit_data:**
- `clinic` ✅ - Veterinary clinic name
- `vet_name` ✅ - Veterinarian's name
- `diagnosis` ✅ - What was diagnosed
- `treatment` ✅ - Treatment prescribed
- `cost` ✅ - Cost of visit (can also be expense record)

**symptom_data:**
- `severity` ✅ - mild, moderate, severe
- `observed_behaviors` ✅ - Description of symptoms

**weight_data:**
- `weight` ✅ - Numeric weight value
- `unit` ✅ - kg or lbs
- `body_condition` ✅ - underweight, ideal, overweight

### Expense Fields (Epic 4 - expenses table)

**Core Fields:**
- `amount` ✅ - Expense amount
- `currency` ✅ - EUR, USD, GBP
- `category` ✅ - vet, food, grooming, supplies, boarding, other
- `date` ✅ - Date of expense
- `merchant` ✅ - Where purchased/paid
- `notes` ✅ - Additional details
- `receipt_url` ✅ - Photo of receipt (Supabase Storage)

**NOT in expenses table:**
- ❌ `vet_diagnosis` - Belongs to health records (vet_visit_data)
- ❌ `treatment` - Belongs to health records (vet_visit_data)
- ❌ `medication_name` - Belongs to health records (medication record)

**Note:** Vet visit costs can be recorded BOTH as:
1. Health record (vet_visit_data.cost) - For medical context
2. Expense record (category: vet) - For financial tracking

### Reminder Fields (Epic 5 - reminders table)

**Core Fields:**
- `title` ✅ - Reminder title
- `date_time` ✅ - When reminder should fire
- `recurrence` ✅ - one_time, daily, weekly, monthly, yearly
- `notes` ✅ - Additional details
- `health_record_id` ✅ - Optional link to health record
- `completed_at` ✅ - When reminder was completed

### Document Fields (Epic 6 - documents table)

**Core Fields:**
- `filename` ✅ - Document filename
- `file_url` ✅ - Supabase Storage URL
- `file_size` ✅ - Size in bytes
- `file_type` ✅ - MIME type
- `category` ✅ - vet_record, vaccine_card, receipt, lab_results, xray, insurance_claim, other
- `uploaded_at` ✅ - When uploaded

## Common Ambiguities and Clarifications

### 1. Weight Field

**Ambiguity:** Story 2.3 AC1 mentions "weight" in pet detail page display.

**Clarification:**
- Weight is NOT a direct field on pets table
- Weight is tracked as health_records (record_type: weight_check)
- Weight shown on pet detail page is CALCULATED from latest weight_check record
- Allows weight history tracking over time

**Implementation:**
```typescript
// pets table - NO weight column
interface Pet {
  name: string
  species: string
  // ... NO weight field
}

// health_records table - weight via weight_check records
interface WeightCheckRecord {
  record_type: 'weight_check'
  weight_data: {
    weight: number
    unit: 'kg' | 'lbs'
    body_condition: string
  }
}

// Display: Get latest weight from health records
const latestWeight = await supabase
  .from('health_records')
  .select('weight_data')
  .eq('pet_id', petId)
  .eq('record_type', 'weight_check')
  .order('date', { ascending: false })
  .limit(1)
  .single()
```

### 2. Current Medications

**Ambiguity:** Pet detail page might show "current medications" but it's not a pet field.

**Clarification:**
- Medications are health_records (record_type: medication)
- "Current medications" = medication records where `end_date IS NULL OR end_date >= today`
- Displayed on pet detail but CALCULATED from health_records

**Implementation:**
```typescript
// Query current medications
const currentMeds = await supabase
  .from('health_records')
  .select('*')
  .eq('pet_id', petId)
  .eq('record_type', 'medication')
  .or('medication_data->end_date.is.null,medication_data->end_date.gte.' + today)
```

### 3. Vet Clinic Information

**Ambiguity:** Multiple places could store vet clinic info.

**Clarification:**
- Primary vet clinic: NOT stored anywhere (future enhancement in profiles or pets)
- Vet clinic per visit: Stored in vet_visit_data.clinic (health records)
- Each visit can be at different clinic

**Future Enhancement:**
- Consider adding `primary_vet_clinic` to pets table in future
- Pre-fill vet visit forms with primary clinic
- Track visit history per clinic

### 4. Allergies

**Ambiguity:** Allergies could be pet field or health record.

**Clarification:**
- Allergies are NOT a pets table field
- Allergies tracked as symptom or vet_visit records
- Can use notes field for quick reference
- Consider adding dedicated allergies table in future (Epic 8+)

**Current Implementation:**
- Use pets.notes for listing allergies
- Create symptom health records for allergy incidents
- Document in vet_visit records

### 5. Age vs Birth Date

**Ambiguity:** Should we store age or calculate it?

**Clarification:**
- Store: `birth_date` (DATE) in pets table
- Calculate: Age at display time using `calculatePetAge(birth_date)` utility
- Never store calculated age (becomes stale)

**Implementation:**
```typescript
// Store only birth date
interface Pet {
  birth_date: string | null // ISO date string
}

// Calculate age at display time
const age = calculatePetAge(pet.birth_date) // "3 years 5 months"
```

### 6. Total Expenses

**Ambiguity:** Should total expenses be on pet detail page?

**Clarification:**
- Total expenses NOT stored in pets table
- Calculated on-demand from expenses table
- Can be cached for performance if needed

**Implementation:**
```typescript
// Calculate total expenses
const { data } = await supabase
  .from('expenses')
  .select('amount')
  .eq('pet_id', petId)

const total = data?.reduce((sum, exp) => sum + exp.amount, 0) || 0
```

### 7. Last Checkup Date

**Ambiguity:** Should last checkup be stored in pets table?

**Clarification:**
- NOT stored in pets table
- Calculated from health_records (record_type: vet_visit)
- Latest vet_visit.date = last checkup

**Implementation:**
```typescript
const { data: lastCheckup } = await supabase
  .from('health_records')
  .select('date')
  .eq('pet_id', petId)
  .eq('record_type', 'vet_visit')
  .order('date', { ascending: false })
  .limit(1)
  .single()
```

## Epic-Specific Guidelines

### Epic 2: Pet Profiles

**What belongs here:**
- Static identifying information (name, species, breed)
- One-time facts (birth date, microchip)
- Physical characteristics that rarely change (gender, spayed/neutered)
- Profile photo

**What DOESN'T belong here:**
- Anything that changes over time (weight, medications)
- Anything with history (health events, expenses)
- Calculated values (age, totals)

### Epic 3: Health Records

**What belongs here:**
- Any health-related EVENT or MEASUREMENT
- Time-series data (weight checks over time)
- Medical history (vaccines, vet visits, symptoms)
- Temporary states (current medications with start/end dates)

**Pattern:** If it has a date and represents a point-in-time event or measurement, it's a health record.

### Epic 4: Expenses

**What belongs here:**
- Financial transactions only
- Money spent on pet-related items/services
- Receipts and proof of purchase

**What DOESN'T belong here:**
- Medical details (use health records)
- Non-monetary resources (use notes)

### Epic 5: Reminders

**What belongs here:**
- Future events to be reminded about
- Recurring tasks (medication reminders)
- Links to health records (vaccine expiration reminders)

**Pattern:** If it's about "don't forget to do X", it's a reminder.

### Epic 6: Documents

**What belongs here:**
- Files (PDFs, images)
- Categorized by type
- Can be linked to other records

**Pattern:** If it's a file, it's a document.

## Review Checklist for Story ACs

When reviewing story acceptance criteria:

- [ ] Does AC mention fields that belong to different tables?
- [ ] Are calculated values (age, totals) mentioned as stored fields?
- [ ] Is there confusion between static pet data vs health history?
- [ ] Do vet visit details leak into pets table?
- [ ] Are time-series data (weight) mentioned as single fields?
- [ ] Is "current state" (medications) mentioned without time context?

## Recommendations for Future Stories

### For Story Authors:

1. **Be explicit:** Specify table names when mentioning fields
   - Good: "Display weight from latest weight_check health record"
   - Bad: "Display weight"

2. **Distinguish stored vs calculated:**
   - Good: "Calculate and display age from birth_date"
   - Bad: "Display age"

3. **Clarify relationships:**
   - Good: "Link expense to vet_visit health record (optional)"
   - Bad: "Add diagnosis to expense"

### For Developers:

1. **Question ambiguities:** If a field seems out of place, ask for clarification
2. **Check ERD:** Refer to database schema before implementing
3. **Consider history:** If it changes over time, it's probably not a base entity field
4. **Think relationships:** Use foreign keys instead of duplicating data

## Known Clarifications Applied

### Story 2.3 - Pet Detail Page

**Original AC1 (ambiguous):**
> "Pet detail page displays all pet fields: photo, name, species, breed, birth date/age, **weight**, gender, spayed/neutered status, microchip number, notes"

**Clarified AC1 (correct):**
> "Pet detail page displays all pet fields: photo, name, species, breed, birth date/age, ~~weight (from latest weight_check health record)~~, gender, spayed/neutered status, microchip number, notes"

**Note:** Weight display was intentionally NOT implemented in Story 2.3 as it belongs to Epic 3 (health records). This was documented in Story 2.3 review.

## References

- Epic 2 Retrospective: docs/retrospectives/epic-2-retrospective.md
- Story 2.3 Review Notes: docs/stories/2-3-pet-detail-page-with-full-info.md
- Database Schema: docs/architecture.md
- Epics Breakdown: docs/epics.md

---

**Last Updated:** 2025-11-15
**Version:** 1.0
**Status:** Active Reference Document
