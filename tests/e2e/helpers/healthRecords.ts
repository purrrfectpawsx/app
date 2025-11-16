import type { Page } from '@playwright/test'

export interface HealthRecordData {
  record_type: 'vaccine' | 'medication' | 'vet_visit' | 'symptom' | 'weight_check'
  title: string
  date: string
  notes?: string
  vaccine_data?: {
    expiration_date?: string
    vet_clinic?: string
    dose?: string
  }
  medication_data?: {
    dosage?: string
    frequency?: string
    start_date?: string
    end_date?: string
  }
  vet_visit_data?: {
    clinic?: string
    vet_name?: string
    diagnosis?: string
    treatment?: string
    cost?: number
  }
  symptom_data?: {
    severity?: 'mild' | 'moderate' | 'severe'
    observed_behaviors?: string
  }
  weight_data?: {
    weight?: number
    unit?: 'kg' | 'lbs'
    body_condition?: string
  }
}

/**
 * Create a health record for a pet
 */
export async function createHealthRecord(
  page: Page,
  petId: string,
  recordData: HealthRecordData
): Promise<string> {
  // Navigate to pet detail page
  await page.goto(`/pets/${petId}`)

  // Click Health tab if not already active
  const healthTab = page.locator('button:has-text("Health")')
  await healthTab.click()

  // Click Add Health Record button
  const addButton = page.getByRole('button', { name: /Add Health Record/i }).first()
  await addButton.click()

  // Wait for dialog to open
  await page.waitForSelector('dialog, [role="dialog"]')

  // Select record type
  const typeSelect = page.locator('select#record_type')
  await typeSelect.selectOption(recordData.record_type)

  // Fill common fields
  await page.fill('input#title', recordData.title)
  await page.fill('input#date', recordData.date)

  if (recordData.notes) {
    await page.fill('textarea#notes', recordData.notes)
  }

  // Fill type-specific fields
  switch (recordData.record_type) {
    case 'vaccine':
      if (recordData.vaccine_data?.expiration_date) {
        await page.fill('input#expiration_date', recordData.vaccine_data.expiration_date)
      }
      if (recordData.vaccine_data?.vet_clinic) {
        await page.fill('input#vet_clinic', recordData.vaccine_data.vet_clinic)
      }
      if (recordData.vaccine_data?.dose) {
        await page.fill('input#dose', recordData.vaccine_data.dose)
      }
      break

    case 'medication':
      if (recordData.medication_data?.dosage) {
        await page.fill('input#dosage', recordData.medication_data.dosage)
      }
      if (recordData.medication_data?.frequency) {
        await page.fill('input#frequency', recordData.medication_data.frequency)
      }
      if (recordData.medication_data?.start_date) {
        await page.fill('input#start_date', recordData.medication_data.start_date)
      }
      if (recordData.medication_data?.end_date) {
        await page.fill('input#end_date', recordData.medication_data.end_date)
      }
      break

    case 'vet_visit':
      if (recordData.vet_visit_data?.clinic) {
        await page.fill('input#clinic', recordData.vet_visit_data.clinic)
      }
      if (recordData.vet_visit_data?.vet_name) {
        await page.fill('input#vet_name', recordData.vet_visit_data.vet_name)
      }
      if (recordData.vet_visit_data?.diagnosis) {
        await page.fill('input#diagnosis', recordData.vet_visit_data.diagnosis)
      }
      if (recordData.vet_visit_data?.treatment) {
        await page.fill('textarea#treatment', recordData.vet_visit_data.treatment)
      }
      if (recordData.vet_visit_data?.cost !== undefined) {
        await page.fill('input#cost', String(recordData.vet_visit_data.cost))
      }
      break

    case 'symptom':
      if (recordData.symptom_data?.severity) {
        await page.selectOption('select#severity', recordData.symptom_data.severity)
      }
      if (recordData.symptom_data?.observed_behaviors) {
        await page.fill('textarea#observed_behaviors', recordData.symptom_data.observed_behaviors)
      }
      break

    case 'weight_check':
      if (recordData.weight_data?.weight !== undefined) {
        await page.fill('input#weight', String(recordData.weight_data.weight))
      }
      if (recordData.weight_data?.unit) {
        await page.selectOption('select#unit', recordData.weight_data.unit)
      }
      if (recordData.weight_data?.body_condition) {
        await page.fill('input#body_condition', recordData.weight_data.body_condition)
      }
      break
  }

  // Submit form
  const submitButton = page.getByRole('button', { name: /Create|Save/i })
  await submitButton.click()

  // Wait for dialog to close
  await page.waitForSelector('dialog, [role="dialog"]', { state: 'hidden' })

  // Extract and return the created record ID (you might need to adjust based on your implementation)
  // For now, we'll return a placeholder
  return 'created-record-id'
}

/**
 * Delete all health records for a pet
 */
export async function deleteHealthRecords(page: Page, petId: string): Promise<void> {
  // Use Supabase client to delete records via JavaScript
  await page.evaluate(async (id) => {
    // @ts-ignore - supabase is available globally
    const { supabase } = window
    if (supabase) {
      await supabase.from('health_records').delete().eq('pet_id', id)
    }
  }, petId)
}

/**
 * Get health record count for a pet
 */
export async function getHealthRecordCount(page: Page, petId: string): Promise<number> {
  return await page.evaluate(async (id) => {
    // @ts-ignore - supabase is available globally
    const { supabase } = window
    if (supabase) {
      const { count } = await supabase
        .from('health_records')
        .select('*', { count: 'exact', head: true })
        .eq('pet_id', id)
      return count || 0
    }
    return 0
  }, petId)
}
