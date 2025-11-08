# Smoke Testing Guide

**Date**: 2025-11-07
**Status**: Infrastructure Complete
**Coverage**: Stories 1.1-1.6 (partial)

---

## Overview

This guide covers the **smoke testing infrastructure** for PetCare app. Smoke tests use **real Supabase** instead of mocked endpoints to validate critical integration points that cannot be tested with mocks.

### What Are Smoke Tests?

**Smoke tests** are high-level integration tests that:
- Use real external services (Supabase, email, etc.)
- Validate critical user flows end-to-end
- Run slower but provide higher confidence
- Catch integration issues mocks can't detect

### When to Use Smoke Tests

Use smoke tests when:
- ✅ Testing requires session persistence across navigation
- ✅ Testing email verification flows
- ✅ Testing OAuth authentication
- ✅ Testing cross-tab session synchronization
- ✅ Testing JWT token refresh
- ✅ Validating actual database operations

Use mocked tests when:
- ✅ Testing UI components and interactions
- ✅ Testing form validation
- ✅ Testing navigation and routing (without auth)
- ✅ Testing error handling
- ✅ Fast feedback during development

---

## Quick Start

### Prerequisites

1. **Separate Supabase Project** (Recommended)
   - Create a dedicated test project in Supabase
   - DO NOT use your production project for testing

2. **Test Environment File**
   ```bash
   # Copy the example file
   cp .env.test.example .env.test.local

   # Edit .env.test.local with your test Supabase credentials
   ```

3. **Configure Test Supabase**
   - Create a verified test user in Supabase dashboard
   - Add credentials to `.env.test.local`

### Configuration

Edit `.env.test.local`:

```bash
# Supabase Test Project
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-test-anon-key-here

# Pre-created verified test user (for login tests)
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=TestPassword123!
TEST_USER_NAME=Test User

# Optional: Auto-cleanup test data
AUTO_CLEANUP=false
```

### Running Smoke Tests

```bash
# Run all smoke tests (tagged with @smoke)
npm run test:smoke

# Run smoke tests in UI mode (watch and debug)
npm run test:smoke:ui

# Run smoke tests with visible browser (debugging)
npm run test:smoke:headed

# Run specific smoke test file
npx playwright test auth-flow.smoke.spec.ts

# Run mocked tests only (exclude smoke tests)
npm run test:mocked
```

---

## Test Structure

### Mocked Tests (Fast - 6 seconds)

**Location**: `tests/e2e/*.spec.ts`
**Tags**: None (default)
**Purpose**: Fast unit/integration tests with mocked Supabase

```
tests/e2e/
├── story-1-1-signup.spec.ts           # 8 tests, 100% pass
├── story-1-2-email-verification.spec.ts # 5 tests, 100% pass
├── story-1-3-login.spec.ts            # 6 tests, 100% pass
└── story-1-6-protected-routes.spec.ts # 2 tests, 100% pass (11 skipped)
```

**Total**: 21 active tests, 22 skipped, ~6 seconds

### Smoke Tests (Slow - Variable)

**Location**: `tests/e2e/*.smoke.spec.ts`
**Tags**: `@smoke`
**Purpose**: Integration tests with real Supabase

```
tests/e2e/
├── auth-flow.smoke.spec.ts               # Complete auth flow
└── story-1-6-protected-routes.smoke.spec.ts # Protected routes & session
```

**Total**: Variable (depends on configuration and manual steps)

---

## Smoke Test Files

### 1. Complete Auth Flow (`auth-flow.smoke.spec.ts`)

**Purpose**: End-to-end authentication flow validation

**Tests**:
1. ✅ **Complete flow**: Signup → Verify → Login → Dashboard → Logout
2. ⏩ **Resend verification email** (requires email testing API)
3. ⏩ **Login with unverified user** (redirects to verify-email)
4. ⏩ **Wrong password error handling**
5. ⏩ **Cross-tab session persistence**

**Manual Steps**:
- Email verification requires manual step (check email and click link)
- OR: Use pre-verified test user from `.env.test.local`

