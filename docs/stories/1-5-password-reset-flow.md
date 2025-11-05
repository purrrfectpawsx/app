# Story 1.5: Password Reset Flow

Status: ready-for-dev

## Story

As a user who forgot my password,
I want to reset it via email,
So that I can regain access to my account.

## Acceptance Criteria

1. "Forgot Password?" link visible on login page
2. Forgot password form accepts email address
3. Reset email sent within 60 seconds (even if email doesn't exist - security)
4. Email contains branded message and secure reset link (valid 1 hour)
5. Reset link opens form to enter new password (with confirmation)
6. New password validated (same rules as signup)
7. Successful reset invalidates old password immediately
8. User automatically logged in after successful reset
9. Notification email sent confirming password change

## Tasks / Subtasks

- [ ] Task 1: Create ForgotPasswordForm component (AC: #1, #2, #3)
  - [ ] Create src/components/auth/ForgotPasswordForm.tsx
  - [ ] Add email input field with validation (required, valid email format)
  - [ ] Add "Send Reset Link" submit button
  - [ ] Implement Supabase auth.resetPasswordForEmail() call
  - [ ] Show success message after submission (regardless of email existence)
  - [ ] Handle loading state during email send
  - [ ] Add error handling for network failures

- [ ] Task 2: Create ForgotPassword page (AC: #1)
  - [ ] Create src/pages/ForgotPassword.tsx
  - [ ] Use AuthLayout component for consistent auth page design
  - [ ] Add ForgotPasswordForm component
  - [ ] Add "Back to Login" link
  - [ ] Add route /forgot-password to App.tsx

- [ ] Task 3: Add "Forgot Password?" link to LoginForm (AC: #1)
  - [ ] Update src/components/auth/LoginForm.tsx
  - [ ] Add link below password field
  - [ ] Link navigates to /forgot-password route
  - [ ] Style link consistently with existing auth forms

- [ ] Task 4: Configure Supabase password reset email (AC: #3, #4)
  - [ ] Customize password reset email template in Supabase Auth settings
  - [ ] Add PetLog branding to email
  - [ ] Verify reset link format: includes token and redirects to /reset-password
  - [ ] Set token expiration to 1 hour
  - [ ] Test email delivery time (<60 seconds)

- [ ] Task 5: Create ResetPasswordForm component (AC: #5, #6, #7, #8)
  - [ ] Create src/components/auth/ResetPasswordForm.tsx
  - [ ] Add new password field (password type input)
  - [ ] Add confirm password field
  - [ ] Implement password validation: minimum 8 characters, 1 uppercase, 1 number
  - [ ] Add password mismatch validation
  - [ ] Show real-time validation feedback
  - [ ] Implement Supabase auth.updateUser({ password: newPassword })
  - [ ] Handle successful reset: show success message, auto-login
  - [ ] Handle errors (expired token, invalid token, network failure)

- [ ] Task 6: Create ResetPassword page (AC: #5)
  - [ ] Create src/pages/ResetPassword.tsx
  - [ ] Use AuthLayout component
  - [ ] Add ResetPasswordForm component
  - [ ] Extract reset token from URL query parameters
  - [ ] Handle invalid/missing token with error message
  - [ ] Add route /reset-password to App.tsx
  - [ ] Redirect to dashboard after successful reset and auto-login

- [ ] Task 7: Configure password change confirmation email (AC: #9)
  - [ ] Verify Supabase sends confirmation email automatically
  - [ ] Customize confirmation email template in Supabase Auth settings
  - [ ] Add PetLog branding to confirmation email
  - [ ] Include security message: "If you didn't make this change, contact support"
  - [ ] Test confirmation email is sent after password reset

- [ ] Task 8: Testing and validation (All ACs)
  - [ ] Test forgot password flow with valid email (existing user)
  - [ ] Test forgot password flow with non-existent email (should still show success)
  - [ ] Test reset email is received within 60 seconds
  - [ ] Test reset link opens reset password page
  - [ ] Test password validation (min 8 chars, 1 uppercase, 1 number)
  - [ ] Test password mismatch validation
  - [ ] Test successful password reset and auto-login
  - [ ] Test old password no longer works after reset
  - [ ] Test confirmation email is sent after reset
  - [ ] Test expired reset token (after 1 hour)
  - [ ] Test invalid reset token
  - [ ] Test network error handling

## Dev Notes

### Technical Stack
- React 18 + Vite (from previous stories)
- Supabase Auth password reset API
- shadcn/ui components (from Story 1.1)
- React Hook Form + Zod validation (from Story 1.1)
- AuthContext for session management (from Story 1.1)

### Implementation Approach
1. Create ForgotPasswordForm with email input and Supabase resetPasswordForEmail call
2. Create ResetPasswordForm with new password inputs and validation
3. Configure Supabase email templates for reset and confirmation
4. Integrate forms into pages with AuthLayout
5. Add routes to App.tsx
6. Implement auto-login after successful reset
7. Test complete flow end-to-end

### Password Reset Flow
1. User clicks "Forgot Password?" link on login page
2. User enters email address in ForgotPasswordForm
3. Call `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/reset-password' })`
4. Show success message (even if email doesn't exist - security best practice)
5. Supabase sends email with reset link containing token
6. User clicks reset link → opens /reset-password with token in URL
7. ResetPasswordForm extracts token from URL
8. User enters new password (validated) and confirms
9. Call `supabase.auth.updateUser({ password: newPassword })`
10. Password updated, old password invalidated immediately
11. Auto-login user with new session
12. Redirect to /dashboard
13. Supabase sends confirmation email

### Security Considerations
- **Email privacy**: Always show success message even if email doesn't exist (prevents email enumeration attacks)
- **Token security**: Reset tokens are single-use, expire after 1 hour
- **Password validation**: Same rules as signup (min 8 chars, 1 uppercase, 1 number)
- **Immediate invalidation**: Old password stops working immediately after reset
- **Confirmation email**: Alerts user to password change (detects unauthorized resets)
- **Rate limiting**: Supabase built-in rate limiting prevents spam (60 requests/min per IP)

### Learnings from Previous Story

**From Story 1-4-google-oauth-integration (Status: done)**

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
  - Consider adding automated tests in future epic (noted in review)

- **Files to Reuse**:
  - src/contexts/AuthContext.tsx - centralized auth state and methods
  - src/components/auth/AuthLayout.tsx - consistent auth page wrapper
  - src/lib/supabase.ts - Supabase client with custom storage adapter
  - src/schemas/auth.ts - validation schemas (password validation already defined)

- **Routes Established**:
  - / → redirects to /login
  - /login → LoginPage with email/password form and OAuth button
  - /signup → SignupPage with email/password form and OAuth button
  - /dashboard → protected route
  - /verify-email → email verification flow
  - /auth/callback → OAuth callback handler

- **Review Learnings**:
  - All code review items from Story 1.4 have been resolved
  - Manual testing guidance documented (follow similar pattern for this story)
  - Environment-based logging pattern established (use for error logging)
  - Google branding guidelines followed (not applicable for this story)

- **Session Management**:
  - Auto-login pattern established after OAuth
  - Session persistence handled by AuthContext
  - Redirect to dashboard after successful auth

[Source: stories/1-4-google-oauth-integration.md#Dev-Agent-Record]

### Project Structure Notes

**Component Location**:
- Auth components: `src/components/auth/`
- UI components: `src/components/ui/` (shadcn/ui)
- Pages: `src/pages/`
- Contexts: `src/contexts/`
- Schemas: `src/schemas/`

**Routing Structure**:
- Public routes: /, /login, /signup, /forgot-password (NEW), /reset-password (NEW), /auth/callback
- Protected routes: /dashboard, /pets/*, /settings/*

**Authentication Flow Integration**:
- Password reset must integrate with existing AuthContext
- Auto-login after reset uses same session management as login/OAuth
- Email templates configured in Supabase Auth settings

**Form Patterns**:
- Use React Hook Form + Zod for validation (established pattern)
- Reuse password validation schema from src/schemas/auth.ts
- Follow shadcn/ui form component patterns
- Show loading states during API calls
- Display user-friendly error messages

### References

- [Epic 1: Foundation & Authentication - docs/epics.md#Epic-1]
- [Story 1.1: User Registration - stories/1-1-user-registration-with-email-password.md]
- [Story 1.3: User Login - stories/1-3-user-login-with-email-password.md]
- [Story 1.4: Google OAuth Integration - stories/1-4-google-oauth-integration.md]
- [Supabase Password Reset Documentation](https://supabase.com/docs/guides/auth/passwords)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

## Dev Agent Record

### Context Reference

- docs/stories/1-5-password-reset-flow.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-05:** Story drafted from Epic 1.5 requirements (Status: backlog → drafted)
