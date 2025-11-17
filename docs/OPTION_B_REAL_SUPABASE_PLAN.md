# Option B: Real Supabase for E2E Tests - Implementation Plan

## Overview

Replace mock Supabase with a dedicated test Supabase project for reliable E2E testing.

**Estimated Time**: 2-3 hours
**Expected Pass Rate After**: 60-70% (170-200/285 tests)
**Reliability**: High - tests real integration

---

## Phase 1: Supabase Test Project Setup (30 minutes)

### 1.1 Create Test Supabase Project

**Steps**:
1. Go to https://supabase.com/dashboard
2. Create new project: `petcare-e2e-tests`
3. Region: Choose closest to you for speed
4. Database password: Save securely (will need for migrations)
5. Wait for project provisioning (~2 minutes)

### 1.2 Get Project Credentials

From project settings, copy:
- `Project URL` (e.g., https://abcdefgh.supabase.co)
- `anon/public` API key
- `service_role` API key (for test cleanup)

### 1.3 Set Up Database Schema

**Option A: Run Migrations** (if you have migrations)
```bash
# Point to test database
export SUPABASE_URL=https://your-test-project.supabase.co
export SUPABASE_KEY=your-service-role-key

# Run migrations
npx supabase db push
```

**Option B: SQL Dump** (if using existing database)
```bash
# Export from dev database
pg_dump your_dev_db > schema.sql

# Import to test database (via Supabase SQL Editor)
# Paste schema.sql content and execute
```

**Option C: Manual Setup** (if schema is simple)
```sql
-- Run in Supabase SQL Editor

-- Users table (handled by Supabase Auth)
-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  subscription_tier TEXT DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Pets table
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  birth_date DATE,
  gender TEXT,
  spayed_neutered BOOLEAN DEFAULT FALSE,
  microchip_id TEXT,
  notes TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Health records table
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  record_type TEXT NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  vet_clinic TEXT,
  cost DECIMAL(10,2),
  weight_value DECIMAL(6,2),
  weight_unit TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can read own pets" ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own pets" ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own pets" ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own pets" ON pets
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can read own health records" ON health_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own health records" ON health_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own health records" ON health_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own health records" ON health_records
  FOR DELETE USING (auth.uid() = user_id);
```

### 1.4 Configure Auth Settings

In Supabase Dashboard → Authentication → Settings:

1. **Email Auth**: Enable
2. **Confirm Email**: **DISABLE** (for tests)
3. **Email Rate Limits**: Increase or disable
4. **Password Requirements**: Match app requirements
5. **Site URL**: `http://localhost:5173` (for test redirects)
6. **Redirect URLs**: Add `http://localhost:5173/**`

---

## Phase 2: Test Configuration (20 minutes)

### 2.1 Environment Variables

Create `.env.test`:
```bash
# Test Supabase Project
VITE_SUPABASE_URL=https://your-test-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-test-anon-key

# Service role key for cleanup (never commit!)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Flag to indicate test mode
VITE_TEST_MODE=true
```

**Security Note**: Add `.env.test` to `.gitignore`!

### 2.2 Update Playwright Config

**File**: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',

    // Pass environment variables to tests
    extraHTTPHeaders: {
      // Not needed, but can add test-specific headers
    },
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    env: {
      // Use test Supabase
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL!,
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY!,
      VITE_TEST_MODE: 'true',
    },
  },
});
```

### 2.3 Remove Mock Setup

**File**: `tests/setup/test-env.ts`

```typescript
import { test as base, expect } from '@playwright/test';

// Remove setupMockSupabase - we're using real Supabase now!

