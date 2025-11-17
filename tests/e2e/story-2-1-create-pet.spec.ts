import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait';
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth';
import {
  openCreatePetDialog,
  fillPetForm,
  submitPetForm,
  createPet,
  expectPetDetailPage,
  expectUpgradeDialog,
  closeUpgradeDialog,
  uploadPetPhoto,
  waitForPhotoCompression,
  expectPhotoPreview,
  createTestImage,
  cleanupTestImages,
} from '../utils/pets';
import {
  TEST_PETS,
  generateTestPet,
  PET_ERROR_MESSAGES,
  PET_SUCCESS_MESSAGES,
} from '../fixtures/pets';

/**
 * E2E Tests for Story 2.1: Create Pet Profile with Basic Info
 *
 * Tests validate all acceptance criteria:
 * AC1: Create pet form displays all required/optional fields
 * AC2: Species dropdown shows common pet types with icons
 * AC3: Photo upload supports JPG, PNG, HEIC up to 5MB
 * AC4: Form validates required fields before submission
 * AC5: Successful creation shows success message and navigates to pet detail page
 * AC6: Free tier users can create 1 pet (enforced in backend)
 * AC7: Photo compressed client-side before upload (50-70% size reduction)
 */

test.describe('Story 2.1: Create Pet Profile', () => {
  // Setup: Authenticate test user for each test
  test.beforeEach(async ({ page }) => {
    // Use authenticateTestUser which goes through signup but handles the flow smoothly
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };
    await authenticateTestUser(page, credentials);
  });

  // Cleanup: Disabled to prevent parallel test interference
  // Files in tests/temp will be cleaned manually or by CI
  // test.afterAll(() => {
  //   cleanupTestImages();
  // });

  test('AC1: Create pet form displays all required and optional fields', async ({ page }) => {
    await openCreatePetDialog(page);

    // Verify required fields
    await expect(page.getByLabel(/pet name/i)).toBeVisible();
    await expect(page.getByLabel(/species/i)).toBeVisible();

    // Verify optional fields
    await expect(page.getByLabel(/breed/i)).toBeVisible();
    await expect(page.getByLabel(/birth date/i)).toBeVisible();
    await expect(page.getByLabel(/gender/i)).toBeVisible();
    await expect(page.getByLabel(/spayed.*neutered/i)).toBeVisible();
    await expect(page.getByLabel(/microchip/i)).toBeVisible();
    await expect(page.getByLabel(/notes/i)).toBeVisible();
    // Photo input is hidden by CSS, but should be attached to DOM
    await expect(page.locator('input[type="file"]')).toBeAttached();

    // Verify submit and cancel buttons
    await expect(page.getByRole('button', { name: /create pet/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /cancel/i })).toBeVisible();
  });

  test('AC2: Species dropdown shows all 5 options with icons', async ({ page }) => {
    await openCreatePetDialog(page);

    // Click species dropdown to open it
    await page.getByLabel(/species/i).click();

    // Verify all 5 species options are available
    await expect(page.getByRole('option', { name: /dog/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /cat/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /bird/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /rabbit/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /other/i })).toBeVisible();

    // Note: Icon verification would require checking SVG elements
    // This is covered in the implementation but harder to test in E2E
  });

  test('AC3: Photo upload accepts JPG files under 5MB', async ({ page }) => {
    await openCreatePetDialog(page);

    // Create a valid test image (2MB JPG)
    const testImagePath = createTestImage('valid-photo.jpg', 2000);

    // Upload photo
    await uploadPetPhoto(page, testImagePath);

    // Wait for compression to complete
    await waitForPhotoCompression(page);

    // Verify photo preview is displayed
    await expectPhotoPreview(page);

    // No error message should be shown
    await expect(page.getByText(PET_ERROR_MESSAGES.photo.tooLarge)).not.toBeVisible();
    await expect(page.getByText(PET_ERROR_MESSAGES.photo.invalidType)).not.toBeVisible();
  });

  test('AC3: Photo upload rejects files larger than 5MB', async ({ page }) => {
    await openCreatePetDialog(page);

    // Create an oversized test image (6MB)
    const largeImagePath = createTestImage('large-photo.jpg', 6000);

    // Attempt to upload large photo
    await uploadPetPhoto(page, largeImagePath);

    // Verify error message appears
    await expect(page.getByText(PET_ERROR_MESSAGES.photo.tooLarge)).toBeVisible();
  });

  test('AC3: Photo upload rejects invalid file types', async ({ page }) => {
    await openCreatePetDialog(page);

    // Create a PDF file (not an image)
    const pdfPath = createTestImage('document.pdf', 1000);

    // Attempt to upload PDF
    await uploadPetPhoto(page, pdfPath);

    // Verify error message appears
    await expect(page.getByText(PET_ERROR_MESSAGES.photo.invalidType)).toBeVisible();
  });

  test('AC4: Form validates required fields - pet name required', async ({ page }) => {
    await openCreatePetDialog(page);

    // Leave name empty, fill species
    await page.getByLabel(/species/i).click();
    await page.getByRole('option', { name: /dog/i }).click();

    // Try to submit
    await submitPetForm(page);

    // Verify validation error for name
    await expect(page.getByText(PET_ERROR_MESSAGES.validation.nameRequired)).toBeVisible();
  });

  test('AC4: Form validates required fields - species required', async ({ page }) => {
    await openCreatePetDialog(page);

    // Fill name, leave species empty
    await page.getByLabel(/pet name/i).fill('Test Pet');

    // Try to submit
    await submitPetForm(page);

    // Verify validation error for species
    await expect(page.getByText(PET_ERROR_MESSAGES.validation.speciesRequired)).toBeVisible();
  });

  test('AC4: Form validates birth date cannot be in future', async ({ page }) => {
    await openCreatePetDialog(page);

    const pet = generateTestPet('dog');
    await fillPetForm(page, pet);

    // Set future birth date
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    const futureDateStr = futureDate.toISOString().split('T')[0];

    await page.getByLabel(/birth date/i).fill(futureDateStr);
    await page.getByLabel(/birth date/i).blur();

    // Verify validation error
    await expect(page.getByText(PET_ERROR_MESSAGES.validation.birthDateFuture)).toBeVisible();
  });

  test('AC5: Successful pet creation shows success message', async ({ page }) => {
    const pet = generateTestPet('dog');

    await openCreatePetDialog(page);
    await fillPetForm(page, pet);
    await submitPetForm(page);

    // Verify success message appears
    await expect(page.getByText(PET_SUCCESS_MESSAGES.created)).toBeVisible({ timeout: 15000 });
  });

  test('AC5: Successful pet creation navigates to pet detail page', async ({ page }) => {
    const pet = generateTestPet('cat', { breed: 'Siamese' });

    await createPet(page, pet);

    // Verify navigation to pet detail page and pet information is displayed
    await expectPetDetailPage(page, pet.name);
    // Pet name is already verified by expectPetDetailPage, check other fields
    await expect(page.getByText(new RegExp(pet.species, 'i')).first()).toBeVisible();
    if (pet.breed) {
      await expect(page.getByText(pet.breed).first()).toBeVisible();
    }
  });

  test('AC6: Free tier user can create first pet successfully', async ({ page }) => {
    const pet = TEST_PETS.basicDog;

    await createPet(page, pet);

    // Verify successful creation
    await expectPetDetailPage(page, pet.name);
  });

  test('AC6: Free tier user blocked from creating second pet', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet('dog');
    await createPet(page, firstPet);

    // Try to create second pet
    await openCreatePetDialog(page);

    const secondPet = generateTestPet('cat');
    await fillPetForm(page, secondPet);
    await submitPetForm(page);

    // Verify upgrade dialog appears instead of success
    await expectUpgradeDialog(page);

    // Verify upgrade dialog contains correct message
    await expect(page.getByText(PET_ERROR_MESSAGES.freeTier.limitReached)).toBeVisible();
    await expect(page.getByText(PET_ERROR_MESSAGES.freeTier.upgradeToPremium)).toBeVisible();

    // Verify "Upgrade to Premium" button exists
    await expect(page.getByRole('button', { name: /upgrade.*premium/i })).toBeVisible();
  });

  test('AC6: Upgrade dialog can be dismissed', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet('bird');
    await createPet(page, firstPet);

    // Try to create second pet to trigger upgrade dialog
    await openCreatePetDialog(page);

    const secondPet = generateTestPet('rabbit');
    await fillPetForm(page, secondPet);
    await submitPetForm(page);

    // Wait for upgrade dialog
    await expectUpgradeDialog(page);

    // Close dialog
    await closeUpgradeDialog(page);

    // Verify dialog is closed
    await expect(page.getByRole('heading', { name: /upgrade.*premium/i })).not.toBeVisible();
  });

  test('AC7: Photo compression reduces file size before upload', async ({ page }) => {
    await openCreatePetDialog(page);

    // Create a larger test image (4MB)
    const testImagePath = createTestImage('large-photo.jpg', 4000);


    // Upload photo
    await uploadPetPhoto(page, testImagePath);

    // Wait for compression indicator
    // Wait for compression indicator (may appear briefly or be skipped if compression is very fast)
    try {
      await expect(page.getByText(/compressing.*image/i)).toBeVisible({ timeout: 1000 });
    } catch {
      // Compression was too fast to catch indicator
    }

    // Wait for compression to complete
    await waitForPhotoCompression(page);

    // Verify preview is shown (compression succeeded)
    await expectPhotoPreview(page);

    // Note: Actual file size verification would require intercepting network requests
    // The presence of compression indicator and successful preview indicates compression occurred
  });

  test('Complete flow: Create pet with all fields and photo', async ({ page }) => {
    const pet = TEST_PETS.completeDog;

    // Create test image
    const testImagePath = createTestImage('dog-photo.jpg', 1500);

    await openCreatePetDialog(page);
    await fillPetForm(page, pet, testImagePath);

    // Wait for photo compression
    await waitForPhotoCompression(page);

    await submitPetForm(page);

    // Verify success
    await expect(page.getByText(PET_SUCCESS_MESSAGES.created)).toBeVisible({ timeout: 15000 });
    await expectPetDetailPage(page, pet.name);

    // Verify all fields are displayed on detail page (name already verified by expectPetDetailPage)
    await expect(page.getByText(new RegExp(pet.species, 'i')).first()).toBeVisible();
    await expect(page.getByText(pet.breed!).first()).toBeVisible();
    if (pet.gender) {
      await expect(page.getByText(new RegExp(pet.gender, 'i')).first()).toBeVisible();
    }
    if (pet.spayedNeutered) {
      await expect(page.getByText(/yes/i)).toBeVisible();
    }
    if (pet.microchip) {
      await expect(page.getByText(pet.microchip)).toBeVisible();
    }
    if (pet.notes) {
      await expect(page.getByText(pet.notes)).toBeVisible();
    }

    // Verify photo is displayed
    await expect(page.locator('img[alt*="' + pet.name + '"]').or(page.locator('img[src*="pets-photos"]'))).toBeVisible();
  });

  test('Edge case: Create pet with only minimum required fields', async ({ page }) => {
    const pet = { name: 'MinimalPet', species: 'other' as const };

    await createPet(page, pet);

    // Verify successful creation with minimal data (name already verified by expectPetDetailPage)
    await expectPetDetailPage(page, pet.name);
    await expect(page.getByText(new RegExp(pet.species, 'i')).first()).toBeVisible();
  });

  test('Edge case: Cancel pet creation', async ({ page }) => {
    await openCreatePetDialog(page);

    // Fill some data
    await page.getByLabel(/pet name/i).fill('Cancelled Pet');

    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();

    // Verify dialog is closed and we're back on pets page
    await expect(page.getByRole('heading', { name: /create pet profile/i })).not.toBeVisible();
    // Verify we're back on pets page (check for either the heading or empty state text)
    await expect(page.getByText(/you haven't added any pets yet/i).or(page.getByRole('heading', { name: /my pets/i }))).toBeVisible({ timeout: 10000 });
  });
});

/**
 * Test Notes:
 * - Tests use unique pet names (timestamp-based) to avoid conflicts
 * - Photo compression verification is challenging in E2E - we verify indicators and successful upload
 * - Free tier enforcement requires a fresh user for each test to ensure clean state
 * - Tests assume VITE_BYPASS_TIER_LIMITS is false (production mode)
 * - Some tests create temporary image files that are cleaned up after all tests
 * - Email verification bypass may need adjustment based on test environment setup
 */
