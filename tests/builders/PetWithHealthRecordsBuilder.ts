/**
 * Builder Pattern: Pet with Health Records
 *
 * Provides fluent API for building complex test scenarios with pets and health records.
 * Makes test setup more readable and maintainable.
 *
 * Usage:
 * ```typescript
 * const scenario = await new PetWithHealthRecordsBuilder(page)
 *   .withName('Buddy')
 *   .withBreed('Labrador')
 *   .withVaccines(3)
 *   .withMedications(2)
 *   .build()
 * ```
 */

import { Page } from '@playwright/test'
import { PetFactory, HealthRecordFactory } from '../factories'
import { createPet } from '../utils/pets'
import { createHealthRecord } from '../utils/healthRecords'

type PetData = ReturnType<typeof PetFactory.build>
type HealthRecordData = ReturnType<typeof HealthRecordFactory.build>

export interface PetWithHealthRecordsResult {
  pet: PetData
  healthRecords: HealthRecordData[]
  petId: string | null
}

export class PetWithHealthRecordsBuilder {
  private page: Page
  private pet: PetData
  private healthRecords: HealthRecordData[] = []

  constructor(page: Page, species: 'dog' | 'cat' = 'dog') {
    this.page = page
    this.pet = species === 'dog' ? PetFactory.buildDog() : PetFactory.buildCat()
  }

  // ============================================================================
  // Pet Configuration Methods
  // ============================================================================

  /**
   * Set pet name
   */
  withName(name: string): this {
    this.pet.name = name
    return this
  }

  /**
   * Set pet breed
   */
  withBreed(breed: string): this {
    this.pet.breed = breed
    return this
  }

  /**
   * Set pet age (birth date calculated from age)
   */
  withAge(years: number): this {
    const birthDate = new Date()
    birthDate.setFullYear(birthDate.getFullYear() - years)
    this.pet.birthDate = birthDate.toISOString().split('T')[0]
    return this
  }

  /**
   * Set pet weight
   */
  withWeight(weight: number, unit: 'kg' | 'lbs' = 'kg'): this {
    this.pet.weight = weight
    this.pet.weightUnit = unit
    return this
  }

  /**
   * Set pet gender
   */
  withGender(gender: 'male' | 'female'): this {
    this.pet.gender = gender
    return this
  }

  /**
   * Set microchip ID
   */
  withMicrochipId(microchipId: string): this {
    this.pet.microchipId = microchipId
    return this
  }

  // ============================================================================
  // Health Records Configuration Methods
  // ============================================================================

  /**
   * Add multiple vaccine records
   */
  withVaccines(count: number, customData?: Partial<HealthRecordData>): this {
    const vaccines = [
      'Rabies',
      'DHPP',
      'Bordetella',
      'FVRCP',
      'FeLV',
      'Lyme Disease',
      'Canine Influenza',
    ]

    for (let i = 0; i < count; i++) {
      const vaccine = HealthRecordFactory.buildVaccine({
        title: vaccines[i % vaccines.length],
        date: this.getDateDaysAgo(i * 30), // One vaccine every 30 days
        ...customData,
      })
      this.healthRecords.push(vaccine)
    }

    return this
  }

  /**
   * Add a specific vaccine record
   */
  withVaccine(title: string, data?: Partial<HealthRecordData>): this {
    this.healthRecords.push(
      HealthRecordFactory.buildVaccine({
        title,
        ...data,
      })
    )
    return this
  }

  /**
   * Add multiple medication records
   */
  withMedications(count: number, customData?: Partial<HealthRecordData>): this {
    const medications = [
      'Antibiotics',
      'Pain Relief',
      'Anti-inflammatory',
      'Dewormer',
      'Flea & Tick Prevention',
    ]

    for (let i = 0; i < count; i++) {
      const medication = HealthRecordFactory.buildMedication({
        title: medications[i % medications.length],
        date: this.getDateDaysAgo(i * 15), // One medication every 15 days
        ...customData,
      })
      this.healthRecords.push(medication)
    }

    return this
  }

  /**
   * Add a specific medication record
   */
  withMedication(title: string, data?: Partial<HealthRecordData>): this {
    this.healthRecords.push(
      HealthRecordFactory.buildMedication({
        title,
        ...data,
      })
    )
    return this
  }

  /**
   * Add multiple vet visit records
   */
  withVetVisits(count: number, customData?: Partial<HealthRecordData>): this {
    const visitReasons = [
      'Annual Checkup',
      'Follow-up Appointment',
      'Emergency Visit',
      'Vaccination',
      'Dental Cleaning',
    ]

    for (let i = 0; i < count; i++) {
      const visit = HealthRecordFactory.buildVetVisit({
        title: visitReasons[i % visitReasons.length],
        date: this.getDateDaysAgo(i * 90), // One visit every 90 days
        ...customData,
      })
      this.healthRecords.push(visit)
    }

    return this
  }

  /**
   * Add a specific vet visit record
   */
  withVetVisit(title: string, data?: Partial<HealthRecordData>): this {
    this.healthRecords.push(
      HealthRecordFactory.buildVetVisit({
        title,
        ...data,
      })
    )
    return this
  }

