import { Page, expect } from '@playwright/test';
import { TestPet } from '../fixtures/pets';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Pet Utilities for E2E Tests
 *
 * Helper functions for pet-related test flows.
 */

/**
 * Navigate to pets page (dashboard)
 */
export async function navigateToPetsPage(page: Page): Promise<void> {
  // Navigate to pets page if not already there
  const currentUrl = page.url();
  // Navigate to /pets if we're not already on the pets list page
  // (don't navigate if we're on a pet detail page like /pets/{id})
  if (!currentUrl.match(/\/pets\/?$/)) {
    await page.goto('/pets');
  }

  // Wait for page to load
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });

  // Wait for page to be ready - check for either pets heading or empty state text
  // This handles both cases: when user has pets and when they don't
  const myPetsHeading = page.getByRole('heading', { name: /my pets/i });
  const emptyStateText = page.getByText(/you haven't added any pets yet/i);

  // Wait for either heading or empty state text to appear
  // Using Promise.any to ensure at least one succeeds
  await Promise.any([
    myPetsHeading.waitFor({ state: 'visible', timeout: 10000 }),
    emptyStateText.waitFor({ state: 'visible', timeout: 10000 })
  ]).catch(() => {
    throw new Error('Neither "My Pets" heading nor empty state message found on pets page');
  });
}

/**
 * Open the create pet dialog/form
 */
export async function openCreatePetDialog(page: Page): Promise<void> {
  await navigateToPetsPage(page);
  const createButton = page.getByRole('button', { name: /add pet|add your first pet|create pet/i });
  await createButton.click();

  // Wait for dialog to open and form to be ready
  await expect(page.getByRole('heading', { name: /create pet profile/i })).toBeVisible();

  // Wait for name field to be ready (ensures form is fully rendered)
  await page.getByLabel(/pet name/i).waitFor({ state: 'visible', timeout: 5000 });
}

/**
 * Fill pet form with provided data
 *
 * @param page - Playwright page object
 * @param pet - Pet data to fill in form
 * @param photoPath - Optional path to photo file for upload
 */
export async function fillPetForm(
  page: Page,
  pet: TestPet,
  photoPath?: string
): Promise<void> {
  // Fill required fields
  await page.getByLabel(/pet name/i).fill(pet.name);

  // Select species from dropdown
  await page.getByLabel(/species/i).click();
  await page.getByRole('option', { name: new RegExp(pet.species, 'i') }).click();

  // Fill optional fields if provided
  if (pet.breed) {
    await page.getByLabel(/breed/i).fill(pet.breed);
  }

  if (pet.birthDate) {
    await page.getByLabel(/birth date/i).fill(pet.birthDate);
  }

  if (pet.gender) {
    await page.getByLabel(/gender/i).click();
    // Use exact match to avoid matching "male" in "female"
    const genderCapitalized = pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1);
    await page.getByRole('option', { name: genderCapitalized, exact: true }).click();
  }

  if (pet.spayedNeutered !== undefined && pet.spayedNeutered) {
    await page.getByLabel(/spayed.*neutered/i).check();
  }

  if (pet.microchip) {
    await page.getByLabel(/microchip/i).fill(pet.microchip);
  }

  if (pet.notes) {
    await page.getByLabel(/notes/i).fill(pet.notes);
  }

  // Upload photo if provided
  if (photoPath) {
    await uploadPetPhoto(page, photoPath);
  }
}

/**
 * Submit the create pet form
 */
export async function submitPetForm(page: Page): Promise<void> {
  const submitButton = page.getByRole('button', { name: /create pet/i });
  // Wait for button to be enabled (form validation complete)
  await submitButton.waitFor({ state: 'visible', timeout: 5000 });
  await expect(submitButton).toBeEnabled({ timeout: 5000 });
  await submitButton.click();
}

/**
 * Create a pet with the provided data
 *
 * @param page - Playwright page object
 * @param pet - Pet data
 * @param photoPath - Optional path to photo file
 */
export async function createPet(
  page: Page,
  pet: TestPet,
  photoPath?: string
): Promise<void> {
  await openCreatePetDialog(page);
  await fillPetForm(page, pet, photoPath);
  await submitPetForm(page);

  // Wait for success and navigation to pet detail page
  await expect(page.getByText(/pet.*created.*successfully/i)).toBeVisible({ timeout: 15000 });
  await expect(page).toHaveURL(/\/pets\/[a-f0-9-]+/, { timeout: 10000 });
}

/**
 * Upload a photo to the pet form
 *
 * @param page - Playwright page object
 * @param photoPath - Path to photo file (relative to project root)
 */
export async function uploadPetPhoto(page: Page, photoPath: string): Promise<void> {
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles(photoPath);

  // Wait for preview or compression indicator
  await page.waitForTimeout(500); // Give time for compression
}

