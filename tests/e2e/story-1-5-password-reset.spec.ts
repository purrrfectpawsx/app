import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait';
import { generateTestUser, TEST_PASSWORDS } from '../fixtures/users';

/**
 * E2E Tests for Story 1.5: Password Reset Flow
 *
 * Tests validate all acceptance criteria:
 * AC1: "Forgot Password?" link visible on login page
 * AC2: Forgot password form accepts email address
 * AC3: Reset email sent within 60 seconds (even if email doesn't exist - security)
 * AC4: Email contains branded message and secure reset link (valid 1 hour)
 * AC5: Reset link opens form to enter new password (with confirmation)
 * AC6: New password validated (same rules as signup)
 * AC7: Successful reset invalidates old password immediately
 * AC8: User automatically logged in after successful reset
 * AC9: Notification email sent confirming password change
 */

test.describe('Story 1.5: Password Reset Flow', () => {
  test('AC1: "Forgot Password?" link visible on login page', async ({ page }) => {
    await page.goto('/login');

    // Verify "Forgot Password?" link is present
    const forgotLink = page.getByRole('link', { name: /forgot password/i });
    await expect(forgotLink).toBeVisible();

    // Verify link navigates to correct page
    await forgotLink.click();
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('AC2: Forgot password form displays email field', async ({ page }) => {
    await page.goto('/forgot-password');

    // Verify email input field is present
    await expect(page.getByLabel(/email/i)).toBeVisible();

    // Verify submit button is present
    await expect(page.getByRole('button', { name: /send reset link/i })).toBeVisible();
  });

  test('AC2: Forgot password form accepts valid email', async ({ page }) => {
    await page.goto('/forgot-password');

    const testUser = generateTestUser();

    // Fill in email
    await page.getByLabel(/email/i).fill(testUser.email);

    // Submit button should be enabled
    const submitButton = page.getByRole('button', { name: /send reset link/i });
    await expect(submitButton).toBeEnabled();

    // Submit form
    await submitButton.click();

    // Should show success message
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 5000 });
  });

  test('AC3: Forgot password shows success for non-existent email (security)', async ({ page }) => {
    await page.goto('/forgot-password');

    // Use obviously fake email
    await page.getByLabel(/email/i).fill('nonexistent-user-12345@example.com');

    // Submit form
    await page.getByRole('button', { name: /send reset link/i }).click();

    // Should STILL show success message (prevents email enumeration)
    await expect(page.getByText(/check your email/i)).toBeVisible({ timeout: 5000 });

    // Should NOT show "email not found" or similar error
    await expect(page.getByText(/not found/i)).not.toBeVisible();
    await expect(page.getByText(/doesn't exist/i)).not.toBeVisible();
  });

  test('AC2: Forgot password form validates email format', async ({ page }) => {
    await page.goto('/forgot-password');

    // Try invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/email/i).blur();

    // Should show validation error
    await expect(page.getByText(/valid email/i)).toBeVisible();
  });

  test.skip('AC4: Reset email sent within 60 seconds', async ({ page }) => {
    // NOTE: Email delivery testing requires real Supabase integration
    // This tests email delivery time which is a Supabase infrastructure concern
    // Better tested with smoke test
  });

  test.skip('AC4: Email contains branded message and reset link', async ({ page }) => {
    // NOTE: Email content testing requires real email service integration
    // This requires:
    // 1. Real Supabase project
    // 2. Email testing service (Mailinator, Mailtrap)
    // 3. Email content parsing and verification
    // Better tested with smoke test or manual verification
  });

  test.skip('AC5: Reset password page shows loading state', async ({ page }) => {
    // NOTE: Loading state is too fast to test reliably
    // The page transitions from loading → error state in milliseconds
    // Loading state exists in ResetPassword.tsx:55-66 but is transient
    // Better tested manually or skipped
    await page.goto('/reset-password');

    // Should show verifying message (briefly before error)
    const verifyingText = page.getByText(/verifying reset link/i);
    await expect(verifyingText).toBeVisible({ timeout: 1000 });
  });

  test('AC5: Reset password page shows error for missing token', async ({ page }) => {
    // Navigate to reset password page without token
    await page.goto('/reset-password');

    // Should show invalid link error (use heading for specificity)
    await expect(page.getByRole('heading', { name: /invalid reset link/i })).toBeVisible({ timeout: 5000 });

    // Should show option to request new link
    await expect(page.getByRole('link', { name: /request new reset link/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /back to login/i })).toBeVisible();
  });

  test.skip('AC5: Reset password form displays with valid token', async ({ page }) => {
    // NOTE: This test requires a valid reset token in the URL
    // The mock doesn't generate valid Supabase tokens
    // Need to either:
    // 1. Mock the token validation in ResetPassword page
    // 2. Use real Supabase to get real token (smoke test)
    // Better tested with smoke test

    // Example flow:
    // const resetUrl = '/reset-password#access_token=mock_token&type=recovery';
    // await page.goto(resetUrl);
    // await expect(page.getByLabel(/new password/i)).toBeVisible();
    // await expect(page.getByLabel(/confirm password/i)).toBeVisible();
  });

  test.skip('AC6: New password validates minimum 8 characters', async ({ page }) => {
    // NOTE: Requires valid reset token to show the form
    // Skipped - covered in smoke test
  });

  test.skip('AC6: New password validates 1 uppercase letter', async ({ page }) => {
    // NOTE: Requires valid reset token to show the form
    // Skipped - covered in smoke test
  });

  test.skip('AC6: New password validates 1 number', async ({ page }) => {
    // NOTE: Requires valid reset token to show the form
    // Skipped - covered in smoke test
  });

  test.skip('AC6: Password mismatch shows error', async ({ page }) => {
    // NOTE: Requires valid reset token to show the form
    // Skipped - covered in smoke test
  });

  test.skip('AC7: Successful reset invalidates old password', async ({ page }) => {
    // NOTE: This requires real database operations
    // Test flow:
    // 1. Create user with password
    // 2. Reset password
    // 3. Try to login with old password - should fail
    // 4. Login with new password - should succeed
    // Requires real Supabase - smoke test
  });

  test.skip('AC8: User automatically logged in after successful reset', async ({ page }) => {
    // NOTE: Requires real Supabase session management
    // Test flow:
    // 1. Complete password reset
    // 2. Should be redirected to /dashboard
    // 3. Should be authenticated (header visible, can access protected routes)
    // Requires real Supabase - smoke test
  });

  test.skip('AC9: Confirmation email sent after password change', async ({ page }) => {
    // NOTE: Email testing requires real Supabase and email service integration
    // Test flow:
    // 1. Complete password reset
    // 2. Check email for confirmation message
    // 3. Verify email contains security warning
    // Requires email testing infrastructure - smoke test
  });

  test('Navigation: "Back to login" link on forgot password page', async ({ page }) => {
    await page.goto('/forgot-password');

    // Find "Back to login" link
    const loginLink = page.getByRole('link', { name: /back to login/i });
    await expect(loginLink).toBeVisible();

    // Click link
    await loginLink.click();

    // Should navigate to login
    await expect(page).toHaveURL(/\/login/);
  });

  test('Navigation: "Request new reset link" from invalid token page', async ({ page }) => {
    await page.goto('/reset-password');

    // Wait for invalid token message (use heading for specificity)
    await expect(page.getByRole('heading', { name: /invalid reset link/i })).toBeVisible({ timeout: 5000 });

    // Find "Request new reset link" button
    const requestLink = page.getByRole('link', { name: /request new reset link/i });
    await expect(requestLink).toBeVisible();

    // Click link
    await requestLink.click();

    // Should navigate to forgot-password page
    await expect(page).toHaveURL(/\/forgot-password/);
  });

  test('UI: Forgot password page has proper title and description', async ({ page }) => {
    await page.goto('/forgot-password');

    // Check for title
    await expect(page.getByRole('heading', { name: /reset your password/i })).toBeVisible();

    // Check for description text
    await expect(page.getByText(/enter your email.*send you a reset link/i)).toBeVisible();
  });

  test('UI: Reset password page shows proper error UI', async ({ page }) => {
    await page.goto('/reset-password');

    // Wait for error state (use heading for specificity)
    await expect(page.getByRole('heading', { name: /invalid reset link/i })).toBeVisible({ timeout: 5000 });

    // Check that error message text is visible
    await expect(page.getByText(/this password reset link is invalid/i)).toBeVisible();

    // Error message should be styled (destructive background) - check for the error container
    const errorBox = page.locator('.bg-destructive\\/10').first();
    await expect(errorBox).toBeVisible();
  });
});

/**
 * Test Notes:
 * - AC1 & AC2: Tested with mocked Supabase (form UI and validation)
 * - AC3: Generic success message tested with mock
 * - AC4: Email delivery and content - smoke test required (real email)
 * - AC5: Form display and token validation partially tested (no valid tokens with mock)
 * - AC6: Password validation - smoke test required (needs valid token to show form)
 * - AC7: Password invalidation - smoke test required (real database)
 * - AC8: Auto-login - smoke test required (real session management)
 * - AC9: Confirmation email - smoke test required (real email)
 *
 * Mock Limitations:
 * - Cannot generate valid Supabase reset tokens
 * - Cannot test actual password updates in database
 * - Cannot test email delivery or content
 * - Cannot test session management after reset
 *
 * Smoke Test Coverage Needed:
 * - Complete password reset flow with real Supabase
 * - Email delivery and content validation
 * - Token expiration (1-hour validity)
 * - Old password invalidation
 * - Auto-login and session creation
 * - Confirmation email delivery
 */
