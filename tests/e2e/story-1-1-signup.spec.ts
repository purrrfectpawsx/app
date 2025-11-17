import { test, expect } from '../fixtures'
import { SmartWait } from '../utils/smart-wait';
import {
  signUp,
  expectLoginPage,
} from '../utils/auth';
import { generateTestUser, TEST_PASSWORDS, ERROR_MESSAGES } from '../fixtures/users';

/**
 * E2E Tests for Story 1.1: User Registration with Email/Password
 *
 * Tests validate all acceptance criteria:
 * AC1: Signup form displays email, password, confirm password, and name fields
 * AC2: Password validation enforces: minimum 8 characters, 1 uppercase, 1 number
 * AC3: Duplicate email addresses rejected with clear error message
 * AC4: Successful registration creates user in Supabase Auth and profiles table
 * AC5: User redirected to email verification prompt after signup
 * AC6: Form validation provides real-time feedback (invalid email, password mismatch)
 */

test.describe('Story 1.1: User Registration', () => {
  test('AC1: Signup form displays all required fields', async ({ page }) => {
    await page.goto('/signup');

    // Verify all form fields are present
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('AC2: Password validation enforces minimum 8 characters', async ({ page }) => {
    await page.goto('/signup');

    const user = generateTestUser();
    await page.getByLabel(/name/i).fill(user.name);
    await page.getByLabel(/email/i).fill(user.email);

    // Enter short password (less than 8 characters)
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORDS.short);
    await page.getByLabel(/^password$/i).blur();

    // Verify validation error appears
    await expect(page.getByText(ERROR_MESSAGES.validation.passwordTooShort)).toBeVisible();
  });

  test('AC2: Password validation enforces 1 uppercase letter', async ({ page }) => {
    await page.goto('/signup');

    const user = generateTestUser();
    await page.getByLabel(/name/i).fill(user.name);
    await page.getByLabel(/email/i).fill(user.email);

    // Enter password without uppercase
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORDS.noUppercase);
    await page.getByLabel(/^password$/i).blur();

    // Verify validation error appears
    await expect(page.getByText(ERROR_MESSAGES.validation.passwordNoUppercase)).toBeVisible();
  });

  test('AC2: Password validation enforces 1 number', async ({ page }) => {
    await page.goto('/signup');

    const user = generateTestUser();
    await page.getByLabel(/name/i).fill(user.name);
    await page.getByLabel(/email/i).fill(user.email);

    // Enter password without number
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORDS.noNumber);
    await page.getByLabel(/^password$/i).blur();

    // Verify validation error appears
    await expect(page.getByText(ERROR_MESSAGES.validation.passwordNoNumber)).toBeVisible();
  });

  test('AC5: Successful signup redirects to email verification', async ({ page }) => {
    const user = generateTestUser();

    await signUp(page, user);

    // Verify redirected to verification page
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.getByText(/check your email/i)).toBeVisible();
  });

  test('AC6: Form validation shows real-time feedback for invalid email', async ({ page }) => {
    await page.goto('/signup');

    // Enter invalid email
    await page.getByLabel(/email/i).fill('invalid-email');
    await page.getByLabel(/email/i).blur();

    // Verify validation error appears
    await expect(page.getByText(ERROR_MESSAGES.validation.invalidEmail)).toBeVisible();
  });

  test('AC6: Form validation shows feedback for password mismatch', async ({ page }) => {
    await page.goto('/signup');

    const user = generateTestUser();
    await page.getByLabel(/name/i).fill(user.name);
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByLabel(/^password$/i).fill(TEST_PASSWORDS.valid);
    await page.getByLabel(/confirm password/i).fill('DifferentPass123');
    await page.getByLabel(/confirm password/i).blur();

    // Verify mismatch error appears
    await expect(page.getByText(ERROR_MESSAGES.validation.passwordMismatch)).toBeVisible();
  });

  test('Navigation: "Already have an account?" link goes to login', async ({ page }) => {
    await page.goto('/signup');

    // Click "Sign in" link (the actual link element, not the paragraph text)
    await page.getByRole('link', { name: /sign in/i }).click();

    // Verify navigated to login page
    await expectLoginPage(page);
  });
});

/**
 * Test Notes:
 * - AC3 (duplicate email rejection) requires test user to exist - will test in integration suite
 * - AC4 (profile creation) requires database access - will test via login after signup
 * - Tests use unique emails (timestamp-based) to avoid conflicts
 * - Tests focus on UI/UX validation, not database state
 */
