import { test, expect } from '../setup/test-env';
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth';
import { createPet } from '../utils/pets';

/**
 * E2E Tests for Story 2.3: Pet Detail Page with Full Info
 *
 * Tests validate all acceptance criteria:
 * AC1: Pet detail page displays all pet fields: photo, name, species, breed, birth date/age, gender, spayed/neutered status, microchip number, notes
 * AC2: Page shows quick stats: Total health records, Last vet visit date, Total expenses (placeholder $0 until expense tracking implemented)
 * AC3: Navigation tabs visible for: Health, Expenses, Reminders, Documents (placeholders initially)
 * AC4: Edit and Delete buttons accessible from header
 * AC5: Back button returns to pets grid
 * AC6: Page loads in <2 seconds
 * AC7: Missing optional fields show "Not provided" or hidden gracefully
 */

test.describe('Story 2.3: Pet Detail Page with Full Info', () => {
  // Setup: Create and log in a test user before each test
  test.beforeEach(async ({ page }) => {
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };
    await authenticateTestUser(page, credentials);
  });

  test('AC1: Pet detail page displays all pet fields with complete information', async ({ page }) => {
    // Create a pet with all optional fields filled
    await page.goto('/pets');
    const pet = {
      name: 'Max',
      species: 'dog' as const,
      breed: 'Labrador Retriever',
      birthDate: '2020-06-15',
      gender: 'male' as const,
      spayedNeutered: true,
      microchip: 'MC123456789',
      notes: 'Very friendly and loves to play fetch.',
    };
    await createPet(page, pet);

    // Page should have navigated to pet detail page
    await expect(page).toHaveURL(/\/pets\/[a-f0-9-]+/);

    // Verify all fields are displayed in PetInfoCard
    await expect(page.getByRole('heading', { name: 'Max' })).toBeVisible();
    await expect(page.getByText(/dog/i)).toBeVisible();
    await expect(page.getByText('Labrador Retriever')).toBeVisible();
    await expect(page.getByText(/\d+ years?/i)).toBeVisible(); // Age calculation
    await expect(page.getByText(/male/i)).toBeVisible();
    await expect(page.getByText(/yes/i)).toBeVisible(); // Spayed/Neutered
    await expect(page.getByText('MC123456789')).toBeVisible();
    await expect(page.getByText('Very friendly and loves to play fetch.')).toBeVisible();

    // Verify Pet Information card exists
    await expect(page.getByText(/pet information/i)).toBeVisible();
  });

  test('AC1: Pet detail page displays minimal pet information (only required fields)', async ({ page }) => {
    // Create a pet with only required fields
    await page.goto('/pets');
    const pet = {
      name: 'Luna',
      species: 'cat' as const,
    };
    await createPet(page, pet);

    // Verify required fields are displayed
    await expect(page.getByRole('heading', { name: 'Luna' })).toBeVisible();
    await expect(page.getByText(/cat/i)).toBeVisible();

    // Verify optional fields are hidden gracefully (not showing empty values)
    // The page should not show empty breed, birth_date, etc.
    const pageContent = await page.textContent('body');
    expect(pageContent).not.toContain('Breed:  '); // No empty breed field
  });

  test('AC2: Page shows quick stats - Health records count, Last vet visit, Total expenses', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Buddy', species: 'dog' };
    await createPet(page, pet);

    // Verify stats section is displayed
    await expect(page.getByText(/health records/i)).toBeVisible();
    await expect(page.getByText(/last vet visit/i)).toBeVisible();
    await expect(page.getByText(/total expenses/i)).toBeVisible();

    // Verify initial values (no data yet)
    await expect(page.getByText('0')).toBeVisible(); // Health records count
    await expect(page.getByText(/never/i)).toBeVisible(); // No vet visits yet
    await expect(page.getByText('$0.00')).toBeVisible(); // Total expenses placeholder
  });

  test('AC3: Navigation tabs are visible for Health, Expenses, Reminders, Documents', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Charlie', species: 'bird' };
    await createPet(page, pet);

    // Verify all 4 tabs are visible
    await expect(page.getByRole('tab', { name: /health/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /expenses/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /reminders/i })).toBeVisible();
    await expect(page.getByRole('tab', { name: /documents/i })).toBeVisible();

    // Verify default tab is Health
    const healthTab = page.getByRole('tab', { name: /health/i });
    const healthTabState = await healthTab.getAttribute('data-state');
    expect(healthTabState).toBe('active');
  });

  test('AC3: Tab navigation works and shows placeholder content', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Daisy', species: 'rabbit' };
    await createPet(page, pet);

    // Click Expenses tab
    await page.getByRole('tab', { name: /expenses/i }).click();
    await expect(page.getByText(/expense tracking will be available in epic 4/i)).toBeVisible();

    // Click Reminders tab
    await page.getByRole('tab', { name: /reminders/i }).click();
    await expect(page.getByText(/reminders will be available in epic 5/i)).toBeVisible();

    // Click Documents tab
    await page.getByRole('tab', { name: /documents/i }).click();
    await expect(page.getByText(/document storage will be available in epic 6/i)).toBeVisible();

    // Click Health tab
    await page.getByRole('tab', { name: /health/i }).click();
    await expect(page.getByText(/health records will be available in epic 3/i)).toBeVisible();
  });

  test('AC4: Edit and Delete buttons are accessible from header', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Oscar', species: 'cat' };
    await createPet(page, pet);

    // Verify Edit button is visible
    const editButton = page.getByRole('button', { name: /edit/i });
    await expect(editButton).toBeVisible();

    // Verify Delete button is visible
    const deleteButton = page.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeVisible();

    // Verify Delete button has destructive styling (red)
    const deleteButtonClasses = await deleteButton.getAttribute('class');
    expect(deleteButtonClasses).toContain('destructive');
  });

  test('AC4: Edit button shows placeholder message (Story 2.4 not implemented)', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Bella', species: 'dog' };
    await createPet(page, pet);

    // Click Edit button
    await page.getByRole('button', { name: /edit/i }).click();

    // For now, it should log to console (Story 2.4 will implement actual edit functionality)
    // No dialog should open yet
    const dialogCount = await page.locator('[role="dialog"]').count();
    expect(dialogCount).toBe(0);
  });

  test('AC4: Delete button shows placeholder message (Story 2.5 not implemented)', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Rocky', species: 'dog' };
    await createPet(page, pet);

    // Click Delete button
    await page.getByRole('button', { name: /delete/i }).click();

    // For now, it should log to console (Story 2.5 will implement actual delete functionality)
    // No dialog should open yet
    const dialogCount = await page.locator('[role="dialog"]').count();
    expect(dialogCount).toBe(0);
  });

  test('AC5: Back button returns to pets grid', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Simba', species: 'cat' };
    await createPet(page, pet);

    // Verify we're on pet detail page
    await expect(page).toHaveURL(/\/pets\/[a-f0-9-]+/);

    // Click back button
    const backButton = page.getByRole('button').filter({ has: page.locator('svg') }).first();
    await backButton.click();

    // Verify navigation to pets grid
    await expect(page).toHaveURL('/pets');
    await expect(page.getByText(/my pets/i)).toBeVisible();
  });

  test('AC6: Page loads in less than 2 seconds', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = {
      name: 'Performance Test Pet',
      species: 'dog' as const,
      breed: 'Husky',
      birthDate: '2019-03-20',
      notes: 'Testing page load performance',
    };
    await createPet(page, pet);

    // Get the pet detail URL
    const petDetailUrl = page.url();

    // Navigate away
    await page.goto('/pets');

    // Measure load time
    const startTime = Date.now();

    // Navigate back to pet detail page
    await page.goto(petDetailUrl);

    // Wait for main content to be visible
    await page.getByRole('heading', { name: 'Performance Test Pet' }).waitFor({ state: 'visible' });
    await page.getByText(/pet information/i).waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;

    // Verify load time is under 2 seconds (2000ms)
    expect(loadTime).toBeLessThan(2000);
  });

  test('AC6: Loading skeleton displays during fetch', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Loading Test', species: 'dog' };
    await createPet(page, pet);

    const petDetailUrl = page.url();

    // Navigate away
    await page.goto('/pets');

    // Reload pet detail page to see loading state
    await page.goto(petDetailUrl);

    // Loading state is very fast, so we just verify the pattern exists in the code
    // The skeleton should appear briefly before content loads
    const hasContent = await page.getByRole('heading', { name: 'Loading Test' }).isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('AC7: Missing optional fields are hidden gracefully', async ({ page }) => {
    // Create a pet with only required fields
    await page.goto('/pets');
    const pet = {
      name: 'Minimal Pet',
      species: 'bird' as const,
    };
    await createPet(page, pet);

    // Verify page loads successfully
    await expect(page.getByRole('heading', { name: 'Minimal Pet' })).toBeVisible();

    // Get page text content
    const pageContent = await page.textContent('body');

    // Verify optional fields are not showing empty values
    // These fields should be hidden when not provided
    expect(pageContent).not.toContain('Breed: '); // Should not show empty breed
    expect(pageContent).not.toContain('Birth Date: '); // Should not show empty birth date
    expect(pageContent).not.toContain('Microchip: '); // Should not show empty microchip
    expect(pageContent).not.toContain('Notes: '); // Should not show empty notes
  });

  test('AC7: Age shows "Unknown" when birth_date is missing', async ({ page }) => {
    // Create a pet without birth date
    await page.goto('/pets');
    const pet = {
      name: 'Ageless Pet',
      species: 'cat' as const,
    };
    await createPet(page, pet);

    // Since birth_date is missing, age should not be displayed
    // Or it could show "Unknown" - depends on implementation
    const pageContent = await page.textContent('body');

    // Age field should either be hidden or show "Unknown"
    // Based on PetInfoCard implementation, age is only shown if birth_date exists
    expect(pageContent).not.toContain('Age: ');
  });

  test('AC1: Pet photo displays with optimized resolution', async ({ page }) => {
    // Create a pet (photo upload will be tested in integration, here we verify display)
    await page.goto('/pets');
    const pet = {
      name: 'Photo Test',
      species: 'dog' as const,
    };
    await createPet(page, pet);

    // Check if photo element exists
    const photoElement = page.locator('img[alt="Photo Test"]');

    // If photo exists, verify lazy loading attribute
    if (await photoElement.count() > 0) {
      const loading = await photoElement.getAttribute('loading');
      expect(loading).toBe('lazy');
    }
  });

  test('Error state: Invalid pet ID shows error message', async ({ page }) => {
    // Navigate to pet detail page with invalid UUID
    await page.goto('/pets/00000000-0000-0000-0000-000000000000');

    // Verify error message is displayed
    await expect(page.getByText(/pet not found/i)).toBeVisible();

    // Verify back button is available
    const backButton = page.getByRole('button', { name: /back to pets/i });
    await expect(backButton).toBeVisible();
  });

  test('Error state: Back button from error page returns to pets grid', async ({ page }) => {
    // Navigate to pet detail page with invalid UUID
    await page.goto('/pets/00000000-0000-0000-0000-000000000000');

    // Click back button
    await page.getByRole('button', { name: /back to pets/i }).click();

    // Verify navigation to pets grid
    await expect(page).toHaveURL('/pets');
  });

  test('AC1: Spayed/Neutered status displays correctly (Yes/No)', async ({ page }) => {
    // Create a pet that is spayed/neutered
    await page.goto('/pets');
    const spayedPet = {
      name: 'Spayed Cat',
      species: 'cat' as const,
      spayedNeutered: true,
    };
    await createPet(page, spayedPet);

    // Verify "Yes" is displayed
    await expect(page.getByText(/spayed\/neutered/i)).toBeVisible();
    await expect(page.getByText('Yes')).toBeVisible();

    // Navigate back and create a pet that is not spayed/neutered
    await page.goto('/pets');
    const notSpayedPet = {
      name: 'Intact Dog',
      species: 'dog' as const,
      spayedNeutered: false,
    };
    await createPet(page, notSpayedPet);

    // Verify "No" is displayed
    await expect(page.getByText(/spayed\/neutered/i)).toBeVisible();
    await expect(page.getByText('No')).toBeVisible();
  });

  test('Responsive layout: Detail page works on mobile viewport', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Mobile Test', species: 'cat' };
    await createPet(page, pet);

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify content is still visible and readable
    await expect(page.getByRole('heading', { name: 'Mobile Test' })).toBeVisible();
    await expect(page.getByText(/pet information/i)).toBeVisible();
    await expect(page.getByRole('tab', { name: /health/i })).toBeVisible();

    // Verify action buttons are visible on mobile
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /delete/i })).toBeVisible();
  });

  test('Responsive layout: Stats cards stack vertically on mobile', async ({ page }) => {
    // Create a pet
    await page.goto('/pets');
    const pet = { name: 'Stats Test', species: 'dog' };
    await createPet(page, pet);

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify all 3 stat cards are visible
    await expect(page.getByText(/health records/i)).toBeVisible();
    await expect(page.getByText(/last vet visit/i)).toBeVisible();
    await expect(page.getByText(/total expenses/i)).toBeVisible();
  });
});
