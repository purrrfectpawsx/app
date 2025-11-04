# app - Epic Breakdown

**Author:** Endre
**Date:** 2025-11-03
**Project Level:** Level 3
**Target Scale:** Medium

---

## Overview

This document provides the detailed epic breakdown for app, expanding on the high-level epic list in the [PRD](./PRD.md).

Each epic includes:

- Expanded goal and value proposition
- Complete story breakdown with user stories
- Acceptance criteria for each story
- Story sequencing and dependencies

**Epic Sequencing Principles:**

- Epic 1 establishes foundational infrastructure and initial functionality
- Subsequent epics build progressively, each delivering significant end-to-end value
- Stories within epics are vertically sliced and sequentially ordered
- No forward dependencies - each story builds only on previous work

---

## Implementation Summary

### Epic Overview

**Total: 7 Epics, 69 Stories**

1. **Epic 1: Foundation & Authentication** - 6 stories
2. **Epic 2: Pet Profile Management** - 6 stories
3. **Epic 3: Health Tracking & Timeline** - 10 stories
4. **Epic 4: Financial Management & Budgeting** - 11 stories
5. **Epic 5: Smart Reminders & Notifications** - 10 stories
6. **Epic 6: Document Management & Export** - 8 stories
7. **Epic 7: Subscription & Monetization** - 10 stories

### Implementation Phases

**Phase 1: Foundation (Week 1-2) - 12 stories**

Sequential Core:
- Stories 1.1 → 1.2 → 1.3 → 1.6 (Auth chain - must be sequential)

Parallel Opportunities:
- Story 1.4 (Google OAuth - after 1.1)
- Story 1.5 (Password reset - after 1.3)
- Story 2.1 → 2.2 → 2.3 → 2.4 → 2.5 → 2.6 (Pet management - can start after auth)

**Phase 2: Core Value Delivery (Week 3-5) - 29 stories**

Health Tracking (10 stories):
- Stories 3.1 → 3.2 → 3.3 → 3.4 (sequential)
- Stories 3.5, 3.6, 3.7, 3.8, 3.9, 3.10 (parallel after 3.4)

Expense Tracking (11 stories - parallel with health):
- Stories 4.1 → 4.2 → 4.3 (sequential)
- Stories 4.4 → 4.5 (sequential budget)
- Stories 4.6, 4.7, 4.8, 4.9, 4.10, 4.11 (parallel after 4.3)

Document Schema:
- Story 6.1 (independent, start anytime after 2.1)

**Phase 3: Proactive Features (Week 6-7) - 18 stories**

Reminders (10 stories):
- Stories 5.1 → 5.2 → 5.3 → 5.4 (sequential)
- Stories 5.5, 5.7 (parallel integration setup)
- Stories 5.6 (after 5.5), 5.8 (after 5.7)
- Stories 5.9, 5.10 (parallel after 5.3)

Documents (8 stories - parallel with reminders):
- Stories 6.2 → 6.3 (after 6.1)
- Stories 6.4, 6.5, 6.6, 6.7, 6.8 (parallel after 6.3)

**Phase 4: Monetization & Polish (Week 8) - 10 stories**

- Stories 7.1 → 7.2 → 7.3 → 7.4 (sequential Stripe setup)
- Stories 7.5, 7.6, 7.7, 7.8, 7.9, 7.10 (parallel after 7.4)

### Development Guidance

**Getting Started:**
1. Complete auth chain: Stories 1.1 → 1.2 → 1.3 → 1.6
2. Parallel work: Stories 1.4, 1.5, 2.1
3. Pet management: Stories 2.2-2.6 after 2.1

**Key Architecture Decisions:**
- Forms: React Hook Form + Zod validation
- UI: shadcn/ui (Radix UI + Tailwind CSS)
- State: React Context (auth, tier) + local state
- API: Supabase client with Row Level Security
- Charts: Recharts for visualizations
- Routing: React Router v6 with protected routes

**Critical Setup Required:**
- Supabase project (database, auth, storage)
- Stripe account (payment processing)
- OneSignal app (push notifications)
- Resend account (email notifications)
- Vercel deployment

**Risk Areas:**
- RLS Policies: Test thoroughly - data isolation is critical
- Storage Cleanup: Delete files when deleting records (Stories 2.5, 3.8, 4.9, 6.5)
- Webhook Idempotency: Prevent duplicate Stripe event processing (Story 7.4)
- Free Tier Enforcement: Backend checks mandatory (all tier limit stories)
- Timezone Handling: Store UTC, display local (Reminder stories 5.1-5.3)

**Parallelization:**
- Max parallel stories: 6-8 at peak (Phase 2)
- Critical path: Auth → Pets → Health/Expenses → Reminders/Docs → Monetization
- Independent workstreams: Health and Expenses develop simultaneously in Phase 2

### Free Tier Limits

All free tier enforcement stories implement backend checks:
- **1 pet** (Story 2.6)
- **50 health records per pet** (Story 3.10)
- **100 expenses per month** (Story 4.11)
- **10 active reminders** (Story 5.10)
- **100MB total storage** (Story 6.8)

Premium tier: Unlimited everything + full PDF exports

---

## Epic 1: Foundation & Authentication

**Epic Goal:** Enable secure user access with multiple authentication methods, establishing the foundation for all user-specific features.

**Epic Value:** Without secure authentication, users cannot safely store pet data. This epic delivers peace of mind that data is private and accessible only to the owner.

---

**Story 1.1: User Registration with Email/Password**

As a pet owner,
I want to create an account using my email and password,
So that I can securely access my pet's data from any device.

**Acceptance Criteria:**
1. Signup form displays email, password, confirm password, and name fields
2. Password validation enforces: minimum 8 characters, 1 uppercase, 1 number
3. Duplicate email addresses rejected with clear error message
4. Successful registration creates user in Supabase Auth and profiles table
5. User redirected to email verification prompt after signup
6. Form validation provides real-time feedback (invalid email, password mismatch)

**Technical Notes:**
- Components: `SignupForm.tsx`, `AuthLayout.tsx`
- Supabase: `auth.signUp()` API
- Database: `profiles` table with columns: id (uuid, FK to auth.users), email, name, created_at, subscription_tier (default: 'free')
- Validation: React Hook Form + Zod schema
- State: Store auth state in React Context (`AuthContext.tsx`)

**Prerequisites:** None (foundational story)

---

**Story 1.2: Email Verification Flow**

As a new user,
I want to verify my email address,
So that I can activate my account and prove I own the email.

**Acceptance Criteria:**
1. After signup, user sees "Check your email for verification link" message
2. Verification email sent via Supabase Auth within 60 seconds
3. Email contains branded message and verification link
4. Clicking verification link marks email as verified in Supabase
5. Verified users redirected to onboarding/dashboard
6. Unverified users blocked from accessing app routes (redirect to verification pending page)
7. Resend verification email option available if not received

**Technical Notes:**
- Components: `VerificationPending.tsx`, `EmailVerified.tsx`
- Supabase: Built-in email verification (configure in Supabase dashboard)
- Email template: Customize in Supabase Auth settings
- Route guards: Check `user.email_confirmed_at` before allowing access
- Resend: `auth.resend()` API

**Prerequisites:** Story 1.1 (signup must exist to trigger verification)

---

**Story 1.3: User Login with Email/Password**

As a returning user,
I want to log in with my email and password,
So that I can access my pet data.

**Acceptance Criteria:**
1. Login form displays email and password fields with "Remember me" checkbox
2. Valid credentials authenticate user and create session
3. Invalid credentials show error: "Invalid email or password" (no hint which is wrong)
4. Session persists across browser sessions if "Remember me" enabled
5. Successful login redirects to dashboard
6. Loading state shown during authentication
7. Account lockout after 5 failed attempts (Supabase rate limiting)

**Technical Notes:**
- Components: `LoginForm.tsx`, `AuthLayout.tsx`
- Supabase: `auth.signInWithPassword()` API
- Session: JWT stored in localStorage/sessionStorage based on "Remember me"
- Error handling: Display user-friendly messages from Supabase errors
- Rate limiting: Supabase built-in (60 req/min per IP)

**Prerequisites:** Story 1.1 (users must exist to login)

---

**Story 1.4: Google OAuth Integration**

As a user who prefers quick signup,
I want to log in with my Google account,
So that I can skip creating a new password and access the app faster.

**Acceptance Criteria:**
1. "Continue with Google" button appears on signup and login pages
2. Clicking button opens Google OAuth consent screen
3. Successful OAuth creates/logs in user and redirects to dashboard
4. User profile created automatically with name and email from Google
5. OAuth failures show clear error message with retry option
6. Google OAuth users can set password later (optional account linking)

**Technical Notes:**
- Components: `GoogleOAuthButton.tsx`
- Supabase: Configure Google OAuth provider in Auth settings
- API: `auth.signInWithOAuth({ provider: 'google' })`
- Callback: Handle OAuth redirect at `/auth/callback` route
- Profile creation: Trigger on first OAuth login (check if profile exists)
- Icon: Use Google brand assets (proper styling per Google guidelines)

**Prerequisites:** Story 1.1 (auth infrastructure and profiles table)

---

**Story 1.5: Password Reset Flow**

As a user who forgot my password,
I want to reset it via email,
So that I can regain access to my account.

