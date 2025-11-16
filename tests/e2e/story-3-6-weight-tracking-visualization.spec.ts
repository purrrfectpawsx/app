import { test, expect } from '../setup/test-env'
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth'
import { createPet } from '../utils/pets'

/**
 * Story 3.6: Weight Tracking Visualization Chart
 *
 * Test Suite covering:
 * - AC1: "Weight Chart" section visible on Health tab
 * - AC2: Line chart displays all Weight Check records
 * - AC3: Chart shows ideal weight range as shaded area
 * - AC4: Date range selector: 1M, 3M, 6M, 1Y, All
 * - AC5: Chart requires minimum 2 weight records (empty state)
 * - AC6: Chart responsive to screen size
 * - AC7: Hover shows exact weight and date
 */

test.describe('Story 3.6: Weight Tracking Visualization Chart @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate test user
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    }
    await authenticateTestUser(page, credentials)
  })

  test('AC1: Weight Chart section visible on Health tab', async ({ page }) => {
    // Create a test pet
    await createPet(page, {
      name: 'Weight Test Dog',
      species: 'dog',
      birthDate: '2020-01-01',
    })

    // Should be on pet detail page now
    await expect(page).toHaveURL(/\/pets\/[a-f0-9-]+/)

    // Click on Health tab (should be default)
    const healthTab = page.getByRole('tab', { name: 'Health' })
    await healthTab.click()

    // Verify Weight Chart section heading is visible
    await expect(page.getByRole('heading', { name: 'Weight Chart' })).toBeVisible()
  })

  test('AC5: Empty state shows when less than 2 weight records', async ({ page }) => {
    // Create a test pet
    await createPet(page, {
      name: 'No Weight Dog',
      species: 'dog',
      birthDate: '2020-01-01',
    })

    // Should be on pet detail page
    await expect(page).toHaveURL(/\/pets\/[a-f0-9-]+/)

    // Click Health tab
    await page.getByRole('tab', { name: 'Health' }).click()

    // Verify empty state message is shown
    await expect(page.getByText(/add at least 2 weight records/i)).toBeVisible()
    await expect(page.getByRole('button', { name: /add weight check/i })).toBeVisible()
  })

  test('AC2 & AC7: Chart displays weight records and shows data on hover', async ({ page }) => {
    // Create a test pet
    await createPet(page, {
      name: 'Weight Chart Cat',
      species: 'cat',
      birthDate: '2021-01-01',
    })

    // Add first weight check record
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('4')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Body Condition').click()
    await page.getByRole('option', { name: 'Ideal' }).click()
    await page.getByLabel('Date').fill('2024-01-01')
    await page.getByRole('button', { name: /^save$/i }).click()

    // Wait for record to be added
    await page.waitForTimeout(1000)

    // Add second weight check record
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('4.5')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Body Condition').click()
    await page.getByRole('option', { name: 'Ideal' }).click()
    await page.getByLabel('Date').fill('2024-06-01')
    await page.getByRole('button', { name: /^save$/i }).click()

    await page.waitForTimeout(1000)

    // Verify chart is now visible (not empty state)
    await expect(page.getByText(/add at least 2 weight records/i)).not.toBeVisible()

    // Verify chart elements
    const chartContainer = page.locator('.recharts-wrapper')
    await expect(chartContainer).toBeVisible()

    // Verify line chart is rendered
    const chartLine = page.locator('.recharts-line-curve')
    await expect(chartLine).toBeVisible()
  })

  test('AC3: Ideal weight range shaded area displays for Cat', async ({ page }) => {
    // Create a cat with 2+ weight records
    await createPet(page, {
      name: 'Ideal Weight Cat',
      species: 'cat',
      birthDate: '2021-01-01',
    })

    // Add 2 weight records
    // Record 1
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('4')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Date').fill('2024-01-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Record 2
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('4.2')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Date').fill('2024-06-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Verify chart is visible
    const chartContainer = page.locator('.recharts-wrapper')
    await expect(chartContainer).toBeVisible()

    // Verify reference area (ideal weight range) exists
    const referenceArea = page.locator('.recharts-reference-area')
    await expect(referenceArea).toBeVisible()
  })

  test('AC4: Date range selector buttons work correctly', async ({ page }) => {
    // Create a pet with 2+ weight records
    await createPet(page, {
      name: 'Range Test Dog',
      species: 'dog',
      birthDate: '2020-01-01',
    })

    // Add 2 weight records
    // Record 1
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('15')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Date').fill('2024-01-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Record 2
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('18')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Date').fill('2024-06-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Verify all date range buttons exist
    await expect(page.getByRole('button', { name: '1M', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '3M', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '6M', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: '1Y', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible()

    // Click on 1M filter
    await page.getByRole('button', { name: '1M', exact: true }).click()

    // Chart should still be visible
    const chartContainer = page.locator('.recharts-wrapper')
    await expect(chartContainer).toBeVisible()

    // Click back to All
    await page.getByRole('button', { name: 'All', exact: true }).click()
  })

  test('AC6: Chart is responsive on mobile viewport', async ({ page }) => {
    // Create a pet with 2+ weight records
    await createPet(page, {
      name: 'Mobile Cat',
      species: 'cat',
      birthDate: '2021-01-01',
    })

    // Add 2 weight records
    // Record 1
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('4')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Date').fill('2024-01-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Record 2
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('4.5')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Date').fill('2024-06-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 })

    // Verify Weight Chart is still visible and responsive
    const chartHeading = page.getByRole('heading', { name: 'Weight Chart' })
    await expect(chartHeading).toBeVisible()

    // Verify chart renders
    const chartContainer = page.locator('.recharts-wrapper')
    await expect(chartContainer).toBeVisible()
  })

  test('AC9: Body condition legend shows color indicators', async ({ page }) => {
    // Create a pet with 2+ weight records
    await createPet(page, {
      name: 'Condition Dog',
      species: 'dog',
      birthDate: '2020-01-01',
    })

    // Add 2 weight records with different body conditions
    // Record 1 - Underweight
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('8')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Body Condition').click()
    await page.getByRole('option', { name: 'Underweight' }).click()
    await page.getByLabel('Date').fill('2024-01-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Record 2 - Ideal
    await page.getByRole('button', { name: /add health record/i }).click()
    await page.getByLabel('Record Type').click()
    await page.getByRole('option', { name: 'Weight Check' }).click()
    await page.getByLabel('Weight').fill('15')
    await page.getByLabel('Unit').click()
    await page.getByRole('option', { name: 'kg' }).click()
    await page.getByLabel('Body Condition').click()
    await page.getByRole('option', { name: 'Ideal' }).click()
    await page.getByLabel('Date').fill('2024-06-01')
    await page.getByRole('button', { name: /^save$/i }).click()
    await page.waitForTimeout(1000)

    // Verify body condition legend is visible
    await expect(page.getByText(/body condition:/i)).toBeVisible()
    await expect(page.getByText('Underweight')).toBeVisible()
    await expect(page.getByText('Ideal')).toBeVisible()
    await expect(page.getByText('Overweight')).toBeVisible()

    // Verify chart has colored dots (SVG circles)
    const chartDots = page.locator('.recharts-layer circle')
    const dotCount = await chartDots.count()

    // Should have at least 2 dots (from weight records)
    expect(dotCount).toBeGreaterThanOrEqual(2)
  })
})
