# Story 1.6: Protected Routes & Session Management

Status: ready-for-dev

## Story

As a user,
I want my session to persist and my data to be protected,
So that I don't have to log in constantly and my data stays private.

## Acceptance Criteria

1. Unauthenticated users accessing app routes redirect to `/login`
2. Authenticated users cannot access `/login` or `/signup` (redirect to dashboard)
3. Session persists across browser tabs
4. JWT auto-refreshes before expiration (seamless, no interruption)
5. Session expires after 30 days of inactivity
6. Manual logout clears session and redirects to login
7. Logout button visible in header/navigation when authenticated

## Tasks / Subtasks

- [ ] Task 1: Create ProtectedRoute component (AC: #1)
  - [ ] Create src/components/auth/ProtectedRoute.tsx
  - [ ] Check authentication status using useAuth hook
  - [ ] Redirect unauthenticated users to /login
  - [ ] Use React Router's Outlet component for nested routes
  - [ ] Handle loading state while checking auth
  - [ ] Preserve intended destination URL for redirect after login

- [ ] Task 2: Implement public route protection (AC: #2)
  - [ ] Create src/components/auth/PublicRoute.tsx component
  - [ ] Check authentication status using useAuth hook
  - [ ] Redirect authenticated users from /login and /signup to /dashboard
  - [ ] Allow access to public routes for unauthenticated users
  - [ ] Handle loading state while checking auth

- [ ] Task 3: Configure session persistence (AC: #3, #4, #5)
  - [ ] Verify Supabase client session persistence config (already in src/lib/supabase.ts)
  - [ ] Confirm persistSession: true and autoRefreshToken: true are set
  - [ ] Test JWT auto-refresh before expiration (Supabase handles automatically)
  - [ ] Verify session expiration after 30 days inactivity (Supabase default)
  - [ ] Test session persistence across browser tabs using BrowserStorageAdapter

- [ ] Task 4: Update App.tsx routing structure (AC: #1, #2)
  - [ ] Wrap protected routes with ProtectedRoute component
  - [ ] Wrap public auth routes (/login, /signup) with PublicRoute component
  - [ ] Keep other public routes (/, /forgot-password, /reset-password, /auth/callback) without wrapper
  - [ ] Verify route structure matches epic technical notes
  - [ ] Test navigation between public and protected routes

- [ ] Task 5: Create logout functionality (AC: #6)
  - [ ] Verify signOut method exists in AuthContext (already implemented in Story 1.1)
  - [ ] Test signOut calls supabase.auth.signOut()
  - [ ] Verify session is cleared from localStorage/sessionStorage
  - [ ] Verify user state is set to null in AuthContext
  - [ ] Test redirect to /login after logout

- [ ] Task 6: Create Header/Navigation with logout button (AC: #7)
  - [ ] Create src/components/layout/Header.tsx component
  - [ ] Add logout button (visible only when authenticated)
  - [ ] Use useAuth hook to check authentication status
  - [ ] Call signOut method on button click
  - [ ] Style header consistently with shadcn/ui components
  - [ ] Position header in app layout

- [ ] Task 7: Integrate Header into app layout (AC: #7)
  - [ ] Update App.tsx to include Header component
  - [ ] Display Header only for authenticated users
  - [ ] Ensure Header persists across all protected routes
  - [ ] Test Header visibility on login/logout

- [ ] Task 8: Testing and validation (All ACs)
  - [ ] Test unauthenticated user accessing /dashboard redirects to /login
  - [ ] Test authenticated user accessing /login redirects to /dashboard
  - [ ] Test authenticated user accessing /signup redirects to /dashboard
  - [ ] Test session persists when opening new browser tab
  - [ ] Test JWT auto-refresh (monitor network tab for token refresh)
  - [ ] Test logout button visible when authenticated
  - [ ] Test logout button hidden when not authenticated
  - [ ] Test logout clears session and redirects to /login
  - [ ] Test login after logout works correctly
  - [ ] Test protected routes remain accessible after page refresh
  - [ ] Test navigation between protected routes without re-authentication

## Dev Notes

### Technical Stack
- React 18 + Vite (from previous stories)
- React Router v6 with Outlet pattern for protected routes
- Supabase Auth session management (auto-refresh, persistence)
- AuthContext for global auth state (from Story 1.1)
- shadcn/ui components for UI consistency

### Implementation Approach
1. Create ProtectedRoute wrapper component using Outlet pattern
2. Create PublicRoute wrapper to prevent authenticated users from accessing login/signup
3. Verify Supabase session persistence config (already configured in Story 1.1)
4. Update App.tsx routing to wrap protected routes
5. Create Header component with logout button
6. Test complete authentication flow and session persistence

### Route Protection Strategy

**Protected Routes Pattern:**
```tsx
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/pets/*" element={<PetsRoutes />} />
  {/* More protected routes */}
</Route>
```

**Public Routes Pattern:**
```tsx
<Route element={<PublicRoute />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
</Route>
```

### Session Persistence Details

**Supabase Configuration (already in src/lib/supabase.ts):**
- `persistSession: true` - Sessions stored in localStorage/sessionStorage
- `autoRefreshToken: true` - JWTs refresh automatically before expiration
- `detectSessionInUrl: true` - Handles OAuth callbacks with session tokens
- `BrowserStorageAdapter` - Custom adapter checks both localStorage (persistent) and sessionStorage (browser-session only)

**Session Behavior:**
- **Default expiration**: 30 days of inactivity (Supabase default)
- **Token refresh**: Automatic, seamless (no user interruption)
- **Cross-tab sync**: Handled by storage events and onAuthStateChange listener
- **Remember me**: Implemented in Story 1.3 (localStorage vs sessionStorage)

### Learnings from Previous Story

**From Story 1-5-password-reset-flow (Status: ready-for-dev)**

Previous story not yet implemented. Story 1.5 is ready for development but hasn't been started yet.

**Most Recent Completed Story: Story 1-4-google-oauth-integration (Status: done)**

- **New Components Created**:
  - GoogleOAuthButton component at src/components/auth/GoogleOAuthButton.tsx
  - GoogleIcon component at src/components/auth/GoogleIcon.tsx
  - AuthCallback page at src/pages/AuthCallback.tsx

- **Architectural Patterns**:
  - AuthContext pattern for centralized auth state management (continue using)
  - Supabase Auth with custom storage adapters (BrowserStorageAdapter)
  - Real-time form validation with React Hook Form + Zod
  - Generic error messages for security (don't leak credential details)
  - OAuth callback handler with profile creation logic

- **Reusable Components**:
  - AuthLayout component at src/components/auth/AuthLayout.tsx - use for consistent auth page layout
  - Button component from shadcn/ui with variant patterns
  - Form components following established patterns

- **Testing Approach**:
  - Manual testing is acceptable (no automated test framework configured yet)
  - Document test scenarios in story for user verification

- **Files to Reuse**:
  - src/contexts/AuthContext.tsx - centralized auth state (user, session, loading, signOut)
  - src/lib/supabase.ts - Supabase client with custom storage adapter and session config
  - src/components/ui/* - shadcn/ui components for consistent styling

- **Routes Established**:
  - / → redirects to /login
  - /login → LoginPage with email/password form and OAuth button
  - /signup → SignupPage with email/password form and OAuth button
  - /dashboard → protected route (currently placeholder)
  - /verify-email → email verification flow
  - /auth/callback → OAuth callback handler

- **Session Management**:
  - Auto-login pattern established after OAuth
  - Session persistence handled by AuthContext
  - Redirect to dashboard after successful auth
  - BrowserStorageAdapter checks both localStorage and sessionStorage

[Source: stories/1-4-google-oauth-integration.md#Dev-Agent-Record]

### Project Structure Notes

**Component Location**:
- Auth components: `src/components/auth/`
- Layout components: `src/components/layout/` (NEW - for Header)
- UI components: `src/components/ui/` (shadcn/ui)
- Pages: `src/pages/`
- Contexts: `src/contexts/`

**Current Routing Structure (from Story 1.4)**:
```tsx
// Public routes
<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="/signup" element={<SignupPage />} />
<Route path="/login" element={<LoginPage />} />
<Route path="/verify-email" element={<VerifyEmailPage />} />
<Route path="/email-verified" element={<EmailVerifiedPage />} />
<Route path="/auth/callback" element={<AuthCallback />} />

// Protected routes (currently using VerifiedRoute)
<Route element={<VerifiedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
</Route>
```

**New Routing Structure (This Story)**:
```tsx
// Public routes (unrestricted)
<Route path="/" element={<Navigate to="/login" replace />} />
<Route path="/forgot-password" element={<ForgotPasswordPage />} />
<Route path="/reset-password" element={<ResetPasswordPage />} />
<Route path="/verify-email" element={<VerifyEmailPage />} />
<Route path="/email-verified" element={<EmailVerifiedPage />} />
<Route path="/auth/callback" element={<AuthCallback />} />

// Public auth routes (redirect authenticated users to dashboard)
<Route element={<PublicRoute />}>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignupPage />} />
</Route>

// Protected routes (require authentication)
<Route element={<ProtectedRoute />}>
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/pets/*" element={<PetsRoutes />} /> {/* Future */}
  <Route path="/settings/*" element={<SettingsRoutes />} /> {/* Future */}
</Route>
```

**Note**: VerifiedRoute (email verification check) may need to be combined with ProtectedRoute or used as nested wrapper depending on requirements.

### Authentication Flow Integration

**ProtectedRoute Logic:**
1. Check `useAuth()` loading state → show loading spinner
2. Check `useAuth()` user state:
   - If null (not authenticated) → redirect to /login with `from` parameter
   - If authenticated → render `<Outlet />` for nested routes

**PublicRoute Logic:**
1. Check `useAuth()` loading state → show loading spinner
2. Check `useAuth()` user state:
   - If authenticated → redirect to /dashboard
   - If null (not authenticated) → render route

**Logout Flow:**
1. User clicks logout button in Header
2. Call `signOut()` from useAuth hook
3. AuthContext calls `supabase.auth.signOut()`
4. Session cleared from storage
5. User state set to null
6. Automatic redirect to /login (via ProtectedRoute)

### References

- [Epic 1: Foundation & Authentication - docs/epics.md#Epic-1]
- [Story 1.1: User Registration - stories/1-1-user-registration-with-email-password.md]
- [Story 1.3: User Login - stories/1-3-user-login-with-email-password.md]
- [Story 1.4: Google OAuth Integration - stories/1-4-google-oauth-integration.md]
- [React Router Protected Routes Documentation](https://reactrouter.com/en/main/start/overview)
- [Supabase Session Management Documentation](https://supabase.com/docs/guides/auth/sessions)

## Dev Agent Record

### Context Reference

- docs/stories/1-6-protected-routes-session-management.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-05:** Story drafted from Epic 1.6 requirements (Status: backlog → drafted)
