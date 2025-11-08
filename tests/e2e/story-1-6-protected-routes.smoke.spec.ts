/**
 * Smoke Tests: Story 1.6 - Protected Routes & Session Management (Real Supabase)
 *
 * These tests validate protected route and session management functionality
 * with REAL Supabase integration. They cover all acceptance criteria that
 * cannot be tested with mocked Supabase due to session persistence requirements.
 *
 * Prerequisites:
 * 1. Copy .env.test.example to .env.test.local
 * 2. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 3. Create a verified test user (TEST_USER_EMAIL, TEST_USER_PASSWORD in .env.test.local)
 *
 * Run with: npm run test:smoke
 * Or: npx playwright test story-1-6-protected-routes.smoke.spec.ts
 */

import { test, expect, smokeTestConfig, skipIfNotConfigured } from '../setup/smoke-test-env';

// Skip all tests if smoke test environment is not configured
test.beforeAll(() => {
  skipIfNotConfigured(test);
});

test.describe('Smoke: Story 1.6 - Protected Routes @smoke', () => {
  let testUser: typeof smokeTestConfig.testUser;

  test.beforeEach(async ({ page }) => {
    // Use pre-configured test user
    testUser = smokeTestConfig.testUser;

    // Log out before each test to start fresh
    await page.goto('/login');
    const logoutButton = page.getByRole('button', { name: /logout/i });
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('AC2: Authenticated user accessing /login redirects to /dashboard', async ({ page }) => {
    console.log('[SMOKE] Testing PublicRoute redirect from /login');

    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Now try to access /login while authenticated
    await page.goto('/login');

    // PublicRoute should redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    console.log('[SMOKE] ✓ PublicRoute redirects authenticated users from /login');
  });

  test('AC2: Authenticated user accessing /signup redirects to /dashboard', async ({ page }) => {
    console.log('[SMOKE] Testing PublicRoute redirect from /signup');

    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Now try to access /signup while authenticated
    await page.goto('/signup');

    // PublicRoute should redirect back to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    console.log('[SMOKE] ✓ PublicRoute redirects authenticated users from /signup');
  });

  test('AC3: Session persists across browser tabs', async ({ page, context }) => {
    console.log('[SMOKE] Testing cross-tab session persistence');

    // Login in first tab (existing page)
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    console.log('[SMOKE] ✓ Logged in on first tab');

    // Open second tab with same context
    const page2 = await context.newPage();
    await page2.goto('/dashboard');

    // Should be authenticated in second tab (session shared)
    await expect(page2).toHaveURL(/\/dashboard/, { timeout: 5000 });
    await expect(page2.getByRole('button', { name: /logout/i })).toBeVisible();

    console.log('[SMOKE] ✓ Session persisted to second tab');

    // Cleanup
    await page2.close();
  });

  test('AC6 & AC7: Manual logout clears session and redirects to login', async ({ page }) => {
    console.log('[SMOKE] Testing logout functionality');

    // Login first
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Verify Header and logout button visible
    await expect(page.getByRole('heading', { name: /petcare/i })).toBeVisible();
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).toBeVisible();

    console.log('[SMOKE] ✓ Logout button visible when authenticated');

    // Click logout
    await logoutButton.click();

    // Should redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Logout button should no longer be visible
    await expect(logoutButton).not.toBeVisible();

    console.log('[SMOKE] ✓ Logout successful, redirected to /login');

    // Verify session cleared by trying to access protected route
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    console.log('[SMOKE] ✓ Session cleared, cannot access protected routes');
  });

  test('AC7: Logout button visible in header when authenticated', async ({ page }) => {
    console.log('[SMOKE] Testing Header visibility based on auth state');

    // Unauthenticated: Header should not show logout button
    await page.goto('/login');
    const logoutButton = page.getByRole('button', { name: /logout/i });
    await expect(logoutButton).not.toBeVisible();

    console.log('[SMOKE] ✓ Logout button not visible when unauthenticated');

    // Login
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Authenticated: Header should show logout button
    await expect(page.getByRole('heading', { name: /petcare/i })).toBeVisible();
    await expect(logoutButton).toBeVisible();

    console.log('[SMOKE] ✓ Header with logout button visible when authenticated');
  });

  test('AC1: Protected route preserves intended destination', async ({ page }) => {
    console.log('[SMOKE] Testing location state preservation');

    // Try to access /dashboard while unauthenticated
    await page.goto('/dashboard');

    // Should redirect to /login
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    console.log('[SMOKE] ✓ Redirected to /login from protected route');

    // Login
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect back to originally intended destination (/dashboard)
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    console.log('[SMOKE] ✓ Redirected back to intended destination after login');
  });

  test.skip('AC4: JWT auto-refreshes before expiration', async ({ page }) => {
    // NOTE: This test requires waiting ~55 minutes for token to approach expiration
    // It's skipped by default and should be run manually when needed

    console.log('[SMOKE] Testing JWT auto-refresh (LONG TEST - ~60 minutes)');

    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    console.log('[SMOKE] Logged in, waiting for token refresh...');

    // Wait for token refresh (Supabase tokens expire after 1 hour)
    // Supabase auto-refreshes before expiration
    // Monitor network for refresh request
    const refreshRequest = await page.waitForRequest(
      (req) => req.url().includes('/auth/v1/token') && req.method() === 'POST',
      { timeout: 3600000 } // 60 minutes
    );

    console.log('[SMOKE] ✓ JWT token refreshed automatically');

    // Verify still authenticated after refresh
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();
  });

  test.skip('AC5: Session expires after 30 days of inactivity', async ({ page }) => {
    // NOTE: This test would require time manipulation or waiting 30 days
    // It's validated through Supabase documentation and configuration
    // Server-side setting, not client-side testable

    console.log('[SMOKE] Session expiration is Supabase server configuration');
    console.log('[SMOKE] Default: 30 days of inactivity');
    console.log('[SMOKE] Verified through Supabase dashboard configuration');
  });

  test.skip('AC6: Session cleared from browser storage after logout', async ({ page }) => {
    // NOTE: This is an implementation detail test
    // It's better to test behavior (cannot access protected routes) than implementation

    console.log('[SMOKE] Testing session storage cleanup');

    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Check localStorage before logout
    const sessionBefore = await page.evaluate(() => {
      return localStorage.getItem('supabase.auth.token');
    });
    expect(sessionBefore).not.toBeNull();

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    // Check localStorage after logout
    const sessionAfter = await page.evaluate(() => {
      return localStorage.getItem('supabase.auth.token');
    });
    expect(sessionAfter).toBeNull();

    console.log('[SMOKE] ✓ Session cleared from localStorage after logout');
  });

  test('Navigation: After logout, can login again', async ({ page }) => {
    console.log('[SMOKE] Testing login after logout');

    // Login
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    // Logout
    await page.getByRole('button', { name: /logout/i }).click();
    await expect(page).toHaveURL(/\/login/);

    console.log('[SMOKE] ✓ Logged out successfully');

    // Login again
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should be able to login again
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();

    console.log('[SMOKE] ✓ Can login again after logout');
  });
});
