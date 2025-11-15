# Form Validation Schemas

This directory contains reusable Zod validation schemas for all forms across the application.

## Overview

Common validation schemas ensure:
- **Consistency:** Same validation rules across all forms
- **Maintainability:** Update rules in one place
- **Type Safety:** TypeScript types derived from schemas
- **Reusability:** Import and compose schemas across features

## Quick Start

### Basic Usage

```typescript
import { z } from 'zod'
import { shortTextSchema, dateSchema, notesSchema } from '@/lib/validation/commonSchemas'

// Define form schema using common schemas
const createPetSchema = z.object({
  name: shortTextSchema,
  birth_date: dateSchema,
  notes: notesSchema,
})

type CreatePetFormData = z.infer<typeof createPetSchema>

// Use in React Hook Form
const form = useForm<CreatePetFormData>({
  resolver: zodResolver(createPetSchema),
})
```

### Grouped Imports

```typescript
import { dateSchemas, currencySchemas, textSchemas } from '@/lib/validation/commonSchemas'

const healthRecordSchema = z.object({
  title: textSchemas.recordTitle,
  date: dateSchemas.date,
  notes: textSchemas.notes,
})
```

## Available Schema Categories

### 1. Date & Time Schemas

| Schema | Description | Example |
|--------|-------------|---------|
| `dateSchema` | ISO date (YYYY-MM-DD) | "2025-11-15" |
| `optionalDateSchema` | Optional date, null if empty | null or "2025-11-15" |
| `pastDateSchema` | Date in the past only | Birth dates |
| `futureDateSchema` | Date in the future only | Appointments |
| `dateRangeSchema` | Start + end date validation | Medication duration |
| `futureDateTime` | ISO datetime in future | Reminder timestamps |

**Usage:**

```typescript
import { dateSchemas } from '@/lib/validation/commonSchemas'

const petSchema = z.object({
  birth_date: dateSchemas.pastDate, // Cannot be in future
})

const reminderSchema = z.object({
  date_time: dateSchemas.futureDateTime, // Must be in future
})
```

### 2. Currency & Numeric Schemas

| Schema | Description | Example |
|--------|-------------|---------|
| `currencySchema` | Positive number, max 2 decimals | 49.99 |
| `optionalCurrencySchema` | Optional currency amount | null or 49.99 |
| `currencyCodeSchema` | EUR, USD, GBP | "EUR" |
| `weightSchema` | Weight value, max 1 decimal | 12.5 |
| `weightUnitSchema` | kg or lbs | "kg" |
| `amountWithCurrencySchema` | Amount + currency combo | { amount: 49.99, currency: "EUR" } |

**Usage:**

```typescript
import { currencySchemas, healthSchemas } from '@/lib/validation/commonSchemas'

const expenseSchema = z.object({
  amount: currencySchemas.amount, // Positive, max 2 decimals
  currency: currencySchemas.currencyCode, // EUR, USD, GBP
})

const weightCheckSchema = z.object({
  weight: healthSchemas.weight, // Positive, max 1 decimal
  unit: healthSchemas.weightUnit, // kg or lbs
})
```

### 3. Text & String Schemas

| Schema | Description | Max Length |
|--------|-------------|------------|
| `shortTextSchema` | Names, titles (required) | 100 chars |
| `optionalShortTextSchema` | Optional short text | 100 chars |
| `mediumTextSchema` | Descriptions (required) | 255 chars |
| `optionalMediumTextSchema` | Optional medium text | 255 chars |
| `longTextSchema` | Long descriptions (required) | 1000 chars |
| `optionalLongTextSchema` | Optional long text | 1000 chars |
| `notesSchema` | Always optional notes | 1000 chars |
| `recordTitleSchema` | Record titles | 200 chars |

**Usage:**

```typescript
import { textSchemas } from '@/lib/validation/commonSchemas'

const petSchema = z.object({
  name: textSchemas.short, // Required, max 100 chars
  breed: textSchemas.optionalShort, // Optional, max 100 chars
  notes: textSchemas.notes, // Always optional, max 1000 chars
})
```

### 4. Health Record Schemas

| Schema | Description | Options |
|--------|-------------|---------|
| `healthRecordTypeSchema` | Record type | vaccine, medication, vet_visit, symptom, weight_check |
| `dosageSchema` | Medication dosage | "10mg", "2ml", "1 tablet" |
| `frequencySchema` | Medication frequency | once-daily, twice-daily, etc. |
| `severitySchema` | Symptom severity | mild, moderate, severe |
| `bodyConditionSchema` | Body condition | Optional string, max 50 chars |

**Usage:**

