/**
 * Global type declarations for E2E tests
 */

interface Window {
  /**
   * Mock users storage for E2E tests
   * Used by authenticateTestUser to register mock users
   */
  __mockUsers?: Map<string, {
    id: string;
    email: string;
    name: string;
    email_confirmed_at: string;
    subscription_tier: string;
  }>;
}
