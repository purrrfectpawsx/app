import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait';
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth';
import {
  createPet,
  expectPetDetailPage,
  createTestImage,
  cleanupTestImages,
  uploadPetPhoto,
  waitForPhotoCompression,
  expectPhotoPreview,
} from '../utils/pets';
import {
  TEST_PETS,
  generateTestPet,
  PET_ERROR_MESSAGES,
  PET_SUCCESS_MESSAGES,
} from '../fixtures/pets';

/**
 * E2E Tests for Story 2.4: Edit Pet Profile
 *
 * Tests validate all acceptance criteria:
 * AC1: Edit button on pet detail page opens edit form
 * AC2: Form pre-populates with existing pet data
 * AC3: All fields editable except creation date
 * AC4: Photo can be replaced (upload new) or removed (revert to placeholder)
 * AC5: Validation enforces same rules as create (name and species required)
 * AC6: Save button updates pet and shows success message
 * AC7: Changes persist immediately, pet detail page updates without refresh
 * AC8: Cancel button discards changes and returns to detail view
 */

test.describe('Story 2.4: Edit Pet Profile', () => {
  // Setup: Create and log in a test user before each test
  test.beforeEach(async ({ page }) => {
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };
    await authenticateTestUser(page, credentials);
  });

  // Cleanup: Remove temporary test images after all tests
  test.afterAll(() => {
    cleanupTestImages();
  });

  test('AC1: Edit button on pet detail page opens edit form', async ({ page }) => {
    // Setup: Create a pet first
    const pet = generateTestPet('dog');
    await createPet(page, pet);

    // Click Edit button
    await page.getByRole('button', { name: /edit/i }).click();

    // Verify edit dialog/form opened
    await expect(page.getByRole('heading', { name: new RegExp(`edit.*${pet.name}`, 'i') })).toBeVisible();

    // Verify it's a dialog/modal (not a new page)
    await expect(page).toHaveURL(/\/pets\/[a-f0-9-]+/); // Still on pet detail page
  });

  test('AC2: Form pre-populates with existing pet data', async ({ page }) => {
    // Setup: Create a pet with complete data
    const pet = TEST_PETS.completeDog;
    await createPet(page, pet);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Verify all fields are pre-populated
    await expect(page.getByLabel(/pet name/i)).toHaveValue(pet.name);

    // Verify species is pre-selected
    const speciesSelect = page.getByLabel(/species/i);
    await expect(speciesSelect).toContainText(new RegExp(pet.species, 'i'));

    // Verify optional fields are pre-filled
    if (pet.breed) {
      await expect(page.getByLabel(/breed/i)).toHaveValue(pet.breed);
    }

    if (pet.birthDate) {
      const dateInput = page.getByLabel(/birth date/i);
      await expect(dateInput).toHaveValue(pet.birthDate);
    }

    if (pet.gender) {
      const genderSelect = page.getByLabel(/gender/i);
      await expect(genderSelect).toContainText(new RegExp(pet.gender, 'i'));
    }

    if (pet.microchip) {
      await expect(page.getByLabel(/microchip/i)).toHaveValue(pet.microchip);
    }

    if (pet.notes) {
      await expect(page.getByLabel(/notes/i)).toHaveValue(pet.notes);
    }

    // Verify spayed/neutered checkbox
    if (pet.spayedNeutered) {
      await expect(page.getByLabel(/spayed.*neutered/i)).toBeChecked();
    }
  });

  test('AC3: All fields are editable', async ({ page }) => {
    // Setup: Create a basic pet
    const pet = generateTestPet('cat');
    await createPet(page, pet);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Update name
    const newName = 'Updated ' + pet.name;
    await page.getByLabel(/pet name/i).fill(newName);

    // Update species
    await page.getByLabel(/species/i).click();
    await page.getByRole('option', { name: /dog/i }).click();

    // Update breed
    await page.getByLabel(/breed/i).fill('Updated Breed');

    // Update birth date
    await page.getByLabel(/birth date/i).fill('2022-05-10');

    // Update gender
    await page.getByLabel(/gender/i).click();
    await page.getByRole('option', { name: /female/i }).click();

    // Check spayed/neutered
    await page.getByLabel(/spayed.*neutered/i).check();

    // Update microchip
    await page.getByLabel(/microchip/i).fill('999888777666555');

    // Update notes
    await page.getByLabel(/notes/i).fill('Updated notes about the pet');

    // Submit form
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify success message
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });

    // Verify updates persisted (dialog should close automatically)
    await expect(page.getByRole('heading', { name: new RegExp(newName, 'i') })).toBeVisible();
  });

  test('AC4: Photo can be replaced with a new photo', async ({ page }) => {
    // Setup: Create pet with initial photo
    const pet = generateTestPet('dog');
    const initialPhotoPath = createTestImage('initial-photo.jpg', 500);
    await createPet(page, pet, initialPhotoPath);

    // Verify initial photo is displayed
    await expectPhotoPreview(page);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Verify existing photo preview is shown
    await expectPhotoPreview(page);

    // Click "Change Photo" button or upload new photo
    const newPhotoPath = createTestImage('new-photo.jpg', 600);
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(newPhotoPath);

    // Wait for compression
    await waitForPhotoCompression(page);

    // Verify new photo preview
    await expectPhotoPreview(page);

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify success
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });

    // Wait for dialog to close
    await page.waitForTimeout(1000);

    // Verify new photo is displayed on detail page
    await expectPhotoPreview(page);
  });

  test('AC4: Photo can be removed', async ({ page }) => {
    // Setup: Create pet with photo
    const pet = generateTestPet('cat');
    const photoPath = createTestImage('remove-photo.jpg', 500);
    await createPet(page, pet, photoPath);

    // Verify photo is displayed
    await expectPhotoPreview(page);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Remove photo by clicking the X button
    const removeButton = page.locator('button').filter({ has: page.locator('svg') }).first();
    await removeButton.click();

    // Verify photo preview is gone
    await expect(page.locator('img[alt*="preview" i]')).not.toBeVisible();

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify success
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });

    // Wait for dialog to close
    await page.waitForTimeout(1000);

    // Verify photo is removed on detail page (should show placeholder or no photo)
    await expect(page.locator('img[alt*="preview" i]')).not.toBeVisible();
  });

  test('AC5: Validation enforces required fields (name)', async ({ page }) => {
    // Setup: Create a pet
    const pet = generateTestPet('bird');
    await createPet(page, pet);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Clear the name field (required)
    await page.getByLabel(/pet name/i).fill('');

    // Try to submit
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify validation error appears
    await expect(page.getByText(PET_ERROR_MESSAGES.validation.nameRequired)).toBeVisible();

    // Verify we're still in edit mode (dialog didn't close)
    await expect(page.getByRole('heading', { name: /edit/i })).toBeVisible();
  });

  test('AC5: Validation enforces birth date cannot be in future', async ({ page }) => {
    // Setup: Create a pet
    const pet = generateTestPet('rabbit');
    await createPet(page, pet);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Set birth date to future
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await page.getByLabel(/birth date/i).fill(futureDateStr);

    // Try to submit
    await page.getByRole('button', { name: /save changes/i }).click();

    // Verify validation error appears
    await expect(page.getByText(PET_ERROR_MESSAGES.validation.birthDateFuture)).toBeVisible();
  });

  test('AC6 & AC7: Save button updates pet and changes persist immediately', async ({ page }) => {
    // Setup: Create a pet
    const pet = generateTestPet('dog');
    await createPet(page, pet);

    // Capture initial URL
    const petUrl = page.url();

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Make changes
    const updatedName = 'Updated ' + pet.name;
    await page.getByLabel(/pet name/i).fill(updatedName);
    await page.getByLabel(/breed/i).fill('Labrador');
    await page.getByLabel(/notes/i).fill('Updated notes');

    // Save changes
    await page.getByRole('button', { name: /save changes/i }).click();

    // AC6: Verify success message
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });

    // Wait for dialog to close and updates to reflect
    await page.waitForTimeout(1500);

    // AC7: Verify changes persist immediately without page refresh
    await expect(page).toHaveURL(petUrl); // Still on same page (no redirect)
    await expect(page.getByRole('heading', { name: new RegExp(updatedName, 'i') })).toBeVisible();

    // Verify updated fields are visible on detail page
    await expect(page.getByText(/labrador/i)).toBeVisible();
    await expect(page.getByText(/updated notes/i)).toBeVisible();
  });

  test('AC8: Cancel button discards changes and returns to detail view', async ({ page }) => {
    // Setup: Create a pet
    const pet = generateTestPet('cat');
    await createPet(page, pet);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Make changes (but don't save)
    const changedName = 'Changed ' + pet.name;
    await page.getByLabel(/pet name/i).fill(changedName);
    await page.getByLabel(/breed/i).fill('Persian');

    // Click Cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Verify dialog closed
    await expect(page.getByRole('heading', { name: /edit/i })).not.toBeVisible();

    // Verify changes were NOT saved (original name still shown)
    await expect(page.getByRole('heading', { name: new RegExp(pet.name, 'i') })).toBeVisible();
    await expect(page.getByRole('heading', { name: new RegExp(changedName, 'i') })).not.toBeVisible();

    // Re-open edit form to verify data wasn't changed
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(page.getByLabel(/pet name/i)).toHaveValue(pet.name);
    await expect(page.getByLabel(/breed/i)).not.toHaveValue('Persian');
  });

  test('Multiple edits: Can edit the same pet multiple times', async ({ page }) => {
    // Setup: Create a pet
    const pet = generateTestPet('dog');
    await createPet(page, pet);

    // First edit: Update name
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/pet name/i).fill('First Edit');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

    // Verify first edit
    await expect(page.getByRole('heading', { name: /first edit/i })).toBeVisible();

    // Second edit: Update breed
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/breed/i).fill('Second Edit Breed');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

    // Verify second edit
    await expect(page.getByText(/second edit breed/i)).toBeVisible();

    // Third edit: Update notes
    await page.getByRole('button', { name: /edit/i }).click();
    await page.getByLabel(/notes/i).fill('Third edit notes');
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

    // Verify all changes persisted
    await expect(page.getByRole('heading', { name: /first edit/i })).toBeVisible();
    await expect(page.getByText(/second edit breed/i)).toBeVisible();
    await expect(page.getByText(/third edit notes/i)).toBeVisible();
  });

  test('Edge case: Edit pet with minimal data (only name and species)', async ({ page }) => {
    // Setup: Create a minimal pet (only required fields)
    const pet = TEST_PETS.basicDog;
    await createPet(page, pet);

    // Open edit form
    await page.getByRole('button', { name: /edit/i }).click();

    // Add optional fields
    await page.getByLabel(/breed/i).fill('Beagle');
    await page.getByLabel(/notes/i).fill('Now has some details');

    // Save
    await page.getByRole('button', { name: /save changes/i }).click();
    await expect(page.getByText(PET_SUCCESS_MESSAGES.updated)).toBeVisible({ timeout: 15000 });
    await page.waitForTimeout(1500);

    // Verify optional fields were added
    await expect(page.getByText(/beagle/i)).toBeVisible();
    await expect(page.getByText(/now has some details/i)).toBeVisible();
  });
});
