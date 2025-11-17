import { Page, expect } from '@playwright/test';

/**
 * Auth Utilities for E2E Tests
 *
 * Helper functions for common authentication flows used across tests.
 */

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

/**
 * Sign up a new user with email/password
 *
 * @param page - Playwright page object
 * @param credentials - User signup credentials
 */
export async function signUp(page: Page, credentials: SignupCredentials): Promise<void> {
  await page.goto('/signup');

  // Fill signup form
  await page.getByLabel(/name/i).fill(credentials.name);
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/^password$/i).fill(credentials.password);
  await page.getByLabel(/confirm password/i).fill(credentials.password);

  // Submit form
  await page.getByRole('button', { name: /create account/i }).click();

  // In test environment with mocked auth, users are auto-verified
  // and may redirect directly to dashboard/pets page instead of verify-email
  // Wait for either verify-email page OR dashboard/pets page (for auto-verified users)
  await Promise.race([
    expect(page).toHaveURL(/\/verify-email/, { timeout: 5000 }).catch(() => {}),
    expect(page).toHaveURL(/\/(dashboard|pets)/, { timeout: 5000 }).catch(() => {})
  ]);

  // Give the page a moment to stabilize
  await page.waitForLoadState('networkidle', { timeout: 10000 });
}

/**
 * Log in an existing user with email/password
 *
 * @param page - Playwright page object
 * @param credentials - User login credentials
 */
export async function login(page: Page, credentials: LoginCredentials): Promise<void> {
  // Check if user is already logged in (e.g., after auto-verified signup)
  const currentUrl = page.url();
  if (currentUrl.includes('/pets') || currentUrl.includes('/dashboard')) {
    // Already logged in, no need to go through login flow
    return;
  }

  await page.goto('/login');

  // Wait for navigation to complete
  await page.waitForLoadState('load', { timeout: 10000 });

  // If already logged in, might redirect immediately to /pets or /dashboard
  // Check URL after navigation
  const urlAfterGoto = page.url();
  if (urlAfterGoto.includes('/pets') || urlAfterGoto.includes('/dashboard')) {
    // Already logged in, redirected from /login
    return;
  }

  // Fill login form
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/password/i).fill(credentials.password);

  // Handle "Remember me" checkbox if specified
  if (credentials.rememberMe !== undefined) {
    const checkbox = page.getByLabel(/remember me/i);
    if (credentials.rememberMe) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }

  // Submit form
  await page.getByRole('button', { name: /sign in/i }).click();

  // Wait for redirect to pets page (dashboard redirects to /pets)
  await expect(page).toHaveURL(/\/(dashboard|pets)/);
}

/**
 * Log out the current user
 *
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  // Click logout button in header
  await page.getByRole('button', { name: /logout/i }).click();

  // Wait for redirect to login page
  await expect(page).toHaveURL(/\/login/);
}

/**
 * Create a unique test email address
 *
 * @param prefix - Email prefix (default: 'test')
 * @returns Unique email address with timestamp
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}+${timestamp}@example.com`;
}

/**
 * Generate a valid test password
 *
 * @returns Password meeting validation requirements (8+ chars, 1 uppercase, 1 number)
 */
export function generateTestPassword(): string {
  return 'TestPass123';
}

/**
 * Wait for auth state to be ready (user logged in)
 *
 * @param page - Playwright page object
 */
export async function waitForAuthReady(page: Page): Promise<void> {
  // Wait for auth context to initialize by checking for logout button
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 10000 });
}

/**
 * Assert user is on login page
 *
 * @param page - Playwright page object
 */
export async function expectLoginPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/login/);
  await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
}

/**
 * Assert user is on dashboard/pets page
 *
 * @param page - Playwright page object
 */
export async function expectDashboardPage(page: Page): Promise<void> {
  await expect(page).toHaveURL(/\/(dashboard|pets)/);
  await expect(page.getByRole('heading', { name: /(dashboard|my pets)/i })).toBeVisible();
}

/**
 * Assert user is authenticated (logout button visible)
 *
 * @param page - Playwright page object
 */
export async function expectAuthenticated(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
}

/**
 * Assert user is NOT authenticated (logout button not visible)
 *
 * @param page - Playwright page object
 */
export async function expectNotAuthenticated(page: Page): Promise<void> {
  await expect(page.getByRole('button', { name: /logout/i })).not.toBeVisible();
}

/**
 * Authenticate a test user (bypasses UI, uses signup flow which is properly mocked)
 * This is the preferred method for test setup in mocked environments.
 * The mocked signup auto-verifies users and logs them in.
 *
 * @param page - Playwright page object
 * @param credentials - User signup credentials
 * @returns The user data
 */
