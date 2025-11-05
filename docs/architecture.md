# PetLog MVP - Architecture Document

## Executive Summary

PetLog MVP is a mobile-first React 19 web application using a modern Jamstack architecture with Supabase as the Backend-as-a-Service. The architecture prioritizes rapid development (14-day timeline), cost efficiency (<$0.10/user/month), and AI agent consistency through strict implementation patterns. All technology decisions leverage latest stable versions (2025) with proven integrations, eliminating custom backend development while ensuring enterprise-grade security through Row Level Security policies.

## Project Initialization

**First Implementation Story: Project Scaffolding**

The project must be initialized with these exact commands to establish the base architecture:

```bash
# Create Vite + React + TypeScript project
npm create vite@latest petlog-app -- --template react-ts
cd petlog-app
npm install

# Install Tailwind CSS v4 (latest 2025)
npm install tailwindcss @tailwindcss/vite

# Configure Tailwind Vite plugin
# Add to vite.config.ts: import tailwindcss from '@tailwindcss/vite'
# Add to plugins array: tailwindcss()

# Initialize shadcn/ui
npx shadcn@latest init

# Install core dependencies
npm install react-router-dom@latest @supabase/supabase-js react-hook-form @hookform/resolvers zod recharts date-fns @react-pdf/renderer papaparse lucide-react

# Install testing dependencies
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom @playwright/test

# Install type definitions
npm install -D @types/node @types/papaparse

# Initialize Playwright
npx playwright install

# Install Stripe, OneSignal, Resend, Sentry SDKs
npm install @stripe/stripe-js stripe react-onesignal resend @sentry/react

# Image compression for uploads
npm install browser-image-compression
```

**Starter Template Decisions Provided:**
- ✅ React 19.2.0 (latest stable)
- ✅ TypeScript 5.9.3 (latest stable)
- ✅ Vite (latest, lightning-fast HMR)
- ✅ ESLint configuration
- ✅ Basic project structure (src/ directory)

**Post-Installation Configuration:**
1. Configure Tailwind CSS in `index.css`: `@import "tailwindcss";`
2. Set up path aliases in `tsconfig.json` and `vite.config.ts` for `@/` imports
3. Configure Vitest in `vitest.config.ts`
4. Configure Playwright in `playwright.config.ts`
5. Create `.env.local` with Supabase and Stripe keys
6. Initialize Supabase project and configure authentication providers

## Decision Summary

| Category | Decision | Version | Affects Epics | Rationale |
| -------- | -------- | ------- | ------------- | --------- |
| **Frontend Framework** | React | 19.2.0 | All | Latest stable, performance improvements, better concurrent features |
| **Build Tool** | Vite | Latest | All | 5x faster than webpack, HMR optimized for React, modern ESM support |
| **Language** | TypeScript | 5.9.3 | All | Type safety prevents runtime errors, better IDE support, catches bugs at compile time |
| **Styling** | Tailwind CSS | 4.0 | All | Utility-first, 5x faster builds, CSS-first config, mobile-first responsive design |
| **UI Components** | shadcn/ui | Latest | All | Accessible (Radix UI), customizable, no runtime overhead, copy-paste components |
| **Routing** | React Router | 7.9.4 | All | Latest stable, client-side navigation, protected routes, nested routing support |
| **State Management** | React Context API | - | Epics 1,7 | Built-in, sufficient for auth and subscription state, no external dependencies |
| **Forms** | React Hook Form + Zod | Latest | Epics 1-7 | Performance (uncontrolled), type-safe validation, great DX, minimal re-renders |
| **Charts** | Recharts | Latest | Epic 3 (weight tracking), Epic 4 (expense charts) | React-native API, responsive, sufficient for simple visualizations |
| **Date Handling** | date-fns | Latest | Epics 3,4,5 | Modular, immutable, tree-shakeable, TypeScript support, timezone-aware |
| **PDF Generation** | react-pdf/renderer | Latest | Epic 6 | React component API (familiar), clean output, server-side compatible |
| **CSV Export** | PapaParse | Latest | Epic 4 | Reliable, handles edge cases, proper escaping, widely used |
| **Image Compression** | browser-image-compression | Latest | Epics 2,3,6 | Client-side, reduces upload time, configurable quality |
| **Icons** | lucide-react | Latest | All | Consistent design, tree-shakeable, extensive library |
| **Backend** | Supabase | Latest | All | PostgreSQL + Auth + Storage + Edge Functions, RLS security, real-time capable |
| **Database** | PostgreSQL | 15/17 (Supabase managed) | All | Relational data model, ACID compliance, RLS for security, proven at scale |
| **Authentication** | Supabase Auth | - | Epic 1 | Email/password + OAuth, JWT tokens, session management, secure by default |
| **File Storage** | Supabase Storage | - | Epics 2,3,6 | S3-compatible, integrated with auth, RLS policies, CDN |
| **Serverless Functions** | Supabase Edge Functions | - | Epics 5,7 | Deno runtime, cron jobs, webhook handling, integrated with DB |
| **Payments** | Stripe Checkout + Portal | API: 2025-10-29.clover | Epic 7 | PCI compliant, hosted checkout, customer portal, webhook reliable |
| **Push Notifications** | OneSignal | Latest | Epic 5 | Reliable delivery, web push support, player ID tracking |
| **Email Notifications** | Resend | Latest | Epics 1,5,6 | Developer-friendly, good deliverability, React email templates |
| **Deployment** | Vercel | - | All | Edge network, automatic HTTPS, instant deployments, optimized for React |
| **Error Tracking** | Sentry | Latest | All | React integration, source maps, performance monitoring |
| **Monitoring** | UptimeRobot | - | All | Uptime monitoring, alerts on downtime |
| **Unit Testing** | Vitest | 4.0 | All | Fast, Vite-native, Jest-compatible API, ESM support |
| **Component Testing** | React Testing Library | Latest | All | User-centric, encourages best practices, widely adopted |
| **E2E Testing** | Playwright | 1.56.1 | All | Cross-browser, reliable, trace viewer, parallel execution |
| **Code Coverage** | @vitest/coverage-v8 | Latest | All | Fast, accurate, V8 engine integration |

## Project Structure