export const test = base;
export { expect };
```

Or simply delete the file and update imports to use Playwright directly.

---

## Phase 3: Test Data Management (30 minutes)

### 3.1 Create Cleanup Utility

**File**: `tests/utils/cleanup.ts`

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Admin client with service role key (bypasses RLS)
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Delete all test data for a specific user
 */
export async function cleanupTestUser(userId: string) {
  try {
    // Delete in order due to foreign key constraints
    await supabaseAdmin.from('health_records').delete().eq('user_id', userId);
    await supabaseAdmin.from('pets').delete().eq('user_id', userId);
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // Delete auth user (cascades to auth.users)
    await supabaseAdmin.auth.admin.deleteUser(userId);

    console.log(`✅ Cleaned up test user: ${userId}`);
  } catch (error) {
    console.error(`❌ Cleanup failed for user ${userId}:`, error);
  }
}

/**
 * Delete all test data from database
 * USE WITH CAUTION - Only run in test environment!
 */
export async function cleanupAllTestData() {
  if (!process.env.VITE_TEST_MODE) {
    throw new Error('Cannot run cleanup in non-test environment!');
  }

  try {
    // Get all users
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();

    if (!users) return;

    // Delete each user and their data
    for (const user of users.users) {
      await cleanupTestUser(user.id);
    }

    console.log(`✅ Cleaned up ${users.users.length} test users`);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  }
}

/**
 * Delete test data older than specified hours
 */
export async function cleanupOldTestData(olderThanHours: number = 24) {
  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - olderThanHours);

  try {
    // Delete old health records
    await supabaseAdmin
      .from('health_records')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    // Delete old pets
    await supabaseAdmin
      .from('pets')
      .delete()
      .lt('created_at', cutoffDate.toISOString());

    // Get users created before cutoff
    const { data: users } = await supabaseAdmin.auth.admin.listUsers();

    if (users) {
      const oldUsers = users.users.filter(
        u => new Date(u.created_at) < cutoffDate
      );

      for (const user of oldUsers) {
        await supabaseAdmin.auth.admin.deleteUser(user.id);
      }

      console.log(`✅ Cleaned up ${oldUsers.length} old test users`);
    }
  } catch (error) {
    console.error('❌ Old data cleanup failed:', error);
  }
}
```

### 3.2 Update authenticateTestUser

**File**: `tests/utils/auth.ts`

```typescript
/**
 * Authenticate a test user using REAL Supabase
 */
export async function authenticateTestUser(
  page: Page,
  credentials: SignupCredentials
): Promise<{ userId: string; email: string; name: string }> {
  // Navigate to signup
  await page.goto('/signup');

  // Fill and submit signup form
  await page.getByLabel(/name/i).fill(credentials.name);
  await page.getByLabel(/email/i).fill(credentials.email);
  await page.getByLabel(/^password$/i).fill(credentials.password);
  await page.getByLabel(/confirm password/i).fill(credentials.password);

  // Submit form
  await page.getByRole('button', { name: /create account/i }).click();

  // Wait for redirect (email confirmation is disabled in test Supabase)
  // Should go directly to /pets
  await expect(page).toHaveURL(/\/(dashboard|pets)/, { timeout: 10000 });

  // Wait for page to load
  await page.waitForLoadState('networkidle', { timeout: 10000 });

  // Verify we're authenticated by checking for expected content
  await Promise.race([
    expect(page.getByRole('heading', { name: /my pets/i })).toBeVisible({ timeout: 5000 }),
    expect(page.getByRole('button', { name: /add pet/i }).first()).toBeVisible({ timeout: 5000 }),
    expect(page.getByText(/you haven't added any pets yet/i)).toBeVisible({ timeout: 5000 }),
  ]);

  // Get user ID from page context
  const userId = await page.evaluate(() => {
    const session = localStorage.getItem('sb-localhost-auth-token');
    if (session) {
      const parsed = JSON.parse(session);
      return parsed.user?.id || parsed.id;
    }
    return null;
  });

  return {
    userId: userId || 'unknown',
    email: credentials.email,
    name: credentials.name,
  };
}
```

### 3.3 Add Cleanup to Test Lifecycle

**Option A: Per-test cleanup** (slower but isolated)

```typescript
import { test as base } from '@playwright/test';
import { cleanupTestUser } from '../utils/cleanup';

type TestFixtures = {
  authenticatedUser: { userId: string; email: string; name: string };
};

export const test = base.extend<TestFixtures>({
  authenticatedUser: async ({ page }, use) => {
    const credentials = {
      name: 'Test User',
      email: generateTestEmail(),
      password: generateTestPassword(),
    };

    const user = await authenticateTestUser(page, credentials);

    // Provide user to test
    await use(user);

    // Cleanup after test
    await cleanupTestUser(user.userId);
  },
});
```

**Option B: Cleanup between test files** (faster)

```typescript
// In playwright.config.ts
export default defineConfig({
  globalTeardown: './tests/global-teardown.ts',
});

// tests/global-teardown.ts
import { cleanupOldTestData } from './utils/cleanup';

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test data...');
  await cleanupOldTestData(0); // Clean all data from this run
}
```

**Option C: Scheduled cleanup** (most flexible)

```bash
# Add npm script
# package.json
{
  "scripts": {
    "test:cleanup": "tsx tests/scripts/cleanup-test-db.ts"
  }
}

# tests/scripts/cleanup-test-db.ts
import { cleanupAllTestData } from '../utils/cleanup';
cleanupAllTestData();

# Run before tests
npm run test:cleanup && npm run test:e2e
```

---

## Phase 4: Update Fixtures (20 minutes)

### 4.1 Update Custom Fixtures

**File**: `tests/fixtures/index.ts`

