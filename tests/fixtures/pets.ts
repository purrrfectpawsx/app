/**
 * Test Fixtures - Pet Data
 *
 * Predefined test data for pet-related scenarios.
 * Use these fixtures for consistent test data across tests.
 */

export interface TestPet {
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string;
  birthDate?: string;
  gender?: 'male' | 'female' | 'unknown';
  spayedNeutered?: boolean;
  microchip?: string;
  notes?: string;
}

/**
 * Predefined pet test data
 */
export const TEST_PETS: Record<string, TestPet> = {
  /** Basic dog with minimum fields */
  basicDog: {
    name: 'Max',
    species: 'dog',
  },

  /** Complete dog profile with all fields */
  completeDog: {
    name: 'Buddy',
    species: 'dog',
    breed: 'Golden Retriever',
    birthDate: '2020-01-15',
    gender: 'male',
    spayedNeutered: true,
    microchip: '123456789012345',
    notes: 'Very friendly, loves treats',
  },

  /** Cat with some optional fields */
  partialCat: {
    name: 'Whiskers',
    species: 'cat',
    breed: 'Siamese',
    birthDate: '2021-06-20',
  },

  /** Bird with minimum fields */
  basicBird: {
    name: 'Tweety',
    species: 'bird',
  },

  /** Rabbit with some fields */
  basicRabbit: {
    name: 'Fluffy',
    species: 'rabbit',
    gender: 'female',
  },

  /** Other species */
  basicOther: {
    name: 'Speedy',
    species: 'other',
    breed: 'Tortoise',
  },
};

/**
 * Generate unique pet name for tests
 */
export function generatePetName(species: string = 'pet'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `Test ${species} ${timestamp}${random}`;
}

/**
 * Generate test pet data with unique name
 */
export function generateTestPet(
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other' = 'dog',
  partial: Partial<TestPet> = {}
): TestPet {
  return {
    name: generatePetName(species),
    species,
    ...partial,
  };
}

/**
 * Test photo files for upload testing
 * These represent file metadata for different test scenarios
 */
export const TEST_PHOTOS = {
  /** Valid JPG photo under 5MB */
  validJpg: {
    name: 'test-photo.jpg',
    type: 'image/jpeg',
    size: 2 * 1024 * 1024, // 2MB
  },

  /** Valid PNG photo under 5MB */
  validPng: {
    name: 'test-photo.png',
    type: 'image/png',
    size: 3 * 1024 * 1024, // 3MB
  },

  /** Photo over 5MB limit (should be rejected) */
  oversized: {
    name: 'large-photo.jpg',
    type: 'image/jpeg',
    size: 6 * 1024 * 1024, // 6MB
  },

  /** Invalid file type (should be rejected) */
  invalidType: {
    name: 'document.pdf',
    type: 'application/pdf',
    size: 1 * 1024 * 1024, // 1MB
  },

  /** Very small test image */
  tiny: {
    name: 'tiny.jpg',
    type: 'image/jpeg',
    size: 50 * 1024, // 50KB
  },
};

/**
 * Common validation error messages for pet forms
 */
export const PET_ERROR_MESSAGES = {
  validation: {
    nameRequired: /pet name.*required/i,
    nameTooLong: /name.*too long/i,
    speciesRequired: /select.*species/i,
    breedTooLong: /breed.*too long/i,
    birthDateFuture: /birth date.*cannot.*future/i,
    notesTooLong: /notes.*too long/i,
    microchipTooLong: /microchip.*too long/i,
  },
  photo: {
    invalidType: /jpg.*png.*heic/i,
    tooLarge: /less than.*5.*mb/i,
    uploadFailed: /failed.*upload/i,
  },
  freeTier: {
    limitReached: /free.*plan.*allows.*1.*pet/i,
    upgradeToPremium: /upgrade.*premium/i,
  },
};

/**
 * Success messages to verify
 */
export const PET_SUCCESS_MESSAGES = {
  created: /pet.*created.*successfully/i,
  updated: /pet.*updated.*successfully/i,
  deleted: /pet.*deleted.*successfully/i,
};
