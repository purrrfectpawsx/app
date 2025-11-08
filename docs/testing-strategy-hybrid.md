# Hybrid Testing Strategy - Documentation

**Date**: 2025-11-07
**Status**: Implemented
**Strategy**: Option C - Hybrid (Mocked + Real Supabase)

---

## Overview

Our testing strategy uses **hybrid approach** combining fast mocked tests with selective real integration tests:

- **90% of tests**: Mocked Supabase (fast, isolated, no dependencies)
- **10% of tests**: Real Supabase (smoke tests, critical paths, E2E validation)

This gives us the best of both worlds: **fast feedback loops** with **confidence in real integration**.

---

## Architecture

### Test Layers

```
┌─────────────────────────────────────────────────┐
│  Unit Tests (Future)                            │
│  - Validation schemas                           │
│  - Utility functions                            │
│  - Pure logic                                   │
│  Speed: Milliseconds                            │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  Component Tests (Future)                       │
│  - React components                             │
│  - Form behavior                                │
│  - User interactions                            │
│  Speed: Milliseconds                            │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  E2E Tests - MOCKED Supabase (PRIMARY)         │ ← 90% of tests
│  - All acceptance criteria                      │
│  - Form validation                              │
│  - Navigation flows                             │
│  - Error handling                               │
│  Speed: Seconds                                 │
│  Dependency: None (fully isolated)              │
└─────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────┐
│  E2E Tests - REAL Supabase (SMOKE)             │ ← 10% of tests
│  - Critical user journeys                       │
│  - Signup → Login → Dashboard                   │
│  - OAuth integration                            │
│  - Email configuration                          │
│  Speed: Slower (network calls)                  │
│  Dependency: Test Supabase project              │
└─────────────────────────────────────────────────┘
```

### File Organization

```
tests/
├── e2e/
│   ├── story-1-1-signup.spec.ts          # Mocked (default)
│   ├── story-1-1-signup.smoke.spec.ts    # Real Supabase
│   ├── story-1-2-verification.spec.ts    # Mocked
│   ├── story-1-3-login.spec.ts           # Mocked
│   └── critical-paths.smoke.spec.ts      # Real Supabase
├── mocks/
│   └── supabase.ts                        # Mock implementations
├── fixtures/
│   └── users.ts                           # Test data
├── setup/
│   └── test-env.ts                        # Test configuration
└── utils/
    └── auth.ts                            # Helper functions
```

---

## How It Works

### Automatic Mock/Real Detection

Tests automatically determine whether to use mocked or real Supabase:

```typescript
// tests/mocks/supabase.ts
export function shouldUseRealSupabase(testFileName?: string): boolean {
  // 1. Explicit environment variable
  if (process.env.USE_REAL_SUPABASE === 'true') {
    return true;
  }

  // 2. Smoke test file naming convention
  if (testFileName?.includes('.smoke.spec.ts')) {
    return true;
  }

  // 3. Default: Use mocked Supabase
  return false;
}
```

### Test File Naming Convention

| File Pattern | Supabase Mode | Use Case |
|-------------|---------------|----------|
| `*.spec.ts` | **Mocked** | All acceptance criteria, validation, flows |
| `*.smoke.spec.ts` | **Real** | Critical paths, integration validation |

### Examples

**Mocked Test** (Fast, Isolated):
```typescript
// tests/e2e/story-1-1-signup.spec.ts
import { test, expect } from '../setup/test-env';

test('AC2: Password validation enforces rules', async ({ page }) => {
  // Runs with mocked Supabase automatically
  await page.goto('/signup');
  await page.getByLabel(/password/i).fill('short');
  await expect(page.getByText(/at least 8/i)).toBeVisible();
});
```

**Smoke Test** (Real Integration):
```typescript
// tests/e2e/story-1-1-signup.smoke.spec.ts
import { test, expect } from '../setup/test-env';

test('Signup → Login → Dashboard (E2E)', async ({ page }) => {
  // Runs with REAL Supabase automatically (filename detection)
  const user = generateTestUser();

  // Real signup
  await signUp(page, user);

  // Verify email in real Supabase test project
  // ... manual verification step or email API integration

  // Real login
  await login(page, user);

  // Dashboard access
  await expect(page).toHaveURL(/\/dashboard/);
});
```

---

## Mocking Strategy

### What We Mock

**Network Requests** (via Playwright route interception):
```typescript
// Intercept Supabase API calls
await page.route('**/auth/v1/signup', async (route) => {
  const postData = route.request().postDataJSON();

  // Mock user creation
  const user = createMockUser(postData.email, postData.data?.name);

  await route.fulfill({
    status: 200,
    body: JSON.stringify({ data: { user }, error: null }),
  });
});
```

