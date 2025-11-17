/**
 * Test Data Factories
 *
 * Provides factory functions for generating consistent test data across all E2E tests.
 * Uses the Factory pattern to create valid test entities with sensible defaults.
 */

import { faker } from '@faker-js/faker'

// ============================================================================
// User Factory
// ============================================================================

export interface UserFactoryData {
  name?: string
  email?: string
  password?: string
}

export class UserFactory {
  static build(overrides: UserFactoryData = {}): Required<UserFactoryData> {
    return {
      name: overrides.name ?? faker.person.fullName(),
      email: overrides.email ?? faker.internet.email().toLowerCase(),
      password: overrides.password ?? 'Test123!@#',
    }
  }

  static buildBatch(count: number, overrides: UserFactoryData = {}): Required<UserFactoryData>[] {
    return Array.from({ length: count }, () => this.build(overrides))
  }
}

// ============================================================================
// Pet Factory
// ============================================================================

export interface PetFactoryData {
  name?: string
  species?: 'cat' | 'dog'
  breed?: string
  birthDate?: string
  gender?: 'male' | 'female'
  color?: string
  microchipId?: string
  weight?: number
  weightUnit?: 'kg' | 'lbs'
}

export class PetFactory {
  private static readonly DOG_BREEDS = [
    'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
    'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler'
  ]

  private static readonly CAT_BREEDS = [
    'Persian', 'Maine Coon', 'Siamese', 'Ragdoll',
    'Bengal', 'British Shorthair', 'Abyssinian', 'Sphynx'
  ]

  static build(overrides: PetFactoryData = {}): Required<PetFactoryData> {
    const species = overrides.species ?? faker.helpers.arrayElement(['cat', 'dog'] as const)
    const breeds = species === 'dog' ? this.DOG_BREEDS : this.CAT_BREEDS

    return {
      name: overrides.name ?? faker.person.firstName(),
      species,
      breed: overrides.breed ?? faker.helpers.arrayElement(breeds),
      birthDate: overrides.birthDate ?? faker.date.past({ years: 5 }).toISOString().split('T')[0],
      gender: overrides.gender ?? faker.helpers.arrayElement(['male', 'female'] as const),
      color: overrides.color ?? faker.color.human(),
      microchipId: overrides.microchipId ?? faker.string.alphanumeric(15).toUpperCase(),
      weight: overrides.weight ?? (species === 'cat' ? faker.number.float({ min: 3, max: 7, precision: 0.1 }) : faker.number.float({ min: 10, max: 40, precision: 0.1 })),
      weightUnit: overrides.weightUnit ?? 'kg',
    }
  }

  static buildBatch(count: number, overrides: PetFactoryData = {}): Required<PetFactoryData>[] {
    return Array.from({ length: count }, () => this.build(overrides))
  }

  static buildDog(overrides: Omit<PetFactoryData, 'species'> = {}): Required<PetFactoryData> {
    return this.build({ ...overrides, species: 'dog' })
  }

  static buildCat(overrides: Omit<PetFactoryData, 'species'> = {}): Required<PetFactoryData> {
    return this.build({ ...overrides, species: 'cat' })
  }
}

// ============================================================================
// Health Record Factory
// ============================================================================

export type RecordType = 'vaccine' | 'medication' | 'vet_visit' | 'symptom' | 'weight_check'

export interface HealthRecordFactoryData {
  record_type?: RecordType
  title?: string
  date?: string
  notes?: string
  vaccine_data?: VaccineData
  medication_data?: MedicationData
  vet_visit_data?: VetVisitData
  symptom_data?: SymptomData
  weight_check_data?: WeightCheckData
}

export interface VaccineData {
  expiration_date?: string
  vet_clinic?: string
  dose?: string
  batch_number?: string
}

export interface MedicationData {
  dosage?: string
  frequency?: string
  start_date?: string
  end_date?: string
  prescribing_vet?: string
}

export interface VetVisitData {
  clinic?: string
  vet_name?: string
  reason?: string
  diagnosis?: string
  treatment?: string
  cost?: number
  follow_up_date?: string
}

export interface SymptomData {
  severity?: 'mild' | 'moderate' | 'severe'
  duration?: string
  treatment_given?: string
}

export interface WeightCheckData {
  weight?: number
  unit?: 'kg' | 'lbs'
  body_condition?: 'underweight' | 'ideal' | 'overweight'
  measured_by?: string
}

export class HealthRecordFactory {
  static build(overrides: HealthRecordFactoryData = {}): Required<HealthRecordFactoryData> {
    const recordType = overrides.record_type ?? 'vaccine'

    return {
      record_type: recordType,
      title: overrides.title ?? this.getDefaultTitle(recordType),
      date: overrides.date ?? faker.date.recent({ days: 30 }).toISOString().split('T')[0],
      notes: overrides.notes ?? faker.lorem.sentence(),
      vaccine_data: overrides.vaccine_data ?? (recordType === 'vaccine' ? this.buildVaccineData() : null) as any,
      medication_data: overrides.medication_data ?? (recordType === 'medication' ? this.buildMedicationData() : null) as any,
      vet_visit_data: overrides.vet_visit_data ?? (recordType === 'vet_visit' ? this.buildVetVisitData() : null) as any,
      symptom_data: overrides.symptom_data ?? (recordType === 'symptom' ? this.buildSymptomData() : null) as any,
      weight_check_data: overrides.weight_check_data ?? (recordType === 'weight_check' ? this.buildWeightCheckData() : null) as any,
    }
  }