**Run**:
```bash
npx playwright test auth-flow.smoke.spec.ts
```

### 2. Protected Routes & Session (`story-1-6-protected-routes.smoke.spec.ts`)

**Purpose**: Validate protected route access control and session management

**Tests**:
1. ✅ **PublicRoute redirect from /login** (AC2)
2. ✅ **PublicRoute redirect from /signup** (AC2)
3. ✅ **Cross-tab session persistence** (AC3)
4. ✅ **Logout clears session** (AC6 & AC7)
5. ✅ **Header visibility based on auth** (AC7)
6. ✅ **Protected route preserves destination** (AC1)
7. ⏩ **JWT auto-refresh** (requires 60-minute wait)
8. ⏩ **30-day expiration** (Supabase config verification)
9. ⏩ **Session storage cleanup** (implementation detail)
10. ✅ **Login after logout**

**Prerequisites**:
- Pre-verified test user in `.env.test.local`

**Run**:
```bash
npx playwright test story-1-6-protected-routes.smoke.spec.ts
```

---

## Smoke Test Setup

### File: `tests/setup/smoke-test-env.ts`

Provides extended test fixture for smoke tests:

**Features**:
- ✅ Automatically uses real Supabase (no mocking)
- ✅ Longer default timeouts (60 seconds vs 30 seconds)
- ✅ Configuration management from `.env.test.local`
- ✅ Optional auto-cleanup (future)
- ✅ Verbose logging for debugging

**Usage**:
```typescript
import { test, expect, smokeTestConfig } from '../setup/smoke-test-env';

test('My smoke test @smoke', async ({ page }) => {
  // Automatically uses real Supabase
  // No mockSupabaseAuth() call needed

  const testUser = smokeTestConfig.testUser;
  // ... test implementation
});
```

**Configuration Access**:
```typescript
import { smokeTestConfig } from '../setup/smoke-test-env';

smokeTestConfig.testUser.email    // TEST_USER_EMAIL from .env
smokeTestConfig.testUser.password // TEST_USER_PASSWORD from .env
smokeTestConfig.timeout           // SMOKE_TEST_TIMEOUT from .env
smokeTestConfig.autoCleanup       // AUTO_CLEANUP from .env
smokeTestConfig.verbose           // VERBOSE_LOGGING from .env
```

---

## Creating New Smoke Tests

### Step 1: Create Smoke Test File

```bash
# Create new smoke test file
touch tests/e2e/my-feature.smoke.spec.ts
```

### Step 2: Import Smoke Test Setup

```typescript
import { test, expect, smokeTestConfig, skipIfNotConfigured } from '../setup/smoke-test-env';

// Skip if environment not configured
test.beforeAll(() => {
  skipIfNotConfigured(test);
});
```

### Step 3: Write Tests with @smoke Tag

```typescript
test.describe('Smoke: My Feature @smoke', () => {
  test('Critical flow end-to-end', async ({ page }) => {
    // No need to call mockSupabaseAuth()
    // Test uses real Supabase automatically

    // Use pre-configured test user
    const testUser = smokeTestConfig.testUser;

    await page.goto('/login');
    await page.getByLabel(/email/i).fill(testUser.email);
    await page.getByLabel(/password/i).fill(testUser.password);
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
```

### Step 4: Run and Validate

```bash
# Run your new smoke test
npx playwright test my-feature.smoke.spec.ts

# Or run with other smoke tests
npm run test:smoke
```

---

## Best Practices

### 1. Tag All Smoke Tests

Always include `@smoke` tag in test descriptions:

```typescript
test.describe('Smoke: Feature Name @smoke', () => {
  test('Test case @smoke', async ({ page }) => {
    // ...
  });
});
```

This allows filtering:
```bash
# Run only smoke tests
npm run test:smoke

# Run all tests EXCEPT smoke tests
npm run test:mocked
```

### 2. Use Pre-Verified Test User

For tests requiring authentication:

