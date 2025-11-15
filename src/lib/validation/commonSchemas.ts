/**
 * Common Zod Validation Schemas
 *
 * Reusable validation schemas for common fields across the application.
 * Use these schemas to ensure consistency in validation rules across forms.
 *
 * Epic 2 Retrospective Recommendation: Create reusable form validation schemas
 * to ensure consistency across health records, expenses, reminders forms.
 */

import { z } from 'zod'

// ============================================================================
// Date & Time Schemas
// ============================================================================

/**
 * Date string in ISO format (YYYY-MM-DD)
 * Used for birth dates, health record dates, expense dates, etc.
 */
export const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .refine(
    (date) => {
      const parsed = new Date(date)
      return !isNaN(parsed.getTime())
    },
    { message: 'Invalid date' }
  )

/**
 * Optional date schema
 * Returns null for empty strings
 */
export const optionalDateSchema = z
  .string()
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val))
  .pipe(z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable())

/**
 * Past date (birth dates, historical events)
 * Cannot be in the future
 */
export const pastDateSchema = dateSchema.refine(
  (date) => {
    const parsed = new Date(date)
    return parsed <= new Date()
  },
  { message: 'Date cannot be in the future' }
)

/**
 * Future date (reminders, appointments)
 * Must be in the future
 */
export const futureDateSchema = dateSchema.refine(
  (date) => {
    const parsed = new Date(date)
    return parsed > new Date()
  },
  { message: 'Date must be in the future' }
)

/**
 * Date range (start and end dates)
 * End date must be after start date
 */
export const dateRangeSchema = z
  .object({
    start_date: dateSchema,
    end_date: dateSchema,
  })
  .refine((data) => new Date(data.end_date) >= new Date(data.start_date), {
    message: 'End date must be after start date',
    path: ['end_date'],
  })

/**
 * DateTime for reminders (ISO 8601)
 * Future timestamps only
 */
export const futureDateTime = z.string().refine(
  (datetime) => {
    const parsed = new Date(datetime)
    return parsed > new Date()
  },
  { message: 'Date and time must be in the future' }
)

// ============================================================================
// Currency & Numeric Schemas
// ============================================================================

/**
 * Currency amount (expenses, vet visit costs)
 * Positive number with max 2 decimal places
 */
export const currencySchema = z
  .number()
  .positive('Amount must be positive')
  .max(999999.99, 'Amount too large')
  .refine(
    (val) => {
      // Check max 2 decimal places
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 2
    },
    { message: 'Amount can have maximum 2 decimal places' }
  )

/**
 * Optional currency amount
 * Returns null for undefined
 */
export const optionalCurrencySchema = z
  .number()
  .positive()
  .max(999999.99)
  .optional()
  .nullable()

/**
 * Currency code (EUR, USD, GBP)
 * ISO 4217 3-letter codes
 */
export const currencyCodeSchema = z.enum(['EUR', 'USD', 'GBP'], {
  required_error: 'Please select a currency',
})

/**
 * Weight value (for weight check records)
 * Positive number with max 1 decimal place
 */
export const weightSchema = z
  .number()
  .positive('Weight must be positive')
  .max(999.9, 'Weight too large')
  .refine(
    (val) => {
      const decimalPlaces = (val.toString().split('.')[1] || '').length
      return decimalPlaces <= 1
    },
    { message: 'Weight can have maximum 1 decimal place' }
  )

/**
 * Weight unit (kg or lbs)
 */
export const weightUnitSchema = z.enum(['kg', 'lbs'], {
  required_error: 'Please select a unit',
})

// ============================================================================
// Text & String Schemas
// ============================================================================

/**
 * Short text field (names, titles)
 * 1-100 characters, no leading/trailing whitespace
 */
export const shortTextSchema = z
  .string()
  .min(1, 'This field is required')
  .max(100, 'Maximum 100 characters')
  .trim()

/**
 * Optional short text
 */
export const optionalShortTextSchema = z
  .string()
  .max(100, 'Maximum 100 characters')
  .trim()
  .optional()
  .nullable()

