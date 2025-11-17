/**
 * Visual Regression Testing Example
 *
 * Demonstrates visual regression testing patterns using Playwright screenshots.
 * These tests capture screenshots and compare them against baseline images.
 *
 * First run: Creates baseline screenshots
 * Subsequent runs: Compares against baseline and fails if differences detected
 *
 * To update baselines after intentional UI changes:
 * `npx playwright test --update-snapshots`
 */

import { test, expect } from '../setup/test-env'
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth'
import { createPet } from '../utils/pets'
import { generateTestPet } from '../fixtures/pets'
import { createHealthRecord } from '../utils/healthRecords'
import {
  compareScreenshot,
  compareElementScreenshot,
  compareResponsiveScreenshots,
  prepareForScreenshot,
  VISUAL_PRESETS,
  COMMON_MASKS,
} from '../utils/visual-regression'
import { PetDetailPage, PetsGridPage } from '../page-objects'

test.describe('Visual Regression: Pet Detail Page', () => {
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
  })

  test('Pet detail page - Health tab with no records', async ({ page }) => {
    const petDetailPage = new PetDetailPage(page)

    // Switch to Health tab
    await petDetailPage.switchToTab('health')

    // Prepare page for screenshot (disable animations, wait for fonts)
    await prepareForScreenshot(page)

    // Compare screenshot with baseline
    await compareScreenshot(page, 'pet-detail-health-empty', VISUAL_PRESETS.strict)
  })

  test('Pet detail page - Health tab with vaccine record', async ({ page }) => {
    const petDetailPage = new PetDetailPage(page)

    // Switch to Health tab
    await petDetailPage.switchToTab('health')

    // Create a vaccine record
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Rabies Vaccine',
      date: '2025-11-15',
    })

    // Prepare and capture screenshot
    await prepareForScreenshot(page)
    await compareScreenshot(page, 'pet-detail-health-with-vaccine', {
      threshold: 0.2,
      // Mask timestamps to avoid flakiness
      mask: [COMMON_MASKS.timestamps],
    })
  })

  test('Health record card visual comparison', async ({ page }) => {
    const petDetailPage = new PetDetailPage(page)

    // Switch to Health tab and create record
    await petDetailPage.switchToTab('health')
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'DHPP Vaccine',
      date: '2025-11-15',
    })

    // Capture screenshot of just the health record card
    await prepareForScreenshot(page)
    await compareElementScreenshot(
      page,
      '[class*="border"]',
      'health-record-card-vaccine',
      VISUAL_PRESETS.strict
    )
  })

  test('Responsive: Pet detail page across viewports', async ({ page }) => {
    const petDetailPage = new PetDetailPage(page)

    // Switch to Health tab
    await petDetailPage.switchToTab('health')

    // Create a health record
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Test Vaccine',
      date: '2025-11-15',
    })

    // Prepare page
    await prepareForScreenshot(page)

    // Capture screenshots at different viewport sizes
    await compareResponsiveScreenshots(page, 'pet-detail-health-responsive', undefined, {
      threshold: 0.2,
      mask: [COMMON_MASKS.timestamps],
    })
  })
})

test.describe('Visual Regression: Pets Grid', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate user
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    }
    await authenticateTestUser(page, credentials)
  })

  test('Pets grid - Empty state', async ({ page }) => {
    const petsGridPage = new PetsGridPage(page)

    // Ensure we're on the pets grid
    await petsGridPage.goto()

    // Prepare and capture
    await prepareForScreenshot(page)
    await compareScreenshot(page, 'pets-grid-empty', VISUAL_PRESETS.strict)
  })

  test('Pets grid - With pet cards', async ({ page }) => {
    // Create multiple pets
    await createPet(page, generateTestPet('dog'))
    await createPet(page, generateTestPet('cat'))

    const petsGridPage = new PetsGridPage(page)
    await petsGridPage.goto()

    // Prepare and capture
    await prepareForScreenshot(page)
    await compareScreenshot(page, 'pets-grid-with-pets', {
      threshold: 0.2,
      // Mask avatars since they might have random colors
      mask: [COMMON_MASKS.avatars],
    })
  })

  test('Pet card visual comparison', async ({ page }) => {
    // Create a pet
    await createPet(page, generateTestPet('dog'))

    const petsGridPage = new PetsGridPage(page)
    await petsGridPage.goto()

    // Capture just the pet card
    await prepareForScreenshot(page)
    await compareElementScreenshot(
      page,
      '[data-testid="pet-card"]',
      'pet-card-dog',
      VISUAL_PRESETS.strict
    )
  })
})

test.describe('Visual Regression: Health Timeline Components', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate and create pet with health records
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    }
    await authenticateTestUser(page, credentials)

    const pet = generateTestPet('dog')
    await createPet(page, pet)

    // Create multiple health records
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Rabies',
      date: '2025-11-15',
    })
    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Antibiotics',
      date: '2025-11-14',
    })
    await createHealthRecord(page, {
      record_type: 'vet_visit',
      title: 'Annual Checkup',
      date: '2025-11-13',
    })
  })

  test('Health timeline with multiple record types', async ({ page }) => {
    const petDetailPage = new PetDetailPage(page)
    await petDetailPage.switchToTab('health')

    // Prepare and capture timeline
    await prepareForScreenshot(page)
    await compareElementScreenshot(
      page,
      '[class*="space-y-4"]',
      'health-timeline-mixed-records',
      {
        threshold: 0.2,
        mask: [COMMON_MASKS.timestamps],
      }
    )
  })

  test('Timeline filter chips visual comparison', async ({ page }) => {
    const petDetailPage = new PetDetailPage(page)
    await petDetailPage.switchToTab('health')

    // Capture just the filter chips
    await prepareForScreenshot(page)
    await compareElementScreenshot(
      page,
      '[role="group"]',
      'timeline-filter-chips',
      VISUAL_PRESETS.strict
    )
  })
})

/**
 * Tips for Visual Regression Testing:
 *
 * 1. Keep tests isolated - each test should set up its own data
 * 2. Disable animations for stable screenshots
 * 3. Mask dynamic content (timestamps, avatars, random data)
 * 4. Use appropriate thresholds (strict for critical UI, lenient for dynamic pages)
 * 5. Test at multiple viewport sizes for responsive designs
 * 6. Update baselines after intentional UI changes: `npx playwright test --update-snapshots`
 * 7. Review failed screenshots in playwright-report folder
 * 8. Use element screenshots for component-level testing
 * 9. Use full page screenshots for page-level testing
 * 10. Consider masking or hiding third-party content (ads, social widgets, etc.)
 */
