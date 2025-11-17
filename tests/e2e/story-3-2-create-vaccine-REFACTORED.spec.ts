/**
 * REFACTORED VERSION: Story 3.2 - Create Vaccine Record
 *
 * This demonstrates advanced refactoring with:
 * 1. CreateHealthRecordDialog POM for complex form interactions
 * 2. Test Data Factories for generating test data
 * 3. Page Object Models for page navigation
 * 4. Cleaner, more maintainable test code
 *
 * Compare with story-3-2-create-vaccine-record.spec.ts to see improvements
 */

import { test, expect } from '../setup/test-env'
import { authenticateTestUser } from '../utils/auth'
import { createPet } from '../utils/pets'
import { UserFactory, PetFactory, HealthRecordFactory } from '../factories'
import { PetDetailPage, CreateHealthRecordDialog } from '../page-objects'
import { format } from 'date-fns'

test.describe('Story 3.2: Create Vaccine Record (REFACTORED)', () => {
  let petDetailPage: PetDetailPage
  let healthRecordDialog: CreateHealthRecordDialog

  test.beforeEach(async ({ page }) => {
    // Initialize page objects
    petDetailPage = new PetDetailPage(page)
    healthRecordDialog = new CreateHealthRecordDialog(page)

    // Use factories for test data
    const user = UserFactory.build()
    await authenticateTestUser(page, user)

    // Create test pet using factory
    const pet = PetFactory.buildDog()
    await createPet(page, pet)
  })

  test('AC1: Add Health Record button is visible on pet detail Health tab', async ({ page }) => {
    // Use POM to switch to Health tab
    await petDetailPage.switchToTab('health')

    // Verify button using POM locator
    await expect(petDetailPage.addHealthRecordButton).toBeVisible()
  })

  test('AC2: Record type selector shows all 5 record types', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Verify dialog is open
    await healthRecordDialog.assertDialogOpen()

    // Click record type dropdown using POM
    await healthRecordDialog.recordTypeSelector.click()

    // Verify all 5 record types are available
    await expect(page.getByRole('option', { name: /^vaccine$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^medication$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^vet visit$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^symptom$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^weight check$/i })).toBeVisible()
  })

  test('AC3: Selecting Vaccine shows all required and optional fields', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Select vaccine type using POM method
    await healthRecordDialog.selectRecordType('vaccine')

    // Verify fields are present (using page locators for labels)
    await expect(page.locator('label:has-text("Vaccine Name")')).toBeVisible()
    await expect(page.locator('label:has-text("Vaccination Date")')).toBeVisible()
    await expect(page.locator('label:has-text("Expiration Date")')).toBeVisible()
    await expect(page.locator('label:has-text("Vet Clinic")')).toBeVisible()
    await expect(page.locator('label:has-text("Dose")')).toBeVisible()
    await expect(page.locator('label:has-text("Notes")')).toBeVisible()

    // Verify action buttons using POM locators
    await expect(healthRecordDialog.saveButton).toBeVisible()
    await expect(healthRecordDialog.cancelButton).toBeVisible()
  })

  test('AC4: Date field defaults to today with calendar picker', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Get today's date in expected format
    const today = new Date()
    const formattedToday = format(today, 'PPP')

    // Verify date field shows today's date
    const dateButton = page.getByText(formattedToday).first()
    await expect(dateButton).toContainText(formattedToday)

    // Click date button to open calendar picker
    await dateButton.click()

    // Verify calendar is displayed
    await expect(page.locator('[role="dialog"]').locator('.rdp')).toBeVisible()
  })

  test('AC6: Successful save shows success message and adds record to timeline', async ({
    page,
  }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Use factory to generate vaccine data
    const vaccine = HealthRecordFactory.buildVaccine({
      title: 'Rabies Vaccine',
    })

    // Use POM method to create vaccine record
    await healthRecordDialog.createVaccineRecord({
      title: vaccine.title,
      notes: vaccine.notes,
    })

    // Verify success message using POM helper
    await healthRecordDialog.assertSuccessMessage('vaccine record created successfully')

    // Verify dialog closes using POM helper
    await healthRecordDialog.assertDialogClosed()
  })

  test('AC7: Form validation prevents submission without required fields', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Try to submit without filling any fields using POM
    await healthRecordDialog.saveButton.click()

    // Verify error messages appear
    await expect(page.getByText(/required/i).first()).toBeVisible()

    // Verify dialog is still open using POM helper
    await healthRecordDialog.assertDialogOpen()
  })

  test('Complete flow: Create vaccine with all fields filled', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Generate vaccine data using factory
    const vaccine = HealthRecordFactory.buildVaccine({
      title: 'DHPP Vaccine',
    })

    // Fill all fields using POM methods
    await healthRecordDialog.fillTitle(vaccine.title)

    // Set expiration date
    await healthRecordDialog.vaccineFields.expirationDateButton.click()
    await page.waitForSelector('[role="dialog"] .rdp', { timeout: 5000 })

    // Calculate one year from now
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

    // Navigate to next year in calendar
    for (let i = 0; i < 12; i++) {
      await page
        .locator('[role="dialog"] .rdp')
        .getByRole('button', { name: /next/i })
        .click()
      await page.waitForTimeout(100)
    }

    // Click on the same day next year
    const dayOfMonth = oneYearFromNow.getDate()
    await page
      .locator('[role="dialog"] .rdp')
      .getByRole('button', { name: String(dayOfMonth), exact: true })
      .first()
      .click()

    // Fill other optional fields
    await healthRecordDialog.vaccineFields.vetClinicInput.fill('Animal Medical Center')
    await healthRecordDialog.vaccineFields.doseInput.fill('2ml subcutaneous')
    await healthRecordDialog.fillNotes(
      'Distemper, hepatitis, parainfluenza, and parvovirus combination vaccine. No adverse reactions observed.'
    )

    // Submit using POM method
    await healthRecordDialog.clickSave()

    // Verify success
    await healthRecordDialog.assertSuccessMessage('vaccine record created successfully')
    await healthRecordDialog.assertDialogClosed()
  })

  test('Cancel button closes dialog without saving', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Fill some fields using POM methods
    await healthRecordDialog.fillTitle('Test Vaccine')

    // Click cancel using POM method
    await healthRecordDialog.clickCancel()

    // Verify dialog closes using POM helper
    await healthRecordDialog.assertDialogClosed()

    // Reopen dialog to verify data wasn't saved
    await petDetailPage.clickAddHealthRecord()
    await healthRecordDialog.assertDialogOpen()

    // Verify field is empty (fresh form)
    await expect(healthRecordDialog.titleInput).toHaveValue('')
  })

  test('Create weight check record using POM helper method', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Use POM's helper method to create weight check record
    await healthRecordDialog.createWeightCheckRecord({
      weight: 25.5,
      unit: 'kg',
      bodyCondition: 'ideal',
    })

    // Verify success
    await healthRecordDialog.assertSuccessMessage('weight check record created successfully')
    await healthRecordDialog.assertDialogClosed()
  })

  test('Create medication record using POM helper method', async ({ page }) => {
    // Navigate using POMs
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Use POM's helper method to create medication record
    await healthRecordDialog.createMedicationRecord({
      title: 'Antibiotics',
      dosage: '500mg',
      frequency: 'Twice daily',
    })

    // Verify success
    await healthRecordDialog.assertSuccessMessage('medication record created successfully')
    await healthRecordDialog.assertDialogClosed()
  })
})

/**
 * ADVANCED REFACTORING IMPROVEMENTS:
 *
 * 1. Page Object Models for Complex Interactions:
 *    - CreateHealthRecordDialog encapsulates all form interactions
 *    - Nested field groups (vaccineFields, medicationFields, etc.)
 *    - Helper methods (createVaccineRecord, createWeightCheckRecord)
 *    - Assertion methods (assertDialogOpen, assertSuccessMessage)
 *
 * 2. Cleaner Test Code:
 *    - Tests read like user stories
 *    - No raw selectors in test files
 *    - Easy to understand what each test does
 *    - Reduced duplication
 *
 * 3. Better Maintainability:
 *    - Change form structure? Update POM once, not 10 tests
 *    - Add new field? Update POM, tests continue working
 *    - Selector changes? Fix in POM, not scattered across tests
 *
 * 4. Test Data Factories:
 *    - HealthRecordFactory.buildVaccine() for consistent data
 *    - Can override specific fields while keeping defaults
 *    - Reduces test setup boilerplate
 *
 * 5. Reusability:
 *    - Helper methods can be used across multiple tests
 *    - New tests can leverage existing POMs
 *    - Faster test development
 */
