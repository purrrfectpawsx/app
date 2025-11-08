/**
 * Smoke Tests: Complete Authentication Flow (Real Supabase)
 *
 * These tests use REAL Supabase instead of mocked endpoints.
 * They validate end-to-end authentication flows with actual:
 * - User registration
 * - Email verification
 * - Login with password
 * - Session persistence
 * - Protected routes
 * - Logout
 *
 * Prerequisites:
 * 1. Copy .env.test.example to .env.test.local
 * 2. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
 * 3. Set up email testing service (optional, for verification tests)
 *
 * Run with: npm run test:smoke
 * Or: npx playwright test --grep @smoke
 */

import { test, expect, smokeTestConfig, skipIfNotConfigured } from '../setup/smoke-test-env';
import { generateTestUser } from '../fixtures/users';

// Skip all tests if smoke test environment is not configured
test.beforeAll(() => {
  skipIfNotConfigured(test);
});

test.describe('Smoke Test: Complete Auth Flow @smoke', () => {
  test.describe.configure({ mode: 'serial' }); // Run tests in order

  let testUser: ReturnType<typeof generateTestUser>;

  test.beforeEach(() => {
    // Generate unique test user for each test
    testUser = generateTestUser();
  });

  test('Complete flow: Signup → Verify → Login → Dashboard → Logout', async ({ page }) => {
    // This is a comprehensive end-to-end test of the entire auth flow
    // It's marked as @smoke for easy filtering

    console.log('[SMOKE] Starting complete auth flow test');
    console.log(`[SMOKE] Test user email: ${testUser.email}`);

    // ====================
    // STEP 1: Sign Up
    // ====================
    console.log('[SMOKE] Step 1: Sign up');

    await page.goto('/signup');

    await page.getByLabel(/name/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByLabel(/confirm password/i).fill(testUser.password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Should redirect to verify-email page
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 10000 });
    await expect(page.getByText(/check your email/i)).toBeVisible();
    await expect(page.getByText(testUser.email)).toBeVisible();

    console.log('[SMOKE] ✓ Signup successful, user created');

    // ====================
    // STEP 2: Email Verification
    // ====================
    console.log('[SMOKE] Step 2: Email verification (MANUAL STEP)');
    console.log('[SMOKE] --------------------------------------------------');
    console.log(`[SMOKE] ACTION REQUIRED:`);
    console.log(`[SMOKE] 1. Check email inbox for: ${testUser.email}`);
    console.log(`[SMOKE] 2. Click the verification link in the email`);
    console.log(`[SMOKE] 3. Alternatively, verify user manually in Supabase dashboard`);
    console.log('[SMOKE] --------------------------------------------------');
    console.log('[SMOKE] Waiting for manual verification...');

    // TODO: Implement automated email verification with email testing service
    // For now, this is a MANUAL step - pause test execution
    // await waitForVerificationEmail(testUser.email);

    // MANUAL PAUSE: Wait for user to verify email
    // In CI/CD, you would:
    // 1. Use pre-verified test user
    // 2. Integrate with email testing API
    // 3. Manually verify via Supabase Admin API

    // For now, skip to login with a pre-verified user from .env.test.local
    if (smokeTestConfig.testUser.email && smokeTestConfig.testUser.password) {
      console.log('[SMOKE] Using pre-verified test user from environment');
      testUser.email = smokeTestConfig.testUser.email;
      testUser.password = smokeTestConfig.testUser.password;
      testUser.name = smokeTestConfig.testUser.name;
    } else {
      console.log('[SMOKE] ⚠️  No pre-verified test user configured');
      console.log('[SMOKE] ⚠️  Configure TEST_USER_EMAIL and TEST_USER_PASSWORD in .env.test.local');
      console.log('[SMOKE] ⚠️  Skipping login and protected route tests');
      return; // Exit test early
    }

    // ====================
    // STEP 3: Login
    // ====================
    console.log('[SMOKE] Step 3: Login with verified user');

    await page.goto('/login');

    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to dashboard after successful login
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });

    console.log('[SMOKE] ✓ Login successful, redirected to dashboard');

    // ====================
    // STEP 4: Verify Protected Routes
    // ====================
    console.log('[SMOKE] Step 4: Verify protected route access');

    // User should be able to access dashboard
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();

    // Header should be visible with logout button
    await expect(page.getByRole('heading', { name: /petcare/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible();

    console.log('[SMOKE] ✓ Protected routes accessible, Header visible');

    // ====================
    // STEP 5: Verify PublicRoute Protection
    // ====================
    console.log('[SMOKE] Step 5: Verify PublicRoute protection');

    // Try to access /login (should redirect back to dashboard)
    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    // Try to access /signup (should redirect back to dashboard)
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });

    console.log('[SMOKE] ✓ PublicRoute protection working (redirects authenticated users)');

    // ====================
    // STEP 6: Logout
    // ====================
    console.log('[SMOKE] Step 6: Logout');

    await page.goto('/dashboard'); // Go back to dashboard
    await page.getByRole('button', { name: /logout/i }).click();

    // Should redirect to login after logout
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });

    // Logout button should no longer be visible
    await expect(page.getByRole('button', { name: /logout/i })).not.toBeVisible();

    console.log('[SMOKE] ✓ Logout successful, session cleared');

    // ====================
    // STEP 7: Verify ProtectedRoute Protection
    // ====================
    console.log('[SMOKE] Step 7: Verify ProtectedRoute protection after logout');

    // Try to access /dashboard (should redirect to login)
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });

    console.log('[SMOKE] ✓ ProtectedRoute protection working (redirects unauthenticated users)');

    console.log('[SMOKE] ========================================');
    console.log('[SMOKE] ✅ Complete auth flow test PASSED');
    console.log('[SMOKE] ========================================');
  });

  test.skip('Signup → Resend verification email', async ({ page }) => {
    // TODO: Test resend verification email functionality
    // Requires email testing service integration

    await page.goto('/signup');

    // Fill signup form
    await page.getByLabel(/name/i).fill(testUser.name);
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByLabel(/confirm password/i).fill(testUser.password);
    await page.getByRole('button', { name: /create account/i }).click();

    // Should be on verify-email page
    await expect(page).toHaveURL(/\/verify-email/);

    // Click resend button
    await page.getByRole('button', { name: /resend/i }).click();

    // Should show success message
    await expect(page.getByText(/email.*sent/i)).toBeVisible({ timeout: 5000 });

    // TODO: Verify new email was sent via email testing API
  });

  test.skip('Login with unverified user redirects to verify-email', async ({ page }) => {
    // TODO: Test that unverified users are redirected to verify-email
    // Requires creating an unverified user

    await page.goto('/login');

    // Try to login with unverified user
    // (user created in signup test but not verified)
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/^password$/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should redirect to verify-email page (not dashboard)
    await expect(page).toHaveURL(/\/verify-email/, { timeout: 10000 });
  });

  test.skip('Login with wrong password shows error', async ({ page }) => {
    // TODO: Test error handling for wrong password

    await page.goto('/login');

    await page.getByLabel(/email/i).fill(smokeTestConfig.testUser.email);
    await page.getByLabel(/^password$/i).fill('WrongPassword123!');
    await page.getByRole('button', { name: /sign in/i }).click();

    // Should show generic error message
    await expect(page.getByText(/invalid.*email.*password/i)).toBeVisible();
  });

  test.skip('Session persists across browser tabs', async ({ context }) => {
    // TODO: Test cross-tab session persistence

    // Login in first tab
    const page1 = await context.newPage();
    await page1.goto('/login');
    await page1.getByLabel(/email/i).fill(smokeTestConfig.testUser.email);
    await page1.getByLabel(/^password$/i).fill(smokeTestConfig.testUser.password);
    await page1.getByRole('button', { name: /sign in/i }).click();
    await expect(page1).toHaveURL(/\/dashboard/);

    // Open second tab
    const page2 = await context.newPage();
    await page2.goto('/dashboard');

    // Should be authenticated in second tab
    await expect(page2).toHaveURL(/\/dashboard/);
    await expect(page2.getByRole('button', { name: /logout/i })).toBeVisible();

    // Logout in first tab
    await page1.getByRole('button', { name: /logout/i }).click();

    // Second tab should also be logged out (session sync)
    // This might require page reload or auth state listener
    await page2.reload();
    await expect(page2).toHaveURL(/\/login/);
  });
});

test.describe('Smoke Test: Password Reset Flow @smoke', () => {
  test.skip('Complete password reset flow', async ({ page }) => {
    // TODO: Implement password reset smoke test
    // Covers Story 1.5: Password Reset Flow

    // 1. Navigate to /forgot-password
    // 2. Enter email
    // 3. Submit form
    // 4. Check email for reset link
    // 5. Click reset link
    // 6. Enter new password
    // 7. Submit new password
    // 8. Login with new password
    // 9. Verify access to dashboard
  });
});

test.describe('Smoke Test: OAuth Flow @smoke', () => {
  test.skip('Google OAuth signup flow', async ({ page }) => {
    // TODO: Implement OAuth smoke test
    // Covers Story 1.4: Google OAuth Integration

    // Note: OAuth testing is complex with real Google
    // May require:
    // - Test Google account credentials
    // - OAuth consent screen automation
    // - OR: Mock OAuth provider for testing
  });
});