  /**
   * Add multiple symptom records
   */
  withSymptoms(count: number, customData?: Partial<HealthRecordData>): this {
    const symptoms = ['Vomiting', 'Diarrhea', 'Coughing', 'Limping', 'Lethargy']

    for (let i = 0; i < count; i++) {
      const symptom = HealthRecordFactory.buildSymptom({
        title: symptoms[i % symptoms.length],
        date: this.getDateDaysAgo(i * 7), // One symptom every 7 days
        ...customData,
      })
      this.healthRecords.push(symptom)
    }

    return this
  }

  /**
   * Add a specific symptom record
   */
  withSymptom(title: string, data?: Partial<HealthRecordData>): this {
    this.healthRecords.push(
      HealthRecordFactory.buildSymptom({
        title,
        ...data,
      })
    )
    return this
  }

  /**
   * Add multiple weight check records
   */
  withWeightChecks(count: number, customData?: Partial<HealthRecordData>): this {
    for (let i = 0; i < count; i++) {
      const weightCheck = HealthRecordFactory.buildWeightCheck({
        title: 'Regular Weight Check',
        date: this.getDateDaysAgo(i * 30), // One check every 30 days
        ...customData,
      })
      this.healthRecords.push(weightCheck)
    }

    return this
  }

  /**
   * Add a specific weight check record
   */
  withWeightCheck(weight: number, data?: Partial<HealthRecordData>): this {
    this.healthRecords.push(
      HealthRecordFactory.buildWeightCheck({
        title: 'Weight Check',
        weight_check_data: { weight, unit: 'kg' } as any,
        ...data,
      })
    )
    return this
  }

  // ============================================================================
  // Scenario Presets
  // ============================================================================

  /**
   * Add a complete health history (vaccines, medications, vet visits)
   */
  withCompleteHealthHistory(): this {
    return this.withVaccines(3).withMedications(2).withVetVisits(2).withWeightChecks(3)
  }

  /**
   * Add basic vaccination history only
   */
  withBasicVaccinations(): this {
    return this.withVaccine('Rabies').withVaccine('DHPP')
  }

  /**
   * Add recent medical issue (symptom + vet visit + medication)
   */
  withRecentMedicalIssue(): this {
    return this.withSymptom('Vomiting', { date: this.getDateDaysAgo(3) })
      .withVetVisit('Emergency Visit', { date: this.getDateDaysAgo(2) })
      .withMedication('Anti-nausea Medication', { date: this.getDateDaysAgo(1) })
  }

  /**
   * Add weight tracking history (for weight chart testing)
   */
  withWeightTrackingHistory(): this {
    // Create weight progression over 6 months
    const baseWeight = this.pet.species === 'cat' ? 4.5 : 25.0
    const weights = [
      baseWeight - 0.5, // 6 months ago
      baseWeight - 0.3, // 5 months ago
      baseWeight - 0.1, // 4 months ago
      baseWeight, // 3 months ago
      baseWeight + 0.2, // 2 months ago
      baseWeight + 0.4, // 1 month ago
    ]

    weights.forEach((weight, i) => {
      this.withWeightCheck(weight, {
        date: this.getDateDaysAgo((weights.length - i) * 30),
      })
    })

    return this
  }

  /**
   * Add senior pet health history (age 10+, regular checkups)
   */
  asSeniorPet(): this {
    return this.withAge(10)
      .withVetVisits(4) // More frequent checkups
      .withMedications(2) // Chronic medications
      .withWeightChecks(6) // Regular weight monitoring
  }

  /**
   * Add puppy/kitten health history (age < 1, multiple vaccines)
   */
  asYoungPet(): this {
    return this.withAge(0.5) // 6 months old
      .withVaccines(4) // Multiple vaccines
      .withWeightChecks(3) // Growth monitoring
  }

  // ============================================================================
  // Build Methods
  // ============================================================================

  /**
   * Build and create the pet with all health records
   * This actually creates the data in the application
   */
  async build(): Promise<PetWithHealthRecordsResult> {
    // Create the pet
    await createPet(this.page, this.pet)

    // Get pet ID from URL
    const petIdMatch = this.page.url().match(/\/pets\/([a-f0-9-]+)/)
    const petId = petIdMatch ? petIdMatch[1] : null

    // Create all health records
    for (const record of this.healthRecords) {
      await createHealthRecord(this.page, record)
    }

    return {
      pet: this.pet,
      healthRecords: this.healthRecords,
      petId,
    }
  }

  /**
   * Get the data without creating it (for API testing or inspection)
   */
  getData(): { pet: PetData; healthRecords: HealthRecordData[] } {
    return {
      pet: this.pet,
      healthRecords: this.healthRecords,
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private getDateDaysAgo(days: number): string {
    const date = new Date()
    date.setDate(date.getDate() - days)
    return date.toISOString().split('T')[0]
  }
}

// ============================================================================
// Convenience Factory Functions
// ============================================================================

/**
 * Create a dog builder
 */
export function buildDog(page: Page): PetWithHealthRecordsBuilder {
  return new PetWithHealthRecordsBuilder(page, 'dog')
}

/**
 * Create a cat builder
 */
export function buildCat(page: Page): PetWithHealthRecordsBuilder {
  return new PetWithHealthRecordsBuilder(page, 'cat')
}
