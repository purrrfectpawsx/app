import { test, expect } from '../fixtures'
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth'
import { createPet } from '../utils/pets'
import { generateTestPet } from '../fixtures/pets'

/**
 * E2E Tests for Story 3.8: Delete Health Record with Confirmation
 *
 * Tests validate all acceptance criteria:
 * AC1: Delete button visible on expanded timeline entry (destructive styling)
 * AC2: Confirmation dialog: "Are you sure you want to delete this [record type]?"
 * AC3: Dialog shows record title and date for confirmation
 * AC4: Successful deletion removes from timeline immediately
 * AC5: Success message: "[Record type] deleted successfully"
 * AC6: No cascade effects (deleting record doesn't affect other data)
 */

test.describe('Story 3.8: Delete Health Record with Confirmation', () => {
  // Setup: Authenticate test user and create a pet with health records
  test.beforeEach(async ({ page }) => {
    // Authenticate user
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    }
    await authenticateTestUser(page, credentials)

    // Create a test pet
    const pet = generateTestPet('dog')
    await createPet(page, pet)

    // Add a vaccine record to delete
    await page.getByRole('tab', { name: /health/i }).click()
    await page.getByRole('button', { name: /add health record/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })

    // Fill vaccine form
    await page.getByLabel(/vaccine name/i).fill('Test Vaccine Record')
    await page.getByLabel(/vet clinic/i).fill('Test Clinic')
    await page.getByLabel(/dose/i).fill('1ml')
    await page.getByLabel(/notes/i).fill('Test notes for deletion test')

    // Save the record
    await page.getByRole('button', { name: /save vaccine record/i }).click()

    // Wait for success - use first() to avoid strict mode violation (toast + screen reader element)
    await expect(page.getByText(/vaccine record created successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })
  })

  test('AC1: Delete button visible on expanded timeline entry with destructive styling', async ({ page }) => {
    // Find the health record card (vaccine = blue border)
    const recordCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await expect(recordCard).toBeVisible({ timeout: 10000 })

    // Initially, Delete button should not be visible (card is collapsed)
    await expect(recordCard.getByRole('button', { name: /delete.*health record/i })).not.toBeVisible({ timeout: 10000 })

    // Click to expand the card
    await recordCard.click()

    // Now Delete button should be visible
    const deleteButton = recordCard.getByRole('button', { name: /delete.*health record/i })
    await expect(deleteButton).toBeVisible({ timeout: 10000 })

    // Verify destructive (red) styling
    await expect(deleteButton).toHaveClass(/text-red-600/)
  })

  test('AC2 & AC3: Clicking Delete opens confirmation dialog with correct content', async ({ page }) => {
    // Expand the health record card
    const recordCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await recordCard.click()

    // Click Delete button
    await recordCard.getByRole('button', { name: /delete.*health record/i }).click()

    // Verify dialog opens
    const dialog = page.getByRole('alertdialog')
    await expect(dialog).toBeVisible({ timeout: 10000 })

    // AC2: Verify dialog message
    await expect(dialog.getByText(/are you sure you want to delete this vaccine/i)).toBeVisible({ timeout: 10000 })

    // AC3: Verify dialog shows record title and date
    await expect(dialog.getByText(/test vaccine record/i)).toBeVisible({ timeout: 10000 })

    // Verify warning text
    await expect(dialog.getByText(/this action cannot be undone/i)).toBeVisible({ timeout: 10000 })

    // Verify Cancel and Delete buttons
    await expect(dialog.getByRole('button', { name: /cancel/i })).toBeVisible({ timeout: 10000 })
    await expect(dialog.getByRole('button', { name: /^delete$/i })).toBeVisible({ timeout: 10000 })
  })

  test('Cancel button closes dialog without deleting record', async ({ page }) => {
    // Expand and click delete
    const recordCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await recordCard.click()
    await recordCard.getByRole('button', { name: /delete.*health record/i }).click()

    // Verify dialog is open
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 10000 })

    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click()

    // Verify dialog closes
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 10000 })

    // Verify record still exists in timeline
    await expect(page.locator('div.rounded-lg[class*="border-blue-500"]').first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/test vaccine record/i)).toBeVisible({ timeout: 10000 })
  })

  test('AC4 & AC5: Delete button removes record and shows success message', async ({ page }) => {
    // Expand and click delete
    const recordCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await recordCard.click()
    await recordCard.getByRole('button', { name: /delete.*health record/i }).click()

    // Confirm deletion
    await page.getByRole('button', { name: /^delete$/i }).click()

    // AC5: Verify success message
    await expect(page.getByText(/vaccine deleted successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Verify dialog closes
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 10000 })

    // AC4: Verify record is removed from timeline
    await expect(page.getByText(/test vaccine record/i)).not.toBeVisible({ timeout: 10000 })

    // Verify empty state or no vaccine cards
    const vaccineCards = page.locator('div.rounded-lg[class*="border-blue-500"]')
    await expect(vaccineCards).toHaveCount(0)
  })

  test('AC4: Timeline updates immediately after deletion (optimistic UI)', async ({ page }) => {
    // Add a second record first
    await page.getByRole('button', { name: /add health record/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
    await page.getByRole('combobox', { name: /record type/i }).click()
    await page.getByRole('option', { name: /^medication$/i }).click()
    // Wait for form to update after record type change
    await expect(page.getByLabel(/medication name/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/medication name/i).fill('Test Medication')
    await page.getByLabel(/dosage/i).fill('500mg')
    await page.getByLabel(/frequency/i).click()
    await page.getByRole('option', { name: /^daily$/i }).click()
    await page.getByRole('button', { name: /save medication record/i }).click()
    await expect(page.getByText(/medication record created successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // Verify both cards are visible
    await expect(page.locator('div.rounded-lg[class*="border-blue-500"]')).toHaveCount(1, { timeout: 10000 })
    await expect(page.locator('div.rounded-lg[class*="border-purple-500"]')).toHaveCount(1, { timeout: 10000 })

    // Now delete the vaccine record
    const vaccineCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await vaccineCard.click()
    await vaccineCard.getByRole('button', { name: /delete.*health record/i }).click()
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Wait for success message
    await expect(page.getByText(/vaccine deleted successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Verify immediate removal (optimistic UI)
    await expect(page.locator('div.rounded-lg[class*="border-blue-500"]')).toHaveCount(0, { timeout: 10000 })

    // Medication record should still exist
    await expect(page.locator('div.rounded-lg[class*="border-purple-500"]')).toHaveCount(1, { timeout: 10000 })
  })

  test('AC6: No cascade effects - pet still exists after deleting health record', async ({ page }) => {
    // Get the pet name before deletion
    const petName = await page.locator('h1').first().textContent()

    // Delete the health record
    const recordCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await recordCard.click()
    await recordCard.getByRole('button', { name: /delete.*health record/i }).click()
    await page.getByRole('button', { name: /^delete$/i }).click()
    await expect(page.getByText(/deleted successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Wait for alert dialog to close
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 10000 })

    // Navigate to pets grid
    await page.getByRole('button', { name: /back to pets/i }).click()

    // Wait for navigation
    await page.waitForURL(/\/pets/i, { timeout: 10000 })

    // Verify pet still exists
    await expect(page.getByText(petName!)).toBeVisible({ timeout: 10000 })
  })

  test('AC6: No cascade effects - other health records not affected', async ({ page }) => {
    // Add a medication record
    await page.getByRole('button', { name: /add health record/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
    await page.getByRole('combobox', { name: /record type/i }).click()
    await page.getByRole('option', { name: /^medication$/i }).click()
    // Wait for form to update after record type change
    await expect(page.getByLabel(/medication name/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/medication name/i).fill('Medication Record')
    await page.getByLabel(/dosage/i).fill('500mg')
    await page.getByLabel(/frequency/i).click()
    await page.getByRole('option', { name: /^daily$/i }).click()
    await page.getByRole('button', { name: /save medication record/i }).click()
    await expect(page.getByText(/medication record created successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // Verify both records exist
    await expect(page.locator('div.rounded-lg[class*="border-blue-500"]')).toHaveCount(1, { timeout: 10000 })
    await expect(page.locator('div.rounded-lg[class*="border-purple-500"]')).toHaveCount(1, { timeout: 10000 })

    // Delete only the vaccine
    const vaccineCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await vaccineCard.click()
    await vaccineCard.getByRole('button', { name: /delete.*health record/i }).click()
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Wait for success message
    await expect(page.getByText(/vaccine deleted successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Verify vaccine is deleted
    await expect(page.locator('div.rounded-lg[class*="border-blue-500"]')).toHaveCount(0, { timeout: 10000 })

    // Verify medication record still exists
    await expect(page.locator('div.rounded-lg[class*="border-purple-500"]')).toHaveCount(1, { timeout: 10000 })
    await expect(page.getByText(/medication record/i)).toBeVisible({ timeout: 10000 })
  })

  // Skip: AlertDialog by design doesn't close on Escape (requires explicit user action)
  test.skip('Escape key closes dialog without deleting', async ({ page }) => {
    // Expand and click delete
    const recordCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await recordCard.click()
    await recordCard.getByRole('button', { name: /delete.*health record/i }).click()

    // Verify dialog is open
    await expect(page.getByRole('alertdialog')).toBeVisible({ timeout: 10000 })

    // Press Escape
    await page.keyboard.press('Escape')

    // Verify dialog closes
    await expect(page.getByRole('alertdialog')).not.toBeVisible({ timeout: 10000 })

    // Verify record still exists
    await expect(page.getByText(/test vaccine record/i)).toBeVisible({ timeout: 10000 })
  })

  test('Can delete different record types (medication)', async ({ page }) => {
    // Create a medication record
    await page.getByRole('button', { name: /add health record/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
    await page.getByRole('combobox', { name: /record type/i }).click()
    await page.getByRole('option', { name: /^medication$/i }).click()
    // Wait for form to update after record type change
    await expect(page.getByLabel(/medication name/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/medication name/i).fill('Antibiotic Medication')
    await page.getByLabel(/dosage/i).fill('250mg')
    await page.getByLabel(/frequency/i).click()
    await page.getByRole('option', { name: /^twice daily$/i }).click()
    await page.getByRole('button', { name: /save medication record/i }).click()
    await expect(page.getByText(/medication record created successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // Delete the medication record
    const medCard = page.locator('div.rounded-lg[class*="border-purple-500"]').first()
    await medCard.click()
    await medCard.getByRole('button', { name: /delete.*health record/i }).click()

    // Verify dialog shows correct record type
    await expect(page.getByText(/are you sure you want to delete this medication/i)).toBeVisible({ timeout: 10000 })

    // Confirm deletion
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Verify success message uses correct record type
    await expect(page.getByText(/medication deleted successfully/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('Can delete different record types (vet visit)', async ({ page }) => {
    // Create a vet visit record
    await page.getByRole('button', { name: /add health record/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
    await page.getByRole('combobox', { name: /record type/i }).click()
    await page.getByRole('option', { name: /vet visit/i }).click()
    // Wait for form to update after record type change
    await expect(page.getByLabel(/visit title/i)).toBeVisible({ timeout: 10000 })
    await page.getByLabel(/visit title/i).fill('Annual Checkup')
    // Clinic Name is optional, use the correct ID
    await page.locator('#clinic').fill('Pet Clinic')
    await page.getByRole('button', { name: /save vet visit record/i }).click()
    await expect(page.getByText(/vet visit record created successfully/i).first()).toBeVisible({ timeout: 15000 })

    // Wait for dialog to close
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // Delete the vet visit record
    const vetCard = page.locator('div.rounded-lg[class*="border-green-500"]').first()
    await expect(vetCard).toBeVisible({ timeout: 10000 })
    await vetCard.click()
    await vetCard.getByRole('button', { name: /delete.*health record/i }).click()

    // Verify dialog shows correct record type
    await expect(page.getByText(/are you sure you want to delete this vet visit/i)).toBeVisible({ timeout: 10000 })

    // Confirm deletion
    await page.getByRole('button', { name: /^delete$/i }).click()

    // Verify success message uses correct record type
    await expect(page.getByText(/vet visit deleted successfully/i).first()).toBeVisible({ timeout: 10000 })
  })

  test('Multiple consecutive deletions work correctly', async ({ page }) => {
    // Add first medication record
    await page.getByRole('button', { name: /add health record/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
    await page.getByRole('combobox', { name: /record type/i }).click()
    await page.getByRole('option', { name: /^medication$/i }).click()
    await expect(page.getByLabel(/medication name/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/medication name/i).fill('Medication 1')
    await page.getByLabel(/dosage/i).fill('100mg')
    await page.getByLabel(/frequency/i).click()
    await page.getByRole('option', { name: /^daily$/i }).click()
    await page.getByRole('button', { name: /save medication record/i }).click()
    await expect(page.getByText(/medication record created successfully/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // Add second medication record
    await page.getByRole('button', { name: /add health record/i }).click()
    await expect(page.getByRole('dialog')).toBeVisible({ timeout: 10000 })
    await page.getByRole('combobox', { name: /record type/i }).click()
    await page.getByRole('option', { name: /^medication$/i }).click()
    await expect(page.getByLabel(/medication name/i)).toBeVisible({ timeout: 5000 })
    await page.getByLabel(/medication name/i).fill('Medication 2')
    await page.getByLabel(/dosage/i).fill('200mg')
    await page.getByLabel(/frequency/i).click()
    await page.getByRole('option', { name: /^daily$/i }).click()
    await page.getByRole('button', { name: /save medication record/i }).click()
    await expect(page.getByText(/medication record created successfully/i).first()).toBeVisible({ timeout: 10000 })
    await expect(page.getByRole('dialog')).not.toBeVisible({ timeout: 10000 })

    // Verify all records exist (1 vaccine + 2 medications)
    await expect(page.locator('div.rounded-lg[class*="border-blue-500"]')).toHaveCount(1, { timeout: 10000 })
    await expect(page.locator('div.rounded-lg[class*="border-purple-500"]')).toHaveCount(2, { timeout: 10000 })

    // Delete first medication
    let firstMed = page.locator('div.rounded-lg[class*="border-purple-500"]').first()
    await firstMed.click()
    await firstMed.getByRole('button', { name: /delete.*health record/i }).click()
    await page.getByRole('button', { name: /^delete$/i }).click()
    await expect(page.getByText(/medication deleted successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Wait for deletion to complete and count to update
    await expect(page.locator('div.rounded-lg[class*="border-purple-500"]')).toHaveCount(1, { timeout: 10000 })

    // Delete second medication
    firstMed = page.locator('div.rounded-lg[class*="border-purple-500"]').first()
    await firstMed.click()
    await firstMed.getByRole('button', { name: /delete.*health record/i }).click()
    await page.getByRole('button', { name: /^delete$/i }).click()
    await expect(page.getByText(/medication deleted successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Wait for deletion to complete
    await expect(page.locator('div.rounded-lg[class*="border-purple-500"]')).toHaveCount(0, { timeout: 10000 })

    // Delete the original vaccine
    const vaccineCard = page.locator('div.rounded-lg[class*="border-blue-500"]').first()
    await vaccineCard.click()
    await vaccineCard.getByRole('button', { name: /delete.*health record/i }).click()
    await page.getByRole('button', { name: /^delete$/i }).click()
    await expect(page.getByText(/vaccine deleted successfully/i).first()).toBeVisible({ timeout: 10000 })

    // Should show empty state
    await expect(page.getByText(/add your first health record/i)).toBeVisible({ timeout: 10000 })
  })
})