```
petlog-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components (Button, Card, Dialog, etc.)
│   │   ├── auth/                  # Epic 1: Authentication
│   │   │   ├── LoginForm.tsx
│   │   │   ├── SignupForm.tsx
│   │   │   ├── GoogleOAuthButton.tsx
│   │   │   ├── GoogleIcon.tsx
│   │   │   ├── ForgotPasswordForm.tsx
│   │   │   ├── ResetPasswordForm.tsx
│   │   │   ├── VerificationPending.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── pets/                  # Epic 2: Pet Management
│   │   │   ├── PetsGrid.tsx
│   │   │   ├── PetCard.tsx
│   │   │   ├── CreatePetForm.tsx
│   │   │   ├── EditPetForm.tsx
│   │   │   ├── PetDetailPage.tsx
│   │   │   ├── PetInfoCard.tsx
│   │   │   ├── PetStats.tsx
│   │   │   ├── PetPhotoUpload.tsx
│   │   │   ├── DeletePetDialog.tsx
│   │   │   └── EmptyPetsState.tsx
│   │   ├── health/                # Epic 3: Health Tracking
│   │   │   ├── HealthTimeline.tsx
│   │   │   ├── HealthRecordCard.tsx
│   │   │   ├── CreateHealthRecordForm.tsx
│   │   │   ├── VaccineFields.tsx
│   │   │   ├── MedicationFields.tsx
│   │   │   ├── VetVisitFields.tsx
│   │   │   ├── SymptomFields.tsx
│   │   │   ├── WeightCheckFields.tsx
│   │   │   ├── WeightChart.tsx
│   │   │   ├── WeightChartControls.tsx
│   │   │   ├── TimelineFilters.tsx
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── AttachedDocuments.tsx
│   │   │   └── DeleteHealthRecordDialog.tsx
│   │   ├── expenses/              # Epic 4: Financial Management
│   │   │   ├── ExpenseDashboard.tsx
│   │   │   ├── ExpenseSummaryCards.tsx
│   │   │   ├── ExpensePieChart.tsx
│   │   │   ├── ExpenseList.tsx
│   │   │   ├── CreateExpenseForm.tsx
│   │   │   ├── CategorySelector.tsx
│   │   │   ├── SetBudgetForm.tsx
│   │   │   ├── BudgetProgressBar.tsx
│   │   │   ├── BudgetAlertBanner.tsx
│   │   │   ├── ExpenseFilters.tsx
│   │   │   ├── DateRangePicker.tsx
│   │   │   ├── ExportExpensesDialog.tsx
│   │   │   ├── ReceiptUploader.tsx
│   │   │   ├── ReceiptPreview.tsx
│   │   │   └── DeleteExpenseDialog.tsx
│   │   ├── reminders/             # Epic 5: Smart Reminders
│   │   │   ├── RemindersList.tsx
│   │   │   ├── ReminderCard.tsx
│   │   │   ├── ReminderGroups.tsx
│   │   │   ├── CreateReminderForm.tsx
│   │   │   ├── DateTimePicker.tsx
│   │   │   ├── RecurrenceSelector.tsx
│   │   │   ├── ReminderActions.tsx
│   │   │   ├── SnoozeMenu.tsx
│   │   │   └── DeleteReminderDialog.tsx
│   │   ├── documents/             # Epic 6: Document Management
│   │   │   ├── DocumentLibrary.tsx
│   │   │   ├── DocumentCard.tsx
│   │   │   ├── DocumentFilters.tsx
│   │   │   ├── UploadDocumentForm.tsx
│   │   │   ├── FileUploader.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   ├── ImageLightbox.tsx
│   │   │   ├── PDFGenerator.tsx
│   │   │   ├── ExportPDFDialog.tsx
│   │   │   ├── EmailPDFDialog.tsx
│   │   │   └── DeleteDocumentDialog.tsx
│   │   ├── subscription/          # Epic 7: Subscription & Monetization
│   │   │   ├── PricingPage.tsx
│   │   │   ├── PricingTierCard.tsx
│   │   │   ├── PricingFAQ.tsx
│   │   │   ├── UpgradeButton.tsx
│   │   │   ├── SubscriptionSettings.tsx
│   │   │   ├── BillingPortalButton.tsx
│   │   │   ├── UsageLimitsDashboard.tsx
│   │   │   ├── UsageLimitBar.tsx
│   │   │   ├── UpgradePromptDialog.tsx
│   │   │   ├── TierLimitBanner.tsx
│   │   │   └── DeleteAccountDialog.tsx
│   │   └── common/                # Shared components
│   │       ├── Layout.tsx
│   │       ├── Navigation.tsx
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── ErrorBoundary.tsx
│   │       ├── Toast.tsx
│   │       └── LoadingSpinner.tsx
│   ├── contexts/                  # React Context providers
│   │   ├── AuthContext.tsx        # User authentication state
│   │   └── SubscriptionContext.tsx # Subscription tier state
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useSupabase.ts         # Supabase client access
│   │   ├── usePets.ts             # Pet data operations
│   │   ├── useHealthRecords.ts    # Health records operations
│   │   ├── useExpenses.ts         # Expense operations
│   │   ├── useReminders.ts        # Reminder operations
│   │   ├── useDocuments.ts        # Document operations
│   │   └── useSubscription.ts     # Subscription tier checks
│   ├── lib/                       # Utilities & services
│   │   ├── supabase.ts            # Supabase client initialization
│   │   ├── stripe.ts              # Stripe helpers
│   │   ├── validations.ts         # Zod schemas for all forms
│   │   ├── utils.ts               # General utilities (cn, formatters)
│   │   ├── constants.ts           # App constants (limits, formats)
│   │   └── errors.ts              # Error message constants
│   ├── types/                     # TypeScript types
│   │   ├── database.types.ts      # Supabase generated types
│   │   ├── pet.types.ts           # Pet-related types
│   │   ├── health.types.ts        # Health record types
│   │   ├── expense.types.ts       # Expense types
│   │   ├── reminder.types.ts      # Reminder types
│   │   ├── document.types.ts      # Document types
│   │   └── subscription.types.ts  # Subscription types
│   ├── pages/                     # Top-level route components
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── ForgotPasswordPage.tsx
│   │   ├── ResetPasswordPage.tsx
│   │   ├── AuthCallback.tsx       # OAuth callback handler
│   │   ├── DashboardPage.tsx      # Main dashboard (pets grid)
│   │   ├── PetDetailPage.tsx      # Pet detail with tabs
│   │   ├── ExpensesPage.tsx       # Standalone expenses view
│   │   ├── RemindersPage.tsx      # Standalone reminders view
│   │   ├── DocumentsPage.tsx      # Standalone documents view
│   │   ├── SettingsPage.tsx       # User settings
│   │   └── PricingPage.tsx        # Public pricing page
│   ├── tests/                     # Test files
│   │   ├── unit/                  # Vitest unit tests
│   │   │   ├── validations.test.ts
│   │   │   ├── utils.test.ts
│   │   │   └── calculations.test.ts
│   │   ├── components/            # RTL component tests
│   │   │   ├── auth/
│   │   │   ├── pets/
│   │   │   └── expenses/
│   │   └── e2e/                   # Playwright E2E tests
│   │       ├── auth.spec.ts
│   │       ├── pet-management.spec.ts
│   │       ├── health-tracking.spec.ts
│   │       ├── expenses.spec.ts
│   │       └── subscription.spec.ts
│   ├── App.tsx                    # Main app component with routes
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles + Tailwind import
├── supabase/                      # Supabase backend configuration
│   ├── functions/                 # Edge Functions
│   │   ├── stripe-webhook/
│   │   │   └── index.ts           # Handle Stripe webhook events
│   │   ├── send-notifications/
│   │   │   └── index.ts           # Cron job: send reminder notifications
│   │   └── generate-pdf/
│   │       └── index.ts           # Server-side PDF generation
│   └── migrations/                # Database migrations
│       ├── 001_initial_schema.sql # Create all tables
│       ├── 002_rls_policies.sql   # Row Level Security policies
│       └── 003_indexes.sql        # Performance indexes
├── playwright.config.ts           # Playwright E2E configuration
├── vitest.config.ts               # Vitest unit/component test config
├── tailwind.config.js             # Tailwind CSS configuration
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.app.json              # TypeScript app-specific config
├── tsconfig.node.json             # TypeScript Node-specific config
├── vite.config.ts                 # Vite build configuration
├── package.json                   # Dependencies and scripts
├── .env.local                     # Environment variables (gitignored)
├── .gitignore
└── README.md
```

