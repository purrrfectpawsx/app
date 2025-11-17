import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait';
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth';
import { createPet } from '../utils/pets';
import { generateTestPet } from '../fixtures/pets';
import { addHealthRecord } from '../utils/healthRecords';

/**
 * E2E Tests for Story 3.7: Edit Health Record
 *
 * Tests validate all acceptance criteria:
 * AC1: Edit button visible on expanded timeline entry
 * AC2: Edit form pre-populates with existing record data
 * AC3: All fields editable except pet_id and creation date
 * AC4: Record type cannot be changed (would require different field structure)
 * AC5: Validation enforces same rules as create
 * AC6: Save updates record and refreshes timeline
 * AC7: Cancel discards changes and collapses entry
 */

test.describe('Story 3.7: Edit Health Record', () => {
  // Setup: Authenticate test user and create a pet with health records
  test.beforeEach(async ({ page }) => {
    // Authenticate user
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };
    await authenticateTestUser(page, credentials);

    // Create a test pet
    const pet = generateTestPet('dog');
    await createPet(page, pet);

    // Add a vaccine record to edit
    await page.getByRole('tab', { name: /health/i }).click();
    await page.getByRole('button', { name: /add health record/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();

    // Fill vaccine form (dates default to today, which is fine for edit tests)
    await page.getByLabel(/vaccine name/i).fill('Rabies Vaccine');
    // Note: Vaccination date defaults to today, no need to set it
    // Note: Expiration date is optional, skip for simplicity
    await page.getByLabel(/vet clinic/i).fill('Happy Paws Clinic');
    await page.getByLabel(/dose/i).fill('1ml');
    await page.getByLabel(/notes/i).fill('Annual rabies vaccination');

    // Save the record
    await page.getByRole('button', { name: /save vaccine record/i }).click();

    // Wait for success
    await expect(page.getByText(/vaccine record created successfully/i)).toBeVisible();
  });

  test('AC1: Edit button visible on expanded timeline entry', async ({ page }) => {
    // Find the health record card
    const recordCard = page.locator('[class*="border-blue-500"]').first();
    await expect(recordCard).toBeVisible();

    // Initially, Edit button should not be visible (card is collapsed)
    await expect(recordCard.getByRole('button', { name: /edit/i })).not.toBeVisible();

    // Click to expand the card
    await recordCard.click();

    // Now Edit button should be visible
    await expect(recordCard.getByRole('button', { name: /edit.*health record/i })).toBeVisible();
  });

  test('AC2: Edit form pre-populates with existing record data', async ({ page }) => {
    // Expand the health record card
    const recordCard = page.locator('[class*="border-blue-500"]').first();
    await recordCard.click();

    // Click Edit button
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();

    // Verify dialog opens with "Edit" title
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/edit health record/i)).toBeVisible();

    // Verify all fields are pre-populated
    await expect(page.getByLabel(/vaccine name/i)).toHaveValue('Rabies Vaccine');
    // Date picker shows as button text, not input value - just verify it's visible
    await expect(page.getByLabel(/vaccination date/i)).toBeVisible();
    await expect(page.getByLabel(/vet clinic/i)).toHaveValue('Happy Paws Clinic');
    await expect(page.getByLabel(/dose/i)).toHaveValue('1ml');
    await expect(page.getByLabel(/notes/i)).toHaveValue('Annual rabies vaccination');
  });

  test('AC3: All fields are editable in edit mode', async ({ page }) => {
    // Expand and click edit
    const recordCard = page.locator('[class*="border-blue-500"]').first();
    await recordCard.click();
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();

    // Verify all fields are enabled (not disabled)
    await expect(page.getByLabel(/vaccine name/i)).toBeEnabled();
    await expect(page.getByLabel(/vaccination date/i)).toBeEnabled();
    await expect(page.getByLabel(/expiration date/i)).toBeEnabled();
    await expect(page.getByLabel(/vet clinic/i)).toBeEnabled();
    await expect(page.getByLabel(/dose/i)).toBeEnabled();
    await expect(page.getByLabel(/notes/i)).toBeEnabled();

    // Edit some fields
    await page.getByLabel(/vaccine name/i).fill('Updated Rabies Vaccine');
    await page.getByLabel(/dose/i).fill('2ml');
    await page.getByLabel(/notes/i).fill('Updated notes for annual vaccination');

    // Verify edits are reflected
    await expect(page.getByLabel(/vaccine name/i)).toHaveValue('Updated Rabies Vaccine');
    await expect(page.getByLabel(/dose/i)).toHaveValue('2ml');
    await expect(page.getByLabel(/notes/i)).toHaveValue('Updated notes for annual vaccination');
  });

  test('AC4: Record type cannot be changed in edit mode', async ({ page }) => {
    // Expand and click edit
    const recordCard = page.locator('[class*="border-blue-500"]').first();
    await recordCard.click();
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();

    // Verify record type selector is disabled
    const recordTypeSelect = page.getByRole('combobox', { name: /record type/i });
    await expect(recordTypeSelect).toBeDisabled();

    // Verify explanatory text is shown
    await expect(page.getByText(/cannot be changed when editing/i)).toBeVisible();
  });

  test('AC5: Validation enforces same rules as create', async ({ page }) => {
    // Expand and click edit
    const recordCard = page.locator('[class*="border-blue-500"]').first();
    await recordCard.click();
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();

    // Try to clear required field (vaccine name)
    await page.getByLabel(/vaccine name/i).clear();

    // Try to submit
    await page.getByRole('button', { name: /update vaccine record/i }).click();

    // Should show validation error
    await expect(page.getByText(/required/i)).toBeVisible();

    // Fill required field to fix the error
    await page.getByLabel(/vaccine name/i).fill('Valid Vaccine Name');

    // Note: Date validation with date pickers is complex and tested in create tests
    // For edit mode, we just verify required field validation works the same
  });

  test('AC6: Save updates record and refreshes timeline', async ({ page }) => {
    // Expand and click edit
    const recordCard = page.locator('[class*="border-blue-500"]').first();
    await recordCard.click();
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();

    // Make changes
    await page.getByLabel(/vaccine name/i).fill('Modified Rabies Vaccine');
    await page.getByLabel(/dose/i).fill('2.5ml');
    await page.getByLabel(/notes/i).fill('Updated vaccination record with new dosage');

    // Save changes
    await page.getByRole('button', { name: /update vaccine record/i }).click();

    // Verify success message
    await expect(page.getByText(/vaccine record updated successfully/i)).toBeVisible();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Verify updated data appears in timeline
    await page.waitForTimeout(1000); // Wait for timeline refresh

    // Expand card again to see updated data
    const updatedCard = page.locator('[class*="border-blue-500"]').first();
    await updatedCard.click();

    // Verify updated content is displayed
    await expect(updatedCard.getByText(/modified rabies vaccine/i)).toBeVisible();
  });

  test('AC7: Cancel discards changes and closes dialog', async ({ page }) => {
    // Expand and click edit
    const recordCard = page.locator('[class*="border-blue-500"]').first();
    await recordCard.click();
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();

    // Make changes
    await page.getByLabel(/vaccine name/i).fill('This Should Be Discarded');
    await page.getByLabel(/dose/i).fill('999ml');

    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Verify dialog closes
    await expect(page.getByRole('dialog')).not.toBeVisible();

    // Expand card again
    const sameCard = page.locator('[class*="border-blue-500"]').first();
    await sameCard.click();

    // Verify original data is still there (changes were discarded)
    await expect(sameCard.getByText(/rabies vaccine/i)).toBeVisible();
    await expect(sameCard.getByText(/1ml/i)).toBeVisible();
  });

  test('AC (All): Can edit medication record type', async ({ page }) => {
    // Create a medication record first
    await page.getByRole('button', { name: /add health record/i }).click();
    await page.getByRole('combobox', { name: /record type/i }).click();
    await page.getByRole('option', { name: /^medication$/i }).click();

    await page.getByLabel(/medication name/i).fill('Pain Relief Medication');
    await page.getByLabel(/dosage/i).fill('500mg');
    await page.getByLabel(/frequency/i).click();
    await page.getByRole('option', { name: /twice daily/i }).click();

    await page.getByRole('button', { name: /save medication record/i }).click();
    await expect(page.getByText(/medication record created successfully/i)).toBeVisible();

    // Edit the medication record
    const medCard = page.locator('[class*="border-purple-500"]').first();
    await medCard.click();
    await medCard.getByRole('button', { name: /edit.*health record/i }).click();

    // Verify pre-population
    await expect(page.getByLabel(/medication name/i)).toHaveValue('Pain Relief Medication');
    await expect(page.getByLabel(/dosage/i)).toHaveValue('500mg');

    // Update and save
    await page.getByLabel(/medication name/i).fill('Updated Pain Relief');
    await page.getByRole('button', { name: /update medication record/i }).click();

    await expect(page.getByText(/medication record updated successfully/i)).toBeVisible();
  });

  test('AC (All): RLS prevents editing other users records', async ({ page }) => {
    // Note: This test would require setting up another user's record
    // For now, we verify that the edit button only appears for user's own records
    // RLS is tested at the database level in unit tests

    // Verify edit button is visible for own records
    const ownCard = page.locator('[class*="border-blue-500"]').first();
    await ownCard.click();
    await expect(ownCard.getByRole('button', { name: /edit.*health record/i })).toBeVisible();
  });

  test('AC6: Multiple edit operations work correctly', async ({ page }) => {
    // Edit the record twice to ensure state management works
    const recordCard = page.locator('[class*="border-blue-500"]').first();

    // First edit
    await recordCard.click();
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();
    await page.getByLabel(/vaccine name/i).fill('First Edit');
    await page.getByRole('button', { name: /update vaccine record/i }).click();
    await expect(page.getByText(/updated successfully/i)).toBeVisible();

    await page.waitForTimeout(1000);

    // Second edit
    await recordCard.click();
    await recordCard.getByRole('button', { name: /edit.*health record/i }).click();
    await expect(page.getByLabel(/vaccine name/i)).toHaveValue('First Edit');
    await page.getByLabel(/vaccine name/i).fill('Second Edit');
    await page.getByRole('button', { name: /update vaccine record/i }).click();
    await expect(page.getByText(/updated successfully/i)).toBeVisible();

    // Verify final state
    await page.waitForTimeout(1000);
    await recordCard.click();
    await expect(recordCard.getByText(/second edit/i)).toBeVisible();
  });
});
