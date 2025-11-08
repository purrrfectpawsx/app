/**
 * Test Fixtures - User Data
 *
 * Predefined test data for common user scenarios.
 * Use these fixtures for consistent test data across tests.
 */

import { MockUser, MockProfile } from '../mocks/supabase';

/**
 * Valid test passwords that meet validation requirements
 */
export const TEST_PASSWORDS = {
  valid: 'TestPass123',
  short: 'Short1',
  noUppercase: 'testpass123',
  noNumber: 'TestPassword',
  noLowercase: 'TESTPASS123',
  weak: 'password',
};

/**
 * Test user credentials for common scenarios
 */
export const TEST_USERS = {
  /** New user for signup tests */
  newUser: {
    name: 'Test User',
    email: 'testuser@example.com',
    password: TEST_PASSWORDS.valid,
  },

  /** Verified user with complete profile */
  verifiedUser: {
    name: 'Verified User',
    email: 'verified@example.com',
    password: TEST_PASSWORDS.valid,
  },

  /** Unverified user (email not confirmed) */
  unverifiedUser: {
    name: 'Unverified User',
    email: 'unverified@example.com',
    password: TEST_PASSWORDS.valid,
  },

  /** Premium user with subscription */
  premiumUser: {
    name: 'Premium User',
    email: 'premium@example.com',
    password: TEST_PASSWORDS.valid,
  },

  /** User for OAuth tests */
  googleUser: {
    name: 'Google User',
    email: 'google@example.com',
    password: TEST_PASSWORDS.valid,
  },
};

/**
 * Generate unique test email for tests that need unique users
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(7);
  return `${prefix}+${timestamp}${random}@example.com`;
}

/**
 * Generate unique test user credentials
 */
export function generateTestUser(name?: string): {
  name: string;
  email: string;
  password: string;
} {
  return {
    name: name || 'Test User',
    email: generateTestEmail(),
    password: TEST_PASSWORDS.valid,
  };
}

/**
 * Create mock user fixture for database
 */
export function createUserFixture(
  email: string,
  name: string,
  verified: boolean = true
): MockUser {
  return {
    id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
    email,
    email_confirmed_at: verified ? new Date().toISOString() : null,
    user_metadata: {
      name,
      full_name: name,
    },
  };
}

/**
 * Create mock profile fixture for database
 */
export function createProfileFixture(
  userId: string,
  email: string,
  name: string,
  tier: 'free' | 'premium' = 'free'
): MockProfile {
  return {
    id: userId,
    email,
    name,
    subscription_tier: tier,
    created_at: new Date().toISOString(),
  };
}

/**
 * Common validation test cases
 */
export const VALIDATION_TEST_CASES = {
  invalidEmails: [
    'invalid',
    'invalid@',
    '@invalid.com',
    'invalid@invalid',
    'invalid..test@example.com',
  ],
  validEmails: [
    'test@example.com',
    'user+tag@domain.co.uk',
    'first.last@subdomain.example.com',
  ],
  invalidPasswords: {
    tooShort: 'Short1',
    noUppercase: 'lowercase123',
    noLowercase: 'UPPERCASE123',
    noNumber: 'NoNumbers',
    onlyNumbers: '12345678',
  },
  validPasswords: [
    'TestPass123',
    'ValidPassword1',
    'Str0ngP@ssw0rd',
    'MyP@ssw0rd123',
  ],
};

/**
 * Common error messages to test
 */
export const ERROR_MESSAGES = {
  auth: {
    invalidCredentials: /invalid.*credentials/i,
    emailExists: /already.*exists/i,
    weakPassword: /password.*weak/i,
    emailNotVerified: /verify.*email/i,
    accountLocked: /too many.*attempts/i,
  },
  validation: {
    required: /required/i,
    invalidEmail: /invalid.*email/i,
    passwordTooShort: /at least.*8.*characters/i,
    passwordNoUppercase: /at least.*1.*uppercase/i,
    passwordNoLowercase: /at least.*1.*lowercase/i,
    passwordNoNumber: /at least.*1.*number/i,
    passwordMismatch: /passwords.*match/i,
  },
};