## Epic to Architecture Mapping

| Epic | Components | Database Tables | Storage Buckets | Edge Functions | Third-Party Services |
|------|-----------|-----------------|-----------------|----------------|---------------------|
| **Epic 1: Foundation & Authentication** | `src/components/auth/*`, `src/contexts/AuthContext.tsx`, `src/pages/LoginPage.tsx`, `src/pages/SignupPage.tsx` | `auth.users` (Supabase built-in), `profiles` | - | - | Supabase Auth, Google OAuth |
| **Epic 2: Pet Profile Management** | `src/components/pets/*`, `src/pages/PetDetailPage.tsx`, `src/hooks/usePets.ts` | `pets` | `pets-photos` | - | - |
| **Epic 3: Health Tracking & Timeline** | `src/components/health/*`, health tab in PetDetailPage | `health_records` | `health-documents` | - | - |
| **Epic 4: Financial Management & Budgeting** | `src/components/expenses/*`, `src/pages/ExpensesPage.tsx` | `expenses`, `budgets` | `receipts` | - | - |
| **Epic 5: Smart Reminders & Notifications** | `src/components/reminders/*`, `src/pages/RemindersPage.tsx` | `reminders` | - | `send-notifications` (cron) | OneSignal, Resend |
| **Epic 6: Document Management & Export** | `src/components/documents/*`, `src/pages/DocumentsPage.tsx` | `documents` | `documents` | `generate-pdf` (optional) | - |
| **Epic 7: Subscription & Monetization** | `src/components/subscription/*`, `src/pages/PricingPage.tsx` | `profiles` (subscription_tier, stripe_customer_id) | - | `stripe-webhook` | Stripe Checkout, Stripe Billing Portal |

## Technology Stack Details

### Core Frontend Technologies

**React 19.2.0**
- Latest stable release (October 2025)
- Concurrent features for better performance
- Improved error handling with Error Boundaries
- Automatic batching for better state updates
- Server Components support (not used in MVP but available for future)

**TypeScript 5.9.3**
- Latest stable release (August 2025)
- Enhanced type inference
- Improved error messages
- Better module resolution for Node.js v20
- Strict mode enabled for maximum type safety

**Vite (Latest)**
- Lightning-fast HMR (Hot Module Replacement)
- Optimized production builds
- Native ESM support
- Fast cold start
- Plugin ecosystem for Tailwind, React, TypeScript

**Tailwind CSS 4.0**
- Complete rewrite, 5x faster builds
- CSS-first configuration
- Automatic content detection
- Container queries support
- P3 color palette for modern displays
- Mobile-first responsive design philosophy

**shadcn/ui**
- Accessible components (Radix UI primitives)
- No runtime overhead (copy-paste components)
- Customizable with Tailwind CSS
- TypeScript support
- Consistent design system

**React Router 7.9.4**
- Client-side routing
- Nested routes
- Protected route wrappers
- URL parameters and query strings
- Programmatic navigation

### Form & Validation

**React Hook Form**
- Uncontrolled components (better performance)
- Minimal re-renders
- Built-in validation
- Easy integration with UI libraries
- Small bundle size

**Zod**
- TypeScript-first schema validation
- Type inference from schemas
- Composable validators
- Clear error messages
- Runtime type safety

**Pattern:**
```typescript
const petSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
})

const form = useForm<PetFormData>({
  resolver: zodResolver(petSchema),
})
```

### Data Visualization

**Recharts**
- React-native API (components, not canvas)
- Responsive charts
- Customizable styling
- Animation support
- TypeScript support

**Used For:**
- Weight tracking line chart (Epic 3)
- Expense breakdown pie chart (Epic 4)
- Budget progress visualization (Epic 4)

### Utilities

**date-fns**
- Modular (import only what you need)
- Immutable (pure functions)
- TypeScript support
- Timezone aware via `date-fns-tz`
- Consistent API

**Pattern:** Always store UTC, display local
```typescript
import { format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

// Storage (UTC)
const utcDate = new Date().toISOString()

// Display (user timezone)
const displayDate = format(parseISO(utcDate), 'PPP')
```

**lucide-react**
- Consistent icon design
- Tree-shakeable (only import used icons)
- SVG-based (scalable, customizable)
- 1000+ icons

**browser-image-compression**
- Client-side compression
- Configurable quality/size
- Maintains aspect ratio
- Progress callback support

### Backend Services

**Supabase**

**PostgreSQL Database:**
- Version: 15 or 17 (Supabase managed)
- ACID compliance
- JSON columns for flexible data (health record type-specific fields)
- Full-text search capability
- Geospatial support (not used in MVP)

**Supabase Auth:**
- Email/password authentication
- OAuth providers (Google)
- JWT-based sessions
- Automatic token refresh
- Password reset via email
- Email verification

**Supabase Storage:**
- S3-compatible API
- Integrated with RLS (security)
- CDN for fast delivery
- Image transformations (resize, optimize)
- Resumable uploads

**Supabase Edge Functions:**
- Deno runtime
- TypeScript support
- Cron jobs (reminder notifications)
- Webhook handlers (Stripe events)
- Direct database access

**Row Level Security (RLS):**
- Database-level security
- Users can only access their own data
- Policies enforced at query level
- No data leaks even with direct SQL

### Third-Party Integrations

**Stripe (API Version: 2025-10-29.clover)**

**Stripe Checkout:**
- Hosted payment page (PCI compliant)
- Subscription management
- Multiple payment methods
- Automatic tax calculation
- Mobile optimized

**Stripe Customer Portal:**
- Self-service billing management
- Update payment methods
- View invoices
- Cancel subscriptions
- No custom UI needed

**Webhooks:**
- `checkout.session.completed` - Upgrade user to Premium
- `customer.subscription.deleted` - Downgrade to Free
- `customer.subscription.updated` - Update subscription details
- `invoice.payment_failed` - Handle failed payments