```typescript
import { healthSchemas, textSchemas, dateSchemas } from '@/lib/validation/commonSchemas'

const medicationSchema = z.object({
  record_type: z.literal('medication'),
  title: textSchemas.recordTitle,
  date: dateSchemas.date,
  medication_data: z.object({
    dosage: healthSchemas.dosage, // Required
    frequency: healthSchemas.frequency, // Required
    start_date: dateSchemas.date,
    end_date: dateSchemas.optionalDate,
  }),
})
```

### 5. Expense Schemas

| Schema | Description | Options |
|--------|-------------|---------|
| `expenseCategorySchema` | Expense category | vet, food, grooming, supplies, boarding, other |
| `merchantSchema` | Store/merchant name | Optional, max 255 chars |

**Usage:**

```typescript
import { expenseSchemas, textSchemas, dateSchemas } from '@/lib/validation/commonSchemas'

const expenseSchema = z.object({
  amount: expenseSchemas.amount,
  currency: expenseSchemas.currency,
  category: expenseSchemas.category,
  merchant: expenseSchemas.merchant,
  date: dateSchemas.date,
  notes: textSchemas.notes,
})
```

### 6. Reminder Schemas

| Schema | Description | Options |
|--------|-------------|---------|
| `recurrenceSchema` | Recurrence type | one_time, daily, weekly, monthly, yearly |
| `futureDateTime` | Future timestamp | ISO 8601 datetime |

**Usage:**

```typescript
import { reminderSchemas, textSchemas } from '@/lib/validation/commonSchemas'

const reminderSchema = z.object({
  title: textSchemas.short,
  date_time: reminderSchemas.futureDateTime,
  recurrence: reminderSchemas.recurrence,
  notes: textSchemas.notes,
})
```

### 7. Document Schemas

| Schema | Description | Options |
|--------|-------------|---------|
| `documentCategorySchema` | Document category | vet_record, vaccine_card, receipt, lab_results, xray, insurance_claim, other |
| `filenameSchema` | Filename | Required, max 255 chars |
| `imageFileTypeSchema` | Image MIME types | image/jpeg, image/png, image/heic |
| `documentFileTypeSchema` | Document MIME types | image/jpeg, image/png, image/heic, application/pdf |

**Usage:**

```typescript
import { documentSchemas, textSchemas } from '@/lib/validation/commonSchemas'

const uploadDocumentSchema = z.object({
  filename: documentSchemas.filename,
  file_type: documentSchemas.documentFileType,
  category: documentSchemas.category,
  notes: textSchemas.notes,
})
```

## Common Patterns

### Pattern 1: Base Record Schema

Most records share common fields (title, date, notes):

```typescript
import { baseRecordSchema } from '@/lib/validation/commonSchemas'

const healthRecordSchema = baseRecordSchema.extend({
  record_type: healthRecordTypeSchema,
  // ... type-specific fields
})
```

### Pattern 2: Date + Notes

Simple records with just date and notes:

```typescript
import { dateWithNotesSchema } from '@/lib/validation/commonSchemas'

const simpleEventSchema = dateWithNotesSchema.extend({
  event_type: z.enum(['observation', 'milestone']),
})
```

### Pattern 3: Amount + Currency

Financial fields:

```typescript
import { amountWithCurrencySchema } from '@/lib/validation/commonSchemas'

const costSchema = amountWithCurrencySchema.extend({
  paid_by: z.enum(['cash', 'card', 'insurance']),
})
```

### Pattern 4: Making Required Fields Optional

```typescript
import { makeOptional, shortTextSchema } from '@/lib/validation/commonSchemas'

const editPetSchema = z.object({
  name: makeOptional(shortTextSchema), // Now optional
})
```

### Pattern 5: Date Range Validation

```typescript
import { dateRangeSchema } from '@/lib/validation/commonSchemas'

const medicationSchema = z.object({
  // ... other fields
  duration: dateRangeSchema, // Validates end_date >= start_date
})
```

### Pattern 6: Custom Date Constraints

```typescript
import { dateInRange, dateWithinLastDays } from '@/lib/validation/commonSchemas'

// Date must be within specific range
const eventSchema = z.object({
  date: dateInRange(new Date('2025-01-01'), new Date('2025-12-31')),
})

// Date must be within last 30 days
const recentExpenseSchema = z.object({
  date: dateWithinLastDays(30),
})
```

## Example Forms

### Example 1: Create Health Record

```typescript
import { z } from 'zod'
import { healthSchemas, textSchemas, dateSchemas } from '@/lib/validation/commonSchemas'

const createVaccineSchema = z.object({
  record_type: z.literal('vaccine'),
  title: textSchemas.recordTitle,
  date: dateSchemas.pastDate,
  notes: textSchemas.notes,
  vaccine_data: z.object({
    expiration_date: dateSchemas.futureDate,
    vet_clinic: textSchemas.optionalMedium,
    dose: textSchemas.optionalShort,
  }),
})

type CreateVaccineFormData = z.infer<typeof createVaccineSchema>
```