  static buildVaccine(overrides: Omit<HealthRecordFactoryData, 'record_type'> = {}): Required<HealthRecordFactoryData> {
    return this.build({ ...overrides, record_type: 'vaccine' })
  }

  static buildMedication(overrides: Omit<HealthRecordFactoryData, 'record_type'> = {}): Required<HealthRecordFactoryData> {
    return this.build({ ...overrides, record_type: 'medication' })
  }

  static buildVetVisit(overrides: Omit<HealthRecordFactoryData, 'record_type'> = {}): Required<HealthRecordFactoryData> {
    return this.build({ ...overrides, record_type: 'vet_visit' })
  }

  static buildSymptom(overrides: Omit<HealthRecordFactoryData, 'record_type'> = {}): Required<HealthRecordFactoryData> {
    return this.build({ ...overrides, record_type: 'symptom' })
  }

  static buildWeightCheck(overrides: Omit<HealthRecordFactoryData, 'record_type'> = {}): Required<HealthRecordFactoryData> {
    return this.build({ ...overrides, record_type: 'weight_check' })
  }

  static buildBatch(count: number, overrides: HealthRecordFactoryData = {}): Required<HealthRecordFactoryData>[] {
    return Array.from({ length: count }, () => this.build(overrides))
  }

  private static getDefaultTitle(recordType: RecordType): string {
    switch (recordType) {
      case 'vaccine':
        return faker.helpers.arrayElement(['Rabies', 'DHPP', 'Bordetella', 'FVRCP', 'FeLV'])
      case 'medication':
        return faker.helpers.arrayElement(['Antibiotics', 'Pain Relief', 'Anti-inflammatory', 'Dewormer'])
      case 'vet_visit':
        return faker.helpers.arrayElement(['Annual Checkup', 'Vaccination', 'Follow-up', 'Emergency Visit'])
      case 'symptom':
        return faker.helpers.arrayElement(['Vomiting', 'Diarrhea', 'Coughing', 'Limping', 'Lethargy'])
      case 'weight_check':
        return 'Regular Weight Check'
    }
  }

  private static buildVaccineData(): VaccineData {
    const today = new Date()
    const expirationDate = new Date(today)
    expirationDate.setFullYear(today.getFullYear() + 1)

    return {
      expiration_date: expirationDate.toISOString().split('T')[0],
      vet_clinic: faker.company.name() + ' Veterinary Clinic',
      dose: faker.helpers.arrayElement(['1ml', '0.5ml', '2ml']),
      batch_number: faker.string.alphanumeric(10).toUpperCase(),
    }
  }

  private static buildMedicationData(): MedicationData {
    const startDate = faker.date.recent({ days: 7 })
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + faker.number.int({ min: 7, max: 30 }))

    return {
      dosage: faker.helpers.arrayElement(['500mg', '250mg', '100mg', '1 tablet']),
      frequency: faker.helpers.arrayElement(['Once daily', 'Twice daily', 'Three times daily', 'As needed']),
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      prescribing_vet: 'Dr. ' + faker.person.lastName(),
    }
  }

  private static buildVetVisitData(): VetVisitData {
    return {
      clinic: faker.company.name() + ' Animal Hospital',
      vet_name: 'Dr. ' + faker.person.lastName(),
      reason: faker.helpers.arrayElement(['Annual checkup', 'Vaccination', 'Illness', 'Injury']),
      diagnosis: faker.helpers.arrayElement(['Healthy', 'Minor infection', 'Needs follow-up']),
      treatment: faker.lorem.sentence(),
      cost: faker.number.float({ min: 50, max: 500, precision: 0.01 }),
      follow_up_date: faker.date.future({ days: 30 }).toISOString().split('T')[0],
    }
  }

  private static buildSymptomData(): SymptomData {
    return {
      severity: faker.helpers.arrayElement(['mild', 'moderate', 'severe'] as const),
      duration: faker.helpers.arrayElement(['< 1 day', '1-3 days', '3-7 days', '> 1 week']),
      treatment_given: faker.lorem.sentence(),
    }
  }

  private static buildWeightCheckData(): WeightCheckData {
    return {
      weight: faker.number.float({ min: 3, max: 40, precision: 0.1 }),
      unit: faker.helpers.arrayElement(['kg', 'lbs'] as const),
      body_condition: faker.helpers.arrayElement(['underweight', 'ideal', 'overweight'] as const),
      measured_by: faker.person.fullName(),
    }
  }
}

// ============================================================================
// Export convenience functions
// ============================================================================

export const factories = {
  user: UserFactory,
  pet: PetFactory,
  healthRecord: HealthRecordFactory,
}

export default factories
