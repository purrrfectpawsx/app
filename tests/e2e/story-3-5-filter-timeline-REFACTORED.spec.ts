/**
 * REFACTORED VERSION: Story 3.5 - Filter Timeline by Record Type
 *
 * This is a demonstration of how to refactor tests using:
 * 1. Test Data Factories (from tests/factories)
 * 2. Page Object Models (from tests/page-objects)
 * 3. Better organization and readability
 *
 * Compare with story-3-5-filter-timeline-by-record-type.spec.ts to see improvements
 */

import { test, expect } from '../setup/test-env'
import { authenticateTestUser } from '../utils/auth'
import { createPet } from '../utils/pets'
import { createHealthRecord } from '../utils/healthRecords'
import { UserFactory, PetFactory, HealthRecordFactory } from '../factories'
import { PetDetailPage } from '../page-objects'

test.describe('Story 3.5: Filter Timeline by Record Type (REFACTORED)', () => {
  let petDetailPage: PetDetailPage

  test.beforeEach(async ({ page }) => {
    // Initialize page object
    petDetailPage = new PetDetailPage(page)

    // Use factory to generate test user
    const user = UserFactory.build()
    await authenticateTestUser(page, user)

    // Use factory to generate test pet
    const pet = PetFactory.buildDog()
    await createPet(page, pet)

    // Navigate to Health tab using POM
    await petDetailPage.switchToTab('health')
  })

  test('AC1 & AC7: All filter chips visible with correct counts', async ({ page }) => {
    // Use factories to create test data
    const vaccine1 = HealthRecordFactory.buildVaccine({
      title: 'Rabies Vaccine',
      date: '2025-11-15',
    })
    const vaccine2 = HealthRecordFactory.buildVaccine({
      title: 'Parvo Vaccine',
      date: '2025-11-14',
    })
    const medication = HealthRecordFactory.buildMedication({
      title: 'Antibiotics',
      date: '2025-11-13',
    })
    const vetVisit = HealthRecordFactory.buildVetVisit({
      title: 'Annual Checkup',
      date: '2025-11-12',
    })
    const symptom = HealthRecordFactory.buildSymptom({
      title: 'Coughing',
      date: '2025-11-11',
    })
    const weightCheck = HealthRecordFactory.buildWeightCheck({
      title: 'Monthly Weigh-in',
      date: '2025-11-10',
    })

    // Create all records
    await createHealthRecord(page, vaccine1)
    await createHealthRecord(page, vaccine2)
    await createHealthRecord(page, medication)
    await createHealthRecord(page, vetVisit)
    await createHealthRecord(page, symptom)
    await createHealthRecord(page, weightCheck)

    // Wait for timeline to load
    await page.waitForSelector('button:has-text("All")')

    // Verify all filter chips are visible with correct counts
    await expect(page.getByRole('button', { name: /All.*6/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Vaccines.*2/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Medications.*1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Vet Visits.*1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Symptoms.*1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Weight Checks.*1/i })).toBeVisible()
  })

  test('AC2 & AC3: Clicking filter toggles it on/off and timeline updates immediately', async ({
    page,
  }) => {
    // Use factories to create mixed record types
    const records = [
      HealthRecordFactory.buildVaccine({ title: 'Vaccine Record', date: '2025-11-15' }),
      HealthRecordFactory.buildMedication({ title: 'Medication Record', date: '2025-11-14' }),
      HealthRecordFactory.buildVetVisit({ title: 'Vet Visit Record', date: '2025-11-13' }),
    ]

    // Create all records
    for (const record of records) {
      await createHealthRecord(page, record)
    }

    await page.waitForSelector('button:has-text("All")')

    // Initially all records visible (All filter active)
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()
    await expect(page.getByText('Vet Visit Record')).toBeVisible()

    // Click Vaccines filter (should show only vaccines)
    await page.click('button:has-text("Vaccines")')
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).not.toBeVisible()
    await expect(page.getByText('Vet Visit Record')).not.toBeVisible()

    // Click Medications filter (should add it to active filters)
    await page.click('button:has-text("Medications")')
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()
    await expect(page.getByText('Vet Visit Record')).not.toBeVisible()

    // Click All filter (should show all records)
    await page.click('button:has-text("All")')
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()
    await expect(page.getByText('Vet Visit Record')).toBeVisible()
  })

  test('AC4: Cannot deselect all filters (at least one always active)', async ({ page }) => {
    // Create a test record using factory
    const vaccine = HealthRecordFactory.buildVaccine({
      title: 'Test Vaccine',
      date: '2025-11-15',
    })
    await createHealthRecord(page, vaccine)

    await page.waitForSelector('button:has-text("All")')

    // Click Vaccines filter to activate it
    await page.click('button:has-text("Vaccines")')

    // Try to deselect the last active filter
    await page.click('button:has-text("Vaccines")')

    // Verify toast notification appears
    await expect(page.getByText('Cannot deselect all filters')).toBeVisible()
    await expect(page.getByText('At least one filter must be active')).toBeVisible()

    // Verify Vaccines filter is still active
    const vaccinesButton = page.getByRole('button', { name: /Vaccines/i })
    const isActive = await vaccinesButton.getAttribute('aria-pressed')
    expect(isActive).toBe('true')
  })

  test('AC5: Active filters visually distinct from inactive', async ({ page }) => {
    // Create a test record using factory
    const vaccine = HealthRecordFactory.buildVaccine({
      title: 'Test Vaccine',
      date: '2025-11-15',
    })
    await createHealthRecord(page, vaccine)

    await page.waitForSelector('button:has-text("All")')

    // Check All filter is initially active
    const allButton = page.getByRole('button', { name: /All/i })
    const allButtonClass = await allButton.getAttribute('class')
    expect(allButtonClass).toContain('bg-blue-500')
    expect(allButtonClass).toContain('text-white')

    // Check Vaccines filter is initially inactive
    const vaccinesButton = page.getByRole('button', { name: /Vaccines/i })
    const vaccinesButtonClass = await vaccinesButton.getAttribute('class')
    expect(vaccinesButtonClass).toContain('bg-white')
    expect(vaccinesButtonClass).toContain('border')

    // Click Vaccines filter to activate it
    await page.click('button:has-text("Vaccines")')

    // Verify Vaccines is now active (filled background)
    const vaccinesButtonClassActive = await vaccinesButton.getAttribute('class')
    expect(vaccinesButtonClassActive).toContain('bg-blue-500')
    expect(vaccinesButtonClassActive).toContain('text-white')

    // Verify All is now inactive (outline style)
    const allButtonClassInactive = await allButton.getAttribute('class')
    expect(allButtonClassInactive).toContain('bg-white')
    expect(allButtonClassInactive).toContain('border')
  })

  test('AC6: Filter state persists during session', async ({ page }) => {
    // Create test records using factories
    const vaccine = HealthRecordFactory.buildVaccine({
      title: 'Test Vaccine',
      date: '2025-11-15',
    })
    const medication = HealthRecordFactory.buildMedication({
      title: 'Test Medication',
      date: '2025-11-14',
    })

    await createHealthRecord(page, vaccine)
    await createHealthRecord(page, medication)

    await page.waitForSelector('button:has-text("All")')

    // Set filters to Vaccines only
    await page.click('button:has-text("Vaccines")')

    // Verify only vaccine is visible
    await expect(page.getByText('Test Vaccine')).toBeVisible()
    await expect(page.getByText('Test Medication')).not.toBeVisible()

    // Switch tabs and come back using POM
    await petDetailPage.switchToTab('expenses')
    await petDetailPage.switchToTab('health')

    // Verify filter state persists
    await expect(page.getByText('Test Vaccine')).toBeVisible()
    await expect(page.getByText('Test Medication')).not.toBeVisible()

    const vaccinesButton = page.getByRole('button', { name: /Vaccines/i })
    const isActive = await vaccinesButton.getAttribute('aria-pressed')
    expect(isActive).toBe('true')
  })

  test('AC8: Keyboard navigation and accessibility', async ({ page }) => {
    // Create test record using factory
    const vaccine = HealthRecordFactory.buildVaccine({
      title: 'Test Vaccine',
      date: '2025-11-15',
    })
    await createHealthRecord(page, vaccine)

    await page.waitForSelector('button:has-text("All")')

    // Verify filter group has proper ARIA label
    const filterGroup = page.locator('div[role="group"][aria-label*="Filter timeline"]')
    await expect(filterGroup).toBeVisible()

    // Verify filter buttons have aria-pressed attribute
    const allButton = page.getByRole('button', { name: /All/i })
    const ariaPressed = await allButton.getAttribute('aria-pressed')
    expect(ariaPressed).toBe('true')

    // Tab to first filter button
    await page.keyboard.press('Tab')
    let focusedElement = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))

    // Verify a filter button can receive focus
    expect(focusedElement).toBeTruthy()

    // Press Enter to toggle filter
    await page.keyboard.press('Enter')
    await page.waitForTimeout(200)

    // Verify filter can be toggled via keyboard
    const ariaLabelAfterToggle = await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-label')
    )
    expect(ariaLabelAfterToggle).toBeTruthy()
  })
})

/**
 * REFACTORING IMPROVEMENTS DEMONSTRATED:
 *
 * 1. Test Data Factories:
 *    - UserFactory.build() instead of hardcoded credentials
 *    - PetFactory.buildDog() instead of hardcoded pet data
 *    - HealthRecordFactory.buildVaccine() etc. for consistent test data
 *
 * 2. Page Object Models:
 *    - PetDetailPage for encapsulating page interactions
 *    - petDetailPage.switchToTab() instead of raw clicks
 *    - Cleaner, more maintainable test code
 *
 * 3. Better Organization:
 *    - Page object initialized in beforeEach
 *    - Consistent patterns across all tests
 *    - Easier to understand and maintain
 *
 * 4. Benefits:
 *    - Less brittle tests (selectors centralized in POMs)
 *    - Easier to maintain (change selector once, affects all tests)
 *    - More readable (semantic method names)
 *    - Consistent test data (factories ensure valid data)
 *    - Easier to write new tests (reuse existing patterns)
 */
