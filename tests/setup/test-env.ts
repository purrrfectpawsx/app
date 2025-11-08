/**
 * Test Environment Setup
 *
 * Global setup and configuration for all tests.
 * This file is imported by playwright.config.ts.
 */

import { test as base } from '@playwright/test';
import { resetMockDatabases, setupSupabaseForTest } from '../mocks/supabase';

/**
 * Extended test fixture with Supabase setup
 */
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    // Reset mock databases before each test
    resetMockDatabases();

    // Set up Supabase (mocked or real based on test type)
    const testFileName = testInfo.file;
    await setupSupabaseForTest(page, testFileName);

    // Use the page
    await use(page);

    // Cleanup after test (if needed)
  },
});

export { expect } from '@playwright/test';
