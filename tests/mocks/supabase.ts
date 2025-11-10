/**
 * Supabase Mock Utilities for Testing
 *
 * Provides mock implementations of Supabase client for fast unit/integration tests.
 * Use real Supabase client for E2E smoke tests only.
 */

import { Page } from '@playwright/test';

export interface MockUser {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  user_metadata: {
    full_name?: string;
    name?: string;
  };
}

export interface MockProfile {
  id: string;
  email: string;
  name: string;
  subscription_tier: 'free' | 'premium';
  created_at: string;
}

export interface MockPet {
  id: string;
  user_id: string;
  name: string;
  species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'other';
  breed?: string | null;
  birth_date?: string | null;
  photo_url?: string | null;
  gender?: 'male' | 'female' | 'unknown' | null;
  spayed_neutered?: boolean;
  microchip?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Mock user database - stores users created during tests
 */
export const mockUserDatabase = new Map<string, MockUser>();
export const mockProfileDatabase = new Map<string, MockProfile>();
export const mockPetDatabase = new Map<string, MockPet>();

/**
 * Reset mock databases between tests
 */
export function resetMockDatabases(): void {
  mockUserDatabase.clear();
  mockProfileDatabase.clear();
  mockPetDatabase.clear();
}

/**
 * Create a mock user for testing
 */
/**
 * Generate a mock UUID (v4 format)
 */
function generateMockUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function createMockUser(email: string, name: string, verified: boolean = true): MockUser {
  const user: MockUser = {
    id: generateMockUUID(),
    email,
    email_confirmed_at: verified ? new Date().toISOString() : null,
    user_metadata: {
      name,
      full_name: name,
    },
  };

  mockUserDatabase.set(email, user);

  // Also create profile
  const profile: MockProfile = {
    id: user.id,
    email: user.email,
    name,
    subscription_tier: 'free',
    created_at: new Date().toISOString(),
  };
  mockProfileDatabase.set(user.id, profile);

  return user;
}

/**
 * Mock Supabase auth responses by intercepting network requests
 */
export async function mockSupabaseAuth(page: Page): Promise<void> {
  // Intercept signup requests
  await page.route('**/auth/v1/signup', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    // Check if user already exists
    if (mockUserDatabase.has(postData.email)) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'User already registered',
          message: 'User already registered',
        }),
      });
      return;
    }

    // Create new user (auto-verified in tests)
    const user = createMockUser(postData.email, postData.data?.name || 'Test User', true);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user,
        access_token: `mock_token_${user.id}`,
        refresh_token: `mock_refresh_${user.id}`,
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
      }),
    });
  });

  // Intercept login requests
  await page.route('**/auth/v1/token?grant_type=password', async (route) => {
    const request = route.request();
    const postData = request.postDataJSON();

    const user = mockUserDatabase.get(postData.email);

    if (!user) {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid login credentials',
          message: 'Invalid login credentials',
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user,
        access_token: `mock_token_${user.id}`,
        refresh_token: `mock_refresh_${user.id}`,
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
      }),
    });
  });

  // Intercept profile queries
  await page.route('**/rest/v1/profiles**', async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === 'GET') {
      // Return all profiles (for user's own profile)
      const profiles = Array.from(mockProfileDatabase.values());
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(profiles),
      });
    } else if (method === 'POST') {
      // Create profile
      const postData = request.postDataJSON();
      const profile: MockProfile = {
        id: postData.id,
        email: postData.email,
        name: postData.name,
        subscription_tier: postData.subscription_tier || 'free',
        created_at: new Date().toISOString(),
      };
      mockProfileDatabase.set(profile.id, profile);

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify([profile]),
      });
    } else {
      await route.continue();
    }
  });

  // Intercept resend verification email
  await page.route('**/auth/v1/resend', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {},
        error: null,
      }),
    });
  });

  // Intercept password reset request
  await page.route('**/auth/v1/recover', async (route) => {
    // Password reset email request - always return success (email enumeration prevention)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {},
        error: null,
      }),
    });
  });

  // Intercept user requests (session check and password update)
  await page.route('**/auth/v1/user', async (route) => {
    const method = route.request().method();
    const authHeader = route.request().headers()['authorization'];

    if (!authHeader) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'No authorization header',
        }),
      });
      return;
    }

    // Extract user ID from mock token (format: mock_token_<uuid>)
    const tokenMatch = authHeader.match(/mock_token_([a-f0-9-]+)/);
    if (!tokenMatch) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Invalid token',
        }),
      });
      return;
    }

    const userId = tokenMatch[1];
    const user = Array.from(mockUserDatabase.values()).find(u => u.id === userId);

    if (!user) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'User not found',
        }),
      });
      return;
    }

    // Handle PUT request (password update via updateUser())
    if (method === 'PUT') {
      // Password update successful (mock - doesn't actually store password)
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(user),
      });
      return;
    }

    // Handle GET request (session check)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(user),
    });
  });

  // Intercept pet CRUD operations
  await page.route('**/rest/v1/pets**', async (route) => {
    const request = route.request();
    const method = request.method();
    const url = request.url();
    const authHeader = request.headers()['authorization'];

    // Extract user ID from auth token (format: mock_token_<uuid>)
    let currentUserId: string | null = null;
    if (authHeader) {
      const tokenMatch = authHeader.match(/mock_token_([a-f0-9-]+)/);
      if (tokenMatch) {
        currentUserId = tokenMatch[1];
      }
    }

    if (!currentUserId) {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'No valid session',
        }),
      });
      return;
    }

    // HEAD - Count pets (used by { count: 'exact', head: true })
    if (method === 'HEAD') {
      const userPets = Array.from(mockPetDatabase.values())
        .filter(pet => pet.user_id === currentUserId);

      await route.fulfill({
        status: 200,
        headers: {
          'content-range': `*/${userPets.length}`,
        },
      });
      return;
    }

    // GET - Fetch pets
    if (method === 'GET') {
      // Check if querying by specific pet ID (not user_id)
      const idMatch = url.match(/[?&]id=eq\.([a-f0-9-]+)/);

      if (idMatch) {
        // Get single pet by ID
        const petId = idMatch[1];
        const pet = mockPetDatabase.get(petId);

        if (!pet || pet.user_id !== currentUserId) {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([]), // Empty array means not found
          });
          return;
        }

        // Check if .single() was used (Accept header indicates single object response)
        const acceptHeader = request.headers()['accept'] || '';
        const returnSingleObject = acceptHeader.includes('application/vnd.pgrst.object+json');

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: returnSingleObject ? JSON.stringify(pet) : JSON.stringify([pet]),
          headers: returnSingleObject ? {} : {
            'content-range': '0-0/1',
          },
        });
      } else {
        // Get all pets for user
        const userPets = Array.from(mockPetDatabase.values())
          .filter(pet => pet.user_id === currentUserId)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(userPets),
          headers: {
            'content-range': `0-${userPets.length - 1}/${userPets.length}`,
          },
        });
      }
      return;
    }

    // POST - Create pet
    if (method === 'POST') {
      const postData = request.postDataJSON();

      // Check free tier limit (1 pet)
      const profile = mockProfileDatabase.get(currentUserId);
      const userPetCount = Array.from(mockPetDatabase.values())
        .filter(pet => pet.user_id === currentUserId).length;

      if (profile?.subscription_tier === 'free' && userPetCount >= 1) {
        // Enforce tier limit unless bypass is set
        const bypassTierLimits = process.env.VITE_BYPASS_TIER_LIMITS === 'true';
        if (!bypassTierLimits) {
          await route.fulfill({
            status: 403,
            contentType: 'application/json',
            body: JSON.stringify({
              error: 'Free tier limit reached',
              message: 'You have reached the maximum number of pets (1) for the free plan.',
            }),
          });
          return;
        }
      }

      const newPet: MockPet = {
        id: generateMockUUID(),
        user_id: currentUserId,
        name: postData.name,
        species: postData.species,
        breed: postData.breed || null,
        birth_date: postData.birth_date || null,
        photo_url: postData.photo_url || null,
        gender: postData.gender || null,
        spayed_neutered: postData.spayed_neutered || false,
        microchip: postData.microchip || null,
        notes: postData.notes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      mockPetDatabase.set(newPet.id, newPet);

      // Check if .single() was used (Accept header indicates single object response)
      const acceptHeader = request.headers()['accept'] || '';
      const returnSingleObject = acceptHeader.includes('application/vnd.pgrst.object+json');

      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: returnSingleObject ? JSON.stringify(newPet) : JSON.stringify([newPet]),
      });
      return;
    }

    // PATCH - Update pet
    if (method === 'PATCH') {
      const idMatch = url.match(/[?&]id=eq\.([a-f0-9-]+)/);

      if (!idMatch) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Pet ID required',
          }),
        });
        return;
      }

      const petId = idMatch[1];
      const pet = mockPetDatabase.get(petId);

      if (!pet || pet.user_id !== currentUserId) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Not Found',
            message: 'Pet not found',
          }),
        });
        return;
      }

      const patchData = request.postDataJSON();
      const updatedPet: MockPet = {
        ...pet,
        ...patchData,
        id: pet.id, // Keep original ID
        user_id: pet.user_id, // Keep original user_id
        created_at: pet.created_at, // Keep original created_at
        updated_at: new Date().toISOString(),
      };

      mockPetDatabase.set(petId, updatedPet);

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([updatedPet]),
      });
      return;
    }

    // DELETE - Delete pet
    if (method === 'DELETE') {
      const idMatch = url.match(/[?&]id=eq\.([a-f0-9-]+)/);

      if (!idMatch) {
        await route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Bad Request',
            message: 'Pet ID required',
          }),
        });
        return;
      }

      const petId = idMatch[1];
      const pet = mockPetDatabase.get(petId);

      if (!pet || pet.user_id !== currentUserId) {
        await route.fulfill({
          status: 404,
          contentType: 'application/json',
          body: JSON.stringify({
            error: 'Not Found',
            message: 'Pet not found',
          }),
        });
        return;
      }

      mockPetDatabase.delete(petId);

      await route.fulfill({
        status: 204,
        body: '',
      });
      return;
    }

    // Unsupported method
    await route.continue();
  });

  // Intercept storage operations (for photo uploads)
  await page.route('**/storage/v1/object/pets-photos/**', async (route) => {
    const method = route.request().method();
    const url = route.request().url();

    if (method === 'POST') {
      // Mock photo upload
      const fileName = `mock_photo_${Date.now()}.jpg`;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          Key: `pets-photos/${fileName}`,
          Id: fileName,
        }),
      });
      return;
    }

    if (method === 'DELETE') {
      // Mock photo deletion
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([{
          name: 'Successfully deleted',
        }]),
      });
      return;
    }

    // For GET requests (public URL access), serve mock image
    if (method === 'GET' && url.includes('/public/')) {
      await route.fulfill({
        status: 200,
        contentType: 'image/jpeg',
        body: Buffer.from('mock-image-data'),
      });
      return;
    }

    // Continue for other requests
    await route.continue();
  });

  // Intercept storage public URL generation
  await page.route('**/storage/v1/object/public/pets-photos/**', async (route) => {
    const url = route.request().url();
    // Just continue - the URL itself is what we want (for getPublicUrl)
    await route.continue();
  });
}

/**
 * Enable real Supabase for E2E tests (don't mock)
 */
export async function useRealSupabase(page: Page): Promise<void> {
  // No mocking - let requests go through to real Supabase
  // This is used for smoke tests that verify actual integration
  console.log('[Test Mode] Using REAL Supabase for E2E test');
}

/**
 * Check if test should use real Supabase
 * Based on environment variable or test file name
 */
export function shouldUseRealSupabase(testFileName?: string): boolean {
  // Use real Supabase if explicitly set
  if (process.env.USE_REAL_SUPABASE === 'true') {
    return true;
  }

  // Use real Supabase for smoke tests
  if (testFileName?.includes('.smoke.spec.ts')) {
    return true;
  }

  // Default to mocked Supabase
  return false;
}

/**
 * Set up Supabase for test (mocked or real based on strategy)
 */
export async function setupSupabaseForTest(page: Page, testFileName?: string): Promise<void> {
  if (shouldUseRealSupabase(testFileName)) {
    await useRealSupabase(page);
  } else {
    await mockSupabaseAuth(page);
  }
}

