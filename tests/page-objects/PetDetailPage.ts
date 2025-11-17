/**
 * Page Object Model: Pet Detail Page
 *
 * Encapsulates all interactions with the pet detail page, including:
 * - Navigation
 * - Tab switching
 * - Health records management
 * - Pet information viewing/editing
 */

import { Page, Locator, expect } from '@playwright/test'

export class PetDetailPage {
  readonly page: Page
  readonly petIdRegex = /\/pets\/([a-f0-9-]+)/

  // Page elements
  readonly backButton: Locator
  readonly petName: Locator
  readonly editButton: Locator
  readonly deleteButton: Locator

  // Tabs
  readonly healthTab: Locator
  readonly expensesTab: Locator
  readonly remindersTab: Locator
  readonly documentsTab: Locator

  // Health tab elements
  readonly addHealthRecordButton: Locator
  readonly healthTimeline: Locator
  readonly timelineFilters: Locator
  readonly weightChart: Locator

  constructor(page: Page) {
    this.page = page

    // Header elements
    this.backButton = page.getByRole('button', { name: /back to pets/i })
    this.petName = page.locator('h1')
    this.editButton = page.getByRole('button', { name: /^edit$/i })
    this.deleteButton = page.getByRole('button', { name: /delete/i })

    // Tabs
    this.healthTab = page.getByRole('tab', { name: /health/i })
    this.expensesTab = page.getByRole('tab', { name: /expenses/i })
    this.remindersTab = page.getByRole('tab', { name: /reminders/i })
    this.documentsTab = page.getByRole('tab', { name: /documents/i })

    // Health tab elements
    this.addHealthRecordButton = page.getByRole('button', { name: /add health record/i }).first()
    this.healthTimeline = page.locator('[class*="space-y-4"]').filter({ hasText: /vaccine|medication|vet visit/i }).first()
    this.timelineFilters = page.locator('[role="group"]', { hasText: /filter/i })
    this.weightChart = page.getByRole('heading', { name: /weight chart/i })
  }

  /**
   * Navigate to a specific pet's detail page
   */
  async goto(petId: string) {
    await this.page.goto(`/pets/${petId}`)
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get the current pet ID from the URL
   */
  async getPetId(): Promise<string | null> {
    const url = this.page.url()
    const match = url.match(this.petIdRegex)
    return match ? match[1] : null
  }

  /**
   * Switch to a specific tab
   */
  async switchToTab(tab: 'health' | 'expenses' | 'reminders' | 'documents') {
    const tabMap = {
      health: this.healthTab,
      expenses: this.expensesTab,
      reminders: this.remindersTab,
      documents: this.documentsTab,
    }
    await tabMap[tab].click()
    await this.page.waitForTimeout(300) // Wait for tab content to render
  }

  /**
   * Click the "Add Health Record" button
   */
  async clickAddHealthRecord() {
    await this.addHealthRecordButton.click()
    // Wait for dialog to appear
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  /**
   * Get all health records from the timeline
   */
  async getHealthRecords() {
    const recordCards = this.page.locator('[class*="border"]').filter({ hasText: /vaccine|medication/i })
    const count = await recordCards.count()

    const records = []
    for (let i = 0; i < count; i++) {
      const card = recordCards.nth(i)
      const title = await card.locator('[class*="font-semibold"]').first().textContent()
      const date = await card.locator('[class*="text-gray"]').first().textContent()
      records.push({ title, date })
    }

    return records
  }

  /**
   * Check if empty state is shown
   */
  async hasEmptyState(): Promise<boolean> {
    return await this.page.getByText(/add your first health record/i).isVisible()
  }

  /**
   * Click a health record card to expand it
   */
  async expandHealthRecord(index: number = 0) {
    const cards = this.page.locator('[class*="border"]').filter({ hasText: /vaccine|medication/i })
    await cards.nth(index).click()
    await this.page.waitForTimeout(300) // Wait for expansion animation
  }

  /**
   * Get pet information from the page
   */
  async getPetInfo() {
    const name = await this.petName.textContent()
    const species = await this.page.locator('p').filter({ hasText: /cat|dog/i }).first().textContent()

    return {
      name: name?.trim() || '',
      species: species?.toLowerCase().includes('cat') ? 'cat' : 'dog',
    }
  }

  /**
   * Click the Edit button for the pet
   */
  async clickEditPet() {
    await this.editButton.click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  /**
   * Click the Delete button for the pet
   */
  async clickDeletePet() {
    await this.deleteButton.click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  /**
   * Click the Back button to return to pets list
   */
  async clickBack() {
    await this.backButton.click()
    await this.page.waitForURL(/\/pets$/)
  }

  /**
   * Verify the page is loaded correctly
   */
  async assertPageLoaded() {
    await expect(this.petName).toBeVisible()
    await expect(this.healthTab).toBeVisible()
  }
}
