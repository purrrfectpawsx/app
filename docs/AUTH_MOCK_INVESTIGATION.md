# Authentication Mock Investigation

## Current Situation

**Test Results:** 285 tests total
- ✅ Passed: 42 (14.7%)  
- ❌ Failed: 184 (64.6%)
- ⏭️ Skipped: 59 (20.7%)

## Root Cause Analysis

### Tests That Pass ✅
All 42 passing tests are ones that **do NOT require authentication**:
- Form validation tests
- Navigation tests  
- UI component visibility tests
- Static page rendering tests

### Tests That Fail ❌
All 184 failing tests require authentication via `authenticateTestUser()`:
- Pet creation/management tests
- Health record tests
- Any test that needs a logged-in user

## The Core Problem

The signup/login flow is not completing in tests:

1. **Form Submission Works**: Form fills correctly and submit button is clicked
2. **Mock Routes Are Set Up**: The mock intercepts `/auth/v1/signup` 
3. **Mock Returns Correct Data**: Returns user object, tokens, etc.
4. **Page Doesn't Navigate**: After signup, stays on `/signup` instead of navigating

### Possible Causes

#### 1. Supabase Client Not Making Requests
- The mock routes are set up, but Supabase client might not be making HTTP requests
- Could be using a different transport mechanism
- Might be caching or using service workers

#### 2. Response Not Being Handled
- Mock returns data, but client doesn't process it correctly  
- Session might not be stored in localStorage
- Auth state change might not trigger navigation

#### 3. Route Timing Issues
- Routes might not be set up before Supabase makes requests
- Race condition between mock setup and API calls

#### 4. Storage Key Mismatch
- Supabase stores session in localStorage with specific key format
- Key format might not match what mock/app expects
- Storage adapter might not be reading correctly

## Investigation Steps Needed

### Step 1: Verify Mock Routes Are Hit
Add logging to mock routes to confirm they're being called:

```typescript
await page.route('**/auth/v1/signup', async (route) => {
  console.log('🔍 MOCK: Signup route intercepted!');
  console.log('📤 Request data:', route.request().postDataJSON());
  
  // ... existing mock logic
  
  console.log('📥 Mock response:', response);
  await route.fulfill(response);
});
```

### Step 2: Check Browser Console
Run test in headed mode and check console for errors:

```bash
npx playwright test --headed --debug
```

Look for:
- Supabase errors
- Network request failures
- JavaScript errors

### Step 3: Verify Supabase Client Configuration
Check if Supabase is using HTTP fetch or some other method:

```typescript
// In app, check what transport Supabase uses
console.log('Supabase config:', supabase.auth.clientOptions);
```

### Step 4: Test Direct localStorage Injection
Try bypassing signup entirely and directly inject session:

```typescript
await page.evaluate(() => {
  const session = {
    access_token: 'test_token',
    refresh_token: 'test_refresh',
    user: { id: 'test-user-id', email: 'test@example.com' }
  };
  localStorage.setItem('sb-localhost-auth-token', JSON.stringify(session));
});
await page.goto('/pets');
// Check if this works
```

### Step 5: Check Auth Hook  
Verify `useAuth()` hook is correctly reading session:

```typescript
// Add logging to AuthProvider
console.log('Auth session:', session);
console.log('Auth user:', user);
```

## Recommended Approach

### Option A: Fix Supabase Mocks (Ideal but Complex)
1. Investigate why Supabase client isn't making HTTP requests
2. Fix mock setup to properly intercept all auth calls
3. Ensure session storage works correctly
4. Test auth flow end-to-end

**Pros**: Tests work as intended, proper E2E testing
**Cons**: Time-consuming, complex debugging

### Option B: Use Real Supabase for Tests (Pragmatic)
1. Set up test Supabase project
2. Use `USE_REAL_SUPABASE=true` environment variable
3. Clean up test data after each test

**Pros**: Simple, reliable, tests real integration
**Cons**: Requires Supabase project, slower tests, network dependency

### Option C: Simplified Mock Approach (Quick Win)
1. Create `__mockAuth` flag in window
2. Make AuthProvider check flag and skip API calls
3. Directly set user state in tests

```typescript
// In test
await page.evaluate(() => {
  window.__mockAuth = {
    user: { id: 'test-id', email: 'test@example.com' },
    session: { access_token: 'mock-token' }
  };
});

// In AuthProvider  
useEffect(() => {
  if (window.__mockAuth) {
    setUser(window.__mockAuth.user);
    setSession(window.__mockAuth.session);
    return;
  }
  // ... normal Supabase logic
}, []);
```

**Pros**: Quick fix, tests can run
**Cons**: Not testing real auth flow, hacky solution

## Current Status

✅ **Test Infrastructure**: Complete and production-ready
- 2,900+ lines of modern patterns
- Fixtures, POMs, Smart Waiters, Factories, Builders
- Well-documented with 5 comprehensive guides
- 19 test files updated

❌ **Auth Mock**: Not working, needs investigation

## Recommended Next Steps

1. **Commit Current Progress**: Infrastructure improvements are valuable regardless
2. **Dedicated Auth Investigation**: Set aside focused time to debug auth mock
3. **Consider Option B or C**: If auth mock proves too complex, pivot to alternative
4. **Incremental Testing**: Start with non-auth tests while fixing auth

## Timeline Estimate

- **Option A** (Fix mocks): 4-8 hours of investigation/debugging
- **Option B** (Real Supabase): 2-3 hours setup + test data management
- **Option C** (Simplified mock): 1-2 hours implementation

## Success Metrics

Once auth is working:
- Expected pass rate: 60-70% (170-200/285)
- Current failures should drop to ~80 tests
- Remaining failures will be actual bugs or missing features