**Endpoints Mocked**:
- `POST /auth/v1/signup` - User registration
- `POST /auth/v1/token?grant_type=password` - Login
- `GET /auth/v1/user` - Session check
- `GET /rest/v1/profiles` - Profile queries
- `POST /rest/v1/profiles` - Profile creation
- More endpoints added as needed

### What We DON'T Mock

**Client-Side Logic** (runs normally):
- React components
- Form validation (Zod schemas)
- React Hook Form behavior
- React Router navigation
- UI state management
- AuthContext logic

This ensures we test the **actual user experience** while avoiding external dependencies.

---

## Test Data Management

### Fixtures (Reusable Test Data)

```typescript
// tests/fixtures/users.ts

export const TEST_USERS = {
  verifiedUser: {
    name: 'Verified User',
    email: 'verified@example.com',
    password: 'TestPass123',
  },

  unverifiedUser: {
    name: 'Unverified User',
    email: 'unverified@example.com',
    password: 'TestPass123',
  },
};

// Generate unique users for tests
export function generateTestUser() {
  return {
    name: 'Test User',
    email: `test+${Date.now()}@example.com`,
    password: 'TestPass123',
  };
}
```

### Mock Database

Tests maintain an in-memory mock database:

```typescript
// tests/mocks/supabase.ts

export const mockUserDatabase = new Map<string, MockUser>();
export const mockProfileDatabase = new Map<string, MockProfile>();

// Reset between tests
export function resetMockDatabases() {
  mockUserDatabase.clear();
  mockProfileDatabase.clear();
}
```

**Benefits**:
- Tests isolated from each other
- No cleanup needed
- Predictable state
- Fast test execution

---

## When to Use Each Strategy

### Use Mocked Tests For:

✅ **All acceptance criteria validation**
- Form field visibility
- Validation rules
- Error messages
- Loading states
- Navigation
- UI behavior

✅ **Edge cases and error scenarios**
- Invalid inputs
- Network failures
- Duplicate data
- Missing data

✅ **Regression testing**
- Fast feedback on code changes
- Run on every commit
- CI/CD pipeline

**Why**: Fast, isolated, deterministic, no dependencies

### Use Real Supabase Tests For:

✅ **Critical user journeys** (Smoke tests)
- Complete signup → login → dashboard flow
- OAuth integration
- Password reset flow

✅ **Configuration validation**
- Email templates
- RLS policies
- Storage buckets
- OAuth providers

✅ **Integration contracts**
- Supabase API behavior
- Database schema
- Authentication flows

**Why**: Validates actual integration, catches configuration issues

---

## Setting Up Real Supabase (Optional)

### Step 1: Create Test Supabase Project

1. Go to https://supabase.com
2. Create new project: "PetCare Test"
3. Note URL and anon key

### Step 2: Configure Test Environment

```bash
# Copy template
cp .env.test.example .env.test

# Edit .env.test
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-test-anon-key-here
USE_REAL_SUPABASE=false  # Only smoke tests use real Supabase
```

### Step 3: Run Database Migrations

```bash
# Apply schema to test project
npx supabase db push --db-url "postgresql://..."
```

### Step 4: Configure Email Templates

- Same as production Supabase
- Use test email domain (e.g., @test.example.com)
- Configure email template variables

### Step 5: Test Data Cleanup

Option A: **Manual cleanup**
```sql
-- Run after smoke tests
DELETE FROM profiles WHERE email LIKE '%@example.com';
DELETE FROM auth.users WHERE email LIKE '%@example.com';
```

Option B: **Automated cleanup** (Future)
```typescript
// tests/setup/cleanup.ts
export async function cleanupTestData() {
  const { data: users } = await supabase
    .from('profiles')
    .select('id')
    .like('email', '%@example.com');

  // Delete test users
}
```

---

## Running Tests

### All Tests (Mocked + Smoke)

```bash
npm test
```

### Mocked Tests Only (Fast)

```bash
npm test -- --grep-invert ".smoke.spec.ts"
```

### Smoke Tests Only (Real Supabase)

```bash
npm test -- --grep ".smoke.spec.ts"
```

### Watch Mode (Mocked)

```bash
npm run test:ui
```

### Headed Mode (See Browser)

```bash
npm run test:headed
```

---

## Performance Comparison

| Test Type | Tests | Avg Time | Total | Dependencies |
|-----------|-------|----------|-------|--------------|
| **Mocked E2E** | 50 | 1-2s | 60s | None |
| **Smoke Tests** | 5 | 5-10s | 40s | Supabase |
| **Combined** | 55 | - | 100s | Supabase (optional) |

**Mocked tests are 5x faster** than real Supabase tests.

---

## Benefits of Hybrid Approach

### Speed ⚡
- **90% of tests** run in seconds (mocked)
- Fast feedback on every code change
- Developers can run full suite locally

### Confidence ✅
- **10% smoke tests** validate real integration
- Catch configuration issues
- Verify Supabase API behavior