/**
 * Create a temporary test image file
 *
 * @param fileName - Name of file to create
 * @param sizeKB - Size of file in KB
 * @returns Path to created file
 */
export function createTestImage(fileName: string, sizeKB: number = 500): string {
  const testDir = path.join(process.cwd(), 'tests', 'temp');

  // Ensure temp directory exists
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
  }

  // Add timestamp and random string to make filename unique across parallel tests
  const uniqueSuffix = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const baseName = fileName.replace(/\.[^.]+$/, ''); // Remove extension
  const extension = fileName.match(/\.[^.]+$/)?.[0] || '.jpg'; // Get extension
  const uniqueFileName = `${baseName}_${uniqueSuffix}${extension}`;
  const filePath = path.join(testDir, uniqueFileName);

  // Create a simple base64 test image (1x1 pixel PNG)
  const base64Image = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  const buffer = Buffer.from(base64Image, 'base64');

  // Pad to desired size
  const paddedBuffer = Buffer.concat([buffer, Buffer.alloc(sizeKB * 1024)]);

  fs.writeFileSync(filePath, paddedBuffer);

  // Verify file was created
  if (!fs.existsSync(filePath)) {
    throw new Error(`Failed to create test image at ${filePath}`);
  }

  return filePath;
}

/**
 * Clean up temporary test files
 */
export function cleanupTestImages(): void {
  const testDir = path.join(process.cwd(), 'tests', 'temp');

  if (fs.existsSync(testDir)) {
    const files = fs.readdirSync(testDir);
    files.forEach(file => {
      fs.unlinkSync(path.join(testDir, file));
    });
  }
}

/**
 * Assert user is on pet detail page
 *
 * @param page - Playwright page object
 * @param petName - Expected pet name to verify
 */
export async function expectPetDetailPage(page: Page, petName: string): Promise<void> {
  await expect(page).toHaveURL(/\/pets\/[a-f0-9-]+/);
  await expect(page.getByRole('heading', { name: new RegExp(petName, 'i') })).toBeVisible();
}

/**
 * Assert upgrade dialog is visible
 */
export async function expectUpgradeDialog(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: /upgrade.*premium/i })).toBeVisible();
  await expect(page.getByText(/free.*plan.*allows.*1.*pet/i)).toBeVisible();
}

/**
 * Close the upgrade dialog
 */
export async function closeUpgradeDialog(page: Page): Promise<void> {
  await page.getByRole('button', { name: /cancel/i }).click();
  await expect(page.getByRole('heading', { name: /upgrade.*premium/i })).not.toBeVisible();
}

/**
 * Navigate to pet detail page by ID
 */
export async function navigateToPetDetail(page: Page, petId: string): Promise<void> {
  await page.goto(`/pets/${petId}`);
}

/**
 * Get all pet cards on the pets page
 */
export async function getPetCards(page: Page) {
  await navigateToPetsPage(page);
  return page.locator('[role="button"]').filter({ hasText: /dog|cat|bird|rabbit|other/i });
}

/**
 * Wait for photo compression to complete
 *
 * @param page - Playwright page object
 * @param timeout - Max time to wait in ms
 */
export async function waitForPhotoCompression(page: Page, timeout: number = 5000): Promise<void> {
  // Wait for compression indicator to disappear
  const compressionIndicator = page.getByText(/compressing.*image/i);

  try {
    await compressionIndicator.waitFor({ state: 'visible', timeout: 1000 });
    await compressionIndicator.waitFor({ state: 'hidden', timeout });
  } catch {
    // Compression was too fast or already complete
  }
}

/**
 * Verify photo preview is displayed
 */
export async function expectPhotoPreview(page: Page): Promise<void> {
  await expect(page.getByAltText(/preview/i)).toBeVisible();
}

/**
 * Remove uploaded photo
 */
export async function removePhoto(page: Page): Promise<void> {
  await page.getByRole('button', { name: /remove/i }).or(page.locator('button').filter({ has: page.locator('svg') })).first().click();
  await expect(page.locator('img[alt*="preview" i]')).not.toBeVisible();
}

/**
 * Delete a pet by clicking the delete button and confirming
 *
 * @param page - Playwright page object
 * @param petName - Name of the pet to delete (for verification)
 */
export async function deletePet(page: Page, petName: string): Promise<void> {
  // Click Delete button
  await page.getByRole('button', { name: /delete/i }).click();

  // Wait for confirmation dialog to appear
  await expect(page.getByRole('alertdialog')).toBeVisible();

  // Confirm deletion
  await page.getByRole('button', { name: /yes.*delete/i }).click();

  // Wait for redirect to pets grid
  await expect(page).toHaveURL('/pets', { timeout: 10000 });

  // Wait for success message
  await expect(page.getByText(new RegExp(`${petName}.*been deleted`, 'i'))).toBeVisible({ timeout: 5000 });
}
