import { test, expect } from '../setup/test-env';
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth';
import { createPet } from '../utils/pets';
import { generateTestPet } from '../fixtures/pets';

/**
 * E2E Tests for Story 3.2: Create Vaccine Record
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

test.describe('Story 3.2: Create Vaccine Record', () => {
  // Setup: Authenticate test user and create a pet for each test
  test.beforeEach(async ({ page }) => {
    // Authenticate user
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };
    await authenticateTestUser(page, credentials);

    // Create a test pet to add health records to
    const pet = generateTestPet('Buddy');
    await createPet(page, pet);
  });

  test('AC1: Add Health Record button is visible on pet detail Health tab', async ({ page }) => {
    // We should already be on the pet detail page after creating the pet
    // Click on Health tab
    await page.getByRole('tab', { name: /health/i }).click();

    // Verify "Add Health Record" button is visible
    await expect(page.getByRole('button', { name: /add health record/i })).toBeVisible();
  });

  test('AC2: Record type selector shows all 5 record types', async ({ page }) => {
    // Navigate to Health tab
    await page.getByRole('tab', { name: /health/i }).click();

    // Click "Add Health Record" button
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog to open
    await expect(page.getByRole('dialog')).toBeVisible();

    // Click record type dropdown
    await page.getByLabel(/record type/i).click();

    // Verify all 5 record types are available
    await expect(page.getByRole('option', { name: /^vaccine$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^medication$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^vet visit$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^symptom$/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /^weight check$/i })).toBeVisible();
  });

  test('AC3: Selecting Vaccine shows all required and optional fields', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select "Vaccine" record type (should be default)
    await page.getByLabel(/record type/i).click();
    await page.getByRole('option', { name: /^vaccine$/i }).click();

    // Verify required fields
    await expect(page.getByLabel(/vaccine name/i)).toBeVisible();
    await expect(page.getByLabel(/vaccination date/i)).toBeVisible();

    // Verify optional fields
    await expect(page.getByLabel(/expiration date/i)).toBeVisible();
    await expect(page.getByLabel(/vet clinic/i)).toBeVisible();
    await expect(page.getByLabel(/dose/i)).toBeVisible();
    await expect(page.getByLabel(/notes/i)).toBeVisible();

    // Verify action buttons
    await expect(page.getByRole('button', { name: /save vaccine record/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('AC4: Date field defaults to today with calendar picker', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Get today's date in the expected format
    const today = new Date();
    const formattedToday = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Verify date field shows today's date (format: "Month Day, Year")
    const dateButton = page.getByLabel(/vaccination date/i);
    await expect(dateButton).toContainText(formattedToday);

    // Click date button to open calendar picker
    await dateButton.click();

    // Verify calendar is displayed
    await expect(page.locator('[role="dialog"]').locator('.rdp')).toBeVisible();
  });

  test('AC5: Expiration date validates must be after vaccine date', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill required fields
    await page.getByLabel(/vaccine name/i).fill('Rabies Vaccine');

    // Set vaccine date to today
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    // Set expiration date to yesterday (before vaccine date)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await page.getByLabel(/expiration date/i).click();

    // Wait for calendar to appear
    await page.waitForSelector('[role="dialog"] .rdp', { timeout: 5000 });

    // Click on yesterday's date in the calendar
    const yesterdayDay = yesterday.getDate();
    await page.locator('[role="dialog"] .rdp').getByRole('button', { name: String(yesterdayDay), exact: true }).first().click();

    // Try to submit
    await page.getByRole('button', { name: /save vaccine record/i }).click();

    // Verify error message appears
    await expect(page.getByText(/expiration date must be after vaccination date/i)).toBeVisible();
  });

  test('AC6: Successful save shows success message and adds record to timeline', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill required fields
    await page.getByLabel(/vaccine name/i).fill('Rabies Vaccine');

    // Date should already default to today, so we can skip setting it

    // Fill optional fields
    await page.getByLabel(/vet clinic/i).fill('City Vet Clinic');
    await page.getByLabel(/dose/i).fill('1ml');
    await page.getByLabel(/notes/i).fill('Annual rabies vaccination');

    // Submit form
    await page.getByRole('button', { name: /save vaccine record/i }).click();

    // Verify success toast appears
    await expect(page.getByText(/vaccine record created successfully/i)).toBeVisible({ timeout: 5000 });

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });

    // Note: Timeline display is coming in Story 3.4, so we can't verify the record appears yet
    // For now, we just verify the dialog closed successfully
  });

  test('AC7: Form validation prevents submission without required fields', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Try to submit without filling any fields
    await page.getByRole('button', { name: /save vaccine record/i }).click();

    // Verify error messages for required fields appear
    await expect(page.getByText(/required/i).first()).toBeVisible();

    // Verify dialog is still open (form didn't submit)
    await expect(page.getByRole('dialog')).toBeVisible();
  });

  test('AC7.1: Form validation shows specific error for empty title', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill only the date field, leave title empty
    // Date should already be filled with today

    // Click on title field and then blur it to trigger validation
    await page.getByLabel(/vaccine name/i).click();
    await page.getByLabel(/vaccination date/i).click(); // Click away to trigger blur

    // Try to submit
    await page.getByRole('button', { name: /save vaccine record/i }).click();

    // Verify error message appears for title
    await expect(page.getByText(/required/i).first()).toBeVisible();
  });

  test('Complete flow: Create vaccine with all fields filled', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill all fields
    await page.getByLabel(/vaccine name/i).fill('DHPP Vaccine');

    // Set expiration date to 1 year from now
    await page.getByLabel(/expiration date/i).click();

    // Wait for calendar
    await page.waitForSelector('[role="dialog"] .rdp', { timeout: 5000 });

    // Calculate one year from now
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

    // Navigate to next year in calendar (click next month button 12 times)
    for (let i = 0; i < 12; i++) {
      await page.locator('[role="dialog"] .rdp').getByRole('button', { name: /next/i }).click();
      await page.waitForTimeout(100); // Small delay between clicks
    }

    // Click on the same day next year
    const dayOfMonth = oneYearFromNow.getDate();
    await page.locator('[role="dialog"] .rdp').getByRole('button', { name: String(dayOfMonth), exact: true }).first().click();

    // Fill other optional fields
    await page.getByLabel(/vet clinic/i).fill('Animal Medical Center');
    await page.getByLabel(/dose/i).fill('2ml subcutaneous');
    await page.getByLabel(/notes/i).fill('Distemper, hepatitis, parainfluenza, and parvovirus combination vaccine. No adverse reactions observed.');

    // Submit form
    await page.getByRole('button', { name: /save vaccine record/i }).click();

    // Verify success
    await expect(page.getByText(/vaccine record created successfully/i)).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 5000 });
  });

  test('Record type selector shows placeholder for non-vaccine types', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Select "Medication" record type
    await page.getByLabel(/record type/i).click();
    await page.getByRole('option', { name: /^medication$/i }).click();

    // Verify placeholder message appears
    await expect(page.getByText(/medication fields coming in story 3\.3/i)).toBeVisible();

    // Verify Save button is disabled for non-vaccine types
    await expect(page.getByRole('button', { name: /save vaccine record/i })).toBeDisabled();
  });

  test('Cancel button closes dialog without saving', async ({ page }) => {
    // Navigate to Health tab and open create dialog
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();

    // Wait for dialog
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill some fields
    await page.getByLabel(/vaccine name/i).fill('Test Vaccine');

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Reopen dialog to verify data wasn't saved
    await page.getByRole('button', { name: /add health record/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Verify field is empty (fresh form)
    await expect(page.getByLabel(/vaccine name/i)).toHaveValue('');
  });
});
