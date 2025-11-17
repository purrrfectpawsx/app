import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait'
import { authenticateTestUser, generateTestEmail, generateTestPassword } from '../utils/auth'
import { createPet } from '../utils/pets'
import { generateTestPet } from '../fixtures/pets'
import { createHealthRecord } from '../utils/healthRecords'

test.describe('Story 3.4: View Health Timeline with Color Coding', () => {
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

    // Navigate to Health tab
    await page.getByRole('tab', { name: /health/i }).click()
  })

  test('AC1 & AC7: Empty timeline shows empty state with CTA', async ({ page }) => {
    // Already on Health tab from beforeEach
    // Verify empty state
    await expect(page.getByText('Add your first health record')).toBeVisible()
    await expect(page.getByText(/Start tracking your pet's health history/)).toBeVisible()

    // Verify CTA button exists
    const ctaButton = page.getByRole('button', { name: /Add Health Record/i }).first()
    await expect(ctaButton).toBeVisible()
  })

  test('AC1 & AC2: Health records appear in timeline with correct structure', async ({
    page,
  }) => {
    // Create test health records
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Rabies Vaccine',
      date: '2025-11-10',
      vaccine_data: {
        expiration_date: '2026-11-10',
        vet_clinic: 'Happy Paws Clinic',
        dose: '1ml',
      },
    })

    await createHealthRecord(page, {
      record_type: 'vet_visit',
      title: 'Annual Checkup',
      date: '2025-11-05',
      vet_visit_data: {
        clinic: 'Happy Paws Clinic',
        vet_name: 'Smith',
        diagnosis: 'Healthy',
        cost: 150,
      },
    })

    // Navigate to pet detail health tab    // Verify both records are displayed
    await expect(page.getByText('Rabies Vaccine')).toBeVisible()
    await expect(page.getByText('Annual Checkup')).toBeVisible()

    // Verify date is displayed for each record
    await expect(page.getByText('Nov 10, 2025')).toBeVisible()
    await expect(page.getByText('Nov 5, 2025')).toBeVisible()
  })

  test('AC1: Timeline sorted newest first', async ({ page }) => {
    // Create records with different dates
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Oldest Record',
      date: '2025-11-01',
    })

    await createHealthRecord(page, {
      record_type: 'medication',
      title: 'Middle Record',
      date: '2025-11-10',
    })

    await createHealthRecord(page, {
      record_type: 'vet_visit',
      title: 'Newest Record',
      date: '2025-11-15',
    })

    // Navigate to timeline    // Get all record titles in order
    const recordTitles = await page.locator('[class*="border"]').allTextContents()
    const titles = recordTitles.join(' ')

    // Verify newest appears before middle, and middle before oldest
    const newestIndex = titles.indexOf('Newest Record')
    const middleIndex = titles.indexOf('Middle Record')
    const oldestIndex = titles.indexOf('Oldest Record')

    expect(newestIndex).toBeLessThan(middleIndex)
    expect(middleIndex).toBeLessThan(oldestIndex)
  })

  test('AC2 & AC3: Color coding correct for each record type', async ({ page }) => {
    // Create one of each record type
    const recordTypes = [
      { type: 'vaccine', title: 'Vaccine Record', colorClass: 'blue' },
      { type: 'medication', title: 'Medication Record', colorClass: 'purple' },
      { type: 'vet_visit', title: 'Vet Visit Record', colorClass: 'green' },
      { type: 'symptom', title: 'Symptom Record', colorClass: 'orange' },
      { type: 'weight_check', title: 'Weight Check Record', colorClass: 'teal' },
    ]

    for (const record of recordTypes) {
      await createHealthRecord(page, {
        record_type: record.type as any,
        title: record.title,
        date: '2025-11-15',
      })
    }

    // Navigate to timeline    // Verify all records are visible
    for (const record of recordTypes) {
      await expect(page.getByText(record.title)).toBeVisible()

      // Find the card containing this title and verify color class
      const card = page.locator(`div:has-text("${record.title}")`).first()
      const className = await card.getAttribute('class')
      expect(className).toContain(record.colorClass)
    }
  })

  test('AC4: Overdue vaccine highlighted with red border/background', async ({ page }) => {
    // Create overdue vaccine (expiration date in the past)
    const pastDate = new Date()
    pastDate.setDate(pastDate.getDate() - 30) // 30 days ago

    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Overdue Vaccine',
      date: '2025-01-01',
      vaccine_data: {
        expiration_date: pastDate.toISOString().split('T')[0],
      },
    })

    // Create current vaccine (expiration date in the future)
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30) // 30 days from now

    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Current Vaccine',
      date: '2025-11-01',
      vaccine_data: {
        expiration_date: futureDate.toISOString().split('T')[0],
      },
    })

    // Navigate to timeline    // Verify overdue vaccine has red styling and OVERDUE badge
    const overdueCard = page.locator('div:has-text("Overdue Vaccine")').first()
    const overdueClassName = await overdueCard.getAttribute('class')
    expect(overdueClassName).toContain('red')

    await expect(page.getByText('OVERDUE')).toBeVisible()

    // Verify current vaccine has normal blue styling
    const currentCard = page.locator('div:has-text("Current Vaccine")').first()
    const currentClassName = await currentCard.getAttribute('class')
    expect(currentClassName).toContain('blue')
    expect(currentClassName).not.toContain('red')
  })

  test('AC5: Clicking timeline entry expands to show full details', async ({ page }) => {
    // Create a vaccine with full details
    await createHealthRecord(page, {
      record_type: 'vaccine',
      title: 'Detailed Vaccine',
      date: '2025-11-15',
      notes: 'This is a detailed note about the vaccine',
      vaccine_data: {
        expiration_date: '2026-11-15',
        vet_clinic: 'Happy Paws Clinic',
        dose: '1ml',
      },
    })

    // Navigate to timeline    // Verify notes are not initially visible (collapsed state)
    await expect(page.getByText('This is a detailed note about the vaccine')).not.toBeVisible()

    // Click the card to expand
    await page.click('div:has-text("Detailed Vaccine")').first()

    // Verify expanded details are now visible
    await expect(page.getByText('This is a detailed note about the vaccine')).toBeVisible()
    await expect(page.getByText('Record Type')).toBeVisible()
    await expect(page.getByText('Expiration Date')).toBeVisible()
    await expect(page.getByText('Vet Clinic')).toBeVisible()
    await expect(page.getByText('Happy Paws Clinic')).toBeVisible()
    await expect(page.getByText('Dose')).toBeVisible()
    await expect(page.getByText('1ml')).toBeVisible()

    // Verify Edit and Delete buttons are visible
    await expect(page.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Delete' })).toBeVisible()

    // Click again to collapse
    await page.click('div:has-text("Detailed Vaccine")').first()

    // Verify details are hidden again
    await expect(page.getByText('Record Type')).not.toBeVisible()
  })

  test('AC6: Timeline loads in <3 seconds for 100+ records', async ({ page }) => {
    // This test creates 100 records to verify performance
    // In a real scenario, you'd use database seeding for better performance

    const recordCount = 100
    const createPromises = []

    // Create 100 records in batches
    for (let i = 0; i < recordCount; i++) {
      createPromises.push(
        createHealthRecord(page, {
          record_type: 'vaccine',
          title: `Test Record ${i + 1}`,
          date: `2025-${String((i % 12) + 1).padStart(2, '0')}-${String((i % 28) + 1).padStart(2, '0')}`,
        })
      )

      // Create in batches of 10 to avoid overwhelming the system
      if (createPromises.length === 10) {
        await Promise.all(createPromises)
        createPromises.length = 0
      }
    }

    // Create remaining records
    if (createPromises.length > 0) {
      await Promise.all(createPromises)
    }

    // Measure load time
    const startTime = Date.now()    // Wait for first record to be visible (timeline loaded)
    await expect(page.getByText('Test Record 1')).toBeVisible()

    const loadTime = Date.now() - startTime

    // Verify load time is under 3 seconds (3000ms)
    expect(loadTime).toBeLessThan(3000)

    // Verify records are displayed (should show first 50 due to pagination)
    const visibleRecords = await page.locator('[class*="border-"]').count()
    expect(visibleRecords).toBeGreaterThan(0)
    expect(visibleRecords).toBeLessThanOrEqual(50) // Pagination limit
  })

  test('AC2: Each record type displays correct icon', async ({ page }) => {
    const recordTypes = [
      { type: 'vaccine', title: 'Vaccine Icon Test' },
      { type: 'medication', title: 'Medication Icon Test' },
      { type: 'vet_visit', title: 'Vet Visit Icon Test' },
      { type: 'symptom', title: 'Symptom Icon Test' },
      { type: 'weight_check', title: 'Weight Check Icon Test' },
    ]

    for (const record of recordTypes) {
      await createHealthRecord(page, {
        record_type: record.type as any,
        title: record.title,
        date: '2025-11-15',
      })
    }

    // Navigate to timeline    // Verify all records have icons (each card should have an SVG icon)
    for (const record of recordTypes) {
      const card = page.locator(`div:has-text("${record.title}")`).first()
      const icon = card.locator('svg').first()
      await expect(icon).toBeVisible()
    }
  })
})
