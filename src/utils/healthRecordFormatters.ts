/**
 * Health Record Formatters
 *
 * Utility functions to format type-specific health record data for display.
 * Story: 3.4 - View Health Timeline with Color Coding
 * Date: 2025-11-15
 */

import { format } from 'date-fns'
import type {
  VaccineData,
  MedicationData,
  VetVisitData,
  SymptomData,
  WeightData,
} from '@/types/healthRecords'

/**
 * Format vaccine details for preview display
 */
export function formatVaccineDetails(vaccineData?: VaccineData): string {
  if (!vaccineData) return ''

  const parts: string[] = []

  if (vaccineData.expiration_date) {
    try {
      const expDate = format(new Date(vaccineData.expiration_date), 'MMM d, yyyy')
      parts.push(`Expires: ${expDate}`)
    } catch {
      // Invalid date, skip
    }
  }

  if (vaccineData.vet_clinic) {
    parts.push(vaccineData.vet_clinic)
  }

  if (vaccineData.dose) {
    parts.push(vaccineData.dose)
  }

  return parts.join(' • ')
}

/**
 * Format medication details for preview display
 */
export function formatMedicationDetails(medicationData?: MedicationData): string {
  if (!medicationData) return ''

  const parts: string[] = []

  if (medicationData.dosage) {
    parts.push(medicationData.dosage)
  }

  if (medicationData.frequency) {
    parts.push(medicationData.frequency)
  }

  if (medicationData.start_date && medicationData.end_date) {
    try {
      const startDate = format(new Date(medicationData.start_date), 'MMM d')
      const endDate = format(new Date(medicationData.end_date), 'MMM d, yyyy')
      parts.push(`${startDate} - ${endDate}`)
    } catch {
      // Invalid dates, skip
    }
  } else if (medicationData.start_date) {
    try {
      const startDate = format(new Date(medicationData.start_date), 'MMM d, yyyy')
      parts.push(`Started: ${startDate}`)
    } catch {
      // Invalid date, skip
    }
  }

  return parts.join(' • ')
}

/**
 * Format vet visit details for preview display
 */
export function formatVetVisitDetails(vetVisitData?: VetVisitData): string {
  if (!vetVisitData) return ''

  const parts: string[] = []

  if (vetVisitData.clinic) {
    parts.push(vetVisitData.clinic)
  }

  if (vetVisitData.vet_name) {
    parts.push(`Dr. ${vetVisitData.vet_name}`)
  }

  if (vetVisitData.diagnosis) {
    parts.push(vetVisitData.diagnosis)
  }

  if (vetVisitData.cost !== null && vetVisitData.cost !== undefined) {
    parts.push(`$${vetVisitData.cost.toFixed(2)}`)
  }

  return parts.join(' • ')
}

/**
 * Format symptom details for preview display
 */
export function formatSymptomDetails(symptomData?: SymptomData): string {
  if (!symptomData) return ''

  const parts: string[] = []

  if (symptomData.severity) {
    parts.push(`Severity: ${symptomData.severity.charAt(0).toUpperCase() + symptomData.severity.slice(1)}`)
  }

  if (symptomData.observed_behaviors) {
    // Truncate long behavior descriptions for preview
    const behaviors =
      symptomData.observed_behaviors.length > 50
        ? symptomData.observed_behaviors.substring(0, 50) + '...'
        : symptomData.observed_behaviors
    parts.push(behaviors)
  }

  return parts.join(' • ')
}

/**
 * Format weight check details for preview display
 */
export function formatWeightDetails(weightData?: WeightData): string {
  if (!weightData) return ''

  const parts: string[] = []

  if (weightData.weight !== null && weightData.weight !== undefined) {
    const unit = weightData.unit || 'lbs'
    parts.push(`${weightData.weight} ${unit}`)
  }

  if (weightData.body_condition) {
    parts.push(`Body Condition: ${weightData.body_condition}`)
  }

  return parts.join(' • ')
}