### Example 2: Create Expense

```typescript
import { z } from 'zod'
import { expenseSchemas, textSchemas, dateSchemas } from '@/lib/validation/commonSchemas'

const createExpenseSchema = z.object({
  amount: expenseSchemas.amount,
  currency: expenseSchemas.currency,
  category: expenseSchemas.category,
  merchant: expenseSchemas.merchant,
  date: dateSchemas.date,
  notes: textSchemas.notes,
})

type CreateExpenseFormData = z.infer<typeof createExpenseSchema>
```

### Example 3: Create Reminder

```typescript
import { z } from 'zod'
import { reminderSchemas, textSchemas } from '@/lib/validation/commonSchemas'

const createReminderSchema = z.object({
  title: textSchemas.short,
  date_time: reminderSchemas.futureDateTime,
  recurrence: reminderSchemas.recurrence,
  notes: textSchemas.notes,
  health_record_id: z.string().uuid().optional().nullable(),
})

type CreateReminderFormData = z.infer<typeof createReminderSchema>
```

### Example 4: Weight Check Record

```typescript
import { z } from 'zod'
import { healthSchemas, textSchemas, dateSchemas } from '@/lib/validation/commonSchemas'

const createWeightCheckSchema = z.object({
  record_type: z.literal('weight_check'),
  title: textSchemas.recordTitle,
  date: dateSchemas.date,
  notes: textSchemas.notes,
  weight_data: z.object({
    weight: healthSchemas.weight,
    unit: healthSchemas.weightUnit,
    body_condition: healthSchemas.bodyCondition,
  }),
})

type CreateWeightCheckFormData = z.infer<typeof createWeightCheckSchema>
```

## Validation Error Messages

All schemas include user-friendly error messages:

- ✅ "Pet name is required" (not "String must contain at least 1 character(s)")
- ✅ "Amount must be positive" (not "Number must be greater than 0")
- ✅ "Date cannot be in the future" (not "Invalid date")
- ✅ "Maximum 100 characters" (not "String must contain at most 100 character(s)")

## Best Practices

### 1. Always Use Common Schemas

```typescript
// ❌ Bad: Custom validation for every form
const schema = z.object({
  name: z.string().min(1).max(100),
})

// ✅ Good: Reuse common schema
import { textSchemas } from '@/lib/validation/commonSchemas'

const schema = z.object({
  name: textSchemas.short,
})
```

### 2. Compose Schemas

```typescript
// ✅ Compose base + specific fields
import { baseRecordSchema } from '@/lib/validation/commonSchemas'

const vetVisitSchema = baseRecordSchema.extend({
  vet_visit_data: z.object({
    clinic: textSchemas.optionalMedium,
    vet_name: textSchemas.optionalShort,
  }),
})
```

### 3. Use Grouped Imports

```typescript
// ❌ Bad: Individual imports
import { dateSchema, pastDateSchema, futureDateSchema } from '...'

// ✅ Good: Grouped import
import { dateSchemas } from '@/lib/validation/commonSchemas'
// Access: dateSchemas.date, dateSchemas.pastDate, dateSchemas.futureDate
```

### 4. Type Inference

```typescript
// Always infer types from schemas
const schema = z.object({
  name: textSchemas.short,
  date: dateSchemas.date,
})

type FormData = z.infer<typeof schema>
// FormData is automatically typed!
```

## Testing Validation

```typescript
import { describe, it, expect } from 'vitest'
import { currencySchema } from '@/lib/validation/commonSchemas'

describe('currencySchema', () => {
  it('accepts valid amounts', () => {
    expect(currencySchema.parse(49.99)).toBe(49.99)
  })

  it('rejects negative amounts', () => {
    expect(() => currencySchema.parse(-10)).toThrow('Amount must be positive')
  })

  it('rejects more than 2 decimals', () => {
    expect(() => currencySchema.parse(49.999)).toThrow('maximum 2 decimal places')
  })
})
```

## Adding New Schemas

When adding new common validation patterns:

1. Add to `commonSchemas.ts`
2. Add to appropriate grouped export
3. Document in this README
4. Add example usage
5. Write tests

## References

- Zod Documentation: https://zod.dev
- React Hook Form: https://react-hook-form.com
- Architecture Document: docs/architecture.md (Pattern 6: Form & Validation)

---

**Last Updated:** 2025-11-15
**Version:** 1.0
**Epic 2 Retrospective Action Item:** Create reusable form validation schemas
