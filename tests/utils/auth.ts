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

  // Wait for redirect to verification page
  await expect(page).toHaveURL(/\/verify-email/);
}

/**
 * Log in an existing user with email/password
 *
 * @param page - Playwright page object
 * @param credentials - User login credentials
 */
export async function login(page: Page, credentials: LoginCredentials): Promise<void> {
  await page.goto('/login');

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
