import { z } from 'zod'
import {
  healthSchemas,
  dateSchemas,
  textSchemas,
} from '@/lib/validation/commonSchemas'

/**
 * Vaccine Record Schema
 *
 * Base fields: record_type, title, date, notes
 * Vaccine-specific fields (stored in vaccine_data JSONB): expiration_date, vet_clinic, dose
 */
export const vaccineRecordSchema = z.object({
  record_type: healthSchemas.recordType.default('vaccine'),
  title: textSchemas.recordTitle,
  date: dateSchemas.date,
  expiration_date: dateSchemas.optionalDate,
  vet_clinic: textSchemas.optionalShort,
  dose: textSchemas.optionalShort,
  notes: textSchemas.notes,
}).refine(
  (data) => {
    // Expiration date must be after vaccine date
    if (data.expiration_date && data.date) {
      const vaccineDate = new Date(data.date)
      const expirationDate = new Date(data.expiration_date)
      return expirationDate > vaccineDate
    }
    return true
  },
  {
    message: 'Expiration date must be after vaccination date',
    path: ['expiration_date'],
  }
)

export type VaccineFormData = z.infer<typeof vaccineRecordSchema>

/**
 * Medication Record Schema
 *
 * Base fields: record_type, title, date, notes
 * Medication-specific fields (stored in medication_data JSONB): dosage, frequency, start_date, end_date
 */
export const medicationRecordSchema = z.object({
  record_type: healthSchemas.recordType.default('medication'),
  title: textSchemas.recordTitle,
  date: dateSchemas.date,
  dosage: textSchemas.optionalShort,
  frequency: z.enum(['daily', 'twice-daily', 'weekly', 'as-needed'], {
    required_error: 'Please select frequency',
  }).optional().nullable(),
  start_date: dateSchemas.optionalDate,
  end_date: dateSchemas.optionalDate,
  notes: textSchemas.notes,
}).refine(
  (data) => {
    // End date must be after start date
    if (data.end_date && data.start_date) {
      const startDate = new Date(data.start_date)
      const endDate = new Date(data.end_date)
      return endDate >= startDate
    }
    return true
  },
  {
    message: 'End date must be on or after start date',
    path: ['end_date'],
  }
)

export type MedicationFormData = z.infer<typeof medicationRecordSchema>

/**
 * Vet Visit Record Schema
 *
 * Base fields: record_type, title, date, notes
 * Vet Visit-specific fields (stored in vet_visit_data JSONB): clinic, vet_name, diagnosis, treatment, cost
 */
export const vetVisitRecordSchema = z.object({
  record_type: healthSchemas.recordType.default('vet_visit'),
  title: textSchemas.recordTitle,
  date: dateSchemas.date,
  clinic: textSchemas.optionalShort,
  vet_name: textSchemas.optionalShort,
  diagnosis: textSchemas.optionalLong,
  treatment: textSchemas.optionalLong,
  cost: z.number().positive('Cost must be positive').optional().nullable(),
  notes: textSchemas.notes,
})

export type VetVisitFormData = z.infer<typeof vetVisitRecordSchema>

/**
 * Symptom Record Schema
 *
 * Base fields: record_type, title, date, notes
 * Symptom-specific fields (stored in symptom_data JSONB): severity, observed_behaviors
 */
export const symptomRecordSchema = z.object({
  record_type: healthSchemas.recordType.default('symptom'),
  title: textSchemas.recordTitle,
  date: dateSchemas.date,
  severity: z.enum(['mild', 'moderate', 'severe'], {
    required_error: 'Please select severity',
  }).optional().nullable(),
  observed_behaviors: textSchemas.optionalLong,
  notes: textSchemas.notes,
})

export type SymptomFormData = z.infer<typeof symptomRecordSchema>

/**
 * Weight Check Record Schema
 *
 * Base fields: record_type, date, notes
 * Weight Check-specific fields (stored in weight_data JSONB): weight, unit, body_condition
 * Note: Weight checks don't require a title field (just the weight itself)
 */
export const weightCheckRecordSchema = z.object({
  record_type: healthSchemas.recordType.default('weight_check'),
  date: dateSchemas.date,
  weight: z.number().positive('Weight must be positive'),
  unit: z.enum(['kg', 'lbs'], {
    required_error: 'Please select unit',
  }),
  body_condition: z.enum(['underweight', 'ideal', 'overweight'], {
    required_error: 'Please select body condition',
  }).optional().nullable(),
  notes: textSchemas.notes,
})

export type WeightCheckFormData = z.infer<typeof weightCheckRecordSchema>

/**
 * Health Record Type for database operations
 */
export interface HealthRecord {
  id: string
  pet_id: string
  user_id: string
  record_type: 'vaccine' | 'medication' | 'vet_visit' | 'symptom' | 'weight_check'
  title: string
  date: string
  notes: string | null
  vaccine_data?: {
    expiration_date?: string | null
    vet_clinic?: string | null
    dose?: string | null
  } | null
  medication_data?: {
    dosage?: string | null
    frequency?: 'daily' | 'twice-daily' | 'weekly' | 'as-needed' | null
    start_date?: string | null
    end_date?: string | null
  } | null
  vet_visit_data?: {
    clinic?: string | null
    vet_name?: string | null
    diagnosis?: string | null
    treatment?: string | null
    cost?: number | null
  } | null
  symptom_data?: {
    severity?: 'mild' | 'moderate' | 'severe' | null
    observed_behaviors?: string | null
  } | null
  weight_data?: {
    weight?: number | null
    unit?: 'kg' | 'lbs' | null
    body_condition?: 'underweight' | 'ideal' | 'overweight' | null
  } | null
  created_at: string
  updated_at: string
}
