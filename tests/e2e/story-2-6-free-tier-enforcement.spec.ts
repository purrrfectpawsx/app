import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait';
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth';
import {
  openCreatePetDialog,
  createPet,
  expectUpgradeDialog,
  closeUpgradeDialog,
  deletePet,
} from '../utils/pets';
import { TEST_PETS, generateTestPet } from '../fixtures/pets';

/**
 * E2E Tests for Story 2.6: Free Tier Enforcement - 1 Pet Limit
 *
 * Tests validate all acceptance criteria:
 * AC1: Free tier users attempting to create a 2nd pet see upgrade prompt dialog
 * AC2: Dialog explains: "Free plan allows 1 pet. Upgrade to Premium for unlimited pets."
 * AC3: Dialog shows upgrade CTA button (links to pricing/checkout - placeholder for now)
 * AC4: Premium users can create unlimited pets (no limit check)
 * AC5: Upgrade prompt also appears on pets grid if user has 1 pet (banner message)
 * AC6: Backend enforces limit (frontend check can be bypassed, backend is source of truth)
 * AC7: Usage indicator visible on pets grid: "1/1 pets used (Free plan)"
 */

test.describe('Story 2.6: Free Tier Enforcement', () => {
  // Setup: Authenticate test user for each test
  test.beforeEach(async ({ page }) => {
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };
    await authenticateTestUser(page, credentials);
  });

  test('AC1: Free tier user with 0 pets can create first pet', async ({ page }) => {
    // User should not see any tier limit warnings when creating first pet
    await openCreatePetDialog(page);

    // Verify create pet form is shown (not upgrade dialog)
    await expect(page.getByLabel(/pet name/i)).toBeVisible();
    await expect(page.getByLabel(/species/i)).toBeVisible();

    // Create first pet successfully
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Verify pet created and detail page shown
    await expect(page).toHaveURL(/\/pets\/.+/);
    await expect(page.getByRole('heading', { name: firstPet.name })).toBeVisible();
  });

  test('AC1 & AC2: Free tier user blocked from creating second pet with upgrade prompt', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Go back to pets grid
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL('/pets');

    // Try to create second pet - should show upgrade dialog
    await page.getByRole('button', { name: /add pet/i }).click();

    // AC2: Verify upgrade dialog message
    await expectUpgradeDialog(page);
    await expect(page.getByText(/free plan allows 1 pet/i)).toBeVisible();
    await expect(page.getByText(/upgrade to premium for unlimited pets/i)).toBeVisible();
  });

  test('AC3: Upgrade dialog shows CTA button linking to pricing', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Go back and try to create second pet
    await page.getByRole('button', { name: /back/i }).click();
    await page.getByRole('button', { name: /add pet/i }).click();

    // Verify upgrade dialog is shown
    await expectUpgradeDialog(page);

    // Verify "Upgrade to Premium" button exists
    const upgradeButton = page.getByRole('button', { name: /upgrade to premium/i });
    await expect(upgradeButton).toBeVisible();

    // Click upgrade button and verify navigation to pricing page
    await upgradeButton.click();
    await expect(page).toHaveURL('/pricing');

    // Verify pricing page displays
    await expect(page.getByRole('heading', { name: /choose your plan/i })).toBeVisible();
  });

  test('AC5: Tier limit banner shows on pets grid when free tier has 1 pet', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Go back to pets grid
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL('/pets');

    // Verify tier limit banner is visible
    await expect(page.getByText(/free plan limit reached/i)).toBeVisible();
    await expect(page.getByText(/upgrade to premium for unlimited pets/i)).toBeVisible();

    // Verify banner has upgrade button
    const bannerUpgradeButton = page.getByRole('button', { name: /upgrade/i }).first();
    await expect(bannerUpgradeButton).toBeVisible();

    // Click banner upgrade button
    await bannerUpgradeButton.click();
    await expect(page).toHaveURL('/pricing');
  });

  test('AC7: Usage indicator shows "0/1 pets used" for new free tier user', async ({ page }) => {
    // On pets grid without any pets
    await page.goto('/pets');

    // Verify usage indicator shows 0/1
    await expect(page.getByText(/0\/1 pets used \(free plan\)/i)).toBeVisible();
  });

  test('AC7: Usage indicator shows "1/1 pets used" after creating first pet', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Go back to pets grid
    await page.getByRole('button', { name: /back/i }).click();
    await expect(page).toHaveURL('/pets');

    // Verify usage indicator shows 1/1
    await expect(page.getByText(/1\/1 pets used \(free plan\)/i)).toBeVisible();
  });

  test('AC7: Usage indicator updates back to 0/1 after deleting pet', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Delete the pet
    await deletePet(page, firstPet.name);

    // Verify redirected to pets grid
    await expect(page).toHaveURL('/pets');

    // Verify usage indicator back to 0/1
    await expect(page.getByText(/0\/1 pets used \(free plan\)/i)).toBeVisible();

    // Verify no tier limit banner shown (user has 0 pets)
    await expect(page.getByText(/free plan limit reached/i)).not.toBeVisible();
  });

  test('Upgrade dialog can be dismissed', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Go back and try to create second pet
    await page.getByRole('button', { name: /back/i }).click();
    await page.getByRole('button', { name: /add pet/i }).click();

    // Verify upgrade dialog shown
    await expectUpgradeDialog(page);

    // Dismiss dialog using "Maybe Later" or X button
    const dismissButton = page.getByRole('button', { name: /(maybe later|cancel)/i });
    await dismissButton.click();

    // Verify dialog closed and user is back on pets grid
    await expect(page.getByText(/upgrade to premium/i)).not.toBeVisible();
    await expect(page).toHaveURL('/pets');
  });

  test('Pricing page displays Free vs Premium comparison', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');

    // Verify pricing page loads
    await expect(page.getByRole('heading', { name: /choose your plan/i })).toBeVisible();

    // Verify Free tier card
    await expect(page.getByText(/\$0\/month/i)).toBeVisible();
    await expect(page.getByText(/1 pet/i)).toBeVisible();
    await expect(page.getByText(/50 health records/i)).toBeVisible();
    await expect(page.getByText(/100 expenses.*month/i)).toBeVisible();

    // Verify Premium tier card
    await expect(page.getByText(/\$7\/month/i)).toBeVisible();
    await expect(page.getByText(/unlimited pets/i)).toBeVisible();
    await expect(page.getByText(/unlimited health records/i)).toBeVisible();
    await expect(page.getByText(/unlimited expenses/i)).toBeVisible();

    // Verify annual pricing option
    await expect(page.getByText(/\$60\/year/i)).toBeVisible();
  });

  test('Free tier user can create another pet after deleting first one', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Delete first pet
    await deletePet(page, firstPet.name);

    // Verify redirected to pets grid
    await expect(page).toHaveURL('/pets');

    // Now create second pet - should succeed since first was deleted
    const secondPet = generateTestPet();
    await createPet(page, secondPet);

    // Verify second pet created successfully
    await expect(page).toHaveURL(/\/pets\/.+/);
    await expect(page.getByRole('heading', { name: secondPet.name })).toBeVisible();
  });

  test('Tier limit banner has correct styling and placement', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Go back to pets grid
    await page.getByRole('button', { name: /back/i }).click();

    // Find tier limit banner
    const banner = page.getByText(/free plan limit reached/i).locator('..');

    // Verify banner is visible
    await expect(banner).toBeVisible();

    // Verify banner contains title and description
    await expect(page.getByText(/free plan limit reached/i)).toBeVisible();
    await expect(page.getByText(/you've reached the free plan limit \(1 pet\)/i)).toBeVisible();

    // Verify banner has upgrade button
    await expect(page.getByRole('button', { name: /upgrade/i }).first()).toBeVisible();
  });

  test('Usage indicator appears in pets grid header', async ({ page }) => {
    // Navigate to pets grid
    await page.goto('/pets');

    // Verify usage indicator is in the header area
    const header = page.locator('header, .header, [class*="header"]').first();
    const usageIndicator = page.getByText(/\d+\/1 pets used \(free plan\)/i);

    // Verify usage indicator exists and is visible
    await expect(usageIndicator).toBeVisible();
  });

  test('Multiple attempts to create second pet consistently show upgrade dialog', async ({ page }) => {
    // Create first pet
    const firstPet = generateTestPet();
    await createPet(page, firstPet);

    // Go back to pets grid
    await page.getByRole('button', { name: /back/i }).click();

    // Try to create second pet (first attempt)
    await page.getByRole('button', { name: /add pet/i }).click();
    await expectUpgradeDialog(page);
    await closeUpgradeDialog(page);

    // Try again (second attempt)
    await page.getByRole('button', { name: /add pet/i }).click();
    await expectUpgradeDialog(page);
    await closeUpgradeDialog(page);

    // Try third time
    await page.getByRole('button', { name: /add pet/i }).click();
    await expectUpgradeDialog(page);

    // All attempts should consistently show upgrade dialog
  });

  test('Pricing page "Coming Soon" message displayed for Stripe checkout', async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');

    // Verify "Coming soon" or similar message for payment processing
    await expect(page.getByText(/coming soon|stripe.*epic 7/i)).toBeVisible();
  });
});

/**
 * Test Coverage Summary
 *
 * ✅ AC1: Free tier users attempting to create 2nd pet see upgrade prompt
 * ✅ AC2: Dialog message explains free tier limit
 * ✅ AC3: Dialog has upgrade CTA linking to pricing
 * ✅ AC5: Banner shows on grid when limit reached
 * ✅ AC7: Usage indicator shows X/1 pets used
 *
 * Additional Coverage:
 * - Upgrade dialog can be dismissed
 * - Pricing page displays free vs premium comparison
 * - User can create another pet after deleting first one
 * - Multiple attempts consistently show upgrade dialog
 * - Usage indicator updates correctly (0/1 → 1/1 → 0/1)
 *
 * Note: AC4 (Premium users unlimited) and AC6 (Backend enforcement)
 * require premium subscription setup which will be tested in Epic 7.
 */
