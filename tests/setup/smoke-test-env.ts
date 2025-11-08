/**
 * Smoke Test Environment Setup
 *
 * Smoke tests use REAL Supabase instead of mocked endpoints.
 * Use this for integration testing of critical flows that require:
 * - Session persistence across navigation
 * - Email verification
 * - Real authentication flows
 * - Cross-tab session sync
 * - JWT token refresh
 */

import { test as base, expect } from '@playwright/test';
import { resetMockDatabases } from '../mocks/supabase';

/**
 * Smoke test configuration
 */
export const smokeTestConfig = {
  // Use real Supabase (no mocking)
  useRealSupabase: true,

  // Longer timeouts for real network requests
  timeout: parseInt(process.env.SMOKE_TEST_TIMEOUT || '60000'),

  // Email verification wait time
  emailTimeout: parseInt(process.env.EMAIL_VERIFICATION_TIMEOUT || '60000'),

  // Test user credentials (pre-created in Supabase)
  testUser: {
    email: process.env.TEST_USER_EMAIL || 'test@example.com',
    password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    name: process.env.TEST_USER_NAME || 'Test User',
  },

  // Auto-cleanup configuration
  autoCleanup: process.env.AUTO_CLEANUP === 'true',
  cleanupStrategy: process.env.CLEANUP_STRATEGY || 'after_all',

  // Logging
  verbose: process.env.VERBOSE_LOGGING === 'true',
};

/**
 * Extended test fixture for smoke tests
 * - Automatically uses real Supabase (no mocking)
 * - Longer default timeouts
 * - Optional cleanup after tests
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Log test start
    if (smokeTestConfig.verbose) {
      console.log(`[SMOKE TEST] Starting: ${testInfo.title}`);
    }

    // DO NOT setup mocks - use real Supabase
    // DO NOT call resetMockDatabases() or mockSupabaseAuth()

    // Set longer timeout for smoke tests
    test.setTimeout(smokeTestConfig.timeout);

    // Use the page
    await use(page);

    // Cleanup after test (if enabled)
    if (smokeTestConfig.autoCleanup && smokeTestConfig.cleanupStrategy === 'after_each') {
      if (smokeTestConfig.verbose) {
        console.log(`[SMOKE TEST] Cleaning up: ${testInfo.title}`);
      }
      // Add cleanup logic here if needed
      // For example: delete test users created during this test
    }

    // Log test end
    if (smokeTestConfig.verbose) {
      console.log(`[SMOKE TEST] Finished: ${testInfo.title} (${testInfo.status})`);
    }
  },
});

// Export expect for convenience
export { expect };

/**
 * Helper to check if smoke test environment is configured
 */
export function isSmokeTestConfigured(): boolean {
  const hasUrl = process.env.VITE_SUPABASE_URL && !process.env.VITE_SUPABASE_URL.includes('your-test-project');
  const hasKey = process.env.VITE_SUPABASE_ANON_KEY && !process.env.VITE_SUPABASE_ANON_KEY.includes('your-test-anon-key');

  return !!(hasUrl && hasKey);
}

/**
 * Skip smoke test if not configured
 * Use this at the beginning of smoke test files
 */
export function skipIfNotConfigured(testInstance: typeof test) {
  testInstance.skip(!isSmokeTestConfigured(), 'Smoke test environment not configured. Copy .env.test.example to .env.test.local and configure.');
}

/**
 * Wait for email verification (placeholder for future email API integration)
 *
 * TODO: Integrate with email testing service (Mailinator, Mailtrap, etc.)
 * For now, this is a manual step documented in smoke test instructions
 */
export async function waitForVerificationEmail(email: string): Promise<string | null> {
  if (smokeTestConfig.verbose) {
    console.log(`[SMOKE TEST] Waiting for verification email to: ${email}`);
    console.log('[SMOKE TEST] Email verification is currently a MANUAL step');
    console.log('[SMOKE TEST] Please check your email and extract the verification link');
  }

  // TODO: Implement email API integration
  // Example with Mailinator:
  // const inbox = await fetch(`https://mailinator.com/api/v2/domains/private/inboxes/${emailUsername}`);
  // const messages = await inbox.json();
  // const verificationEmail = messages.find(msg => msg.subject.includes('Verify'));
  // const link = extractVerificationLink(verificationEmail.body);
  // return link;

  return null;
}

/**
 * Clean up test data (placeholder for future implementation)
 */
export async function cleanupTestData() {
  if (smokeTestConfig.verbose) {
    console.log('[SMOKE TEST] Cleaning up test data...');
  }

  // TODO: Implement cleanup logic
  // - Delete test users created during smoke tests
  // - Delete test profiles
  // - Delete any test data in database

  // Example:
  // const { data: users } = await supabase.auth.admin.listUsers();
  // const testUsers = users.filter(u => u.email.startsWith('test+'));
  // for (const user of testUsers) {
  //   await supabase.auth.admin.deleteUser(user.id);
  // }
}
