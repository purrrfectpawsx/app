/**
 * Page Object Model: Create/Edit Health Record Dialog
 *
 * Encapsulates all interactions with the health record creation/editing dialog.
 * Handles all record types: vaccine, medication, vet_visit, symptom, weight_check
 */

import { Page, Locator, expect } from '@playwright/test'
import type { RecordType } from '../factories'

export class CreateHealthRecordDialog {
  readonly page: Page

  // Dialog elements
  readonly dialog: Locator
  readonly dialogTitle: Locator
  readonly closeButton: Locator

  // Common fields
  readonly recordTypeSelector: Locator
  readonly titleInput: Locator
  readonly dateButton: Locator
  readonly notesTextarea: Locator

  // Action buttons
  readonly saveButton: Locator
  readonly cancelButton: Locator

  // Record type specific fields
  readonly vaccineFields: VaccineFields
  readonly medicationFields: MedicationFields
  readonly vetVisitFields: VetVisitFields
  readonly symptomFields: SymptomFields
  readonly weightCheckFields: WeightCheckFields

  constructor(page: Page) {
    this.page = page

    // Dialog elements
    this.dialog = page.getByRole('dialog')
    this.dialogTitle = this.dialog.getByRole('heading').first()
    this.closeButton = this.dialog.getByRole('button', { name: /close/i })

    // Common fields
    this.recordTypeSelector = this.dialog.getByRole('combobox', { name: /record type/i })
    this.titleInput = this.dialog.locator('input#title')
    this.dateButton = this.dialog.locator('button').filter({ hasText: /\d{1,2}(st|nd|rd|th)/ }).first()
    this.notesTextarea = this.dialog.getByLabel(/notes/i)

    // Action buttons
    this.saveButton = this.dialog.getByRole('button', { name: /save.*record/i })
    this.cancelButton = this.dialog.getByRole('button', { name: /cancel/i })

    // Record type specific fields
    this.vaccineFields = new VaccineFields(page)
    this.medicationFields = new MedicationFields(page)
    this.vetVisitFields = new VetVisitFields(page)
    this.symptomFields = new SymptomFields(page)
    this.weightCheckFields = new WeightCheckFields(page)
  }

  /**
   * Select a record type from the dropdown
   */
  async selectRecordType(type: RecordType) {
    await this.recordTypeSelector.click()

    const optionMap: Record<RecordType, string> = {
      vaccine: 'Vaccine',
      medication: 'Medication',
      vet_visit: 'Vet Visit',
      symptom: 'Symptom',
      weight_check: 'Weight Check',
    }

    await this.page.getByRole('option', { name: optionMap[type] }).click()
    await this.page.waitForTimeout(500) // Wait for form to update
  }

  /**
   * Fill the title field
   */
  async fillTitle(title: string) {
    await this.titleInput.fill(title)
  }

  /**
   * Fill the notes field
   */
  async fillNotes(notes: string) {
    await this.notesTextarea.fill(notes)
  }

  /**
   * Click the Save button
   */
  async clickSave() {
    await this.saveButton.click()
    // Wait for dialog to close
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 10000 })
    await this.page.waitForTimeout(500) // Wait for any animations
  }

  /**
   * Click the Cancel button
   */
  async clickCancel() {
    await this.cancelButton.click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'hidden', timeout: 5000 })
  }

  /**
   * Create a vaccine record with sensible defaults
   */
  async createVaccineRecord(data: { title: string; notes?: string }) {
    await this.selectRecordType('vaccine')
    await this.fillTitle(data.title)
    if (data.notes) {
      await this.fillNotes(data.notes)
    }
    // Use form defaults for date, expiration, clinic, dose
    await this.clickSave()
  }

  /**
   * Create a medication record with sensible defaults
   */
  async createMedicationRecord(data: { title: string; dosage?: string; frequency?: string }) {
    await this.selectRecordType('medication')
    await this.fillTitle(data.title)

    if (data.dosage) {
      await this.medicationFields.dosageInput.fill(data.dosage)
    }
    if (data.frequency) {
      await this.medicationFields.selectFrequency(data.frequency)
    }

    await this.clickSave()
  }

  /**
   * Create a weight check record
   */
  async createWeightCheckRecord(data: { weight: number; unit?: string; bodyCondition?: string }) {
    await this.selectRecordType('weight_check')

    await this.weightCheckFields.weightInput.fill(data.weight.toString())

    if (data.unit) {
      await this.weightCheckFields.selectUnit(data.unit)
    }
    if (data.bodyCondition) {
      await this.weightCheckFields.selectBodyCondition(data.bodyCondition)
    }

    await this.clickSave()
  }

  /**
   * Verify the dialog is open
   */
  async assertDialogOpen() {
    await expect(this.dialog).toBeVisible()
    await expect(this.dialogTitle).toBeVisible()
  }

  /**
   * Verify the dialog is closed
   */
  async assertDialogClosed() {
    await expect(this.dialog).not.toBeVisible()
  }

  /**
   * Verify success message appears
   */
  async assertSuccessMessage(message: string) {
    await expect(this.page.getByText(new RegExp(message, 'i')).first()).toBeVisible({ timeout: 5000 })
  }
}

