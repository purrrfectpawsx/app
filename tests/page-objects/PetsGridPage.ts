/**
 * Page Object Model: Pets Grid Page
 *
 * Encapsulates all interactions with the main pets listing page, including:
 * - Navigation
 * - Pet card interactions
 * - Filtering and searching
 * - Pet creation
 */

import { Page, Locator, expect } from '@playwright/test'

export class PetsGridPage {
  readonly page: Page

  // Page elements
  readonly pageTitle: Locator
  readonly addPetButton: Locator
  readonly searchInput: Locator
  readonly speciesFilter: Locator
  readonly emptyState: Locator

  // Pet cards
  readonly petCards: Locator

  constructor(page: Page) {
    this.page = page

    // Main page elements
    this.pageTitle = page.getByRole('heading', { name: /my pets/i })
    this.addPetButton = page.getByRole('button', { name: /add pet/i }).first()
    this.searchInput = page.getByPlaceholder(/search pets/i)
    this.speciesFilter = page.getByRole('combobox', { name: /species/i })
    this.emptyState = page.getByText(/you haven't added any pets yet/i)

    // Pet cards
    this.petCards = page.locator('[data-testid="pet-card"]')
  }

  /**
   * Navigate to the pets grid page
   */
  async goto() {
    await this.page.goto('/pets')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click the "Add Pet" button
   */
  async clickAddPet() {
    await this.addPetButton.click()
    // Wait for dialog or navigation
    await this.page.waitForTimeout(300)
  }

  /**
   * Search for pets by name
   */
  async searchPets(query: string) {
    await this.searchInput.fill(query)
    await this.page.waitForTimeout(500) // Wait for debounce
  }

  /**
   * Filter pets by species
   */
  async filterBySpecies(species: 'cat' | 'dog' | 'all') {
    await this.speciesFilter.click()

    const optionMap = {
      cat: 'Cats',
      dog: 'Dogs',
      all: 'All Pets',
    }

    await this.page.getByRole('option', { name: optionMap[species] }).click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Click on a pet card by name
   */
  async clickPetByName(petName: string) {
    await this.page.getByText(petName).first().click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Click on a pet card by index
   */
  async clickPetByIndex(index: number = 0) {
    await this.petCards.nth(index).click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Get the number of pet cards displayed
   */
  async getPetCount(): Promise<number> {
    return await this.petCards.count()
  }

  /**
   * Get all pet names from the grid
   */
  async getAllPetNames(): Promise<string[]> {
    const count = await this.getPetCount()
    const names: string[] = []

    for (let i = 0; i < count; i++) {
      const card = this.petCards.nth(i)
      const name = await card.locator('[class*="font-semibold"]').first().textContent()
      if (name) names.push(name.trim())
    }

    return names
  }

  /**
   * Check if empty state is displayed
   */
  async hasEmptyState(): Promise<boolean> {
    return await this.emptyState.isVisible()
  }

  /**
   * Verify a pet card exists with the given name
   */
  async hasPetWithName(petName: string): Promise<boolean> {
    const names = await this.getAllPetNames()
    return names.includes(petName)
  }

  /**
   * Click the edit button on a pet card
   */
  async clickEditPet(petName: string) {
    const petCard = this.page.locator('[data-testid="pet-card"]').filter({ hasText: petName })
    await petCard.getByRole('button', { name: /edit/i }).click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  /**
   * Click the delete button on a pet card
   */
  async clickDeletePet(petName: string) {
    const petCard = this.page.locator('[data-testid="pet-card"]').filter({ hasText: petName })
    await petCard.getByRole('button', { name: /delete/i }).click()
    await this.page.waitForSelector('[role="dialog"]', { state: 'visible' })
  }

  /**
   * Verify the page is loaded correctly
   */
  async assertPageLoaded() {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.addPetButton).toBeVisible()
  }

  /**
   * Verify a specific number of pets are displayed
   */
  async assertPetCount(expectedCount: number) {
    const actualCount = await this.getPetCount()
    expect(actualCount).toBe(expectedCount)
  }

  /**
   * Verify a pet exists in the grid
   */
  async assertPetExists(petName: string) {
    const exists = await this.hasPetWithName(petName)
    expect(exists).toBe(true)
  }

  /**
   * Verify empty state is shown
   */
  async assertEmptyState() {
    await expect(this.emptyState).toBeVisible()
  }
}
