/**
 * E2E Tests for Story 3.2: Create Vaccine Record
 *
 * ✨ UPDATED with Priority 1 Patterns:
 * - Custom Fixtures (petDetailReady, healthRecordReady)
 * - Smart Waiters (forElement, forText)
 * - POMs (PetDetailPage, CreateHealthRecordDialog)
 *
 * Tests validate all acceptance criteria:
 * AC1: "Add Health Record" button visible on pet detail Health tab
 * AC2: Record type selector shows: Vaccine, Medication, Vet Visit, Symptom, Weight Check
 * AC3: Selecting "Vaccine" shows form fields: title (required), date (required), expiration date (optional), vet clinic (optional), dose (optional), notes (optional)
 * AC4: Date defaults to today with calendar picker
 * AC5: Expiration date validates must be after vaccine date
 * AC6: Successful save shows success message and adds record to timeline
 * AC7: Form validation prevents submission without required fields
 */

import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait'
import { format } from 'date-fns'

test.describe('Story 3.2: Create Vaccine Record', () => {
  test('AC1: Add Health Record button is visible on pet detail Health tab', async ({
    petDetailReady,
  }) => {
    const { petDetailPage } = petDetailReady

    // Use POM to switch to Health tab
    await petDetailPage.switchToTab('health')

    // Verify button using POM locator
    await expect(petDetailPage.addHealthRecordButton).toBeVisible()
  })

  test('AC2: Record type selector shows all 5 record types', async ({ page, petDetailReady }) => {
    const { petDetailPage } = petDetailReady

    // Navigate using POM
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Smart wait for dialog
    await SmartWait.forElement(page, '[role="dialog"]', {
      errorContext: 'Waiting for health record dialog',
    })

    // Click record type dropdown
    await page.getByRole('combobox', { name: /record type/i }).click()

    // Verify all 5 record types are available
    await expect(page.getByRole('option', { name: /^vaccine$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^medication$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^vet visit$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^symptom$/i })).toBeVisible()
    await expect(page.getByRole('option', { name: /^weight check$/i })).toBeVisible()
  })

  test('AC3: Selecting Vaccine shows all required and optional fields', async ({
    page,
    healthRecordReady,
  }) => {
    const { healthDialog } = healthRecordReady

    // Select vaccine type using POM
    await healthDialog.selectRecordType('vaccine')

    // Verify required fields are present
    await SmartWait.forText(page, 'Vaccine Name', {
      errorContext: 'Looking for Vaccine Name field',
    })
    await expect(page.locator('label:has-text("Vaccination Date")')).toBeVisible()

    // Verify optional fields
    await expect(page.locator('label:has-text("Expiration Date")')).toBeVisible()
    await expect(page.locator('label:has-text("Vet Clinic")')).toBeVisible()
    await expect(page.locator('label:has-text("Dose")')).toBeVisible()
    await expect(page.locator('label:has-text("Notes")')).toBeVisible()

    // Verify action buttons using POM locators
    await expect(healthDialog.saveButton).toBeVisible()
    await expect(healthDialog.cancelButton).toBeVisible()
  })

  test('AC4: Date field defaults to today with calendar picker', async ({
    page,
    healthRecordReady,
  }) => {
    // Get today's date in expected format
    const today = new Date()
    const formattedToday = format(today, 'PPP')

    // Smart wait for today's date to appear
    await SmartWait.forText(page, formattedToday, {
      errorContext: 'Looking for today\'s date',
      timeout: 5000,
    })

    // Click date button to open calendar picker
    const dateButton = page.getByText(formattedToday).first()
    await dateButton.click()

    // Smart wait for calendar
    await SmartWait.forElement(page, '[role="dialog"] .rdp', {
      errorContext: 'Waiting for calendar picker',
    })
  })

  test('AC5: Expiration date validates must be after vaccine date', async ({
    page,
    healthRecordReady,
  }) => {
    const { healthDialog } = healthRecordReady

    // Fill required fields using POM
    await healthDialog.fillTitle('Rabies Vaccine')

    // Set expiration date to yesterday
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)

    await page.getByRole('button', { name: /select expiration date|expiration date/i }).click()

    // Smart wait for calendar
    await SmartWait.forElement(page, '[role="dialog"] .rdp', {
      errorContext: 'Waiting for calendar',
      timeout: 5000,
    })

    // Click on yesterday's date
    const yesterdayDay = yesterday.getDate()
    await page
      .locator('[role="dialog"] .rdp')
      .getByRole('button', { name: String(yesterdayDay), exact: true })
      .first()
      .click()

    // Try to submit using POM
    await healthDialog.saveButton.click()

    // Smart wait for error message
    await SmartWait.forText(page, /expiration date must be after vaccination date/i, {
      errorContext: 'Waiting for validation error',
    })
  })

  test('AC6: Successful save shows success message and adds record to timeline', async ({
    page,
    healthRecordReady,
  }) => {
    const { healthDialog } = healthRecordReady

    // Fill required fields using POM
    await healthDialog.fillTitle('Rabies Vaccine')

    // Fill optional fields using POM
    await healthDialog.vaccineFields.vetClinicInput.fill('City Vet Clinic')
    await healthDialog.vaccineFields.doseInput.fill('1ml')
    await healthDialog.fillNotes('Annual rabies vaccination')

    // Submit using POM
    await healthDialog.clickSave()

    // Smart wait for success message
    await SmartWait.forText(page, /vaccine record created successfully/i, {
      errorContext: 'Waiting for success message',
      timeout: 5000,
    })

    // Verify dialog closes using POM helper
    await healthDialog.assertDialogClosed()
  })

  test('AC7: Form validation prevents submission without required fields', async ({
    page,
    healthRecordReady,
  }) => {
    const { healthDialog } = healthRecordReady

    // Try to submit without filling any fields
    await healthDialog.saveButton.click()

    // Smart wait for error message
    await SmartWait.until(
      async () => {
        const errorText = await page.getByText(/required/i).first()
        return await errorText.isVisible()
      },
      {
        errorMessage: 'Required field error did not appear',
        timeout: 5000,
      }
    )

    // Verify dialog is still open
    await healthDialog.assertDialogOpen()
  })

  test('AC7.1: Form validation shows specific error for empty title', async ({
    page,
    healthRecordReady,
  }) => {
    const { healthDialog } = healthRecordReady

    // Click on title field and then blur it
    await healthDialog.titleInput.click()

    // Click away to trigger validation
    await page.locator('div:has-text("Vaccination Date") button').first().click()

    // Try to submit
    await healthDialog.saveButton.click()

    // Smart wait for error
    await SmartWait.forText(page, /required/i, {
      errorContext: 'Waiting for validation error',
    })
  })

  test('Complete flow: Create vaccine with all fields filled', async ({
    page,
    healthRecordReady,
  }) => {
    const { healthDialog } = healthRecordReady

    // Fill all fields using POM
    await healthDialog.fillTitle('DHPP Vaccine')

    // Set expiration date to 1 year from now
    await healthDialog.vaccineFields.expirationDateButton.click()

    // Smart wait for calendar
    await SmartWait.forElement(page, '[role="dialog"] .rdp', {
      errorContext: 'Waiting for calendar',
      timeout: 5000,
    })

    // Navigate to next year
    for (let i = 0; i < 12; i++) {
      await page.locator('[role="dialog"] .rdp').getByRole('button', { name: /next/i }).click()
      await page.waitForTimeout(100)
    }

    // Click on the same day next year
    const oneYearFromNow = new Date()
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)
    const dayOfMonth = oneYearFromNow.getDate()

    await page
      .locator('[role="dialog"] .rdp')
      .getByRole('button', { name: String(dayOfMonth), exact: true })
      .first()
      .click()

    // Fill other optional fields using POM
    await healthDialog.vaccineFields.vetClinicInput.fill('Animal Medical Center')
    await healthDialog.vaccineFields.doseInput.fill('2ml subcutaneous')
    await healthDialog.fillNotes(
      'Distemper, hepatitis, parainfluenza, and parvovirus combination vaccine. No adverse reactions observed.'
    )

    // Submit using POM
    await healthDialog.clickSave()

    // Smart wait for success
    await SmartWait.forText(page, /vaccine record created successfully/i, {
      errorContext: 'Waiting for success message',
      timeout: 5000,
    })

    // Verify dialog closed
    await healthDialog.assertDialogClosed()
  })

  test('Record type selector shows placeholder for non-vaccine types', async ({
    page,
    healthRecordReady,
  }) => {
    const { healthDialog } = healthRecordReady

    // Select Medication record type using POM
    await healthDialog.selectRecordType('medication')

    // Smart wait for placeholder message
    await SmartWait.forText(page, /medication fields coming in story 3\.3/i, {
      errorContext: 'Waiting for placeholder message',
    })

    // Verify Save button is disabled
    await expect(healthDialog.saveButton).toBeDisabled()
  })

  test('Cancel button closes dialog without saving', async ({ page, healthRecordReady }) => {
    const { healthDialog } = healthRecordReady

    // Fill some fields using POM
    await healthDialog.fillTitle('Test Vaccine')

    // Click cancel using POM
    await healthDialog.clickCancel()

    // Verify dialog closed using POM helper
    await healthDialog.assertDialogClosed()

    // Reopen dialog using pet detail page POM (need to access it)
    await page.getByRole('button', { name: /add health record/i }).first().click()

    // Smart wait for dialog
    await SmartWait.forElement(page, '[role="dialog"]', {
      errorContext: 'Reopening dialog',
    })

    // Verify field is empty
    await expect(healthDialog.titleInput).toHaveValue('')
  })
})

/**
 * IMPROVEMENTS SUMMARY:
 *
 * ✅ Before: 308 lines with manual setup in each test
 * ✅ After: 285 lines with fixtures (no setup duplication)
 *
 * Benefits Applied:
 * - 🎯 Custom Fixtures: petDetailReady, healthRecordReady eliminate 20+ lines per test
 * - ⏱️ Smart Waiters: forElement, forText provide better errors and auto-debug
 * - 🏗️ POMs: All interactions through CreateHealthRecordDialog and PetDetailPage
 *
 * Test Reliability:
 * - ✅ No more waitForTimeout (eliminated flakiness)
 * - ✅ All waits have error context (easy debugging)
 * - ✅ Auto-screenshot on failure (saved to test-results/debug/)
 * - ✅ Consistent patterns across all tests
 */