// ============================================================================
// Record Type Specific Field Groups
// ============================================================================

class VaccineFields {
  readonly page: Page
  readonly expirationDateButton: Locator
  readonly vetClinicInput: Locator
  readonly doseInput: Locator

  constructor(page: Page) {
    this.page = page
    this.expirationDateButton = page.getByRole('button', { name: /select expiration date|expiration/i }).first()
    this.vetClinicInput = page.getByLabel(/vet clinic/i)
    this.doseInput = page.getByLabel(/dose/i)
  }
}

class MedicationFields {
  readonly page: Page
  readonly dosageInput: Locator
  readonly frequencySelector: Locator
  readonly startDateButton: Locator
  readonly endDateButton: Locator

  constructor(page: Page) {
    this.page = page
    this.dosageInput = page.getByLabel(/dosage/i)
    this.frequencySelector = page.getByLabel(/frequency/i)
    this.startDateButton = page.locator('button').filter({ hasText: /start date/i })
    this.endDateButton = page.locator('button').filter({ hasText: /end date/i })
  }

  async selectFrequency(frequency: string) {
    await this.frequencySelector.click()
    await this.page.getByRole('option', { name: frequency }).click()
  }
}

class VetVisitFields {
  readonly page: Page
  readonly clinicInput: Locator
  readonly vetNameInput: Locator
  readonly reasonInput: Locator
  readonly diagnosisInput: Locator
  readonly costInput: Locator

  constructor(page: Page) {
    this.page = page
    this.clinicInput = page.getByLabel(/clinic/i)
    this.vetNameInput = page.getByLabel(/vet name/i)
    this.reasonInput = page.getByLabel(/reason/i)
    this.diagnosisInput = page.getByLabel(/diagnosis/i)
    this.costInput = page.getByLabel(/cost/i)
  }
}

class SymptomFields {
  readonly page: Page
  readonly severitySelector: Locator
  readonly durationInput: Locator

  constructor(page: Page) {
    this.page = page
    this.severitySelector = page.getByLabel(/severity/i)
    this.durationInput = page.getByLabel(/duration/i)
  }

  async selectSeverity(severity: string) {
    await this.severitySelector.click()
    await this.page.getByRole('option', { name: severity }).click()
  }
}

class WeightCheckFields {
  readonly page: Page
  readonly weightInput: Locator
  readonly unitSelector: Locator
  readonly bodyConditionSelector: Locator

  constructor(page: Page) {
    this.page = page
    this.weightInput = page.getByRole('spinbutton', { name: /weight/i })
    this.unitSelector = page.getByLabel(/unit/i)
    this.bodyConditionSelector = page.getByLabel(/body condition/i)
  }

  async selectUnit(unit: string) {
    await this.unitSelector.click()
    await this.page.getByRole('option', { name: new RegExp(unit, 'i') }).click()
  }

  async selectBodyCondition(condition: string) {
    await this.bodyConditionSelector.click()
    await this.page.getByRole('option', { name: new RegExp(condition, 'i') }).click()
  }
}