Remove any mock-specific code, keep the fixture structure:

```typescript
import { test as base, expect, Page } from '@playwright/test';
import { authenticateTestUser, SignupCredentials } from '../utils/auth';
import { PetDetailPage, PetsGridPage } from '../page-objects';
import { PetFactory } from '../factories';
import { createPet } from '../utils/pets';
import { cleanupTestUser } from '../utils/cleanup';

// Fixtures work the same with real Supabase!
export const test = base.extend<{
  authenticatedUser: { user: { userId: string; email: string; name: string } };
  petWithUser: { user: any; pet: any };
  // ... other fixtures
}>({
  authenticatedUser: async ({ page }, use) => {
    const credentials = {
      name: 'Test User',
      email: `test+${Date.now()}@example.com`,
      password: 'TestPass123',
    };

    const user = await authenticateTestUser(page, credentials);
    await use({ user });

    // Cleanup
    await cleanupTestUser(user.userId);
  },

  petWithUser: async ({ page, authenticatedUser }, use) => {
    const pet = PetFactory.buildDog();
    await createPet(page, pet);
    await use({ user: authenticatedUser.user, pet });
  },

  // ... other fixtures work the same!
});

export { expect };
```

---

## Phase 5: Testing & Validation (30 minutes)

### 5.1 Test Basic Auth Flow

```bash
# Run a simple auth test
npx playwright test tests/e2e/story-1-1-signup.spec.ts --grep "AC5" --headed

# Should see:
# ✅ Real signup form
# ✅ Real Supabase API calls
# ✅ Redirect to /pets
# ✅ Test passes!
```

### 5.2 Test Pet Creation

```bash
# Run a pet test
npx playwright test tests/e2e/story-2-1-create-pet.spec.ts --max-failures=3

# Should see:
# ✅ User authenticated
# ✅ Pet created in real database
# ✅ Test passes!
```

### 5.3 Run Full Suite

```bash
# Run all tests
npx playwright test tests/e2e/ --reporter=list

# Expected results:
# ✅ 170-200 tests passing (60-70%)
# ❌ ~80 tests failing (actual bugs or missing features)
# ⏭️ 59 tests skipped (features not implemented)
```

### 5.4 Verify Cleanup

```bash
# Check Supabase dashboard
# Authentication → Users → Should be empty or minimal after cleanup

# Or run cleanup script
npm run test:cleanup
```

---

## Phase 6: CI/CD Integration (20 minutes)

### 6.1 GitHub Actions

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npx playwright install --with-deps

      - name: Run E2E tests
        env:
          VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
          VITE_TEST_MODE: true
        run: npm run test:e2e

      - name: Cleanup test data
        if: always()
        env:
          VITE_SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.TEST_SUPABASE_SERVICE_KEY }}
        run: npm run test:cleanup

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

### 6.2 Add GitHub Secrets

In repo settings → Secrets and variables → Actions:
- `TEST_SUPABASE_URL`
- `TEST_SUPABASE_ANON_KEY`
- `TEST_SUPABASE_SERVICE_KEY`

---

## Success Criteria

✅ **Phase 1 Complete**: Test Supabase project created and schema deployed
✅ **Phase 2 Complete**: Tests use real Supabase (no mocks)
✅ **Phase 3 Complete**: Cleanup utilities working
✅ **Phase 4 Complete**: Fixtures updated
✅ **Phase 5 Complete**: Tests passing at 60-70% rate
✅ **Phase 6 Complete**: CI/CD pipeline working

---

## Rollback Plan

If issues arise:

1. **Keep mock setup**: Don't delete `tests/mocks/supabase.ts`
2. **Environment flag**: Use `USE_REAL_SUPABASE` to toggle
3. **Separate test command**: `npm run test:e2e:mock` vs `npm run test:e2e:real`

---

## Cost Estimate

- **Supabase Free Tier**: Covers ~50-100 test runs/month
- **Pro Tier** ($25/month): Unlimited test runs, better performance
- **Recommended**: Start with Free tier, upgrade if needed

---

## Timeline Summary

| Phase | Task | Time |
|-------|------|------|
| 1 | Supabase setup | 30 min |
| 2 | Test configuration | 20 min |
| 3 | Data management | 30 min |
| 4 | Update fixtures | 20 min |
| 5 | Testing & validation | 30 min |
| 6 | CI/CD integration | 20 min |
| **Total** | | **2.5 hours** |

---

## Next Steps

1. **Create Supabase test project** (30 min)
2. **Update configuration** (20 min)
3. **Add cleanup utilities** (30 min)
4. **Run test suite** (30 min)
5. **Celebrate!** 🎉

Let me know when you're ready to start, and I'll guide you through each phase!