/**
 * Medium text field (descriptions, merchant names)
 * 1-255 characters
 */
export const mediumTextSchema = z
  .string()
  .min(1, 'This field is required')
  .max(255, 'Maximum 255 characters')
  .trim()

/**
 * Optional medium text
 */
export const optionalMediumTextSchema = z
  .string()
  .max(255, 'Maximum 255 characters')
  .trim()
  .optional()
  .nullable()

/**
 * Long text field (notes, descriptions)
 * 1-1000 characters
 */
export const longTextSchema = z
  .string()
  .min(1, 'This field is required')
  .max(1000, 'Maximum 1000 characters')
  .trim()

/**
 * Optional long text
 */
export const optionalLongTextSchema = z
  .string()
  .max(1000, 'Maximum 1000 characters')
  .trim()
  .optional()
  .nullable()

/**
 * Notes field (always optional, max 1000 chars)
 */
export const notesSchema = z
  .string()
  .max(1000, 'Notes cannot exceed 1000 characters')
  .optional()
  .nullable()
  .transform((val) => (val === '' ? null : val))

/**
 * Title/name field specifically for records
 * 1-200 characters
 */
export const recordTitleSchema = z
  .string()
  .min(1, 'Title is required')
  .max(200, 'Title cannot exceed 200 characters')
  .trim()

// ============================================================================
// Medication & Dosage Schemas
// ============================================================================

/**
 * Dosage (medication amount and unit)
 * Examples: "10mg", "2ml", "1 tablet"
 */
export const dosageSchema = z
  .string()
  .min(1, 'Dosage is required')
  .max(50, 'Maximum 50 characters')
  .trim()

/**
 * Medication frequency
 * Predefined options + custom
 */
export const frequencySchema = z.enum(
  [
    'once-daily',
    'twice-daily',
    'three-times-daily',
    'every-8-hours',
    'every-12-hours',
    'weekly',
    'as-needed',
    'other',
  ],
  {
    required_error: 'Please select frequency',
  }
)

// ============================================================================
// Health Record Schemas
// ============================================================================

/**
 * Health record type
 */
export const healthRecordTypeSchema = z.enum(
  ['vaccine', 'medication', 'vet_visit', 'symptom', 'weight_check'],
  {
    required_error: 'Please select a record type',
  }
)

/**
 * Symptom severity
 */
export const severitySchema = z.enum(['mild', 'moderate', 'severe'], {
  required_error: 'Please select severity',
})

/**
 * Body condition score
 */
export const bodyConditionSchema = z
  .string()
  .max(50, 'Maximum 50 characters')
  .optional()
  .nullable()

// ============================================================================
// Expense Schemas
// ============================================================================

/**
 * Expense category
 */
export const expenseCategorySchema = z.enum(
  ['vet', 'food', 'grooming', 'supplies', 'boarding', 'other'],
  {
    required_error: 'Please select a category',
  }
)

/**
 * Merchant/store name
 */
export const merchantSchema = optionalMediumTextSchema

// ============================================================================
// Reminder Schemas
// ============================================================================

/**
 * Reminder recurrence type
 */
export const recurrenceSchema = z.enum(
  ['one_time', 'daily', 'weekly', 'monthly', 'yearly'],
  {
    required_error: 'Please select recurrence',
  }
)

// ============================================================================
// Document Schemas
// ============================================================================

/**
 * Document category
 */
export const documentCategorySchema = z.enum(
  ['vet_record', 'vaccine_card', 'receipt', 'lab_results', 'xray', 'insurance_claim', 'other'],
  {
    required_error: 'Please select a category',
  }
)

/**
 * Filename
 */
export const filenameSchema = z
  .string()
  .min(1, 'Filename is required')
  .max(255, 'Filename too long')
  .trim()

// ============================================================================
// File Upload Schemas
// ============================================================================

/**
 * File size in bytes
 * Max 10MB for documents, 5MB for photos
 */