**OneSignal**
- Web push notifications
- Browser permission handling
- Player ID tracking
- Delivery analytics
- Segmentation (future)

**Resend**
- Transactional email delivery
- React Email templates
- High deliverability
- Webhook notifications
- Email analytics

**Dual Notification Strategy:**
- Primary: Push notification via OneSignal
- Backup: Email via Resend
- Both sent simultaneously for redundancy
- User can disable either channel

### Deployment & Monitoring

**Vercel**
- Edge network (global CDN)
- Automatic HTTPS
- Instant rollbacks
- Preview deployments for PRs
- Environment variables
- Automatic deployments on git push

**Sentry**
- Error tracking and logging
- Source map support
- Performance monitoring
- User session replay
- Breadcrumb tracking
- Release tracking

**UptimeRobot**
- Uptime monitoring (99.9%+ target)
- HTTP status checks
- Email alerts on downtime
- Public status page (optional)

### Testing Stack

**Vitest 4.0**
- Vite-native (same config, same speed)
- Jest-compatible API
- Browser mode for component testing
- Snapshot testing
- Coverage reports
- Watch mode

**React Testing Library**
- User-centric testing
- Queries based on accessibility
- Encourages best practices
- No implementation details
- Works with Vitest

**Playwright 1.56.1**
- Cross-browser testing (Chromium, Firefox, WebKit)
- Auto-wait (no flaky tests)
- Parallel execution
- Trace viewer for debugging
- Screenshot and video recording
- Mobile device emulation

**Coverage Goals:**
- Unit tests: 80%+ for business logic
- Component tests: All major user-facing components
- E2E tests: 5-7 critical user flows

## Integration Points

### Frontend ↔ Supabase

**Authentication Flow:**
1. User logs in via `supabase.auth.signInWithPassword()` or OAuth
2. Supabase returns JWT token
3. `AuthContext` stores user state via `onAuthStateChange` listener
4. All subsequent queries include JWT automatically
5. RLS policies enforce data isolation

**Data Queries:**
```typescript
// All queries follow this pattern
const { data, error } = await supabase
  .from('pets')
  .select('*')
  .eq('user_id', userId)

if (error) {
  // Handle error
  throw error
}
// Use data
```

**File Uploads:**
```typescript
// 1. Compress image client-side
const compressed = await imageCompression(file, options)

// 2. Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('pets-photos')
  .upload(`${userId}/${petId}.jpg`, compressed)

// 3. Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('pets-photos')
  .getPublicUrl(path)

// 4. Store URL in database
await supabase.from('pets').update({ photo_url: publicUrl })
```

### Frontend ↔ Stripe

**Checkout Flow:**
1. User clicks "Upgrade to Premium"
2. Frontend calls Supabase Edge Function
3. Edge Function creates Stripe Checkout Session
4. Frontend redirects to Stripe hosted checkout
5. User completes payment
6. Stripe redirects back to success URL
7. Webhook updates user tier in database

**Customer Portal:**
1. User clicks "Manage Billing"
2. Frontend calls Edge Function
3. Edge Function creates Stripe Portal Session
4. Frontend redirects to Stripe portal
5. User manages subscription/payment
6. Stripe sends webhook on changes
7. Webhook updates database

### Edge Functions ↔ Services

**Reminder Notifications (Cron Job):**
```typescript
// Runs every 5 minutes
// 1. Query reminders due in next 5 minutes
const { data: reminders } = await supabase
  .from('reminders')
  .select('*')
  .lte('date_time', fiveMinutesFromNow)
  .gte('date_time', now)
  .is('notified_at', null)

// 2. For each reminder:
//    - Send push via OneSignal API
//    - Send email via Resend API
//    - Update notified_at timestamp

// 3. Handle recurring reminders (create next instance)
```

**Stripe Webhook Handler:**
```typescript
// Verify webhook signature
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
)

// Handle events
switch (event.type) {
  case 'checkout.session.completed':
    // Upgrade user to Premium
    await supabase
      .from('profiles')
      .update({ subscription_tier: 'premium' })
      .eq('id', userId)
    break

  case 'customer.subscription.deleted':
    // Downgrade user to Free
    await supabase
      .from('profiles')
      .update({ subscription_tier: 'free' })
      .eq('id', userId)
    break
}
```

## Implementation Patterns

These patterns are **mandatory** for all AI agents to ensure consistency.

### 1. Naming Conventions

