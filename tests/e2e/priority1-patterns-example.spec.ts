/**
 * Priority 1 Patterns Example Tests
 *
 * Demonstrates the three Priority 1 improvements working together:
 * 1. Custom Fixtures - Eliminates setup boilerplate
 * 2. Smart Waiters - Reduces flaky tests
 * 3. Builder Pattern - Complex scenarios made easy
 *
 * Compare these tests to older ones to see the massive improvement in:
 * - Readability
 * - Maintainability
 * - Reliability
 * - Development speed
 */

import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait'
import { buildDog, buildCat } from '../builders'

test.describe('Priority 1 Patterns: Combined Examples', () => {
  /**
   * EXAMPLE 1: Using Custom Fixtures
   * No manual setup needed - fixture handles authentication
   */
  test('Custom Fixture: Authenticated user can view pets', async ({
    authenticatedUser,
    petsGridReady,
  }) => {
    // That's it! User is authenticated, we're on pets grid page
    // No setup boilerplate needed

    await petsGridReady.assertPageLoaded()

    // User details available if needed
    expect(authenticatedUser.user.email).toBeTruthy()
  })

  /**
   * EXAMPLE 2: Using petWithUser Fixture
   * User authenticated AND pet created automatically
   */
  test('Custom Fixture: Pet already created', async ({ petWithUser }) => {
    const { pet } = petWithUser

    // Pet is already created! No setup code needed
    expect(pet.name).toBeTruthy()
    expect(pet.species).toMatch(/cat|dog/)
  })

  /**
   * EXAMPLE 3: Using petDetailReady Fixture
   * Everything ready: user, pet, on pet detail page with POM
   */
  test('Custom Fixture: Pet detail page ready', async ({ petDetailReady }) => {
    const { petDetailPage, pet } = petDetailReady

    // Already on pet detail page with POM initialized!
    await petDetailPage.assertPageLoaded()

    // Switch to health tab using POM
    await petDetailPage.switchToTab('health')

    // Verify empty state
    const isEmpty = await petDetailPage.hasEmptyState()
    expect(isEmpty).toBe(true)
  })

  /**
   * EXAMPLE 4: Using Smart Waiters
   * Better error messages and automatic debugging
   */
  test('Smart Waiters: Better error handling', async ({ page, petDetailReady }) => {
    const { petDetailPage } = petDetailReady

    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    // Smart waiter with context
    await SmartWait.forElement(page, '[role="dialog"]', {
      errorContext: 'Waiting for health record dialog to open',
      timeout: 5000,
    })

    // Smart waiter for text
    await SmartWait.forText(page, 'Record Type')

    // If this fails, SmartWait will:
    // 1. Capture screenshot automatically
    // 2. Log page HTML snippet
    // 3. Provide detailed error with context
    // 4. Save debug info to test-results/debug/
  })

  /**
   * EXAMPLE 5: Using Builder Pattern
   * Complex test scenarios made readable
   */
  test('Builder Pattern: Create pet with complete health history', async ({
    page,
    authenticatedUser,
  }) => {
    // Use builder to create complex scenario
    const scenario = await buildDog(page)
      .withName('Buddy')
      .withAge(5)
      .withWeight(25.5, 'kg')
      .withCompleteHealthHistory() // Adds vaccines, medications, vet visits
      .build()

    // Verify pet was created
    expect(scenario.pet.name).toBe('Buddy')
    expect(scenario.healthRecords.length).toBeGreaterThan(0)

    // Smart wait for records to appear
    await SmartWait.forElementCount(
      page,
      '[class*="border"]',
      scenario.healthRecords.length,
      {
        errorContext: 'Waiting for all health records to render',
      }
    )
  })

  /**
   * EXAMPLE 6: All Three Patterns Together
   * The ultimate clean test!
   */
  test('All Patterns: Complete workflow', async ({ page, authenticatedUser }) => {
    // 1. BUILDER PATTERN: Create complex scenario
    const scenario = await buildCat(page)
      .withName('Whiskers')
      .withAge(3)
      .withBasicVaccinations()
      .withWeightTrackingHistory()
      .build()

    // 2. SMART WAITERS: Reliable waiting
    await SmartWait.forURL(page, /\/pets\/[a-f0-9-]+/, {
      errorContext: 'Waiting for pet detail page',
    })

    // 3. Navigate using POM (from fixture context)
    await page.getByRole('tab', { name: /health/i }).click()

    // 4. SMART WAITERS: Wait for timeline
    await SmartWait.forElement(page, '[class*="space-y-4"]', {
      errorContext: 'Waiting for health timeline',
    })

    // 5. Verify records using smart waiter
    await SmartWait.until(
      async () => {
        const recordCount = await page.locator('[class*="border"]').count()
        return recordCount === scenario.healthRecords.length
      },
      {
        errorMessage: `Expected ${scenario.healthRecords.length} records in timeline`,
        timeout: 10000,
      }
    )

    // Test passed with minimal code and maximum readability!
  })

  /**
   * EXAMPLE 7: Builder Pattern - Scenario Presets
   * Pre-built scenarios for common cases
   */
  test('Builder Pattern: Senior pet with medical history', async ({
    page,
    authenticatedUser,
  }) => {
    // Use preset for senior pet
    const scenario = await buildDog(page).withName('Old Max').asSeniorPet().build()

    // Senior pet preset automatically adds:
    // - Age 10+
    // - Multiple vet visits
    // - Chronic medications
    // - Regular weight monitoring

    expect(scenario.healthRecords.length).toBeGreaterThan(5)

    // Smart wait for all records
    await SmartWait.forElementCount(
      page,
      '[class*="border"]',
      scenario.healthRecords.length
    )
  })

  /**
   * EXAMPLE 8: Builder Pattern - Young Pet
   * Another preset scenario
   */
  test('Builder Pattern: Puppy with vaccination schedule', async ({
    page,
    authenticatedUser,
  }) => {
    const scenario = await buildDog(page).withName('Puppy').asYoungPet().build()

    // Young pet preset adds:
    // - Age < 1 year
    // - Multiple vaccines
    // - Growth weight tracking

    await SmartWait.forText(page, 'Puppy')

    // Filter to vaccines only
    await page.click('button:has-text("Vaccines")')

    // Smart wait for filtered view
    await SmartWait.until(
      async () => {
        const vaccines = scenario.healthRecords.filter(r => r.record_type === 'vaccine')
        const visibleCount = await page.locator('[class*="border"]:visible').count()
        return visibleCount === vaccines.length
      },
      { errorMessage: 'Vaccine filter did not work correctly' }
    )
  })

  /**
   * EXAMPLE 9: Smart Waiters - API Waiting
   * Wait for API responses
   */
  test('Smart Waiters: Wait for API responses', async ({ page, petDetailReady }) => {
    const { petDetailPage } = petDetailReady

    await petDetailPage.switchToTab('health')

    // Wait for API call
    await SmartWait.forAPI(page, '/api/health_records', {
      expectedStatus: 200,
      timeout: 5000,
    })

    // Or wait for multiple APIs
    await SmartWait.forAPIs(page, ['/api/pets', '/api/health_records'])
  })

  /**
   * EXAMPLE 10: Smart Waiters - Retry Logic
   * Retry flaky actions automatically
   */
  test('Smart Waiters: Retry flaky actions', async ({ page, healthRecordReady }) => {
    const { healthDialog } = healthRecordReady

    // Retry filling form if it fails
    await SmartWait.retry(
      async () => {
        await healthDialog.selectRecordType('vaccine')
        await healthDialog.fillTitle('Rabies Vaccine')

        // Verify it worked
        const title = await healthDialog.titleInput.inputValue()
        if (title !== 'Rabies Vaccine') {
          throw new Error('Form not filled correctly')
        }
      },
      {
        retries: 3,
        delay: 500,
        errorMessage: 'Failed to fill vaccine form',
      }
    )
  })

  /**
   * EXAMPLE 11: Builder Pattern - Custom Scenario
   * Build exactly what you need
   */
  test('Builder Pattern: Custom medical issue scenario', async ({
    page,
    authenticatedUser,
  }) => {
    const scenario = await buildCat(page)
      .withName('Mittens')
      .withAge(7)
      .withRecentMedicalIssue() // Adds symptom + vet visit + medication
      .build()

    // Recent medical issue preset creates a realistic sequence:
    // Day 1: Symptom observed
    // Day 2: Emergency vet visit
    // Day 3: Medication started

    await SmartWait.forText(page, 'Mittens')

    // Verify all three records are present
    await SmartWait.forElementCount(page, '[class*="border"]', 3)

    // Check chronological order (newest first)
    const records = await page.locator('[class*="border"]').allTextContents()
    expect(records.join()).toMatch(/Medication.*Visit.*Symptom/i)
  })

  /**
   * EXAMPLE 12: Combining Fixtures + Builder + Smart Waiters
   * The cleanest test possible
   */
  test('Combined: Weight chart with tracking history', async ({
    page,
    authenticatedUser,
  }) => {
    // BUILDER: Create pet with weight tracking data
    const scenario = await buildDog(page)
      .withName('Tracker')
      .withWeightTrackingHistory() // Creates 6 months of weight data
      .build()

    // SMART WAIT: Wait for page load
    await SmartWait.forURL(page, /\/pets\//)

    // Navigate to health tab
    await page.getByRole('tab', { name: /health/i }).click()

    // SMART WAIT: Wait for weight chart to render
    await SmartWait.forElement(page, '[class*="recharts"]', {
      errorContext: 'Waiting for weight chart',
      timeout: 10000,
    })

    // Verify chart has data points
    await SmartWait.until(
      async () => {
        const dataPoints = await page.locator('[class*="recharts"] circle').count()
        return dataPoints === scenario.healthRecords.length
      },
      { errorMessage: 'Weight chart does not show all data points' }
    )

    // Success! Clean test with:
    // - No setup boilerplate (fixtures)
    // - Readable scenario creation (builder)
    // - Reliable waiting (smart waiters)
  })
})

/**
 * COMPARISON: Before vs After
 *
 * BEFORE (Old Pattern):
 * ```typescript
 * test('Create pet with health history', async ({ page }) => {
 *   // Manual authentication (15 lines)
 *   const user = {
 *     name: 'Test User',
 *     email: 'test@example.com',
 *     password: 'Password123'
 *   }
 *   await page.goto('/login')
 *   await page.fill('#email', user.email)
 *   await page.fill('#password', user.password)
 *   await page.click('button[type="submit"]')
 *   await page.waitForURL('/pets')
 *
 *   // Manual pet creation (20 lines)
 *   await page.click('button:has-text("Add Pet")')
 *   await page.fill('#name', 'Buddy')
 *   await page.selectOption('#species', 'dog')
 *   // ... many more lines
 *   await page.click('button:has-text("Save")')
 *   await page.waitForTimeout(1000) // Flaky!
 *
 *   // Manual health records (30+ lines)
 *   for (let i = 0; i < 3; i++) {
 *     await page.click('button:has-text("Add Health Record")')
 *     await page.fill('#title', `Vaccine ${i}`)
 *     // ... many more lines
 *     await page.click('button:has-text("Save")')
 *     await page.waitForTimeout(500) // Flaky!
 *   }
 *
 *   // Finally test (5 lines)
 *   await page.waitForSelector('.health-record')
 *   const count = await page.locator('.health-record').count()
 *   expect(count).toBe(3)
 * })
 * // Total: ~70 lines, flaky, hard to read
 * ```
 *
 * AFTER (New Pattern):
 * ```typescript
 * test('Create pet with health history', async ({ page, authenticatedUser }) => {
 *   // BUILDER: Setup scenario
 *   const scenario = await buildDog(page)
 *     .withName('Buddy')
 *     .withVaccines(3)
 *     .build()
 *
 *   // SMART WAIT: Reliable waiting
 *   await SmartWait.forElementCount(page, '.health-record', 3)
 *
 *   // Test
 *   expect(scenario.healthRecords.length).toBe(3)
 * })
 * // Total: ~10 lines, reliable, readable
 * ```
 *
 * IMPROVEMENT:
 * - 85% less code
 * - 100% more reliable (no flaky waits)
 * - 10x more readable
 * - Reusable across all tests
 */