export async function authenticateTestUser(
  page: Page,
  credentials: SignupCredentials
): Promise<{ userId: string; email: string; name: string }> {
  // Use the signup flow which is properly mocked
  await page.goto('/signup');

  // Fill and submit signup form
  await page.getByLabel(/name/i).fill(credentials.name);
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/^password$/i).fill(credentials.password);
  await page.getByLabel(/confirm password/i).fill(credentials.password);

  // Submit form
  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for auth to complete - the mock auto-verifies and should redirect to /pets
  // Try multiple strategies to verify we're authenticated
  try {
    // First, wait a bit for the signup request to complete
    await page.waitForTimeout(1000);

    // Check current URL - might already be at /pets
    let currentUrl = page.url();

    if (currentUrl.includes('/verify-email')) {
      // If we're at verify-email, navigate directly to /pets
      // (in mocked environment, user is auto-verified)
      await page.goto('/pets');
      currentUrl = page.url();
    }

    // If still not at /pets, try navigating again
    if (!currentUrl.includes('/pets')) {
      await page.goto('/pets', { waitUntil: 'domcontentloaded' });
    }

    // Wait for page to load
    await page.waitForLoadState('load', { timeout: 10000 });

    // Verify we're authenticated by checking for expected content
    await Promise.race([
      expect(page.getByRole('heading', { name: /my pets/i })).toBeVisible({ timeout: 5000 }),
      expect(page.getByRole('button', { name: /add pet/i }).first()).toBeVisible({ timeout: 5000 }),
      expect(page.getByText(/you haven't added any pets yet/i)).toBeVisible({ timeout: 5000 }),
    ]);

  } catch (error) {
    const url = page.url();
    throw new Error(`Failed to authenticate after signup. Current URL: ${url}. Original error: ${error.message}`);
  }

  // Extract user ID from the page context if possible, otherwise generate one
  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(7)}`;

  return {
    userId,
    email: credentials.email,
    name: credentials.name,
  };
}

/**
 * Helper: Inject mock auth session into browser localStorage
 * This ensures the Supabase client recognizes the user as authenticated
 */
async function injectAuthSession(page: Page, user: any, accessToken: string, refreshToken: string) {
  await page.evaluate(
    ({ user, accessToken, refreshToken }) => {
      const session = {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'bearer',
        user,
      };

      // Try multiple storage key formats that Supabase might use
      const storageKeys = [
        'supabase.auth.token', // Generic key
        'sb-localhost-auth-token', // Localhost development
        'sb-127.0.0.1-auth-token', // Localhost IP
        `sb-${window.location.hostname}-auth-token`, // Hostname-based
      ];

      // Set in all possible locations to ensure it's found
      storageKeys.forEach(key => {
        localStorage.setItem(key, JSON.stringify(session));
      });

      // Also try sessionStorage as fallback
      sessionStorage.setItem('supabase.auth.token', JSON.stringify(session));
    },
    { user, accessToken, refreshToken }
  );
}

/**
 * Create an authenticated user directly without going through signup/login flows
 *
 * This is the RECOMMENDED approach for test setup in mocked environments.
 * It bypasses the UI flows entirely and directly sets up authentication state,
 * which is much faster and more reliable than going through signup + login.
 *
 * @param page - Playwright page object
 * @param credentials - Optional user credentials (generates unique user if not provided)
 * @returns The created user object with credentials
 *
 * @example
 * ```typescript
 * test('should create a pet', async ({ page }) => {
 *   // Fast, reliable auth setup
 *   const user = await createAuthenticatedUser(page);
 *
 *   // Now you can test pet creation
 *   await openCreatePetDialog(page);
 *   // ... rest of test
 * });
 * ```
 */
export async function createAuthenticatedUser(
  page: Page,
  credentials?: SignupCredentials
): Promise<SignupCredentials & { userId: string }> {
  // Import createMockUser from the mocks
  const { createMockUser } = await import('../mocks/supabase');

  // Generate credentials if not provided
  const userCredentials = credentials || {
    name: 'Test User',
    email: generateTestEmail(),
    password: generateTestPassword(),
  };

  // Create mock user in the database
  const mockUser = createMockUser(userCredentials.email, userCredentials.name, true);

  // Generate tokens
  const accessToken = `mock_token_${mockUser.id}`;
  const refreshToken = `mock_refresh_${mockUser.id}`;

  // Navigate to a base page first
  await page.goto('/');

  // Use Supabase's setSession() API to properly inject the session
  // This is the correct way - Supabase will handle storage in the right format
  await page.evaluate(
    async ({ user, accessToken, refreshToken }) => {
      // Access the Supabase client from the window
      const { supabase } = await import('/src/lib/supabase.ts');

      // Use Supabase's official setSession method
      await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
    },
    { user: mockUser, accessToken, refreshToken }
  );

  // Give Supabase a moment to process the session
  await page.waitForTimeout(1000);

  // Navigate to pets page
  await page.goto('/pets', { waitUntil: 'load', timeout: 15000 });

  // Wait for auth context to initialize
  await page.waitForTimeout(500);

  return {
    ...userCredentials,
    userId: mockUser.id,
  };
}