```typescript
import { smokeTestConfig } from '../setup/smoke-test-env';

test('Feature requiring auth @smoke', async ({ page }) => {
  const testUser = smokeTestConfig.testUser;

  // Login with pre-verified user
  await page.goto('/login');
  await page.getByLabel(/email/i).fill(testUser.email);
  await page.getByLabel(/password/i).fill(testUser.password);
  await page.getByRole('button', { name: /sign in/i }).click();

  // ... test authenticated features
});
```

**Why?**
- Avoids email verification delays
- More reliable and faster
- Easier to set up in CI/CD

### 3. Clean Up After Tests

If creating test data:

```typescript
test.afterEach(async ({ page }) => {
  // Logout if logged in
  const logoutButton = page.getByRole('button', { name: /logout/i });
  if (await logoutButton.isVisible()) {
    await logoutButton.click();
  }
});
```

Future: Automatic cleanup with `AUTO_CLEANUP=true`

### 4. Handle Manual Steps

Some flows require manual intervention (email verification):

```typescript
test.skip('Email verification flow @smoke', async ({ page }) => {
  // TODO: Requires email testing API integration
  // For now, skip or use pre-verified user

  console.log('[SMOKE] Manual step required:');
  console.log('[SMOKE] 1. Check email inbox');
  console.log('[SMOKE] 2. Click verification link');
});
```

### 5. Use Longer Timeouts

Smoke tests with real services are slower:

```typescript
test('Slow operation @smoke', async ({ page }) => {
  // Longer timeout already set automatically (60s)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
});
```

---

## Troubleshooting

### Error: "Smoke test environment not configured"

**Cause**: `.env.test.local` not created or missing credentials

**Solution**:
```bash
# Copy example file
cp .env.test.example .env.test.local

# Edit and add your test Supabase credentials
nano .env.test.local
```

### Error: "User not found" or "Invalid credentials"

**Cause**: Test user doesn't exist in test Supabase project

**Solution**:
1. Log into your test Supabase dashboard
2. Go to Authentication → Users
3. Create a new user with email/password
4. Verify the user's email
5. Update `.env.test.local` with credentials

### Error: "Cannot access /dashboard" or redirect loops

**Cause**: Test user email not verified

**Solution**:
1. In Supabase dashboard, go to Authentication → Users
2. Find your test user
3. Click on user, verify email manually
4. Or create new user and verify during creation

### Smoke tests taking too long

**Cause**: Network delays, slow Supabase instance

**Solution**:
- Use faster Supabase region
- Increase timeout: `SMOKE_TEST_TIMEOUT=120000` in `.env.test.local`
- Run fewer smoke tests: `npx playwright test specific-file.smoke.spec.ts`

### Email verification tests not working

**Cause**: Email testing API not integrated

**Current State**: Email verification is a **manual step** in smoke tests

**Future Solution**:
- Integrate with Mailinator, Mailtrap, or MailHog
- Implement `waitForVerificationEmail()` helper
- Automate email link extraction

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Smoke Tests

on:
  schedule:
    # Run smoke tests daily at 2 AM
    - cron: '0 2 * * *'
  workflow_dispatch: # Manual trigger

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Create test environment file
        run: |
          echo "VITE_SUPABASE_URL=${{ secrets.TEST_SUPABASE_URL }}" > .env.test.local
          echo "VITE_SUPABASE_ANON_KEY=${{ secrets.TEST_SUPABASE_ANON_KEY }}" >> .env.test.local
          echo "TEST_USER_EMAIL=${{ secrets.TEST_USER_EMAIL }}" >> .env.test.local
          echo "TEST_USER_PASSWORD=${{ secrets.TEST_USER_PASSWORD }}" >> .env.test.local
          echo "TEST_USER_NAME=Test User" >> .env.test.local

      - name: Run smoke tests
        run: npm run test:smoke

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: smoke-test-results
          path: playwright-report/
```

**GitHub Secrets Required**:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_USER_EMAIL`
- `TEST_USER_PASSWORD`

---

## Future Enhancements

### 1. Email Testing Integration

**Goal**: Automate email verification without manual steps

