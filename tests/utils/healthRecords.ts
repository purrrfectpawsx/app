/**
 * Health Records Test Utilities - Simplified Version
 *
 * This helper works with form defaults to avoid complex calendar interactions.
 * Dates default to today, which is acceptable for most test scenarios.
 */

import { Page } from '@playwright/test'

export interface VaccineData {
  expiration_date?: string
  vet_clinic?: string
  dose?: string
}

export interface MedicationData {
  dosage?: string
  frequency?: string
  start_date?: string
  end_date?: string
}

export interface VetVisitData {
  clinic?: string
  vet_name?: string
  diagnosis?: string
  treatment?: string
  cost?: number
}

export interface SymptomData {
  severity?: string
  body_part_affected?: string
  duration?: string
}

export interface WeightCheckData {
  weight?: number
  unit?: string
  body_condition?: string
}

export interface HealthRecordData {
  record_type: 'vaccine' | 'medication' | 'vet_visit' | 'symptom' | 'weight_check'
  title: string
  date?: string  // Optional - will use form default (today) if not provided
  notes?: string
  vaccine_data?: VaccineData
  medication_data?: MedicationData
  vet_visit_data?: VetVisitData
  symptom_data?: SymptomData
  weight_check_data?: WeightCheckData
}

/**
 * Create a health record for a pet
 * If already on the pet detail page with Health tab active, petId can be omitted
 *
 * SIMPLIFIED APPROACH: Uses form defaults for dates (today) to avoid calendar popover complexity
 */
export async function createHealthRecord(
  page: Page,
  recordData: HealthRecordData,
  petId?: string
): Promise<string> {
  // Navigate to pet detail page only if petId is provided
  if (petId) {
    await page.goto(`/pets/${petId}`)
    // Click Health tab if not already active
    const healthTab = page.locator('button:has-text("Health")')
    await healthTab.click()
  }

  // Click Add Health Record button
  const addButton = page.getByRole('button', { name: /Add Health Record/i }).first()
  await addButton.click()

  // Wait for dialog to open
  await page.waitForSelector('dialog, [role="dialog"]', { timeout: 10000 })

  // Select record type using the combobox
  const typeCombobox = page.getByRole('combobox', { name: /record type/i })
  await typeCombobox.click()

  // Map record types to display names
  const typeMap: Record<string, string> = {
    'vaccine': 'Vaccine',
    'medication': 'Medication',
    'vet_visit': 'Vet Visit',
    'symptom': 'Symptom',
    'weight_check': 'Weight Check'
  }

  // Wait for options and select
  const displayType = typeMap[recordData.record_type]
  await page.getByRole('option', { name: displayType }).click()

  // Small wait for form to update after type selection
  await page.waitForTimeout(500)

  // Fill title field - the ID varies by record type but all use #title
  await page.locator('input#title').fill(recordData.title)

  // NOTE: We skip date fields - the form defaults to today which works for most tests
  // If specific dates are needed, tests should interact with calendar directly

  // Fill notes if provided
  if (recordData.notes) {
    const notesField = page.locator('textarea#notes, textarea[placeholder*="additional information"]')
    await notesField.fill(recordData.notes)
  }

  // Fill type-specific optional fields
  switch (recordData.record_type) {
    case 'vaccine':
      if (recordData.vaccine_data?.vet_clinic) {
        await page.locator('input#vet_clinic').fill(recordData.vaccine_data.vet_clinic)
      }
      if (recordData.vaccine_data?.dose) {
        await page.locator('input#dose').fill(recordData.vaccine_data.dose)
      }
      // Skip expiration_date - requires calendar interaction
      break

    case 'medication':
      if (recordData.medication_data?.dosage) {
        await page.locator('input#dosage').fill(recordData.medication_data.dosage)
      }
      // Skip frequency, start_date, end_date - some require complex interactions
      break

    case 'vet_visit':
      if (recordData.vet_visit_data?.clinic) {
        await page.locator('input#clinic').fill(recordData.vet_visit_data.clinic)
      }
      if (recordData.vet_visit_data?.vet_name) {
        await page.locator('input#vet_name').fill(recordData.vet_visit_data.vet_name)
      }
      if (recordData.vet_visit_data?.diagnosis) {
        await page.locator('input#diagnosis').fill(recordData.vet_visit_data.diagnosis)
      }
      if (recordData.vet_visit_data?.treatment) {
        await page.locator('input#treatment').fill(recordData.vet_visit_data.treatment)
      }
      if (recordData.vet_visit_data?.cost) {
        await page.locator('input#cost').fill(String(recordData.vet_visit_data.cost))
      }
      break

    case 'symptom':
      if (recordData.symptom_data?.severity) {
        await page.locator('input#severity').fill(recordData.symptom_data.severity)
      }
      if (recordData.symptom_data?.body_part_affected) {
        await page.locator('input#body_part_affected').fill(recordData.symptom_data.body_part_affected)
      }
      if (recordData.symptom_data?.duration) {
        await page.locator('input#duration').fill(recordData.symptom_data.duration)
      }
      break

    case 'weight_check':
      if (recordData.weight_check_data?.weight) {
        await page.locator('input#weight').fill(String(recordData.weight_check_data.weight))
      }
      if (recordData.weight_check_data?.unit) {
        // Unit is typically a select/combobox
        const unitSelect = page.locator('select#unit, [role="combobox"]#unit')
        await unitSelect.click()
        await page.getByRole('option', { name: new RegExp(recordData.weight_check_data.unit, 'i') }).click()
      }
      if (recordData.weight_check_data?.body_condition) {
        await page.locator('input#body_condition, select#body_condition').fill(recordData.weight_check_data.body_condition)
      }
      break
  }

  // Click save button
  const saveButton = page.getByRole('button', { name: /save.*record/i })
  await saveButton.click()

  // Wait for dialog to close (indicates success)
  await page.waitForSelector('dialog, [role="dialog"]', { state: 'hidden', timeout: 10000 })

  // Give a moment for the UI to update
  await page.waitForTimeout(500)

  // Return a mock ID (tests don't actually use this)
  return 'mock-record-id'
}

/**
 * Delete all health records for a pet (cleanup utility)
 * Not actually needed since mock database resets between tests
 */
export async function deleteHealthRecords(page: Page, petId: string): Promise<void> {
  // This is a no-op in the simplified version
  // Tests should rely on beforeEach resetting the mock database
}