export const fileSizeSchema = (maxSizeMB: number) =>
  z
    .number()
    .max(maxSizeMB * 1024 * 1024, `File size cannot exceed ${maxSizeMB}MB`)

/**
 * Image file types
 */
export const imageFileTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/heic'], {
  required_error: 'Only JPG, PNG, and HEIC images allowed',
})

/**
 * Document file types
 */
export const documentFileTypeSchema = z.enum(
  ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'],
  {
    required_error: 'Only JPG, PNG, HEIC, and PDF files allowed',
  }
)

// ============================================================================
// Common Combinations
// ============================================================================

/**
 * Date + Notes (common pattern in health records)
 */
export const dateWithNotesSchema = z.object({
  date: dateSchema,
  notes: notesSchema,
})

/**
 * Amount + Currency (common pattern in expenses)
 */
export const amountWithCurrencySchema = z.object({
  amount: currencySchema,
  currency: currencyCodeSchema,
})

/**
 * Title + Date + Notes (base for most records)
 */
export const baseRecordSchema = z.object({
  title: recordTitleSchema,
  date: dateSchema,
  notes: notesSchema,
})

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Create optional version of any schema
 */
export const makeOptional = <T extends z.ZodTypeAny>(schema: T) =>
  schema.optional().nullable()

/**
 * Refine date to be within a specific range
 */
export const dateInRange = (minDate: Date, maxDate: Date) =>
  dateSchema.refine(
    (date) => {
      const parsed = new Date(date)
      return parsed >= minDate && parsed <= maxDate
    },
    {
      message: `Date must be between ${minDate.toLocaleDateString()} and ${maxDate.toLocaleDateString()}`,
    }
  )

/**
 * Refine date to be within last N days
 */
export const dateWithinLastDays = (days: number) => {
  const minDate = new Date()
  minDate.setDate(minDate.getDate() - days)
  return dateSchema.refine(
    (date) => {
      const parsed = new Date(date)
      return parsed >= minDate
    },
    { message: `Date must be within the last ${days} days` }
  )
}

// ============================================================================
// Export Grouped Schemas
// ============================================================================

/**
 * Date/Time schemas grouped for easy import
 */
export const dateSchemas = {
  date: dateSchema,
  optionalDate: optionalDateSchema,
  pastDate: pastDateSchema,
  futureDate: futureDateSchema,
  dateRange: dateRangeSchema,
  futureDateTime,
}

/**
 * Currency schemas grouped
 */
export const currencySchemas = {
  amount: currencySchema,
  optionalAmount: optionalCurrencySchema,
  currencyCode: currencyCodeSchema,
  amountWithCurrency: amountWithCurrencySchema,
}

/**
 * Text schemas grouped
 */
export const textSchemas = {
  short: shortTextSchema,
  optionalShort: optionalShortTextSchema,
  medium: mediumTextSchema,
  optionalMedium: optionalMediumTextSchema,
  long: longTextSchema,
  optionalLong: optionalLongTextSchema,
  notes: notesSchema,
  recordTitle: recordTitleSchema,
}

/**
 * Health record schemas grouped
 */
export const healthSchemas = {
  recordType: healthRecordTypeSchema,
  dosage: dosageSchema,
  frequency: frequencySchema,
  severity: severitySchema,
  weight: weightSchema,
  weightUnit: weightUnitSchema,
  bodyCondition: bodyConditionSchema,
}

/**
 * Expense schemas grouped
 */
export const expenseSchemas = {
  category: expenseCategorySchema,
  merchant: merchantSchema,
  amount: currencySchema,
  currency: currencyCodeSchema,
}

/**
 * Reminder schemas grouped
 */
export const reminderSchemas = {
  recurrence: recurrenceSchema,
  futureDateTime,
}

/**
 * Document schemas grouped
 */
export const documentSchemas = {
  category: documentCategorySchema,
  filename: filenameSchema,
  imageFileType: imageFileTypeSchema,
  documentFileType: documentFileTypeSchema,
}