**Files:**
- React Components: `PascalCase.tsx` (e.g., `CreatePetForm.tsx`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useAuth.ts`)
- Utilities: `camelCase.ts` (e.g., `validations.ts`)
- Types: `camelCase.types.ts` (e.g., `pet.types.ts`)
- Tests: Match source with `.test.tsx` or `.spec.ts`

**Database (PostgreSQL):**
- Tables: `snake_case` plural (e.g., `pets`, `health_records`)
- Columns: `snake_case` (e.g., `user_id`, `created_at`)
- Foreign keys: `[table]_id` (e.g., `pet_id`)
- Timestamps: Always include `created_at` and `updated_at`

**React Components:**
- Component names: `PascalCase` matching filename
- Props interfaces: `[ComponentName]Props`
- Event handlers: `handle[Action]` (e.g., `handleSubmit`)
- Boolean props: `is[State]` or `has[Feature]`

**Functions & Variables:**
- Functions: `camelCase` with verb prefix (e.g., `fetchPets`)
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Types/Interfaces: `PascalCase`

### 2. Component Structure Pattern

**MUST follow this exact order:**

```typescript
// 1. Imports (grouped)
import { useState } from 'react' // React imports first
import { useAuth } from '@/hooks/useAuth' // Local hooks
import { Button } from '@/components/ui/button' // UI components
import { supabase } from '@/lib/supabase' // Lib/utilities
import type { Pet } from '@/types/pet.types' // Types last

// 2. Types/Interfaces
interface CreatePetFormProps {
  onSuccess: () => void
}

// 3. Component
export const CreatePetForm = ({ onSuccess }: CreatePetFormProps) => {
  // 3a. Hooks (order: context, state, refs, custom hooks)
  const { user } = useAuth()
  const [name, setName] = useState('')

  // 3b. Event handlers
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    // Implementation
  }

  // 3c. Effects
  useEffect(() => {
    // Side effects
  }, [])

  // 3d. Render helpers (if needed)
  const renderError = () => {
    return <div>Error message</div>
  }

  // 3e. Return JSX
  return (
    <form onSubmit={handleSubmit}>
      {/* JSX content */}
    </form>
  )
}
```

### 3. Import Path Aliases

**Configure in tsconfig.json and vite.config.ts:**

```typescript
// Use @/ prefix for all imports
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase'
import type { Pet } from '@/types/pet.types'
```

**Aliases:**
- `@/components/*` - All components
- `@/hooks/*` - Custom hooks
- `@/lib/*` - Utilities and services
- `@/types/*` - TypeScript types
- `@/contexts/*` - Context providers
- `@/pages/*` - Page components

### 4. Database Schema Pattern

**All tables MUST follow this structure:**

```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  -- ... other columns ...
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Always create updated_at trigger
CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Always enable RLS
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;

-- Always create CRUD policies
CREATE POLICY select_pets_policy ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_pets_policy ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_pets_policy ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_pets_policy ON pets
  FOR DELETE USING (auth.uid() = user_id);

-- Create performance indexes
CREATE INDEX idx_pets_user_id ON pets(user_id);
```

**Key Principles:**
- Always use UUID for primary keys
- Always include `user_id` foreign key with CASCADE DELETE
- Always include `created_at` and `updated_at` timestamps
- Always enable RLS with policies for SELECT, INSERT, UPDATE, DELETE
- Always create indexes on foreign keys and frequently queried columns

### 5. Supabase Query Pattern

**MUST follow this pattern:**

```typescript
// Always destructure { data, error }
const { data: pets, error } = await supabase
  .from('pets')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })

// Always check error first
if (error) {
  console.error('Failed to fetch pets:', error)
  throw error // or handle gracefully with toast
}

// Use TypeScript generics for type safety
const { data } = await supabase
  .from('pets')
  .select('*')
  .returns<Pet[]>()
```

**Insert Pattern:**
```typescript
const { data, error } = await supabase
  .from('pets')
  .insert({
    user_id: userId,
    name: petData.name,
    species: petData.species,
  })
  .select()
  .single()
```

**Update Pattern:**
```typescript
const { error } = await supabase
  .from('pets')
  .update({ name: newName })
  .eq('id', petId)
  .eq('user_id', userId) // Security: verify ownership
```

**Delete Pattern:**
```typescript
const { error } = await supabase
  .from('pets')
  .delete()
  .eq('id', petId)
  .eq('user_id', userId) // Security: verify ownership
```

### 6. Form & Validation Pattern

**MUST use React Hook Form + Zod:**

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Define schema with Zod
const petSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  species: z.enum(['dog', 'cat', 'bird', 'rabbit', 'other']),
  birthDate: z.date().optional(),
})

type PetFormData = z.infer<typeof petSchema>

// Use zodResolver
const { register, handleSubmit, formState: { errors } } = useForm<PetFormData>({
  resolver: zodResolver(petSchema),
})

const onSubmit = async (data: PetFormData) => {
  // Form is already validated by Zod
  // Submit to Supabase
}
```

### 7. Error Handling Pattern

**Consistent error messages:**

```typescript
// Define in lib/errors.ts
export const ERROR_MESSAGES = {
  AUTH_INVALID: 'Invalid email or password',
  AUTH_NETWORK: 'Connection lost. Please check your internet.',
  GENERIC: 'Something went wrong. Please try again.',
  VALIDATION: 'Please check your input and try again.',
} as const
```

**Error handling in async functions:**

```typescript
try {
  const { data, error } = await supabase
    .from('pets')
    .insert(petData)

  if (error) throw error

  showToast({
    title: 'Success',
    description: 'Pet created successfully',
  })

  return data
} catch (error) {
  console.error('Failed to create pet:', error)
  showToast({
    variant: 'destructive',
    title: 'Failed to create pet',
    description: ERROR_MESSAGES.GENERIC,
  })
  throw error
}
```

**React Error Boundaries:**

```typescript
// Wrap app in ErrorBoundary
<ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</ErrorBoundary>
```

### 8. State Management Pattern

**React Context for global state:**

```typescript
// Create context with undefined default
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook with error checking
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

### 9. Styling Pattern (Tailwind CSS)

**Class order (MUST follow):**

```tsx
<div className="
  flex flex-col          // Layout
  w-full h-screen       // Sizing
  p-4 gap-2            // Spacing
  bg-white text-gray-900  // Colors
  text-base font-medium   // Typography
  rounded-lg shadow-sm    // Effects
">
```

**Responsive design (mobile-first):**

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
</div>
```

**Touch targets (minimum 44x44px):**

```tsx
<button className="min-h-[44px] min-w-[44px] p-3">
  Click me
</button>
```

### 10. Date/Time Handling Pattern

**CRITICAL: Always store UTC, display local**

```typescript
import { format, parseISO } from 'date-fns'
import { formatInTimeZone } from 'date-fns-tz'

// Storing (always UTC)
const utcDate = new Date().toISOString()
await supabase.from('reminders').insert({
  date_time: utcDate, // Stored as TIMESTAMPTZ (UTC)
})

// Displaying (user's timezone)
const displayDate = format(parseISO(utcDate), 'PPP p') // "Nov 6, 2025 at 9:00 AM"

// Comparing
import { isBefore, isAfter } from 'date-fns'
const isOverdue = isBefore(parseISO(reminderDate), new Date())
```

**Database timestamp columns:**
- Use `TIMESTAMPTZ` (timestamp with timezone)
- Always store in UTC
- PostgreSQL handles timezone conversion

## Consistency Rules

### Cross-Cutting Concerns

**1. Error Handling Strategy**

- **React Error Boundaries:** Catch rendering errors at component tree level
- **Supabase Errors:** Always check `error` first, log to console, show user-friendly message
- **Validation Errors:** Zod + React Hook Form provides inline field-level errors
- **Global Error State:** Use toast notifications for async operation results
- **Error Logging:** Sentry for production, console.error for development

**User-Facing Error Messages:**
- Auth errors: Generic "Invalid email or password" (security)
- Network errors: "Connection lost. Retrying..."
- Validation errors: Specific field messages from Zod
- Unexpected errors: "Something went wrong. Please try again."

**2. Logging Strategy**

- **Development:** `console.log`, `console.error`, `console.warn`
- **Production:** Sentry for errors only (no verbose logging)
- **Supabase queries:** Log slow queries (>500ms) to Sentry
- **User actions:** No logging (GDPR privacy)
- **Format:** Structured objects: `console.error('Failed to save pet', { error, petId })`

**3. Date/Time Handling**

- **Storage:** Always UTC in database (`TIMESTAMPTZ`)
- **Display:** Convert to user's local timezone using `date-fns`
- **Library:** `date-fns` for all date operations
- **Format Standard:** ISO 8601 for API communication
- **Example:** Stored as `2025-11-06T09:00:00Z`, displayed as "Nov 6, 2025 at 9:00 AM"

**4. Authentication Pattern**

- **Supabase Auth** handles all authentication (email/password + Google OAuth)
- **JWT tokens** in httpOnly cookies (Supabase manages)
- **Session state:** React Context (`AuthContext`)
- **Route protection:** `ProtectedRoute` wrapper component checks auth state
- **RLS enforcement:** Database-level security via policies

**5. API Response Format**

- **Supabase Pattern:** All queries return `{ data, error }` structure
- **Success:** `data` contains results, `error` is null
- **Failure:** `data` is null, `error` contains error object
- **Always check error first:** `if (error) { handle error }`

**6. Testing Strategy**

- **Unit Tests (Vitest):** Business logic, utilities, calculations, validation functions
  - Goal: 80%+ coverage for critical logic
- **Component Tests (RTL):** User interactions, rendering, integration with hooks
  - Focus: User-facing components with complex interactions
- **E2E Tests (Playwright):** Critical user flows end-to-end
  - Flows: Signup → Add Pet → Health Record → Timeline
  - Flows: Add Expense → Set Budget → Alert
  - Flows: Create Reminder → Complete → Recurring
  - Flows: Upgrade to Premium → Verify limits removed

### Naming Conventions Summary

| Category | Convention | Example |
|----------|-----------|---------|
| React Component Files | PascalCase.tsx | `CreatePetForm.tsx` |
| Hook Files | camelCase.ts with `use` prefix | `useAuth.ts` |
| Utility Files | camelCase.ts | `validations.ts` |
| Type Files | camelCase.types.ts | `pet.types.ts` |
| Database Tables | snake_case plural | `pets`, `health_records` |
| Database Columns | snake_case | `user_id`, `created_at` |
| Component Names | PascalCase | `CreatePetForm` |
| Props Interfaces | [Component]Props | `CreatePetFormProps` |
| Functions | camelCase with verb | `fetchPets`, `handleSubmit` |
| Variables | camelCase | `petData`, `currentUser` |
| Constants | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Types/Interfaces | PascalCase | `Pet`, `HealthRecord` |

### Code Organization Rules

1. **Component structure order:** Imports → Types → Component → Hooks → Handlers → Effects → Helpers → JSX
2. **Import grouping:** React → Local hooks → UI components → Lib/utils → Types
3. **Import aliases:** Always use `@/` prefix for all local imports
4. **File location:** Components in `src/components/[epic]/`, pages in `src/pages/`

## Data Architecture

### Database Schema

**Table: `profiles`**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Table: `pets`**
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat', 'bird', 'rabbit', 'other')),
  breed TEXT,
  birth_date DATE,
  weight DECIMAL(10,2),
  gender TEXT CHECK (gender IN ('male', 'female', 'unknown')),
  spayed_neutered BOOLEAN DEFAULT false,
  microchip TEXT,
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pets_user_id ON pets(user_id);
```

**Table: `health_records`**
```sql
CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccine', 'medication', 'vet_visit', 'symptom', 'weight_check')),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  vaccine_data JSONB, -- { expiration_date, vet_clinic, dose }
  medication_data JSONB, -- { dosage, frequency, start_date, end_date }
  vet_visit_data JSONB, -- { clinic, vet_name, diagnosis, treatment, cost }
  symptom_data JSONB, -- { severity, observed_behaviors }
  weight_data JSONB, -- { weight, unit, body_condition }
  document_urls TEXT[], -- Array of Supabase Storage URLs
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_health_records_pet_date ON health_records(pet_id, date DESC);
CREATE INDEX idx_health_records_user_id ON health_records(user_id);
```

**Table: `expenses`**
```sql
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR' CHECK (currency IN ('EUR', 'USD', 'GBP')),
  category TEXT NOT NULL CHECK (category IN ('vet', 'food', 'grooming', 'supplies', 'boarding', 'other')),
  date DATE NOT NULL,
  merchant TEXT,
  notes TEXT,
  receipt_url TEXT, -- Supabase Storage URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_pet_date ON expenses(pet_id, date DESC);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
```

**Table: `budgets`**
```sql
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pet_id UUID REFERENCES pets(id) ON DELETE CASCADE, -- NULL = all pets budget
  monthly_amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EUR',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, pet_id) -- One budget per pet (or one overall)
);

CREATE INDEX idx_budgets_user_id ON budgets(user_id);
```

**Table: `reminders`**
```sql
CREATE TABLE reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date_time TIMESTAMPTZ NOT NULL,
  recurrence TEXT NOT NULL CHECK (recurrence IN ('one_time', 'daily', 'weekly', 'monthly', 'yearly')),
  notes TEXT,
  health_record_id UUID REFERENCES health_records(id) ON DELETE SET NULL,
  completed_at TIMESTAMPTZ,
  notified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminders_datetime ON reminders(user_id, date_time) WHERE completed_at IS NULL;
CREATE INDEX idx_reminders_pet_id ON reminders(pet_id);
```

**Table: `documents`**
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT NOT NULL, -- bytes
  file_type TEXT NOT NULL, -- MIME type
  category TEXT NOT NULL CHECK (category IN ('vet_record', 'vaccine_card', 'receipt', 'lab_results', 'xray', 'insurance_claim', 'other')),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_pet_id ON documents(pet_id);
CREATE INDEX idx_documents_user_id ON documents(user_id);
```

### Relationships & Cascade Behavior

```
auth.users (Supabase managed)
  ↓ ON DELETE CASCADE
profiles (1:1)

auth.users
  ↓ ON DELETE CASCADE
pets (1:many)
  ↓ ON DELETE CASCADE
  ├── health_records (many)
  ├── expenses (many)
  ├── reminders (many)
  └── documents (many)

budgets (many) - Can be per-pet or overall (pet_id NULL)
```

**Critical: All foreign keys use `ON DELETE CASCADE`**
- Deleting a user deletes all their data
- Deleting a pet deletes all associated records
- No orphaned data

### Storage Buckets

**Bucket: `pets-photos`**
- Path: `{user_id}/{pet_id}.{ext}`
- Max size: 5MB per file
- Types: JPG, PNG, HEIC
- RLS: Users can only access their own photos

**Bucket: `health-documents`**
- Path: `{user_id}/{pet_id}/{record_id}/{filename}`
- Max size: 10MB per file
- Types: PDF, JPG, PNG, HEIC
- RLS: Users can only access their own documents

**Bucket: `receipts`**
- Path: `{user_id}/{expense_id}.{ext}`
- Max size: 10MB per file
- Types: JPG, PNG, PDF
- RLS: Users can only access their own receipts

**Bucket: `documents`**
- Path: `{user_id}/{pet_id}/{document_id}-{filename}`
- Max size: 10MB per file
- Types: PDF, JPG, PNG, HEIC
- RLS: Users can only access their own documents

### Free Tier Limits (Backend Enforcement)

| Limit | Free Tier | Premium |
|-------|-----------|---------|
| Pets | 1 | Unlimited |
| Health Records (per pet) | 50 | Unlimited |
| Expenses (per month) | 100 | Unlimited |
| Active Reminders | 10 | Unlimited |
| Storage | 100MB | 5GB |

**Enforcement Pattern:**
```typescript
// Before insert, check limit
const { count } = await supabase
  .from('pets')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)

const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_tier')
  .eq('id', userId)
  .single()

if (profile.subscription_tier === 'free' && count >= 1) {
  throw new Error('Free tier limit: 1 pet')
}
```

## API Contracts

### Supabase Client Initialization

```typescript
// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
```

### Authentication APIs

**Sign Up:**
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
  options: {
    data: {
      name: 'John Doe',
    },
  },
})
```

**Sign In:**
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
})
```

**Google OAuth:**
```typescript
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
  },
})
```

**Sign Out:**
```typescript
const { error } = await supabase.auth.signOut()
```

**Password Reset:**
```typescript
// Request reset
const { error } = await supabase.auth.resetPasswordForEmail(email)

// Update password
const { error } = await supabase.auth.updateUser({
  password: newPassword,
})
```

### Data Query Patterns

**Fetch with filtering:**
```typescript
const { data, error } = await supabase
  .from('pets')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
```

**Fetch with joins:**
```typescript
const { data, error } = await supabase
  .from('pets')
  .select(`
    *,
    health_records (
      id,
      record_type,
      date
    )
  `)
  .eq('user_id', userId)
```

**Aggregate queries:**
```typescript
const { count, error } = await supabase
  .from('expenses')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)
  .gte('date', startOfMonth)
```

### Stripe APIs

**Create Checkout Session:**
```typescript
// Edge Function: create-checkout-session
const session = await stripe.checkout.sessions.create({
  customer_email: user.email,
  client_reference_id: user.id,
  mode: 'subscription',
  line_items: [{
    price: priceId, // Monthly or Annual price ID
    quantity: 1,
  }],
  success_url: `${origin}/upgrade/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${origin}/pricing`,
})
```

**Create Portal Session:**
```typescript
// Edge Function: create-portal-session
const session = await stripe.billingPortal.sessions.create({
  customer: stripeCustomerId,
  return_url: `${origin}/settings`,
})
```

## Security Architecture

### Authentication Security

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number
- Validated by Zod schema

**Session Management:**
- JWT-based sessions (Supabase managed)
- Automatic token refresh
- 30-day expiration (if "Remember me" enabled)
- httpOnly cookies (XSS protection)

**Account Lockout:**
- 5 failed login attempts triggers lockout
- Supabase rate limiting (60 req/min per IP)

**OAuth Security:**
- State parameter prevents CSRF
- Redirect URL validation
- User email verification required

### Data Security

**Row Level Security (RLS):**

All tables have RLS policies enforcing `auth.uid() = user_id`:

```sql
-- Example: Pets table policies
CREATE POLICY select_pets_policy ON pets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY insert_pets_policy ON pets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY update_pets_policy ON pets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY delete_pets_policy ON pets
  FOR DELETE USING (auth.uid() = user_id);
```

**Storage Security:**

All storage buckets have RLS policies:

```sql
-- Users can only access their own files
CREATE POLICY "Users can view own files"
ON storage.objects FOR SELECT
USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own files"
ON storage.objects FOR INSERT
WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

**SQL Injection Prevention:**
- Supabase client uses parameterized queries
- No raw SQL from frontend
- Edge Functions use prepared statements

**XSS Prevention:**
- React auto-escapes JSX
- Sanitize user input in forms
- Content Security Policy headers

**CSRF Prevention:**
- SameSite cookies
- Supabase handles CSRF tokens

### Payment Security (PCI Compliance)

**Stripe Checkout:**
- Hosted payment page (no card data touches our servers)
- PCI DSS Level 1 compliant
- 3D Secure support
- Fraud detection built-in

**Webhook Security:**
```typescript
// Verify webhook signature
const signature = headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  webhookSecret
)
```

**API Keys:**
- Publishable key in frontend (safe to expose)
- Secret key in Edge Functions only (never frontend)
- Webhook secret for signature verification

### GDPR Compliance

**Data Export:**
```typescript
// User can export all their data
const { data } = await supabase
  .from('pets')
  .select(`
    *,
    health_records (*),
    expenses (*),
    reminders (*),
    documents (*)
  `)
  .eq('user_id', userId)

// Convert to JSON and download
```

**Account Deletion:**
```typescript
// Cascade delete all user data
const { error } = await supabase.auth.admin.deleteUser(userId)
// RLS CASCADE DELETE handles all related data

// Cancel Stripe subscription
await stripe.subscriptions.cancel(subscriptionId)

// Delete all files from storage
await supabase.storage.from('pets-photos').remove([...])
```

**Data Retention:**
- Completed reminders: 30 days
- Deleted data: Immediate permanent deletion
- Backup retention: 7 days (Supabase automatic)

**Cookie Consent:**
- Optional analytics cookies only
- Essential cookies (auth) don't require consent
- Clear cookie policy

### HTTPS & Transport Security

**Vercel:**
- Automatic HTTPS enforcement
- TLS 1.3 support
- HSTS headers
- SSL Labs A+ rating

**Supabase:**
- All API calls over HTTPS
- Certificate pinning (mobile apps in future)

**Security Headers:**
```typescript
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

## Performance Considerations

### Page Load Performance (Target: <2s on 4G)

**Code Splitting:**
```typescript
// Route-based code splitting
const PetDetailPage = lazy(() => import('@/pages/PetDetailPage'))
const ExpensesPage = lazy(() => import('@/pages/ExpensesPage'))

// Component lazy loading
<Suspense fallback={<LoadingSpinner />}>
  <PetDetailPage />
</Suspense>
```

**Image Optimization:**
- Client-side compression before upload
- Responsive image sizes (Supabase transformations)
- WebP format preference
- Lazy loading with Intersection Observer

**Bundle Size:**
- Target: <500KB gzipped main bundle
- Tree-shaking via Vite
- Dynamic imports for heavy components
- Analyze with `vite-bundle-visualizer`

### Query Performance (Target: <500ms p95)

**Database Indexes:**
```sql
-- All foreign keys indexed
CREATE INDEX idx_pets_user_id ON pets(user_id);
CREATE INDEX idx_health_records_pet_date ON health_records(pet_id, date DESC);
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);

-- Composite indexes for common queries
CREATE INDEX idx_reminders_datetime_active
ON reminders(user_id, date_time)
WHERE completed_at IS NULL;
```

**Query Optimization:**
- Select only needed columns (avoid `SELECT *` for lists)
- Use pagination (50 items per page)
- Limit results with `.limit()`
- Use `.single()` for single-row queries

**Caching:**
- React Query for client-side caching (future enhancement)
- Supabase connection pooling
- CDN caching for static assets (Vercel)

### Frontend Performance

**React Optimization:**
```typescript
// Memoize expensive computations
const expenseTotal = useMemo(() =>
  expenses.reduce((sum, e) => sum + e.amount, 0),
  [expenses]
)

// Memoize callbacks
const handleDelete = useCallback((id) => {
  deleteExpense(id)
}, [deleteExpense])

// Virtualize long lists (future)
import { useVirtualizer } from '@tanstack/react-virtual'
```

**Debouncing:**
```typescript
// Search/filter inputs
import { debounce } from '@/lib/utils'

const debouncedSearch = debounce((value) => {
  setSearchQuery(value)
}, 300)
```

**Optimistic UI Updates:**
```typescript
// Update UI immediately, rollback if fails
setExpenses([...expenses, newExpense])

try {
  const { error } = await supabase.from('expenses').insert(newExpense)
  if (error) throw error
} catch (error) {
  // Rollback on error
  setExpenses(expenses)
  showError()
}
```

## Deployment Architecture

### Vercel Deployment

**Build Configuration:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "npm install"
}
```

**Environment Variables:**
```bash
# Supabase
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxx...

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx # Edge Functions only
STRIPE_WEBHOOK_SECRET=whsec_xxx

# OneSignal
VITE_ONESIGNAL_APP_ID=xxx

# Resend
RESEND_API_KEY=re_xxx # Edge Functions only

# Sentry
VITE_SENTRY_DSN=https://xxx@sentry.io/xxx
```

**Deployment Strategy:**
- Automatic deployments on `main` branch push
- Preview deployments for pull requests
- Production: main branch
- Staging: develop branch (optional)

### Edge Functions Deployment

**Supabase Edge Functions:**
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy stripe-webhook
supabase functions deploy send-notifications
```

**Cron Configuration:**
```typescript
// send-notifications function
// Schedule: Every 5 minutes
Deno.cron("send-reminder-notifications", "*/5 * * * *", async () => {
  // Query and send notifications
})
```

### Monitoring & Alerting

**Sentry:**
- Error tracking with source maps
- Performance monitoring
- Release tracking
- User session replay

**UptimeRobot:**
- HTTP status monitoring (every 5 minutes)
- Email alerts on downtime >5 minutes
- Status page (optional)

**Supabase Dashboard:**
- Database query performance
- Storage usage
- API request volume
- RLS policy violations

## Development Environment

### Prerequisites

- **Node.js:** v18+ (LTS recommended)
- **npm:** v9+ (or pnpm/yarn)
- **Git:** Latest version
- **VS Code:** Recommended IDE (with extensions)

**VS Code Extensions:**
- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript and JavaScript Language Features

### Local Setup

```bash
# Clone repository
git clone [repo-url]
cd petlog-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your keys
# (Supabase project URL/key, Stripe keys, etc.)