**Options**:
- **Mailinator**: Free, simple API
- **Mailtrap**: Paid, robust testing environment
- **MailHog**: Self-hosted, local development

**Implementation**:
```typescript
export async function waitForVerificationEmail(email: string): Promise<string> {
  const apiKey = process.env.TEST_EMAIL_API_KEY;
  const apiUrl = process.env.TEST_EMAIL_API_URL;

  // Poll for email
  for (let i = 0; i < 30; i++) {
    const response = await fetch(`${apiUrl}/messages?to=${email}`);
    const messages = await response.json();

    const verificationEmail = messages.find(m =>
      m.subject.includes('Verify your email')
    );

    if (verificationEmail) {
      // Extract verification link from email body
      const link = extractVerificationLink(verificationEmail.html);
      return link;
    }

    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
  }

  throw new Error('Verification email not received within timeout');
}
```

### 2. Automatic Test Data Cleanup

**Goal**: Clean up test users automatically after smoke tests

**Implementation**:
```typescript
export async function cleanupTestData() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_KEY; // Server-side key

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(supabaseUrl, serviceKey);

  // List all test users (emails starting with 'test+')
  const { data: users } = await supabase.auth.admin.listUsers();
  const testUsers = users.filter(u => u.email.startsWith('test+'));

  // Delete test users
  for (const user of testUsers) {
    await supabase.auth.admin.deleteUser(user.id);
    console.log(`[CLEANUP] Deleted test user: ${user.email}`);
  }
}
```

Enable in `.env.test.local`:
```bash
AUTO_CLEANUP=true
CLEANUP_STRATEGY=after_all  # or 'after_each'
```

### 3. OAuth Testing

**Goal**: Test Google OAuth flow end-to-end

**Challenges**:
- Google requires real user consent
- Testing OAuth is complex with real providers

**Options**:
- Use test Google account with OAuth consent automation
- Mock OAuth provider for testing
- Manual OAuth testing only

### 4. Performance Monitoring

**Goal**: Track smoke test execution time and reliability

**Implementation**:
- Add test duration logging
- Track flaky tests
- Report to monitoring service (DataDog, Sentry)

---

## Summary

### Infrastructure Files Created

1. ✅ `.env.test.example` - Environment configuration template
2. ✅ `tests/setup/smoke-test-env.ts` - Smoke test setup and configuration
3. ✅ `tests/e2e/auth-flow.smoke.spec.ts` - Complete auth flow smoke tests
4. ✅ `tests/e2e/story-1-6-protected-routes.smoke.spec.ts` - Protected routes smoke tests
5. ✅ `package.json` - Added smoke test commands
6. ✅ `docs/smoke-testing-guide.md` - This comprehensive guide

### NPM Commands Added

```bash
npm run test:smoke        # Run smoke tests only
npm run test:smoke:ui     # Run smoke tests in UI mode
npm run test:smoke:headed # Run smoke tests with visible browser
npm run test:mocked       # Run mocked tests only (exclude smoke)
```

### Current Coverage

**Mocked Tests**: 21/21 passing (6.1 seconds)
**Smoke Tests**: Infrastructure ready, examples created

**Stories Covered**:
- Story 1.1: User Registration (mocked only)
- Story 1.2: Email Verification (mocked + smoke examples)
- Story 1.3: User Login (mocked only)
- Story 1.6: Protected Routes (mocked 2 tests + smoke 7 tests)

### Next Steps

1. **Configure Test Environment**: Set up `.env.test.local`
2. **Create Test User**: Verify user in test Supabase project
3. **Run Smoke Tests**: Validate infrastructure works
4. **Add More Smoke Tests**: Stories 1.4 (OAuth), 1.5 (Password Reset)
5. **Integrate Email Testing**: Automate email verification
6. **Set Up CI/CD**: Run smoke tests on schedule or deployment

---

**Smoke Testing Infrastructure Complete**: 2025-11-07
**Status**: ✅ Ready for use
**Next**: Configure `.env.test.local` and run first smoke test