**Acceptance Criteria:**
1. "Forgot Password?" link visible on login page
2. Forgot password form accepts email address
3. Reset email sent within 60 seconds (even if email doesn't exist - security)
4. Email contains branded message and secure reset link (valid 1 hour)
5. Reset link opens form to enter new password (with confirmation)
6. New password validated (same rules as signup)
7. Successful reset invalidates old password immediately
8. User automatically logged in after successful reset
9. Notification email sent confirming password change

**Technical Notes:**
- Components: `ForgotPasswordForm.tsx`, `ResetPasswordForm.tsx`
- Supabase: `auth.resetPasswordForEmail()` and `auth.updateUser()`
- Email: Configure reset email template in Supabase
- Security: Reset tokens single-use, expire after 1 hour
- Route: `/reset-password` handles reset link with token
- Validation: React Hook Form + Zod (same as signup)

**Prerequisites:** Story 1.3 (login flow exists for post-reset login)

---

**Story 1.6: Protected Routes & Session Management**

As a user,
I want my session to persist and my data to be protected,
So that I don't have to log in constantly and my data stays private.

**Acceptance Criteria:**
1. Unauthenticated users accessing app routes redirect to `/login`
2. Authenticated users cannot access `/login` or `/signup` (redirect to dashboard)
3. Session persists across browser tabs
4. JWT auto-refreshes before expiration (seamless, no interruption)
5. Session expires after 30 days of inactivity
6. Manual logout clears session and redirects to login
7. Logout button visible in header/navigation when authenticated

**Technical Notes:**
- Components: `ProtectedRoute.tsx` (React Router wrapper), `AuthContext.tsx` (global auth state)
- Supabase: `auth.onAuthStateChange()` listener for session updates
- React Router: Use `<Outlet />` pattern for protected route layout
- JWT refresh: Supabase client handles automatically
- Logout: `auth.signOut()` API, clear local state, redirect to login
- Route structure:
  - Public: `/`, `/login`, `/signup`, `/forgot-password`, `/reset-password`
  - Protected: `/dashboard`, `/pets/*`, `/expenses/*`, `/reminders/*`, `/documents/*`, `/settings/*`

**Prerequisites:** Story 1.3 (login creates sessions to protect)

---

## Epic 2: Pet Profile Management

**Epic Goal:** Enable users to create and manage pet profiles, establishing the core entity around which all tracking features are built.

**Epic Value:** Pets are the central hub of PetLog - all health records, expenses, reminders, and documents are linked to pets. This epic delivers the foundational user experience of "adding your first pet."

---

**Story 2.1: Create Pet Profile with Basic Info**

As a pet owner,
I want to create a pet profile with name, species, and photo,
So that I can start tracking my pet's health and expenses.

**Acceptance Criteria:**
1. Create pet form displays: name (required), species dropdown (required: dog, cat, bird, rabbit, other), breed (optional), birth date (optional), photo upload (optional)
2. Species dropdown shows common pet types with icons
3. Photo upload supports JPG, PNG, HEIC up to 5MB
4. Form validates required fields before submission
5. Successful creation shows success message and navigates to pet detail page
6. Free tier users can create 1 pet (enforced in backend)
7. Photo compressed client-side before upload (50-70% size reduction)

**Technical Notes:**
- Components: `CreatePetForm.tsx`, `PetPhotoUpload.tsx`
- Database: `pets` table with columns: id (uuid), user_id (FK to profiles), name, species, breed, birth_date, photo_url, gender, spayed_neutered, microchip, notes, created_at
- Supabase Storage: `pets-photos` bucket with RLS policies (user can only access their own)
- Image compression: Use `browser-image-compression` library
- Validation: React Hook Form + Zod schema
- Free tier check: Query count of user's pets before allowing create

**Prerequisites:** Story 1.6 (protected routes ensure only authenticated users create pets)

---

**Story 2.2: View All Pets Grid**

As a user with pets,
I want to see all my pets in a visual grid,
So that I can quickly select which pet to manage.

**Acceptance Criteria:**
1. Dashboard shows pet cards in responsive grid (1 column mobile, 2-3 columns desktop)
2. Each card displays: pet photo (or placeholder), name, species, age (calculated from birth date)
3. Cards show visual indicators: red badge for overdue vaccines (if any exist)
4. Tapping card navigates to pet detail page
5. Empty state shows "Add your first pet" with prominent CTA button
6. Grid loads in <2 seconds
7. Pet photos optimized for card size (thumbnail resolution)

**Technical Notes:**
- Components: `PetsGrid.tsx`, `PetCard.tsx`, `EmptyPetsState.tsx`
- API: Supabase query fetches all pets for current user with `.select('*')`
- Age calculation: Client-side function using `date-fns` library
- Overdue vaccine badge: Requires health_records table (will be populated later, show placeholder for now)
- Responsive: Tailwind CSS grid with breakpoints (grid-cols-1 sm:grid-cols-2 lg:grid-cols-3)
- Route: `/pets` (dashboard)

**Prerequisites:** Story 2.1 (pets must exist to display)

---

**Story 2.3: Pet Detail Page with Full Info**

As a user,
I want to view complete details for a selected pet,
So that I can see all information at a glance and access related features.

**Acceptance Criteria:**
1. Pet detail page displays all pet fields: photo, name, species, breed, birth date/age, weight, gender, spayed/neutered status, microchip number, notes
2. Page shows quick stats: Total health records, Last vet visit date, Total expenses (placeholder $0 until expense tracking implemented)
3. Navigation tabs visible for: Health, Expenses, Reminders, Documents (placeholders initially)
4. Edit and Delete buttons accessible from header
5. Back button returns to pets grid
6. Page loads in <2 seconds
7. Missing optional fields show "Not provided" or hidden gracefully

**Technical Notes:**
- Components: `PetDetailPage.tsx`, `PetInfoCard.tsx`, `PetStats.tsx`
- API: Supabase query fetches pet by id with RLS ensuring user owns pet
- Route: `/pets/:petId`
- Age calculation: Display "X years Y months" or "X months" for young pets
- Quick stats: Aggregate queries count health_records, expenses (implement when tables exist)
- Navigation tabs: Use React Router nested routes (future stories activate tabs)

**Prerequisites:** Story 2.2 (grid links to detail pages)

---

**Story 2.4: Edit Pet Profile**

As a user,
I want to update my pet's information,
So that I can keep their profile accurate as they grow or if I initially missed details.

**Acceptance Criteria:**
1. Edit button on pet detail page opens edit form
2. Form pre-populates with existing pet data
3. All fields editable except creation date
4. Photo can be replaced (upload new) or removed (revert to placeholder)
5. Validation enforces same rules as create (name and species required)
6. Save button updates pet and shows success message
7. Changes persist immediately, pet detail page updates without refresh
8. Cancel button discards changes and returns to detail view

**Technical Notes:**
- Components: `EditPetForm.tsx` (reuse/extend `CreatePetForm.tsx`)
- API: Supabase `.update()` on pets table with RLS
- Photo replacement: Upload new photo to storage, delete old photo, update photo_url
- Optimistic UI: Update local state immediately, rollback if API fails
- Validation: Prevent future birth dates, weight must be positive number
- Form mode: Add `mode` prop to CreatePetForm to toggle create/edit behavior

**Prerequisites:** Story 2.3 (detail page provides edit entry point)

---

**Story 2.5: Delete Pet with Confirmation**

As a user,
I want to delete a pet profile when no longer needed,
So that I can keep my account clean (e.g., pet passed away or transferred ownership).

**Acceptance Criteria:**
1. Delete button visible on pet detail page with destructive styling (red)
2. Clicking delete shows confirmation dialog with warning message
3. Dialog explains: "This will permanently delete [Pet Name] and all associated health records, expenses, reminders, and documents. This cannot be undone."
4. Dialog shows count of items to be deleted (e.g., "12 health records, 45 expenses")
5. Confirmation requires typing pet name or clicking "Yes, delete" button
6. Successful deletion redirects to pets grid with success message
7. Deletion cascades to all related data (health_records, expenses, reminders, documents)
8. Deleted pet photos removed from storage

**Technical Notes:**
- Components: `DeletePetDialog.tsx`
- API: Supabase `.delete()` on pets table with CASCADE foreign key constraints
- Count query: Aggregate counts before deletion for confirmation dialog
- Storage cleanup: Supabase Edge Function or manual deletion of pet photos and documents
- Database: Ensure foreign keys set to CASCADE DELETE in schema
- UI: Use shadcn/ui AlertDialog component for confirmation
- Safety: Require explicit confirmation (type pet name) to prevent accidental deletion

**Prerequisites:** Story 2.3 (detail page provides delete entry point)

---

**Story 2.6: Free Tier Enforcement - 1 Pet Limit**

As a product owner,
I want free tier users limited to 1 pet,
So that premium subscriptions provide clear value.

**Acceptance Criteria:**
1. Free tier users attempting to create a 2nd pet see upgrade prompt dialog
2. Dialog explains: "Free plan allows 1 pet. Upgrade to Premium for unlimited pets."
3. Dialog shows upgrade CTA button (links to pricing/checkout - placeholder for now)
4. Premium users can create unlimited pets (no limit check)
5. Upgrade prompt also appears on pets grid if user has 1 pet (banner message)
6. Backend enforces limit (frontend check can be bypassed, backend is source of truth)
7. Usage indicator visible on pets grid: "1/1 pets used (Free plan)"

**Technical Notes:**
- Components: `UpgradePromptDialog.tsx`, `TierLimitBanner.tsx`
- API: Backend check before pet creation - query `SELECT COUNT(*) FROM pets WHERE user_id = $1`
- Subscription tier: Check `profiles.subscription_tier` column ('free' or 'premium')
- Error handling: Return 403 Forbidden if limit exceeded with upgrade message
- Usage indicator: Show on pets grid header for free tier users
- Placeholder: Upgrade button can link to `/pricing` page (implement Stripe later)

**Prerequisites:** Story 2.1 (create pet flow exists to enforce limit)

---

## Epic 3: Health Tracking & Timeline

**Epic Goal:** Enable comprehensive pet health tracking with multiple record types and visual timeline, solving the "never miss vaccines, instant health history" user problem.

**Epic Value:** This epic delivers the first core promise of PetLog - pet owners can track all health information in one place, see overdue vaccines at a glance, and have instant access to health history during vet visits.

---

**Story 3.1: Create Health Record Database Schema**

As a developer,
I want to establish the health records database schema,
So that we can store multiple health record types with type-specific fields.

**Acceptance Criteria:**
1. `health_records` table created with columns: id (uuid), pet_id (FK to pets), user_id (FK to profiles for RLS), record_type (enum), title, date, notes, created_at, updated_at
2. Record type enum includes: vaccine, medication, vet_visit, symptom, weight_check
3. Type-specific JSON fields: vaccine_data (expiration_date, vet_clinic, dose), medication_data (dosage, frequency, start_date, end_date), vet_visit_data (clinic, vet_name, diagnosis, treatment, cost), symptom_data (severity, observed_behaviors), weight_data (weight, unit, body_condition)
4. Foreign key constraints with CASCADE DELETE (delete pet → delete all health records)
5. RLS policies ensure users only access their own health records
6. Database indexes on: pet_id, user_id, date, record_type for query performance

**Technical Notes:**
- Database: Supabase PostgreSQL with RLS
- Schema migration: Create via Supabase SQL editor or migration files
- JSON columns for type-specific data (flexible, avoids multiple tables)
- RLS policy: `user_id = auth.uid()`
- Indexes: `CREATE INDEX idx_health_records_pet_date ON health_records(pet_id, date DESC);`

**Prerequisites:** Story 2.1 (pets table must exist for foreign key)

---

**Story 3.2: Create Vaccine Record**

As a pet owner,
I want to record vaccine information with expiration dates,
So that I never miss vaccine renewals and have proof for boarding/travel.

**Acceptance Criteria:**
1. "Add Health Record" button visible on pet detail Health tab
2. Record type selector shows: Vaccine, Medication, Vet Visit, Symptom, Weight Check
3. Selecting "Vaccine" shows form fields: title (required), date (required), expiration date (optional), vet clinic (optional), dose (optional), notes (optional)
4. Date defaults to today with calendar picker
5. Expiration date validates must be after vaccine date
6. Successful save shows success message and adds record to timeline
7. Form validation prevents submission without required fields

**Technical Notes:**
- Components: `CreateHealthRecordForm.tsx`, `VaccineFields.tsx`
- API: Supabase insert into health_records with record_type='vaccine'
- JSON field: `vaccine_data: { expiration_date, vet_clinic, dose }`
- Validation: React Hook Form + Zod (expiration_date > date)
- Route: Modal/drawer from `/pets/:petId/health`
- Success: Close form, refetch health records, show toast

**Prerequisites:** Story 3.1 (database schema), Story 2.3 (pet detail page with Health tab)

---

**Story 3.3: Create Medication, Vet Visit, Symptom, and Weight Check Records**

As a pet owner,
I want to track different types of health events,
So that I have a complete health history beyond just vaccines.

**Acceptance Criteria:**
1. Record type selector allows choosing: Medication, Vet Visit, Symptom, Weight Check
2. **Medication fields:** title, date, dosage, frequency (dropdown: daily, twice daily, weekly), start date, end date, notes
3. **Vet Visit fields:** title, date, clinic, vet name, diagnosis, treatment, cost (optional), notes
4. **Symptom fields:** title, date, severity (dropdown: mild, moderate, severe), observed behaviors (textarea), notes
5. **Weight Check fields:** date, weight (number), unit (dropdown: kg, lbs), body condition (dropdown: underweight, ideal, overweight), notes
6. Form dynamically shows relevant fields based on selected record type
7. All record types save successfully and appear in timeline

**Technical Notes:**
- Components: `MedicationFields.tsx`, `VetVisitFields.tsx`, `SymptomFields.tsx`, `WeightCheckFields.tsx`
- API: Same health_records table, different JSON data per type
- Conditional rendering: Show fields based on `recordType` state
- Validation: Type-specific rules (weight must be positive, cost must be number)
- Frequency dropdown: ['daily', 'twice-daily', 'weekly', 'as-needed']
- Severity dropdown: ['mild', 'moderate', 'severe']

**Prerequisites:** Story 3.2 (health record creation infrastructure exists)

---

**Story 3.4: View Health Timeline with Color Coding**

As a pet owner,
I want to see all health records in a chronological timeline,
So that I can quickly review my pet's health history.

**Acceptance Criteria:**
1. Health tab on pet detail page shows timeline of all health records (newest first)
2. Each timeline entry displays: icon (based on type), title, date, key details preview
3. Color-coded by type: Vaccine (blue), Medication (purple), Vet Visit (green), Symptom (orange), Weight Check (teal)
4. Overdue vaccines highlighted with red border/background (expiration_date < today)
5. Clicking timeline entry expands to show full details
6. Timeline loads in <3 seconds for 100+ records
7. Empty state shows "Add your first health record" with CTA button

**Technical Notes:**
- Components: `HealthTimeline.tsx`, `HealthRecordCard.tsx`
- API: Supabase query `SELECT * FROM health_records WHERE pet_id = $1 ORDER BY date DESC`
- Overdue logic: Client-side check `vaccine_data.expiration_date < new Date()`
- Color mapping: Tailwind CSS classes per record type
- Icons: Use lucide-react (Syringe, Pill, Stethoscope, AlertCircle, Scale)
- Pagination: Load 50 records initially, infinite scroll for more

**Prerequisites:** Story 3.3 (health records exist to display)

---

**Story 3.5: Filter Timeline by Record Type**

As a pet owner,
I want to filter the health timeline by record type,
So that I can focus on specific health information (e.g., only vaccines).

**Acceptance Criteria:**
1. Filter chips visible above timeline: All, Vaccines, Medications, Vet Visits, Symptoms, Weight Checks
2. Clicking filter chip toggles that type on/off (multi-select)
3. Timeline updates immediately to show only selected types
4. At least one filter must be active (can't deselect all)
5. Active filters visually distinct (filled background vs outline)
6. Filter state persists during session (React state)
7. Record count shown per filter type (e.g., "Vaccines (5)")

**Technical Notes:**
- Components: `TimelineFilters.tsx` (chip group)
- State: `const [activeFilters, setActiveFilters] = useState(['all'])`
- Filter logic: `filteredRecords = records.filter(r => activeFilters.includes(r.record_type))`
- Count calculation: `records.filter(r => r.record_type === 'vaccine').length`
- UI: shadcn/ui Toggle or custom chip components
- Accessibility: Keyboard navigation for filter chips

**Prerequisites:** Story 3.4 (timeline exists to filter)

---

**Story 3.6: Weight Tracking Visualization Chart**

As a pet owner,
I want to see my pet's weight trends over time in a chart,
So that I can monitor if they're maintaining a healthy weight.

**Acceptance Criteria:**
1. "Weight Chart" section visible on Health tab below/above timeline
2. Line chart displays all Weight Check records over time (x-axis: date, y-axis: weight)
3. Chart shows ideal weight range as shaded area (based on species/breed defaults)
4. Date range selector: 1 month, 3 months, 6 months, 1 year, All time
5. Chart requires minimum 2 weight records to display (otherwise shows empty state)
6. Chart responsive to screen size (mobile-friendly)
7. Hover shows exact weight and date for each data point

**Technical Notes:**
- Components: `WeightChart.tsx`, `WeightChartControls.tsx`
- Charting library: Recharts (LineChart component)
- Data: Filter health_records where `record_type = 'weight_check'`
- Ideal range: Hardcoded defaults per species (dog: 10-30kg, cat: 3-6kg) - customize later
- Date filtering: Client-side filter based on selected range
- Empty state: "Add at least 2 weight records to see chart"
- Responsive: Recharts ResponsiveContainer with aspect ratio

**Prerequisites:** Story 3.4 (weight check records exist to visualize)

---

**Story 3.7: Edit Health Record**

As a pet owner,
I want to update existing health records,
So that I can correct mistakes or add details I initially forgot.

**Acceptance Criteria:**
1. Edit button visible on expanded timeline entry
2. Edit form pre-populates with existing record data
3. All fields editable except pet_id and creation date
4. Record type cannot be changed (would require different field structure)
5. Validation enforces same rules as create
6. Save updates record and refreshes timeline
7. Cancel discards changes and collapses entry

**Technical Notes:**
- Components: Reuse `CreateHealthRecordForm.tsx` with edit mode
- API: Supabase `.update()` on health_records table
- Pre-populate: Parse JSON fields back into form state
- Optimistic UI: Update local state immediately
- Validation: Same Zod schemas as create
- Updated timestamp: `updated_at = now()`

**Prerequisites:** Story 3.4 (timeline entries provide edit entry point)

---

**Story 3.8: Delete Health Record with Confirmation**

As a pet owner,
I want to delete health records I added by mistake,
So that my timeline stays accurate.

**Acceptance Criteria:**
1. Delete button visible on expanded timeline entry (destructive styling)
2. Confirmation dialog: "Are you sure you want to delete this [record type]?"
3. Dialog shows record title and date for confirmation
4. Successful deletion removes from timeline immediately
5. Success message: "[Record type] deleted successfully"
6. No cascade effects (deleting record doesn't affect other data)

**Technical Notes:**
- Components: `DeleteHealthRecordDialog.tsx`
- API: Supabase `.delete()` on health_records table
- Confirmation: shadcn/ui AlertDialog
- Timeline update: Remove from local state, refetch for accuracy
- Undo: Not implemented in MVP (permanent deletion)

**Prerequisites:** Story 3.4 (timeline entries provide delete entry point)

---

**Story 3.9: Attach Documents to Health Records**

As a pet owner,
I want to attach photos/PDFs to health records,
So that I can include vet records, vaccine cards, and lab results.

**Acceptance Criteria:**
1. Health record form includes "Attach Documents" section
2. File upload supports: PDF, JPG, PNG, HEIC up to 10MB per file
3. Multiple files can be attached (up to 5 per record)
4. Attached files show thumbnail preview with filename
5. Files stored in Supabase Storage with path: `health-documents/{pet_id}/{record_id}/{filename}`
6. Viewing record shows attached documents with preview/download buttons
7. Deleting record deletes associated documents from storage

**Technical Notes:**
- Components: `DocumentUploader.tsx`, `AttachedDocuments.tsx`
- Database: Add `document_urls` JSON array column to health_records table
- Storage: Supabase Storage bucket `health-documents` with RLS
- Upload flow: Upload to storage first, get URLs, save in record
- Thumbnails: Generate for images, use PDF icon for PDFs
- Deletion: Supabase Edge Function or manual cleanup on record delete

**Prerequisites:** Story 3.2 (health record creation exists to attach documents to)

---

**Story 3.10: Free Tier Enforcement - 50 Health Records Limit**

As a product owner,
I want free tier users limited to 50 health records per pet,
So that premium provides clear value for power users.

**Acceptance Criteria:**
1. Free tier users blocked from creating 51st health record
2. Upgrade prompt dialog: "Free plan allows 50 health records. Upgrade to Premium for unlimited."
3. Usage indicator on Health tab: "45/50 health records used (Free plan)"
4. Premium users have no limit
5. Limit enforced in backend (frontend check can be bypassed)
6. Count includes all record types (vaccines + medications + vet visits + symptoms + weight checks)

**Technical Notes:**
- API: Before insert, query `SELECT COUNT(*) FROM health_records WHERE pet_id = $1 AND user_id = $2`
- Subscription check: Query `profiles.subscription_tier`
- Error response: 403 Forbidden with upgrade message
- Components: Reuse `UpgradePromptDialog.tsx` from Epic 2
- Usage indicator: Show at top of Health tab for free tier users
- Per-pet limit: Each pet can have 50 records (not 50 total across all pets)

**Prerequisites:** Story 3.2 (health record creation exists to enforce limit)

---

## Epic 4: Financial Management & Budgeting

**Epic Goal:** Enable comprehensive expense tracking with budget management and alerts, solving the "financial visibility and budget control" user problem.

**Epic Value:** This epic delivers the second core promise - pet owners can track all pet-related expenses, set budgets, receive alerts when approaching limits, and export data for taxes or reimbursements.

---

**Story 4.1: Create Expense Database Schema**

As a developer,
I want to establish the expenses database schema,
So that we can track pet-related expenses with categorization and budget tracking.

**Acceptance Criteria:**
1. `expenses` table created with columns: id (uuid), pet_id (FK to pets), user_id (FK to profiles for RLS), amount (decimal), currency (string, default: EUR), category (enum), date, merchant (string), notes (text), receipt_url (string), created_at, updated_at
2. Category enum includes: vet, food, grooming, supplies, boarding, other
3. Foreign key constraints with CASCADE DELETE (delete pet → delete all expenses)
4. RLS policies ensure users only access their own expenses
5. Database indexes on: pet_id, user_id, date, category for query performance
6. Currency stored as 3-letter ISO code (EUR, USD, GBP)

**Technical Notes:**
- Database: Supabase PostgreSQL with RLS
- Amount: Use DECIMAL(10,2) for precise currency handling
- RLS policy: `user_id = auth.uid()`
- Indexes: `CREATE INDEX idx_expenses_pet_date ON expenses(pet_id, date DESC);`
- Receipt storage: Optional, stores Supabase Storage URL

**Prerequisites:** Story 2.1 (pets table must exist for foreign key)

---

**Story 4.2: Create Expense with Category Selection**

As a pet owner,
I want to log pet expenses with amounts and categories,
So that I can track where my money is going.

**Acceptance Criteria:**
1. "Add Expense" button visible on pet detail Expenses tab
2. Form fields: pet (dropdown if multiple pets), amount (required, number), currency (dropdown: EUR, USD, GBP), category (required, 6 options with icons), date (required, defaults to today), merchant (optional), notes (optional), receipt photo (optional)
3. Category dropdown shows: Vet, Food, Grooming, Supplies, Boarding/Pet Sitting, Other (each with icon)
4. Amount validation: must be positive number, max 2 decimal places
5. Date picker defaults to today
6. Currency auto-detected from browser locale (fallback EUR)
7. Successful save shows success message and updates dashboard

**Technical Notes:**
- Components: `CreateExpenseForm.tsx`, `CategorySelector.tsx`
- API: Supabase insert into expenses table
- Currency detection: `navigator.language` → determine default currency
- Category icons: Use lucide-react (Stethoscope, Apple, Scissors, ShoppingBag, Home, MoreHorizontal)
- Validation: React Hook Form + Zod (amount > 0, max 2 decimals)
- Route: Modal/drawer from `/pets/:petId/expenses`

**Prerequisites:** Story 4.1 (database schema), Story 2.3 (pet detail page with Expenses tab)

---

**Story 4.3: View Expense Dashboard with Summary Cards**

As a pet owner,
I want to see expense summaries and breakdowns,
So that I understand my pet spending patterns.

**Acceptance Criteria:**
1. Expenses tab shows 4 summary cards: Total This Month, Total This Year, Most Expensive Category, Average Monthly
2. Pie chart displays spending breakdown by category for current month
3. Expense list below shows all expenses chronologically (newest first)
4. Each list item shows: category icon, merchant/title, amount with currency, date
5. Dashboard loads in <3 seconds
6. Empty state shows "Add your first expense" with CTA button
7. Multi-pet users see aggregated data (all pets combined) with filter option

**Technical Notes:**
- Components: `ExpenseDashboard.tsx`, `ExpenseSummaryCards.tsx`, `ExpensePieChart.tsx`, `ExpenseList.tsx`
- API: Aggregate queries for summary cards
- Pie chart: Recharts PieChart component
- Calculations: Group by category, sum amounts, calculate averages
- Date filtering: Current month = expenses where `date >= start of month AND date <= today`
- Responsive: Cards stack on mobile, side-by-side on desktop

**Prerequisites:** Story 4.2 (expenses exist to display)

---

**Story 4.4: Set Monthly Budget with Progress Bar**

As a pet owner,
I want to set a monthly budget and see spending progress,
So that I can avoid overspending on pet expenses.

**Acceptance Criteria:**
1. "Set Budget" button visible on Expenses dashboard
2. Budget form: monthly amount (number), applies to (dropdown: specific pet or all pets)
3. Budget progress bar shows: current spending / budget amount
4. Color coding: Green (<80%), Amber (80-99%), Red (≥100%)
5. Progress percentage displayed: "€450 / €500 (90%)"
6. Budget resets automatically on first day of each month
7. Can edit budget anytime (updates immediately)

**Technical Notes:**
- Database: `budgets` table with columns: id, user_id, pet_id (nullable for "all pets"), monthly_amount, currency, created_at
- Components: `SetBudgetForm.tsx`, `BudgetProgressBar.tsx`
- Progress calculation: `(total_expenses_this_month / monthly_amount) * 100`
- Color logic: Tailwind classes based on percentage thresholds
- Monthly reset: Client-side logic, always query current month expenses
- API: Upsert budget (insert or update if exists)

**Prerequisites:** Story 4.3 (expense dashboard exists to show budget)

---

**Story 4.5: Budget Alert Notifications**

As a pet owner,
I want to receive alerts when approaching budget limits,
So that I can adjust spending before going over budget.

**Acceptance Criteria:**
1. Alert banner appears on dashboard when 80% threshold crossed: "Budget Warning: You've spent 80% of your monthly budget"
2. Critical alert at 100%: "Budget Exceeded: You've spent your entire monthly budget"
3. Alerts dismissible but reappear on page reload until threshold changes
4. Color-coded: Amber for 80% warning, Red for 100% critical
5. Alert includes: current spending amount, budget amount, percentage
6. Clicking alert navigates to budget management
7. No alerts shown if no budget set

**Technical Notes:**
- Components: `BudgetAlertBanner.tsx`
- Alert logic: Check percentage on dashboard load and after expense add/edit/delete
- State: Store dismissed alerts in session storage (don't persist across sessions)
- Calculation: Real-time check of `(current_spending / budget) * 100`
- Position: Top of Expenses tab, below summary cards
- Dismissal: X button hides banner, stores in sessionStorage

**Prerequisites:** Story 4.4 (budget must be set to trigger alerts)

---

**Story 4.6: Filter and Sort Expenses**

As a pet owner,
I want to filter expenses by pet, category, and date range,
So that I can analyze specific spending patterns.

**Acceptance Criteria:**
1. Filter controls above expense list: Pet (dropdown), Category (multi-select chips), Date Range (preset options + custom)
2. Date range presets: This Month, Last Month, This Year, Last 12 Months, Custom
3. Custom date range shows calendar picker (start and end dates)
4. Filters apply immediately (no "Apply" button needed)
5. Filter state persists during session
6. Clear filters button resets all filters to default
7. Filtered results update summary cards and pie chart

**Technical Notes:**
- Components: `ExpenseFilters.tsx`, `DateRangePicker.tsx`
- State: React state for active filters
- Filter logic: Client-side filter of expense array (or server-side for large datasets)
- Date library: `date-fns` for date manipulation
- Multi-select: shadcn/ui multi-select or custom chips
- URL params: Optionally sync filters to URL for bookmarking

**Prerequisites:** Story 4.3 (expense dashboard exists to filter)

---

**Story 4.7: Export Expenses to CSV**

As a pet owner,
I want to export my expense data to CSV,
So that I can use it for tax deductions or personal budgeting tools.

**Acceptance Criteria:**
1. "Export CSV" button visible on Expenses dashboard
2. Export dialog shows: Date range selector, Pet filter (specific pet or all)
3. CSV includes columns: Date, Pet Name, Category, Amount, Currency, Merchant, Notes
4. Filename format: `petlog-expenses-{start-date}-{end-date}.csv`
5. File downloads within 5 seconds for 1000+ expenses
6. CSV opens correctly in Excel and Google Sheets
7. Empty results show message: "No expenses in selected date range"

**Technical Notes:**
- Components: `ExportExpensesDialog.tsx`
- CSV generation: Use `papaparse` library or manual CSV string building
- Date format in CSV: ISO 8601 (YYYY-MM-DD) for compatibility
- Download: Create blob URL, trigger download via anchor tag
- Validation: Ensure start_date < end_date
- Include headers row: Date,Pet,Category,Amount,Currency,Merchant,Notes

**Prerequisites:** Story 4.3 (expenses exist to export)

---

**Story 4.8: Edit Expense**

As a pet owner,
I want to update expense details,
So that I can correct mistakes or add missing information.

**Acceptance Criteria:**
1. Edit button visible on expense list items (pencil icon)
2. Edit form pre-populates with existing expense data
3. All fields editable except creation date
4. Receipt photo can be replaced or removed
5. Validation enforces same rules as create
6. Save updates expense and refreshes dashboard/charts
7. Budget progress bar updates if amount changed

**Technical Notes:**
- Components: Reuse `CreateExpenseForm.tsx` with edit mode
- API: Supabase `.update()` on expenses table
- Optimistic UI: Update local state immediately
- Dashboard refresh: Recalculate summary cards and pie chart
- Budget recalculation: If amount changed and budget exists, update progress
- Updated timestamp: `updated_at = now()`

**Prerequisites:** Story 4.3 (expense list provides edit entry point)

---

**Story 4.9: Delete Expense with Confirmation**

As a pet owner,
I want to delete expenses I logged by mistake,
So that my spending data remains accurate.

**Acceptance Criteria:**
1. Delete button visible on expense list items (trash icon, destructive styling)
2. Confirmation dialog: "Are you sure you want to delete this expense?"
3. Dialog shows expense details: amount, category, date, merchant
4. Successful deletion removes from list and updates dashboard
5. Budget progress bar updates if budget exists
6. Success message: "Expense deleted successfully"
7. Free tier monthly limit updated (expense count decremented)

**Technical Notes:**
- Components: `DeleteExpenseDialog.tsx`
- API: Supabase `.delete()` on expenses table
- Receipt cleanup: If receipt_url exists, delete from Supabase Storage
- Dashboard update: Recalculate all summary data
- Free tier: Decrement monthly expense count for user
- Confirmation: shadcn/ui AlertDialog

**Prerequisites:** Story 4.3 (expense list provides delete entry point)

---

**Story 4.10: Attach Receipt Photo to Expense**

As a pet owner,
I want to attach receipt photos to expenses,
So that I have proof for reimbursements or tax deductions.

**Acceptance Criteria:**
1. Expense form includes "Attach Receipt" photo upload
2. Supports: JPG, PNG, HEIC up to 10MB
3. One photo per expense (replace if uploading new one)
4. Photo preview shows in form after upload
5. Expense list shows camera icon if receipt attached
6. Viewing expense shows receipt photo with full-screen preview option
7. Deleting expense deletes receipt photo from storage

**Technical Notes:**
- Components: `ReceiptUploader.tsx`, `ReceiptPreview.tsx`
- Storage: Supabase Storage bucket `receipts` with path: `{user_id}/{expense_id}.jpg`
- Compression: Use `browser-image-compression` before upload
- Database: Store receipt_url in expenses table
- Preview: Lightbox modal for full-screen view
- Cleanup: Delete file on expense deletion

**Prerequisites:** Story 4.2 (expense creation exists to attach receipts to)

---

**Story 4.11: Free Tier Enforcement - 100 Expenses Per Month**

As a product owner,
I want free tier users limited to 100 expenses per month,
So that premium subscriptions provide clear value for frequent users.

**Acceptance Criteria:**
1. Free tier users blocked from creating 101st expense in current month
2. Upgrade prompt dialog: "Free plan allows 100 expenses per month. Upgrade to Premium for unlimited."
3. Usage indicator on Expenses tab: "85/100 expenses this month (Free plan)"
4. Premium users have no limit
5. Limit resets automatically on first day of each month
6. Backend enforces limit (frontend check can be bypassed)
7. Count spans all pets (not per-pet)

**Technical Notes:**
- API: Before insert, query `SELECT COUNT(*) FROM expenses WHERE user_id = $1 AND date >= start_of_month`
- Subscription check: Query `profiles.subscription_tier`
- Error response: 403 Forbidden with upgrade message
- Components: Reuse `UpgradePromptDialog.tsx`
- Usage indicator: Show at top of Expenses tab for free tier users
- Monthly reset: Server-side date comparison, no manual reset needed

**Prerequisites:** Story 4.2 (expense creation exists to enforce limit)

---

## Epic 5: Smart Reminders & Notifications

**Epic Goal:** Enable proactive reminder system with push and email notifications, delivering "peace of mind" through automated alerts for health and care milestones.

**Epic Value:** This epic provides the proactive layer that prevents missed vaccines, medications, and appointments - addressing the organization chaos problem with smart automation.

---

**Story 5.1: Create Reminders Database Schema**

As a developer,
I want to establish the reminders database schema,
So that we can store one-time and recurring reminders with notification tracking.

**Acceptance Criteria:**
1. `reminders` table created with columns: id (uuid), pet_id (FK to pets), user_id (FK to profiles for RLS), title (text), date_time (timestamp with timezone), recurrence (enum: one_time, daily, weekly, monthly, yearly), notes (text), health_record_id (FK to health_records, nullable), completed_at (timestamp, nullable), notified_at (timestamp, nullable), created_at, updated_at
2. Foreign key constraints with CASCADE DELETE
3. RLS policies ensure users only access their own reminders
4. Database indexes on: pet_id, user_id, date_time, completed_at for query performance
5. Recurrence enum: one_time, daily, weekly, monthly, yearly

**Technical Notes:**
- Database: Supabase PostgreSQL with RLS
- Timestamp: Store in UTC, convert to user's timezone in frontend
- Health record link: Optional, allows reminders to reference specific health events
- Completed_at: NULL = active reminder, NOT NULL = completed
- Notified_at: Tracks when notification was sent (prevents duplicates)
- Indexes: `CREATE INDEX idx_reminders_datetime ON reminders(user_id, date_time) WHERE completed_at IS NULL;`

**Prerequisites:** Story 2.1 (pets table), Story 3.1 (health_records table for optional FK)

---

**Story 5.2: Create One-Time and Recurring Reminders**

As a pet owner,
I want to create reminders for pet care tasks,
So that I never forget important activities like medication or grooming appointments.

**Acceptance Criteria:**
1. "Add Reminder" button visible on pet detail Reminders tab
2. Form fields: title (required), pet (dropdown), date/time (required, defaults to tomorrow 9 AM), recurrence (dropdown: one-time, daily, weekly, monthly, yearly), notes (optional)
3. Date/time picker shows calendar + time selection
4. Recurrence clearly explained (e.g., "Weekly: repeats every 7 days")
5. Successful save shows success message
6. Reminder appears in appropriate grouping (Today, This Week, Later)
7. Form validates: date/time must be in future (not past)

**Technical Notes:**
- Components: `CreateReminderForm.tsx`, `DateTimePicker.tsx`, `RecurrenceSelector.tsx`
- API: Supabase insert into reminders table
- Timezone: Store UTC, display in user's local timezone
- Validation: React Hook Form + Zod (date_time > now())
- Recurrence UI: Dropdown with icons and descriptions
- Route: Modal/drawer from `/pets/:petId/reminders`

**Prerequisites:** Story 5.1 (database schema), Story 2.3 (pet detail page with Reminders tab)

---

**Story 5.3: View Reminders List with Grouping**

As a pet owner,
I want to see my reminders organized by urgency,
So that I can prioritize what needs attention first.

**Acceptance Criteria:**
1. Reminders tab shows grouped lists: Overdue (red), Today (green), This Week (blue), Later (gray)
2. Each reminder displays: title, pet name, date/time, recurrence icon (if recurring)
3. Overdue count shows badge on Reminders nav icon
4. Empty state shows "Create your first reminder" with CTA button
5. Completed reminders hidden from main view (available in history)
6. List loads in <2 seconds
7. Timezone-aware: "Today" respects user's local timezone

**Technical Notes:**
- Components: `RemindersList.tsx`, `ReminderCard.tsx`, `ReminderGroups.tsx`
- API: Query reminders where `completed_at IS NULL ORDER BY date_time ASC`
- Grouping logic: Client-side based on date comparison with current date/time
- Overdue: `date_time < now()`
- Today: `date_time >= start of today AND date_time < start of tomorrow`
- This week: `date_time >= tomorrow AND date_time < end of week`
- Later: `date_time >= start of next week`

**Prerequisites:** Story 5.2 (reminders exist to display)

---

**Story 5.4: Mark Reminder Complete and Snooze Options**

As a pet owner,
I want to mark reminders as complete or snooze them,
So that I can manage my task list and defer non-urgent items.

**Acceptance Criteria:**
1. Each reminder has "Complete" button (checkmark icon)
2. Completing reminder shows success animation and removes from list
3. "Snooze" dropdown offers: 1 day, 3 days, 1 week
4. Snooze updates reminder date and keeps in list
5. Recurring reminders: completing creates next occurrence automatically (e.g., daily reminder creates tomorrow's instance)
6. One-time reminders: completing moves to history
7. Completed reminders viewable in "History" section (30-day retention)

**Technical Notes:**
- Components: `ReminderActions.tsx`, `SnoozeMenu.tsx`
- API: Complete = update `completed_at = now()`
- Recurring logic: On complete, create new reminder with `date_time = date_time + recurrence_interval`
- Snooze: Update `date_time = date_time + snooze_duration`
- History query: `SELECT * FROM reminders WHERE completed_at IS NOT NULL AND completed_at > now() - interval '30 days'`
- Recurrence intervals: daily (+1 day), weekly (+7 days), monthly (+1 month), yearly (+1 year)

**Prerequisites:** Story 5.3 (reminders list provides action entry points)

---

**Story 5.5: Configure OneSignal Push Notifications**

As a developer,
I want to integrate OneSignal for push notifications,
So that users receive timely alerts on their devices.

**Acceptance Criteria:**
1. OneSignal SDK integrated in frontend (React)
2. User prompted for notification permission on first reminder creation
3. Push permission status stored (granted, denied, default)
4. Device tokens registered with OneSignal
5. Test notification sends successfully
6. User can enable/disable push notifications in settings
7. Notification permission respects browser/OS settings

**Technical Notes:**
- Library: OneSignal React SDK (`react-onesignal`)
- Setup: Initialize with OneSignal App ID (environment variable)
- Permission prompt: Trigger via `OneSignal.Notifications.requestPermission()`
- Device registration: Automatic after permission granted
- Storage: Store OneSignal player_id in user profile
- Settings: Toggle in user settings page
- Testing: Use OneSignal dashboard to send test notification

**Prerequisites:** Story 5.2 (reminders exist to send notifications for)

---

**Story 5.6: Send Push Notifications at Reminder Time**

As a pet owner,
I want to receive push notifications when reminders are due,
So that I'm alerted even when not using the app.

**Acceptance Criteria:**
1. Push notifications send within 5 minutes of reminder time
2. Notification includes: title, pet name, notes preview
3. Clicking notification opens app to pet detail page
4. Notifications only send if user granted push permission
5. No duplicate notifications for same reminder
6. Failed notifications logged for debugging
7. Notifications work on both desktop and mobile browsers

**Technical Notes:**
- Backend: Supabase Edge Function (cron job checks reminders every 5 minutes)
- OneSignal API: Send notification via REST API
- Cron schedule: `*/5 * * * *` (every 5 minutes)
- Query: `SELECT * FROM reminders WHERE date_time <= now() + interval '5 minutes' AND date_time > now() - interval '5 minutes' AND completed_at IS NULL AND notified_at IS NULL`
- Payload: `{ heading: title, content: "Reminder for [pet_name]: [notes]", url: "/pets/[pet_id]" }`
- Mark notified: Update `notified_at = now()` after sending

**Prerequisites:** Story 5.5 (OneSignal integration), Story 5.2 (reminders to notify about)

---

**Story 5.7: Configure Resend Email Notifications**

As a developer,
I want to integrate Resend for email notifications,
So that users receive reminder alerts via email as backup to push.

**Acceptance Criteria:**
1. Resend API configured with domain and API key
2. Email templates created for reminders
3. Test email sends successfully
4. Emails render correctly in Gmail, Outlook, mobile clients
5. Unsubscribe link included (required by email best practices)
6. User can disable email notifications in settings
7. From address: noreply@petlog.app (or configured domain)

**Technical Notes:**
- API: Resend REST API or SDK
- Edge Function: Supabase Edge Function calls Resend API
- Email template: HTML with PetLog branding
- Content: Title, pet name, date/time, notes, deeplink button
- Unsubscribe: Link to user settings page
- Settings: Store `email_notifications_enabled` in profiles table (default: true)
- Testing: Use Resend dashboard to view sent emails

**Prerequisites:** Story 5.2 (reminders exist to send email notifications for)

---

**Story 5.8: Send Email Notifications at Reminder Time**

As a pet owner,
I want to receive email notifications when reminders are due,
So that I have a reliable backup if push notifications fail.

**Acceptance Criteria:**
1. Email notifications send within 5 minutes of reminder time
2. Email subject: "[Pet Name] Reminder: [Title]"
3. Email body includes: pet photo, title, date/time, notes, "View in PetLog" button (deeplink)
4. Emails only send if user has email_notifications_enabled = true
5. Same edge function handles both push and email (send both)
6. Failed emails logged for debugging
7. No duplicate emails for same reminder

**Technical Notes:**
- Backend: Same Supabase Edge Function as push notifications
- Resend API: Send email via REST API after sending push
- Email body: Use Resend React Email templates
- Query: Same as push notification query
- Dual send: Send push, then send email (both at same time)
- Deeplink: `https://petlog.app/pets/[pet_id]`
- Error handling: If Resend fails, log to Supabase but don't block push

**Prerequisites:** Story 5.7 (Resend integration), Story 5.6 (notification edge function)

---

**Story 5.9: Edit and Delete Reminders**

As a pet owner,
I want to update or delete reminders,
So that I can correct mistakes or cancel tasks I no longer need.

**Acceptance Criteria:**
1. Edit button visible on reminder card
2. Edit form pre-populates with existing data
3. All fields editable except creation date
4. Editing recurring reminder: option to edit only this instance or all future instances
5. Delete button shows confirmation dialog
6. Deleting recurring reminder: option to delete only this instance or all future instances
7. Changes update immediately in list

**Technical Notes:**
- Components: Reuse `CreateReminderForm.tsx` with edit mode, `DeleteReminderDialog.tsx`
- API: Supabase `.update()` or `.delete()` on reminders table
- Recurring edit: If "all future", update all reminders with same parent_id (add parent_id column for recurring chains)
- Recurring delete: If "all future", delete all reminders with same parent_id
- Validation: Same as create (date_time in future for active reminders)
- Optimistic UI: Update local state immediately

**Prerequisites:** Story 5.3 (reminders list provides edit/delete entry points)

---

**Story 5.10: Free Tier Enforcement - 10 Reminders Limit**

As a product owner,
I want free tier users limited to 10 active reminders,
So that premium subscriptions provide clear value for power users.

**Acceptance Criteria:**
1. Free tier users blocked from creating 11th active reminder
2. Upgrade prompt dialog: "Free plan allows 10 reminders. Upgrade to Premium for unlimited."
3. Usage indicator on Reminders tab: "8/10 reminders used (Free plan)"
4. Premium users have no limit
5. Backend enforces limit (frontend check can be bypassed)
6. Count includes only active reminders (completed reminders don't count)
7. Completing a reminder frees up a slot

**Technical Notes:**
- API: Before insert, query `SELECT COUNT(*) FROM reminders WHERE user_id = $1 AND completed_at IS NULL`
- Subscription check: Query `profiles.subscription_tier`
- Error response: 403 Forbidden with upgrade message
- Components: Reuse `UpgradePromptDialog.tsx`
- Usage indicator: Show at top of Reminders tab for free tier users
- Active count: Only count where `completed_at IS NULL`

**Prerequisites:** Story 5.2 (reminder creation exists to enforce limit)

---

## Epic 6: Document Management & Export

**Epic Goal:** Enable document storage with categorization and professional export capabilities, completing the "paperless records, shareable instantly" promise.

**Epic Value:** This epic ensures pet owners can go fully paperless while maintaining professional, shareable records for vets, boarders, and travel.

---

**Story 6.1: Create Documents Database Schema**

As a developer,
I want to establish the documents database schema,
So that we can track uploaded files with categorization and storage quota management.

**Acceptance Criteria:**
1. `documents` table created with columns: id (uuid), pet_id (FK to pets), user_id (FK to profiles for RLS), filename (text), file_url (text), file_size (bigint, bytes), file_type (text), category (enum), uploaded_at, created_at
2. Category enum includes: vet_record, vaccine_card, receipt, lab_results, xray, insurance_claim, other
3. Foreign key constraints with CASCADE DELETE (delete pet → delete all documents)
4. RLS policies ensure users only access their own documents
5. Database indexes on: pet_id, user_id, category for query performance

**Technical Notes:**
- Database: Supabase PostgreSQL with RLS
- File size: Stored in bytes for quota calculations
- File type: MIME type (image/jpeg, application/pdf, etc.)
- RLS policy: `user_id = auth.uid()`
- Storage quota tracking: Aggregate file_size per user

**Prerequisites:** Story 2.1 (pets table must exist for foreign key)

---

**Story 6.2: Upload Documents with Categorization**

As a pet owner,
I want to upload and categorize documents,
So that I can organize vet records, receipts, and other pet-related files.

**Acceptance Criteria:**
1. "Upload Document" button visible on pet detail Documents tab
2. File upload supports: PDF, JPG, PNG, HEIC up to 10MB per file
3. Category dropdown: Vet Record, Vaccine Card, Receipt, Lab Results, X-ray/Imaging, Insurance Claim, Other
4. Filename editable (defaults to uploaded filename)
5. Upload shows progress bar
6. Successful upload shows in document library immediately
7. Storage quota checked before upload (free: 100MB, premium: 5GB)

**Technical Notes:**
- Components: `UploadDocumentForm.tsx`, `FileUploader.tsx`
- Storage: Supabase Storage bucket `documents` with path: `{user_id}/{pet_id}/{document_id}-{filename}`
- API: Upload to storage first, then insert metadata into documents table
- Quota check: Query `SELECT SUM(file_size) FROM documents WHERE user_id = $1`
- Progress: Track upload progress via Supabase Storage SDK
- Compression: Optionally compress images before upload

**Prerequisites:** Story 6.1 (database schema), Story 2.3 (pet detail page with Documents tab)

---

**Story 6.3: View Document Library with Grid Layout**

As a pet owner,
I want to see all my documents in an organized library,
So that I can quickly find specific files when needed.

**Acceptance Criteria:**
1. Documents tab shows grid of document cards (thumbnails for images, icons for PDFs)
2. Each card displays: thumbnail/icon, filename, category, file size, upload date
3. Filter by pet, category
4. Sort by: Date uploaded (newest/oldest), Filename (A-Z), File size
5. Grid responsive: 1 column mobile, 3 columns desktop
6. Empty state shows "Upload your first document" with CTA button
7. Storage usage bar visible: "45MB / 100MB used (Free plan)"

**Technical Notes:**
- Components: `DocumentLibrary.tsx`, `DocumentCard.tsx`, `DocumentFilters.tsx`
- API: Query documents table with filters and sorting
- Thumbnails: Generate for images using Supabase Storage transformations
- PDF icon: Use lucide-react FileText icon
- Lazy loading: Load thumbnails as user scrolls
- Storage usage: Real-time calculation from sum of file_size

**Prerequisites:** Story 6.2 (documents exist to display)

---

**Story 6.4: Preview and Download Documents**

As a pet owner,
I want to view and download my documents,
So that I can access files when needed (e.g., at vet appointments).

**Acceptance Criteria:**
1. Clicking document card opens preview
2. Images display in lightbox with pinch-to-zoom on mobile
3. PDFs open in new tab (browser PDF viewer)
4. Download button saves file to device with original filename
5. Lightbox navigation: previous/next arrows for browsing
6. Close button or ESC key closes preview
7. Preview loads in <3 seconds

**Technical Notes:**
- Components: `DocumentPreview.tsx`, `ImageLightbox.tsx`
- Images: Display full resolution with zoom/pan support
- PDFs: Open via `window.open(file_url)` to leverage browser PDF viewer
- Download: Create blob URL and trigger download via anchor tag
- Lightbox: Use react-image-lightbox or custom implementation
- Mobile: Support touch gestures (swipe, pinch-zoom)

**Prerequisites:** Story 6.3 (document library provides preview entry points)

---

**Story 6.5: Delete Documents with Storage Quota Update**

As a pet owner,
I want to delete documents I no longer need,
So that I can free up storage space and keep my library organized.

**Acceptance Criteria:**
1. Delete button visible on document card (trash icon)
2. Confirmation dialog: "Are you sure you want to delete [filename]?"
3. Successful deletion removes from library and frees storage quota
4. Storage usage bar updates immediately
5. File deleted from Supabase Storage (not just database)
6. Success message: "Document deleted successfully"
7. Undo not available (permanent deletion)

**Technical Notes:**
- Components: `DeleteDocumentDialog.tsx`
- API: Delete from storage first, then delete from documents table
- Storage cleanup: `supabase.storage.from('documents').remove([file_path])`
- Quota update: Subtract file_size from user's total usage
- Confirmation: shadcn/ui AlertDialog
- Error handling: If storage delete fails, don't delete from database

**Prerequisites:** Story 6.3 (document library provides delete entry points)

---

**Story 6.6: Export Pet Profile to PDF**

As a pet owner,
I want to export a professional pet health profile to PDF,
So that I can share complete information with vets, boarders, or during travel.

**Acceptance Criteria:**
1. "Export PDF" button visible on pet detail page
2. PDF includes: Pet photo, basic info (name, species, breed, age, weight, microchip), health timeline (last 12 months), current medications, allergies/notes, emergency contact (user email/phone)
3. Professional formatting: Clean typography, PetLog branding in footer
4. Filename: `{PetName}-Health-Profile-{Date}.pdf`
5. PDF generates within 10 seconds
6. Free tier: Text-only PDF (no pet photo or document thumbnails)
7. Premium tier: Full PDF with pet photo and health record document thumbnails

**Technical Notes:**
- Components: `ExportPDFDialog.tsx`, `PDFGenerator.tsx`
- PDF library: jsPDF or react-pdf/renderer
- Data: Aggregate pet info, health records (last 12 months), medications (active), notes
- Branding: Include PetLog logo in footer with "Generated on [date]"
- Tier check: Include/exclude photo based on subscription_tier
- File size: Optimize to <2MB for typical profile
- Download: Trigger download via blob URL

**Prerequisites:** Story 2.3 (pet detail page), Story 3.4 (health timeline for data)

---

**Story 6.7: Email Pet Profile to Veterinarian**

As a pet owner,
I want to email my pet's profile directly to my vet,
So that I can share information quickly before appointments.

**Acceptance Criteria:**
1. "Email to Vet" button visible on pet detail page
2. Dialog prompts for: Veterinarian email address, optional message
3. Email sent via Resend with PDF attachment
4. Email subject: "[Pet Name] Health Profile from [User Name]"
5. Email body: Friendly intro, optional user message, PDF attachment notice
6. Successful send shows confirmation: "Email sent to [vet email]"
7. Failed send shows error with retry option

**Technical Notes:**
- Components: `EmailPDFDialog.tsx`
- Backend: Supabase Edge Function generates PDF and sends email
- Resend API: Send email with PDF attachment
- Email from: noreply@petlog.app, Reply-to: user's email
- PDF generation: Server-side for consistency
- Validation: Validate email format
- Rate limiting: Prevent spam (max 5 emails per hour per user)

**Prerequisites:** Story 6.6 (PDF export capability), Story 5.7 (Resend integration)

---

**Story 6.8: Free Tier Enforcement - 100MB Storage Limit**

As a product owner,
I want free tier users limited to 100MB total storage,
So that premium subscriptions provide clear value for document-heavy users.

**Acceptance Criteria:**
1. Free tier users blocked from uploading if it would exceed 100MB total
2. Upgrade prompt dialog: "Free plan allows 100MB storage. Upgrade to Premium for 5GB."
3. Storage usage bar shows: "95MB / 100MB used (Free plan)"
4. Premium users limited to 5GB (show usage but higher limit)
5. Backend enforces limit (frontend check can be bypassed)
6. Quota calculated across all documents (all pets)
7. Deleting documents frees up quota immediately

**Technical Notes:**
- API: Before upload, query `SELECT SUM(file_size) FROM documents WHERE user_id = $1`
- Check: `current_usage + new_file_size <= limit`
- Limits: Free = 100MB (104,857,600 bytes), Premium = 5GB (5,368,709,120 bytes)
- Error response: 403 Forbidden with upgrade message
- Components: Reuse `UpgradePromptDialog.tsx`
- Usage bar: Color-code (green <80%, amber 80-99%, red ≥100%)

**Prerequisites:** Story 6.2 (document upload exists to enforce limit)

---

## Epic 7: Subscription & Monetization

**Epic Goal:** Enable Stripe payment integration with freemium tier management, delivering sustainable business model with transparent pricing.

**Epic Value:** This epic monetizes the product while maintaining generous free tier, ensuring long-term sustainability and ability to support users.

---

**Story 7.1: Create Stripe Integration Setup**

As a developer,
I want to integrate Stripe for payment processing,
So that users can upgrade to Premium subscriptions securely.

**Acceptance Criteria:**
1. Stripe account created and configured
2. Stripe API keys stored in environment variables (publishable and secret)
3. Stripe SDK integrated in frontend and backend
4. Test mode configured for development
5. Webhook endpoint created and registered with Stripe
6. Product and Price objects created in Stripe: Premium Monthly ($7), Premium Annual ($60)
7. Test payment completes successfully

**Technical Notes:**
- Stripe Dashboard: Create products with recurring prices
- Frontend: `@stripe/stripe-js` SDK
- Backend: Supabase Edge Function with Stripe Node SDK
- Environment variables: `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Products: "PetLog Premium Monthly" ($7/month), "PetLog Premium Annual" ($60/year)
- Webhook URL: `https://[project].supabase.co/functions/v1/stripe-webhook`

**Prerequisites:** None (foundational infrastructure)

---

**Story 7.2: Create Pricing Page**

As a potential customer,
I want to see clear pricing information,
So that I can understand the value of Premium before upgrading.

**Acceptance Criteria:**
1. Pricing page accessible at `/pricing` (public route)
2. Two-column comparison: Free vs Premium
3. Free tier shows: 1 pet, 50 health records, 100 expenses/month, 10 reminders, 100MB storage
4. Premium tier shows: Unlimited everything + full PDF exports
5. Pricing displayed: Monthly $7/month, Annual $60/year (save 29%)
6. "Upgrade Now" CTA buttons link to Stripe Checkout
7. FAQ section addresses common questions

**Technical Notes:**
- Components: `PricingPage.tsx`, `PricingTierCard.tsx`, `PricingFAQ.tsx`
- Route: `/pricing` (public, no auth required)
- Design: Side-by-side comparison table (mobile stacks vertically)
- Annual savings: Calculate and highlight (($7 * 12) - $60 = $24 saved)
- CTA: Link to signup if not authenticated, checkout if authenticated
- SEO: Meta tags optimized for "pet expense tracking app pricing"

**Prerequisites:** None (can be built independently)

---

**Story 7.3: Stripe Checkout Flow - Monthly and Annual**

As a free tier user,
I want to upgrade to Premium,
So that I can unlock unlimited features.

**Acceptance Criteria:**
1. "Upgrade to Premium" button visible throughout app (navbar, upgrade prompts, pricing page)
2. Clicking upgrade redirects to Stripe Checkout hosted page
3. Checkout shows: Monthly ($7/month) or Annual ($60/year) option
4. User selects plan, enters payment details
5. Successful payment redirects back to app with success confirmation
6. Failed payment shows error message with retry option
7. User receives Stripe email receipt automatically

**Technical Notes:**
- Components: `UpgradeButton.tsx`
- API: Supabase Edge Function creates Stripe Checkout Session
- Checkout mode: `subscription` for recurring payments
- Success URL: `https://petlog.app/upgrade/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `https://petlog.app/pricing`
- Customer creation: Create Stripe Customer with user email
- Metadata: Include `user_id` in session metadata for webhook processing

**Prerequisites:** Story 7.1 (Stripe integration), Story 7.2 (pricing page)

---

**Story 7.4: Process Stripe Webhook for Subscription Updates**

As a developer,
I want to handle Stripe webhooks,
So that subscription changes update user tier automatically.

**Acceptance Criteria:**
1. Webhook endpoint receives Stripe events
2. Signature verification prevents unauthorized requests
3. `checkout.session.completed` event upgrades user to Premium
4. `customer.subscription.deleted` event downgrades user to Free
5. `customer.subscription.updated` event updates subscription details
6. User tier updates in database within 60 seconds of payment
7. Failed webhook events logged for manual investigation

**Technical Notes:**
- Supabase Edge Function: `/stripe-webhook`
- Signature verification: `stripe.webhooks.constructEvent(payload, signature, webhook_secret)`
- Events to handle: checkout.session.completed, customer.subscription.deleted, customer.subscription.updated, invoice.payment_failed
- Database updates: Update `profiles.subscription_tier` and `profiles.stripe_customer_id`
- Logging: Log all events to `webhook_logs` table for debugging
- Idempotency: Check event ID to prevent duplicate processing

**Prerequisites:** Story 7.3 (Stripe Checkout creates subscriptions to process)

---

**Story 7.5: View Subscription Status and Manage Billing**

As a Premium user,
I want to view my subscription details and manage billing,
So that I can update payment methods or cancel if needed.

**Acceptance Criteria:**
1. Settings page shows subscription section
2. Displays: Current plan (Free/Premium Monthly/Premium Annual), Next billing date, Payment method (last 4 digits)
3. "Manage Billing" button opens Stripe Customer Portal
4. Customer Portal allows: Update payment method, View invoices, Cancel subscription
5. Cancellation takes effect at period end (no immediate downgrade)
6. Successful changes sync back via webhooks
7. Free tier users see "Upgrade to Premium" CTA instead

**Technical Notes:**
- Components: `SubscriptionSettings.tsx`, `BillingPortalButton.tsx`
- API: Supabase Edge Function creates Stripe Billing Portal Session
- Portal URL: Redirect to `session.url` from Stripe
- Return URL: `https://petlog.app/settings`
- Portal features: payment_method_update, invoice_history, subscription_cancel
- Data source: Query `profiles.subscription_tier`, `profiles.stripe_customer_id`

**Prerequisites:** Story 7.4 (subscription exists to manage)

---

**Story 7.6: Downgrade Flow - Premium to Free**

As a Premium user,
I want to downgrade to Free tier,
So that I can cancel my subscription while retaining my data.

**Acceptance Criteria:**
1. Downgrade available via Stripe Customer Portal
2. Cancellation takes effect at end of billing period (no prorating)
3. User receives confirmation email from Stripe
4. During remaining period, user retains Premium access
5. After period ends, user downgraded to Free tier
6. Free tier limits enforced immediately after downgrade
7. Data preserved but features locked (e.g., can't add 2nd pet, new health records beyond 50)

**Technical Notes:**
- Stripe Portal: User clicks "Cancel subscription"
- Webhook: `customer.subscription.deleted` event triggers downgrade
- Database: Update `profiles.subscription_tier = 'free'` when subscription ends
- Grace period: Keep Premium active until `subscription.current_period_end`
- Limit enforcement: All free tier checks activate on next action
- Data retention: No data deleted, just feature limits applied

**Prerequisites:** Story 7.5 (billing portal for cancellation)

---

**Story 7.7: Handle Failed Payments and Dunning**

As a product owner,
I want to handle failed payments gracefully,
So that users have a chance to update payment details before losing access.

**Acceptance Criteria:**
1. `invoice.payment_failed` webhook received when payment fails
2. User notified via email (Stripe automatic retry emails)
3. Stripe automatically retries payment (3 attempts over 2 weeks)
4. If all retries fail, subscription cancelled automatically
5. User downgraded to Free tier after final retry fails
6. Notification in app: "Payment failed - update billing info"
7. Update billing button prominent in app during retry period

**Technical Notes:**
- Stripe Smart Retries: Automatic retry schedule (day 3, 5, 7, 10)
- Webhook: `invoice.payment_failed` logs failure
- Dunning emails: Stripe sends automatic emails to customer
- Notification: Show alert banner in app if invoice is past_due
- Database: Track `subscription_status` (active, past_due, cancelled)
- Final cancellation: `customer.subscription.deleted` webhook downgrades user

**Prerequisites:** Story 7.4 (webhook processing)

---

**Story 7.8: Annual Subscription Discount Logic**

As a potential customer,
I want to save money by choosing annual billing,
So that I get better value for long-term commitment.

**Acceptance Criteria:**
1. Annual plan priced at $60/year (29% discount vs monthly)
2. Savings clearly displayed: "Save $24/year" on pricing page
3. Annual plan billed once per year (not monthly)
4. Both plans have identical features (unlimited everything)
5. Annual users can switch to monthly (prorated credit applied)
6. Monthly users can upgrade to annual (prorated credit applied)
7. Stripe handles proration automatically

**Technical Notes:**
- Stripe Prices: Monthly = $7/month recurring, Annual = $60/year recurring
- Discount calculation: (($7 * 12) - $60) / ($7 * 12) = 28.6% (round to 29%)
- Plan switching: Use Stripe `subscription.update()` with proration_behavior: 'create_prorations'
- Proration: Stripe calculates credit/charge automatically
- UI: Highlight annual savings on pricing page and upgrade prompts

**Prerequisites:** Story 7.3 (checkout supports both plans)

---

**Story 7.9: Free Tier Limits Summary Dashboard**

As a free tier user,
I want to see all my usage limits in one place,
So that I understand what I'm using and when I might need to upgrade.

**Acceptance Criteria:**
1. Settings page shows "Usage & Limits" section for free tier users
2. Displays all limits with current usage:
   - Pets: 1/1 used
   - Health Records: 35/50 used (per pet)
   - Expenses: 67/100 this month
   - Reminders: 8/10 active
   - Storage: 78MB/100MB used
3. Visual progress bars (green <80%, amber 80-99%, red ≥100%)
4. "Upgrade to Premium" CTA below limits
5. Premium users see "Unlimited" instead of limits
6. Real-time usage (refreshes on page load)

**Technical Notes:**
- Components: `UsageLimitsDashboard.tsx`, `UsageLimitBar.tsx`
- API: Aggregate queries for each limit type
- Calculations:
  - Pets: `COUNT(*) FROM pets WHERE user_id = $1`
  - Health records: `COUNT(*) FROM health_records WHERE pet_id = $1`
  - Expenses: `COUNT(*) FROM expenses WHERE user_id = $1 AND date >= start_of_month`
  - Reminders: `COUNT(*) FROM reminders WHERE user_id = $1 AND completed_at IS NULL`
  - Storage: `SUM(file_size) FROM documents WHERE user_id = $1`
- Color coding: Tailwind CSS based on percentage thresholds

**Prerequisites:** All previous tier enforcement stories (2.6, 3.10, 4.11, 5.10, 6.8)

---

**Story 7.10: GDPR Compliance - Account Deletion and Data Export**

As a user,
I want to delete my account and export my data,
So that I comply with my GDPR data rights.

**Acceptance Criteria:**
1. Settings page shows "Delete Account" button (destructive styling)
2. Delete confirmation requires typing account email
3. Confirmation explains: "This will permanently delete all pets, health records, expenses, reminders, documents, and cancel your subscription"
4. Deletion cascades to all user data (pets → health_records, expenses, reminders, documents)
5. Stripe subscription cancelled automatically
6. User receives confirmation email after deletion
7. "Export All Data" button generates JSON file with complete user data

**Technical Notes:**
- Components: `DeleteAccountDialog.tsx`, `ExportDataButton.tsx`
- API: Supabase Edge Function handles deletion
- Cascade delete: Remove all foreign key references (pets, health_records, expenses, reminders, documents)
- Storage cleanup: Delete all files from Supabase Storage
- Stripe: Cancel subscription via `subscription.cancel()`
- Data export: JSON file with all user data (pets, health_records, expenses, reminders, documents)
- GDPR: Must complete within 30 days of request

**Prerequisites:** Story 7.5 (subscription management for cancellation)

---

---

## Story Guidelines Reference

**Story Format:**

```
**Story [EPIC.N]: [Story Title]**

As a [user type],
I want [goal/desire],
So that [benefit/value].

**Acceptance Criteria:**
1. [Specific testable criterion]
2. [Another specific criterion]
3. [etc.]

**Prerequisites:** [Dependencies on previous stories, if any]
```

**Story Requirements:**

- **Vertical slices** - Complete, testable functionality delivery
- **Sequential ordering** - Logical progression within epic
- **No forward dependencies** - Only depend on previous work
- **AI-agent sized** - Completable in 2-4 hour focused session
- **Value-focused** - Integrate technical enablers into value-delivering stories

---

**For implementation:** Use the `create-story` workflow to generate individual story implementation plans from this epic breakdown.
