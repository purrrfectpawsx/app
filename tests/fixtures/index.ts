/**
 * Custom Playwright Fixtures
 *
 * Provides reusable, composable test fixtures that eliminate setup boilerplate.
 * Fixtures automatically handle setup and teardown, and can depend on other fixtures.
 *
 * Usage:
 * ```typescript
 * import { test, expect } from '../fixtures'
 *
 * test('Test with authenticated user', async ({ authenticatedUser }) => {
 *   // User already authenticated, ready to test!
 * })
 *
 * test('Test with pet ready', async ({ petWithUser }) => {
 *   // User authenticated AND pet created!
 *   const { pet } = petWithUser
 * })
 * ```
 */

import { test as base, expect, Page } from '@playwright/test'
import { UserFactory, PetFactory, HealthRecordFactory } from '../factories'
import { PetDetailPage, PetsGridPage, CreateHealthRecordDialog } from '../page-objects'
import { authenticateTestUser } from '../utils/auth'
import { createPet } from '../utils/pets'
import { createHealthRecord } from '../utils/healthRecords'

// ============================================================================
// Fixture Types
// ============================================================================

type UserData = ReturnType<typeof UserFactory.build>
type PetData = ReturnType<typeof PetFactory.build>
type HealthRecordData = ReturnType<typeof HealthRecordFactory.build>

export interface AuthenticatedUserFixture {
  user: UserData
}

export interface PetWithUserFixture {
  user: UserData
  pet: PetData
}

export interface PetDetailReadyFixture {
  user: UserData
  pet: PetData
  petDetailPage: PetDetailPage
}

export interface HealthRecordReadyFixture {
  user: UserData
  pet: PetData
  petDetailPage: PetDetailPage
  healthDialog: CreateHealthRecordDialog
}

export interface PetWithHealthRecordsFixture {
  user: UserData
  pet: PetData
  healthRecords: HealthRecordData[]
}

// ============================================================================
// Custom Fixtures Definition
// ============================================================================

export const test = base.extend<{
  /**
   * Authenticated user fixture
   * Provides a user that's already logged in
   */
  authenticatedUser: AuthenticatedUserFixture

  /**
   * Pet with authenticated user fixture
   * Provides a user + a created pet
   */
  petWithUser: PetWithUserFixture

  /**
   * Pet detail page ready fixture
   * Provides user + pet + PetDetailPage already navigated
   */
  petDetailReady: PetDetailReadyFixture

  /**
   * Health record dialog ready fixture
   * Provides everything + dialog open and ready
   */
  healthRecordReady: HealthRecordReadyFixture

  /**
   * Pet with health records fixture
   * Provides user + pet + multiple health records
   */
  petWithHealthRecords: PetWithHealthRecordsFixture

  /**
   * Pets grid page ready fixture
   * Provides authenticated user on the pets grid page
   */
  petsGridReady: PetsGridPage
}>({
  /**
   * Fixture: Authenticated User
   * Creates and authenticates a test user
   */
  authenticatedUser: async ({ page }, use) => {
    const user = UserFactory.build()
    await authenticateTestUser(page, user)

    await use({ user })

    // Cleanup: logout if needed
    // await logout(page)
  },

  /**
   * Fixture: Pet with User
   * Depends on: authenticatedUser
   * Creates a pet for the authenticated user
   */
  petWithUser: async ({ page, authenticatedUser }, use) => {
    const pet = PetFactory.buildDog()
    await createPet(page, pet)

    await use({
      user: authenticatedUser.user,
      pet,
    })

    // Cleanup: delete pet if needed
    // await deletePet(page, pet.id)
  },

  /**
   * Fixture: Pet Detail Page Ready
   * Depends on: petWithUser
   * Navigates to the pet detail page with POM ready
   */
  petDetailReady: async ({ page, petWithUser }, use) => {
    const petDetailPage = new PetDetailPage(page)

    // Get the pet ID from URL (we're already on pet detail after creation)
    const petId = await petDetailPage.getPetId()
    if (!petId) {
      throw new Error('Failed to get pet ID from URL')
    }

    await use({
      user: petWithUser.user,
      pet: petWithUser.pet,
      petDetailPage,
    })
  },

  /**
   * Fixture: Health Record Dialog Ready
   * Depends on: petDetailReady
   * Opens the health record dialog and provides POM
   */
  healthRecordReady: async ({ page, petDetailReady }, use) => {
    const { petDetailPage, user, pet } = petDetailReady

    // Switch to Health tab and open dialog
    await petDetailPage.switchToTab('health')
    await petDetailPage.clickAddHealthRecord()

    const healthDialog = new CreateHealthRecordDialog(page)
    await healthDialog.assertDialogOpen()

    await use({
      user,
      pet,
      petDetailPage,
      healthDialog,
    })

    // Cleanup: close dialog if still open
    try {
      await healthDialog.clickCancel()
    } catch {
      // Dialog might already be closed
    }
  },

  /**
   * Fixture: Pet with Health Records
   * Depends on: petWithUser
   * Creates a pet with multiple health records
   */
  petWithHealthRecords: async ({ page, petWithUser }, use) => {
    // Create 3 different types of health records
    const healthRecords = [
      HealthRecordFactory.buildVaccine({
        title: 'Rabies Vaccine',
        date: '2025-11-15',
      }),
      HealthRecordFactory.buildMedication({
        title: 'Antibiotics',
        date: '2025-11-10',
      }),
      HealthRecordFactory.buildVetVisit({
        title: 'Annual Checkup',
        date: '2025-11-05',
      }),
    ]

    // Create all health records
    for (const record of healthRecords) {
      await createHealthRecord(page, record)
    }

    await use({
      user: petWithUser.user,
      pet: petWithUser.pet,
      healthRecords,
    })

    // Cleanup: delete records if needed
  },

  /**
   * Fixture: Pets Grid Ready
   * Depends on: authenticatedUser
   * Navigates to pets grid with POM ready
   */
  petsGridReady: async ({ page, authenticatedUser }, use) => {
    const petsGridPage = new PetsGridPage(page)
    await petsGridPage.goto()

    await use(petsGridPage)
  },
})

// Re-export expect for convenience
export { expect }

// ============================================================================
// Fixture Composition Examples
// ============================================================================

/**
 * USAGE EXAMPLES:
 *
 * 1. Simple authenticated test:
 * ```typescript
 * test('View pets list', async ({ authenticatedUser, page }) => {
 *   await page.goto('/pets')
 *   // User already authenticated!
 * })
 * ```
 *
 * 2. Test with pet already created:
 * ```typescript
 * test('Edit pet details', async ({ petWithUser }) => {
 *   const { pet } = petWithUser
 *   // User authenticated AND pet created!
 * })
 * ```
 *
 * 3. Test with page ready:
 * ```typescript
 * test('View health tab', async ({ petDetailReady }) => {
 *   const { petDetailPage } = petDetailReady
 *   await petDetailPage.switchToTab('health')
 *   // Everything already set up!
 * })
 * ```
 *
 * 4. Test with dialog ready:
 * ```typescript
 * test('Create vaccine', async ({ healthRecordReady }) => {
 *   const { healthDialog } = healthRecordReady
 *   await healthDialog.fillTitle('Rabies Vaccine')
 *   await healthDialog.clickSave()
 *   // Dialog already open, ready to fill!
 * })
 * ```
 *
 * 5. Test with test data ready:
 * ```typescript
 * test('Filter health records', async ({ petWithHealthRecords }) => {
 *   const { healthRecords } = petWithHealthRecords
 *   // Pet with 3 health records already created!
 * })
 * ```
 */