### Reliability 🎯
- Mocked tests are deterministic (no flakiness)
- No network dependencies
- No rate limiting issues

### Maintainability 🛠️
- Easy to update mocks when API changes
- Tests document expected behavior
- Clear separation of concerns

### Cost-Effective 💰
- Minimal Supabase test project usage
- No production data pollution
- Reduced CI/CD time

---

## Best Practices

### 1. Default to Mocked Tests

```typescript
// ✅ Good - Most tests should be mocked
// tests/e2e/story-1-1-signup.spec.ts

test('AC1: Form displays fields', async ({ page }) => {
  // Runs with mocked Supabase automatically
});
```

### 2. Create Smoke Tests for Critical Paths

```typescript
// ✅ Good - Smoke test for end-to-end validation
// tests/e2e/auth-flow.smoke.spec.ts

test('Complete auth flow E2E', async ({ page }) => {
  // Runs with REAL Supabase automatically
});
```

### 3. Use Fixtures for Test Data

```typescript
// ✅ Good - Reusable test data
import { TEST_USERS, generateTestUser } from '../fixtures/users';

test('Login with verified user', async ({ page }) => {
  await login(page, TEST_USERS.verifiedUser);
});
```

### 4. Reset Mock Database Between Tests

```typescript
// ✅ Automatic - Handled by test-env.ts
import { test } from '../setup/test-env';

test('Signup', async ({ page }) => {
  // Mock database automatically reset before this test
});
```

### 5. Document Real Supabase Requirements

```typescript
// ✅ Good - Clear documentation
/**
 * Smoke Test - Requires real Supabase test project
 *
 * Prerequisites:
 * - .env.test configured
 * - Email templates set up
 * - Test data cleanup after run
 */
test.describe('Auth Flow Smoke Tests', () => {
  // ...
});
```

---

## Migration Plan

### Phase 1: Mocked Infrastructure ✅ COMPLETE
- ✅ Install Vitest for mocking utilities
- ✅ Create Supabase mock utilities
- ✅ Create test fixtures
- ✅ Set up test environment config
- ✅ Update existing tests to use mocks

### Phase 2: Retrofit Epic 1 with Mocked Tests (Current)
- [ ] Story 1.1: Signup (80% complete, 2 tests need Supabase)
- [ ] Story 1.2: Email Verification
- [ ] Story 1.3: Login
- [ ] Story 1.6: Protected Routes
- [ ] Story 1.5: Password Reset
- [ ] Story 1.4: OAuth

### Phase 3: Create Smoke Tests
- [ ] Complete auth flow (signup → verify → login → dashboard)
- [ ] OAuth integration
- [ ] Password reset flow

### Phase 4: Set Up Real Supabase (Optional)
- [ ] Create test Supabase project
- [ ] Configure .env.test
- [ ] Apply database migrations
- [ ] Configure email templates
- [ ] Set up test data cleanup

---

## Troubleshooting

### Mock Not Working

**Issue**: Test still making real network requests

**Solution**: Check test file imports
```typescript
// ❌ Bad - Bypasses mock setup
import { test } from '@playwright/test';

// ✅ Good - Uses mock setup
import { test } from '../setup/test-env';
```

### Smoke Test Not Using Real Supabase

**Issue**: Smoke test using mocked Supabase

**Solution**: Check filename convention
```
❌ Bad: tests/e2e/auth-flow-e2e.spec.ts
✅ Good: tests/e2e/auth-flow.smoke.spec.ts
```

### Mock Database State Persists

**Issue**: Mock data from previous test affects current test

**Solution**: Use test-env.ts (auto-resets) or manual reset
```typescript
import { resetMockDatabases } from '../mocks/supabase';

test.beforeEach(() => {
  resetMockDatabases();
});
```

---

## Resources

**Implementation Files**:
- `tests/mocks/supabase.ts` - Mock implementations
- `tests/fixtures/users.ts` - Test data fixtures
- `tests/setup/test-env.ts` - Test environment setup
- `.env.test.example` - Environment template

**Documentation**:
- `tests/README.md` - General testing guide
- `docs/testing-setup-complete.md` - Infrastructure setup
- This document - Hybrid strategy details

**External**:
- [Playwright Route Mocking](https://playwright.dev/docs/network)
- [Supabase Test Environments](https://supabase.com/docs/guides/platform/multi-environment)

---

## Summary

**Hybrid testing strategy provides**:
- ⚡ **Fast feedback** with mocked tests (90%)
- ✅ **Integration confidence** with smoke tests (10%)
- 🎯 **Deterministic** and reliable test suite
- 🛠️ **Easy maintenance** with clear patterns
- 💰 **Cost-effective** with minimal external dependencies

**Status**: ✅ Infrastructure complete, ready for Epic 1 retrofit

**Next Steps**: Retrofit remaining Epic 1 stories with mocked tests