# Run development server
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build

# Preview production build
npm run preview
```

### npm Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "coverage": "vitest --coverage",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "type-check": "tsc --noEmit"
  }
}
```

### Supabase Local Development

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase project
supabase init

# Start local Supabase
supabase start

# Create migration
supabase migration new initial_schema

# Apply migrations
supabase db push

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts
```

## Architecture Decision Records (ADRs)

### ADR-001: Use Supabase as Backend-as-a-Service

**Decision:** Use Supabase for database, auth, storage, and serverless functions instead of custom backend.

**Rationale:**
- Eliminates 14-day timeline constraint of building custom backend
- PostgreSQL + RLS provides enterprise-grade security
- Integrated auth (email + OAuth) with minimal setup
- S3-compatible storage with CDN
- Edge Functions for webhooks and cron jobs
- Cost-efficient scaling (<$0.10/user/month achievable)

**Consequences:**
- Vendor lock-in to Supabase ecosystem
- Limited to Supabase's feature set
- RLS policies must be carefully designed
- Edge Functions limited to Deno runtime

**Status:** Accepted

### ADR-002: Use React 19 Instead of Next.js

**Decision:** Use React 19 with Vite instead of Next.js framework.

**Rationale:**
- MVP is a Single Page Application (SPA), no SSR needed
- Vite provides faster development experience than Next.js
- Simpler architecture for 14-day timeline
- No SEO requirements for logged-in app
- Future migration to Next.js possible if SSR needed

**Consequences:**
- No server-side rendering
- Client-side routing only
- Limited SEO for public pages
- Easier to reason about (no server/client split)

**Status:** Accepted

### ADR-003: Use Tailwind CSS 4.0 for Styling

**Decision:** Use Tailwind CSS 4.0 instead of CSS-in-JS or traditional CSS.

**Rationale:**
- Mobile-first responsive design built-in
- Utility-first approach speeds development
- v4.0 offers 5x faster builds
- shadcn/ui components built on Tailwind
- Consistent design system
- No runtime cost (unlike CSS-in-JS)

**Consequences:**
- Large HTML class strings
- Learning curve for utility classes
- Requires Tailwind expertise
- CSS file size offset by tree-shaking

**Status:** Accepted

### ADR-004: Free Tier Limits Enforced Backend-First

**Decision:** All free tier limits enforced in database/backend, not just frontend.

**Rationale:**
- Security: Frontend checks can be bypassed
- Data integrity: Backend is source of truth
- Prevents abuse via API calls
- Consistent enforcement across all clients (future mobile apps)

**Consequences:**
- Requires backend checks for every insert
- Slightly slower operations (query count before insert)
- More complex backend logic
- Better security posture

**Status:** Accepted

### ADR-005: Use react-pdf/renderer for PDF Generation

**Decision:** Use react-pdf/renderer instead of jsPDF or other PDF libraries.

**Rationale:**
- React component API (familiar to team)
- Declarative PDF creation
- Clean, consistent output
- Server-side compatible (Edge Functions)
- Good documentation and community

**Consequences:**
- Heavier bundle size than jsPDF
- Limited to react-pdf features
- Requires learning react-pdf API
- Better maintainability with React patterns

**Status:** Accepted

### ADR-006: Dual Notification System (Push + Email)

**Decision:** Send both push notifications (OneSignal) and email (Resend) for all reminders.

**Rationale:**
- Redundancy: If push fails, email serves as backup
- User preference: Some users prefer email
- Higher delivery rate
- Better user experience (peace of mind)

**Consequences:**
- Increased cost (2x notification sends)
- More complex Edge Function logic
- Both services must be monitored
- Higher reliability overall

**Status:** Accepted

### ADR-007: Comprehensive Testing with Vitest + Playwright

**Decision:** Implement unit tests (Vitest), component tests (RTL), and E2E tests (Playwright).

**Rationale:**
- Catches bugs early in development
- Confidence in refactoring
- Documents expected behavior
- Critical for multi-agent development (AI consistency)
- Playwright provides excellent E2E experience

**Consequences:**
- Increased development time (tests take time to write)
- Test maintenance overhead
- CI/CD pipeline complexity
- Higher quality, fewer production bugs

**Status:** Accepted

---

_Generated by BMAD Decision Architecture Workflow v1.3.2_
_Date: 2025-11-06_
_For: Endre_
_Project: PetLog MVP (Level 3, Greenfield)_
