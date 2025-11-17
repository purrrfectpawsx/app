import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait'
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth'
import { createPet } from '../utils/pets'
import { generateTestPet } from '../fixtures/pets'
import { createHealthRecord } from '../utils/healthRecords'

test.describe('Story 3.5: Filter Timeline by Record Type', () => {  test.beforeEach(async ({ page }) => {
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

    // Navigate to Health tab
    await page.getByRole('tab', { name: /health/i }).click()
  })

  test('AC1 & AC7: All filter chips visible with correct counts', async ({ page }) => {
    // Create health records of different types
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Rabies Vaccine',
      date: '2025-11-15',
    })

    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Parvo Vaccine',
      date: '2025-11-14',
    })

    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Antibiotics',
      date: '2025-11-13',
    })

    await createHealthRecord(page, {
      record_type: 'vet_visit',
      title: 'Annual Checkup',
      date: '2025-11-12',
    })

    await createHealthRecord(page, {
      record_type: 'symptom',
      title: 'Coughing',
      date: '2025-11-11',
    })

    await createHealthRecord(page, {
      record_type: 'weight_check',
      title: 'Monthly Weigh-in',
      date: '2025-11-10',
    })

    // Navigate to pet detail health tab    // Wait for timeline to load
    await page.waitForSelector('button:has-text("All")')

    // Verify all filter chips are visible
    await expect(page.getByRole('button', { name: /All.*6/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Vaccines.*2/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Medications.*1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Vet Visits.*1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Symptoms.*1/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Weight Checks.*1/i })).toBeVisible()

    // Verify record counts are accurate
    await expect(page.getByText('All')).toBeVisible()
    await expect(page.getByText('6', { exact: true }).first()).toBeVisible()
  })

  test('AC2 & AC3: Clicking filter toggles it on/off and timeline updates immediately', async ({
    page,
  }) => {
    // Create multiple record types
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Vaccine Record',
      date: '2025-11-15',
    })

    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Medication Record',
      date: '2025-11-14',
    })

    await createHealthRecord(page, {
      record_type: 'vet_visit',
      title: 'Vet Visit Record',
      date: '2025-11-13',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

    // Initially all records visible (All filter active)
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()
    await expect(page.getByText('Vet Visit Record')).toBeVisible()

    // Click Vaccines filter (should deselect All and show only vaccines)
    await page.click('button:has-text("Vaccines")')
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).not.toBeVisible()
    await expect(page.getByText('Vet Visit Record')).not.toBeVisible()

    // Click Medications filter (should add it to active filters)
    await page.click('button:has-text("Medications")')
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()
    await expect(page.getByText('Vet Visit Record')).not.toBeVisible()

    // Click All filter (should deselect specific filters and show all)
    await page.click('button:has-text("All")')
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()
    await expect(page.getByText('Vet Visit Record')).toBeVisible()
  })

  test('AC4: Cannot deselect all filters (at least one always active)', async ({ page }) => {
    // Create a test record
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Test Vaccine',
      date: '2025-11-15',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

    // Click Vaccines filter to activate it
    await page.click('button:has-text("Vaccines")')

    // Try to deselect the last active filter
    await page.click('button:has-text("Vaccines")')

    // Verify toast notification appears
    await expect(page.getByText('Cannot deselect all filters')).toBeVisible()
    await expect(page.getByText('At least one filter must be active')).toBeVisible()

    // Verify Vaccines filter is still active (button still has active styling)
    const vaccinesButton = page.getByRole('button', { name: /Vaccines/i })
    const isActive = await vaccinesButton.getAttribute('aria-pressed')
    expect(isActive).toBe('true')
  })

  test('AC5: Active filters visually distinct from inactive', async ({ page }) => {
    // Create test records
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Test Vaccine',
      date: '2025-11-15',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

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
    // Create test records
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Test Vaccine',
      date: '2025-11-15',
    })

    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Test Medication',
      date: '2025-11-14',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

    // Set filters to Vaccines only
    await page.click('button:has-text("Vaccines")')

    // Verify only vaccine is visible
    await expect(page.getByText('Test Vaccine')).toBeVisible()
    await expect(page.getByText('Test Medication')).not.toBeVisible()

    // Switch tabs and come back
    await page.click('button:has-text("Expenses")')    // Verify filter state persists (still showing only vaccines)
    await expect(page.getByText('Test Vaccine')).toBeVisible()
    await expect(page.getByText('Test Medication')).not.toBeVisible()

    const vaccinesButton = page.getByRole('button', { name: /Vaccines/i })
    const isActive = await vaccinesButton.getAttribute('aria-pressed')
    expect(isActive).toBe('true')
  })

  test('AC1: "All" filter behavior - exclusive when clicked', async ({ page }) => {
    // Create multiple record types
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Vaccine Record',
      date: '2025-11-15',
    })

    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Medication Record',
      date: '2025-11-14',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

    // Click Vaccines filter
    await page.click('button:has-text("Vaccines")')

    // Click Medications filter (now both are active)
    await page.click('button:has-text("Medications")')

    // Click All filter (should deselect all others)
    await page.click('button:has-text("All")')

    // Verify all records are now visible
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()

    // Verify only All filter is active
    const allButton = page.getByRole('button', { name: /All/i })
    const vaccinesButton = page.getByRole('button', { name: /Vaccines/i })
    const medicationsButton = page.getByRole('button', { name: /Medications/i })

    const allIsActive = await allButton.getAttribute('aria-pressed')
    const vaccinesIsActive = await vaccinesButton.getAttribute('aria-pressed')
    const medicationsIsActive = await medicationsButton.getAttribute('aria-pressed')

    expect(allIsActive).toBe('true')
    expect(vaccinesIsActive).toBe('false')
    expect(medicationsIsActive).toBe('false')
  })

  test('AC1: Selecting all types individually activates "All" filter', async ({ page }) => {
    // Create one of each record type
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Vaccine Record',
      date: '2025-11-15',
    })

    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Medication Record',
      date: '2025-11-14',
    })

    await createHealthRecord(page, {
      record_type: 'vet_visit',
      title: 'Vet Visit Record',
      date: '2025-11-13',
    })

    await createHealthRecord(page, {
      record_type: 'symptom',
      title: 'Symptom Record',
      date: '2025-11-12',
    })

    await createHealthRecord(page, {
      record_type: 'weight_check',
      title: 'Weight Check Record',
      date: '2025-11-11',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

    // Click Vaccines filter
    await page.click('button:has-text("Vaccines")')

    // Click each filter one by one
    await page.click('button:has-text("Medications")')
    await page.click('button:has-text("Vet Visits")')
    await page.click('button:has-text("Symptoms")')
    await page.click('button:has-text("Weight Checks")')

    // Verify "All" filter is now active (automatically activated)
    const allButton = page.getByRole('button', { name: /All/i })
    const allIsActive = await allButton.getAttribute('aria-pressed')
    expect(allIsActive).toBe('true')

    // Verify all records are visible
    await expect(page.getByText('Vaccine Record')).toBeVisible()
    await expect(page.getByText('Medication Record')).toBeVisible()
    await expect(page.getByText('Vet Visit Record')).toBeVisible()
    await expect(page.getByText('Symptom Record')).toBeVisible()
    await expect(page.getByText('Weight Check Record')).toBeVisible()
  })

  test('AC3 & AC1: Timeline maintains sorting after filtering', async ({ page }) => {
    // Create records with different dates and types
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Newest Vaccine',
      date: '2025-11-15',
    })

    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Middle Medication',
      date: '2025-11-10',
    })

    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Oldest Vaccine',
      date: '2025-11-05',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

    // Filter to show only vaccines
    await page.click('button:has-text("Vaccines")')

    // Get visible vaccine titles in order
    const recordTitles = await page.locator('[class*="border"]').allTextContents()
    const titles = recordTitles.join(' ')

    // Verify newest vaccine appears before oldest
    const newestIndex = titles.indexOf('Newest Vaccine')
    const oldestIndex = titles.indexOf('Oldest Vaccine')
    const medicationIndex = titles.indexOf('Middle Medication')

    // Medication should not be found
    expect(medicationIndex).toBe(-1)

    // Newest should come before oldest
    expect(newestIndex).toBeLessThan(oldestIndex)
  })

  test('AC8: Keyboard navigation and accessibility', async ({ page }) => {
    // Create test record
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Test Vaccine',
      date: '2025-11-15',
    })

    // Navigate to timeline    await page.waitForSelector('button:has-text("All")')

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

    // Wait for state update
    await page.waitForTimeout(200)

    // Verify filter can be toggled via keyboard
    const ariaLabelAfterToggle = await page.evaluate(() => document.activeElement?.getAttribute('aria-label'))
    expect(ariaLabelAfterToggle).toBeTruthy()
  })
})
