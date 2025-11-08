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

/**
 * Mock user database - stores users created during tests
 */
export const mockUserDatabase = new Map<string, MockUser>();
export const mockProfileDatabase = new Map<string, MockProfile>();

/**
 * Reset mock databases between tests
 */
export function resetMockDatabases(): void {
  mockUserDatabase.clear();
  mockProfileDatabase.clear();
}

/**
 * Create a mock user for testing
 */
export function createMockUser(email: string, name: string, verified: boolean = true): MockUser {
  const user: MockUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
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

    // Create new user
    const user = createMockUser(postData.email, postData.data?.name || 'Test User', false);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          user,
          session: {
            access_token: `mock_token_${user.id}`,
            refresh_token: `mock_refresh_${user.id}`,
          },
        },
        error: null,
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
        data: {
          user,
          session: {
            access_token: `mock_token_${user.id}`,
            refresh_token: `mock_refresh_${user.id}`,
          },
        },
        error: null,
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

    // Extract user ID from mock token
    const tokenMatch = authHeader.match(/mock_token_(user_\w+)/);
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
        body: JSON.stringify({
          data: { user },
          error: null,
        }),
      });
      return;
    }

    // Handle GET request (session check)
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: { user },
        error: null,
      }),
    });
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
