# PetLog MVP - Product Requirements Document

**Author:** Endre
**Date:** 2025-11-03
**Version:** 1.0

---

## Executive Summary

PetLog is a simple, mobile-first web application designed to bring pet health and expense management into the digital age for EU pet owners. While the EU still requires paper-based pet passports, PetLog offers a complementary digital solution that not only tracks health records but also adds financial tracking, smart reminders, and document management - features that paper passports simply cannot provide.

**The Core Problem:** Pet owners in the EU face three interconnected challenges that current solutions fail to address holistically:
1. **Health Management Crisis** - Missed vaccines lead to $150+ emergency vet visits; critical information scattered across paper documents
2. **Financial Blindness** - Pet owners spend $1,500-3,000+/year per pet but have zero visibility into costs or budget control
3. **Organization Chaos** - Paper passports get lost, records scattered, no reminders for recurring needs

**Our Solution:** PetLog combines health tracking, expense management with budget alerts, document storage, and smart notifications in an affordable ($7/month premium, free tier available) mobile-first web app that works alongside required EU pet passports.

**Market Opportunity:** 85+ million EU households own pets in a $140B+ global industry. Existing solutions are either too expensive ($15-30/month), too complex (built for vets, not owners), or incomplete (health-only or finance-only, not both).

### What Makes This Special

**PetLog's magic is the intersection of simplicity and completeness:**

1. **Unique Value Combination:** Only solution combining health tracking + financial management + budgeting in one affordable place
2. **Radical Simplicity:** Every page has one clear purpose - no bloat, just essentials done exceptionally well
3. **Extreme Affordability:** $7/month (50% cheaper than competitors) with generous free tier, enabled by smart tech stack (Supabase + Vercel)
4. **Works Anywhere:** Mobile-first web app - no app store needed, works on any device instantly
5. **Peace of Mind:** Never miss a vaccine, never be surprised by spending - the app keeps you on track

**The "Wow" Moment:** When a pet owner pulls up their phone at the vet and instantly answers "When was the last rabies vaccine?" while seeing their monthly pet budget status - all in one beautifully simple app.

---

## Project Classification

**Technical Type:** Web App (Mobile-First SaaS)
**Domain:** Consumer/Pet Tech (General)
**Complexity:** Medium (Level 3)

**Project Analysis:**

This is a **consumer-facing web application** built with a mobile-first responsive design strategy. The technical architecture centers on a modern React frontend with a Backend-as-a-Service (Supabase) approach, eliminating the need for custom backend development while leveraging best-in-class third-party services for payments (Stripe), notifications (OneSignal + Resend), and hosting (Vercel).

**Domain Classification:** General consumer software with no complex regulatory requirements. While operating in the pet care space, PetLog does not provide medical advice, diagnostic services, or veterinary care - it's a personal organization and tracking tool. This keeps the domain complexity low and avoids healthcare/medical device regulations.

**Complexity Justification (Level 3):**
- **Multiple Integrated Systems:** 7 core feature areas (auth, pet management, health tracking, expenses, reminders, documents, export)
- **Third-Party Integrations:** Stripe payments, OneSignal push, Resend email, Supabase backend
- **Freemium Business Model:** Tier management, usage limits, upgrade flows
- **14-Day Development Timeline:** Ambitious but achievable with modern BaaS approach

---

## Success Criteria

**PetLog succeeds when pet owners feel in control and at peace.**

Success is not measured by vanity metrics, but by genuine user outcomes that demonstrate the product delivers on its core promise: peace of mind through simplicity.

### User Success Indicators

**Immediate Success (First Use):**
- User completes onboarding and adds their first pet within 3 minutes
- User experiences the "wow moment" - adds health record and sees it in the timeline
- User sets their first budget and understands the alert system

**Short-Term Success (First 30 Days):**
- **100+ users** who discovered PetLog and chose to try it
- **Active engagement:** 60%+ of users return within first week to add more records
- **Premium conversion:** 20%+ upgrade to Premium (validates pricing and value perception)
- **Positive sentiment:** User feedback mentions "simple," "finally," "exactly what I needed"
- **Technical reliability:** <5% error rate, >99% uptime (users trust the app with important data)

**Medium-Term Success (90 Days):**
- **500-1,000 users** actively managing their pets
- **Power users emerge:** 10%+ of users have logged 20+ health records and 30+ expenses (deep engagement)
- **Revenue validation:** $25-50/month MRR proves business model
- **Cost efficiency maintained:** Infrastructure costs <$50/month (sustainable economics)
- **Product-market fit signals:** Users recommend PetLog to other pet owners, organic word-of-mouth begins

### Business Metrics

**Financial Health:**
- **Customer Acquisition Cost (CAC):** <$5 per user through organic channels (Reddit, Twitter, Facebook communities)
- **Monthly Recurring Revenue (MRR):** $25-50 (Month 3) → $700+ (Month 6) → $3,500+ (Year 1)
- **Unit Economics:** Gross margin >95% (excluding payment processing)
- **Sustainability:** Break-even at 20 Premium users ($140/month revenue vs $25/month infrastructure)

**Product Validation:**
- **Conversion funnel:** Signup → Add Pet → Add Health Record → Set Budget → Return next week (measure drop-off at each step)
- **Feature adoption:** 80%+ use health tracking, 60%+ use expense tracking, 40%+ set budgets
- **Retention:** 50%+ of users still active after 30 days (indicates real value, not curiosity)

**Growth Indicators:**
- Identify top 3 feature requests that validate product direction
- Clear understanding of which acquisition channels drive highest-quality users
- Evidence that health + finance combination is the differentiator users care about

### What "Winning" Looks Like

**For Users:**
- Never panic at the vet because all records are instantly accessible
- Monthly budget notifications prevent financial stress
- Smooth transitions when switching vets or traveling with pets
- Tax time is easy with one-click CSV export

**For the Business:**
- Sustainable economics enable continued low pricing ($7/month) as competitive moat
- Product simplicity allows solo developer to maintain and grow the product
- Strong conversion rate (20%+) validates freemium model
- Early user feedback guides Phase 2 feature prioritization

---

## Product Scope

**Scope Philosophy:** PetLog's MVP is deliberately constrained to validate the core hypothesis: pet owners will pay for a simple, combined health + financial tracking solution. The MVP must be complete enough to deliver the "wow moment" while remaining buildable in 14 days.

### MVP - Minimum Viable Product

**Target Timeline:** 14 days development + testing + launch
**Target Outcome:** Validate product-market fit with 100+ users and 20% Premium conversion

**What Must Work for This to Be Useful:**

The MVP delivers seven integrated feature areas that work together to solve the core problem:

**1. Foundation & Authentication (Days 1-2)**
- Email/password authentication with secure password reset
- Google OAuth social login
- Email verification flow
- Protected routes ensuring data privacy

**2. Pet Management (Days 3-4)**
- Create pet profiles (name, species, breed, birth date, weight, photo, microchip, notes)
- View all pets in card grid layout
- Edit and delete pets with confirmation
- **Free tier enforcement:** 1 pet maximum (upgrade prompt for additional pets)

**3. Health Tracking (Days 5-7)**
- Add multiple health record types: vaccines, medications, vet visits, symptoms, weight checks
- Color-coded health timeline (chronological view with overdue vaccines highlighted in red)
- Upload supporting documents (vet records, vaccine cards, x-rays, lab results)
- Weight tracking chart with breed-specific ideal ranges
- Filter timeline by record type

**4. Expense Management (Days 8-9)**
- Track expenses across 6 categories: vet, food, grooming, supplies, boarding/pet sitting, other
- Monthly spending dashboard with visual breakdown (pie charts, summary cards)
- Budget setting with intelligent alerts (80% warning, 100% critical threshold)
- Export expenses to CSV for tax deductions and reimbursements
- **Free tier limit:** 100 expenses per month

**5. Smart Reminders & Notifications (Days 10-11)**
- Create one-time and recurring reminders (daily, weekly, monthly, yearly)
- Grouped reminder view: Overdue, Today, This Week, Later
- Mark complete or snooze (1 day, 3 days, 1 week)
- Push notifications via OneSignal at 9 AM on reminder date
- Email notifications via Resend (same timing)
- Auto-create next reminder for recurring items when marked complete
- **Free tier limit:** 10 reminders maximum

**6. Document Library & Export (Days 12-13)**
- Upload and categorize documents: vet records, vaccine cards, receipts, lab results, x-rays, insurance claims, other
- Preview images and download PDFs
- Storage limits: 100MB free tier, 5GB Premium
- Export pet profile to branded PDF (health history, medications, allergies, emergency contact)
- Email pet profile directly to veterinarians

**7. Freemium Business Model (Day 14)**
- Stripe integration (Premium Monthly $7/month, Premium Annual $60/year)
- Upgrade/downgrade flows
- Usage limit enforcement across all free tier restrictions
- Simple landing page explaining value proposition
- Privacy policy and terms of service pages

**MVP Non-Negotiables:**
- Mobile-first responsive design (works perfectly on 640px screens)
- All features functional and tested
- Error tracking (Sentry) and uptime monitoring (UptimeRobot) operational
- GDPR-compliant data handling
- All free tier limits enforced correctly

### Growth Features (Post-MVP)

**Phase 2 (Months 1-3): Based on User Feedback**

Features to consider after validating core value proposition:

- **Multi-user accounts:** Family sharing with role-based permissions (owner, caregiver, viewer)
- **Enhanced analytics:** Expense trends over time, cost comparison by pet, budget forecasting
- **Receipt scanning/OCR:** Automatic expense entry from receipt photos
- **Medication tracking:** Daily medication checklist with dose tracking and refill reminders
- **Vet portal integration:** Direct data sharing with participating veterinary clinics
- **Pet insurance integration:** Submit claims directly from app with expense and document export
- **Custom categories:** User-defined expense and health record categories beyond defaults
- **Advanced notifications:** SMS reminders, customizable notification times
- **Collaborative sharing:** Share pet profile view-only link with pet sitters, boarders, or family

**Prioritization Criteria:** User demand + competitive differentiation + implementation complexity

### Vision (Future)

**Long-Term Vision (6-12+ Months): Market-Driven Innovation**

Ambitious features that extend PetLog's value but require significant development:

- **Native mobile apps (iOS/Android):** If web app limitations emerge or users strongly request
- **AI-powered insights:** Food tracking with nutrition analysis, health pattern detection, spending optimization
- **Telemedicine integration:** Video vet consultations within the app
- **Social features:** Pet profiles, photo sharing, community forums (if social use case emerges)
- **Breeder/shelter management:** Multi-pet tracking for professional use cases
- **Pharmacy integration:** Prescription refill ordering through partner pharmacies
- **Wearable integration:** Connect pet health trackers (smart collars, GPS, activity monitors)
- **International expansion:** Localized versions for non-English EU markets (German, French, Spanish, Italian)
- **Blockchain pet passport:** Immutable health record stored on blockchain for travel/ownership verification

**Vision Principle:** Only pursue these if core product achieves strong product-market fit and user demand justifies investment.

---

## Web App Specific Requirements

PetLog is built as a **Single Page Application (SPA)** using modern web technologies optimized for the mobile-first user experience.

### Architecture & Technology Stack

**Frontend Architecture:**
- **Framework:** React 18 with Vite (lightning-fast HMR and optimized builds)
- **Routing:** React Router v6 for client-side navigation (SPA architecture)
- **State Management:** React Context API for global state (user session, subscription tier)
- **Styling:** Tailwind CSS for utility-first rapid development
- **UI Components:** shadcn/ui (accessible, customizable components built on Radix UI)
- **Forms:** React Hook Form + Zod validation for type-safe form handling
- **Data Visualization:** Recharts for expense breakdowns and weight tracking charts
- **PDF Generation:** jsPDF or react-pdf for pet profile exports

**Backend Architecture:**
- **BaaS Provider:** Supabase (PostgreSQL database + Auth + Storage + Edge Functions)
- **Database:** PostgreSQL with Row Level Security (RLS) policies
- **File Storage:** Supabase Storage for pet photos and document uploads
- **Real-time:** Supabase real-time subscriptions (future use for multi-user collaboration)

**Hosting & Deployment:**
- **Platform:** Vercel (edge network, automatic HTTPS, instant deployments)
- **CI/CD:** Automatic deployment on git push to main branch
- **Environment:** Separate staging and production environments

### Browser Support & Compatibility

**Supported Browsers (Modern Evergreen):**
- Chrome/Edge (last 2 versions) - Primary target
- Firefox (last 2 versions)
- Safari (last 2 versions) - iOS Safari priority
- Mobile browsers: iOS Safari 14+, Chrome Android 90+

**NOT Supported:**
- Internet Explorer (end of life)
- Legacy Edge (<2020)
- Browsers >2 years old

**Testing Strategy:**
- Primary testing: Chrome desktop + iOS Safari mobile
- Secondary validation: Firefox, Chrome Android
- BrowserStack for cross-browser validation before major releases

### Responsive Design Strategy

**Mobile-First Approach:**

PetLog is designed mobile-first with progressive enhancement for larger screens.

**Breakpoints (Tailwind CSS):**
- **Mobile:** 0-640px (sm) - Primary design target, optimized for one-hand use
- **Tablet:** 640-1024px (md/lg) - Two-column layouts where appropriate
- **Desktop:** 1024px+ (xl) - Three-column layouts, expanded visualizations

**Key Responsive Behaviors:**
- **Navigation:** Mobile hamburger menu → Desktop sidebar/header navigation
- **Forms:** Full-width stacked on mobile → Multi-column on desktop
- **Charts:** Simplified mobile view → Full detail desktop view
- **Data tables:** Card layout mobile → Table layout desktop
- **Images:** Optimized resolution per device (responsive images)

**Touch Optimization:**
- Minimum touch target: 44x44px (Apple HIG standard)
- Generous spacing between interactive elements
- Swipe gestures for timeline navigation (future enhancement)

### Authentication & Authorization

**Authentication Methods:**
1. **Email/Password:** Standard email-based signup with Supabase Auth
2. **Google OAuth:** Social login via Google (faster onboarding, higher conversion)
3. **Password Reset:** Email-based secure password reset flow
4. **Email Verification:** Required for new accounts to prevent spam

**Authorization Model:**
- **Row Level Security (RLS):** Supabase RLS policies ensure users only access their own data
- **Session Management:** JWT-based sessions with automatic refresh
- **Protected Routes:** React Router guards redirect unauthenticated users to login
- **Subscription Tier Enforcement:** Middleware checks user tier before allowing premium actions

**Security Considerations:**
- No passwords stored in frontend (handled by Supabase)
- HTTPS-only (enforced by Vercel)
- XSS protection via React's built-in escaping
- CSRF protection via SameSite cookies

### Platform Support

**Primary Platform:** Progressive Web App (PWA) characteristics without full PWA implementation

**Why Web-Only for MVP:**
- **Faster time to market:** 14 days vs 6-8 weeks for native apps
- **No app store approval delays:** Launch immediately
- **Single codebase:** Maintain one codebase for all platforms
- **Instant updates:** Deploy fixes without app store review
- **Lower barrier to entry:** No app install required, just visit URL

**Web Platform Advantages:**
- Works on any device with a modern browser
- Shareable via URL (acquisition advantage)
- No storage constraints (beyond device storage)
- Easier A/B testing and iteration

**Future Native Apps (Post-MVP):**
- Only if user demand justifies development cost
- React Native or native Swift/Kotlin for best performance
- Native features: Biometric auth, advanced camera integration, true offline mode

### SEO Requirements

**Limited SEO Focus for MVP:**

PetLog is a **logged-in application** with minimal public-facing content, so SEO is not a primary concern.

**Public Pages (SEO-Optimized):**
- Landing page (marketing copy, value proposition)
- Pricing page (tier comparison)
- Privacy policy, Terms of service
- Blog (future content marketing)

**SEO Implementation:**
- **Meta tags:** Title, description, Open Graph for social sharing
- **Sitemap:** XML sitemap for public pages
- **Robots.txt:** Allow indexing of public pages, block app routes
- **Performance:** Lighthouse score >90 (fast page loads improve SEO)
- **Mobile-friendly:** Google mobile-first indexing compliance

**App Routes (No SEO):**
- All authenticated routes return 401/403 for crawlers
- No need for SSR (Server-Side Rendering) for app pages
- Client-side rendering (SPA) is sufficient for logged-in experience

### Real-Time Requirements

**Current Needs (MVP):**
- **No real-time requirements** for MVP (single-user application)
- All data updates are user-initiated (create, edit, delete)
- Standard request-response model is sufficient

**Future Real-Time Use Cases (Post-MVP):**
- **Multi-user collaboration:** See when family member adds health record
- **Live notifications:** Real-time reminder alerts without page refresh
- **Vet portal integration:** Real-time sync when vet updates records

**Technical Approach (Future):**
- Supabase real-time subscriptions via WebSocket
- Optimistic UI updates for perceived performance
- Conflict resolution for concurrent edits

---

## User Experience Principles

**Design Philosophy:** PetLog's UX embodies "radical simplicity" - every screen has one clear purpose, zero distractions, and instant clarity.

### Core UX Principles

**1. Instant Clarity Over Feature Discovery**

Users should understand what they're looking at within 2 seconds, without tutorials or onboarding.

- **Every page has ONE primary action** (floating action button or prominent CTA)
- **Clear visual hierarchy:** Title → Key info → Actions
- **No hidden features:** Everything important is visible, not buried in menus
- **Progressive disclosure:** Advanced options appear only when needed

**2. Mobile-First Touch Interactions**

Designed for thumbs, not cursors. Everything is reachable with one hand on a phone.

- **Bottom navigation:** Core features within thumb reach on mobile
- **Large touch targets:** Minimum 44x44px (Apple HIG standard)
- **Generous spacing:** Prevent accidental taps
- **Pull-to-refresh:** Natural mobile gesture for data updates

**3. Visual Feedback & Confidence**

Users need to feel confident their data is safe and actions are successful.

- **Immediate visual feedback:** Button states, loading indicators, success animations
- **Color-coded status:** Green (good), Yellow (warning), Red (urgent/overdue)
- **Confirmation for destructive actions:** Delete requires explicit confirmation
- **Undo capability:** For accidental deletions (trash/archive pattern)

**4. Contextual Intelligence**

The app should anticipate user needs and surface relevant information proactively.

- **Smart defaults:** Pre-fill forms with likely values (e.g., today's date)
- **Contextual suggestions:** "Vaccine due soon - set a reminder?"
- **Budget awareness:** Show spending progress when adding expenses
- **Quick actions:** Common tasks accessible from multiple entry points

**5. Delightful Without Being Distracting**

Subtle animations and personality that reinforce the product magic without slowing users down.

- **Micro-interactions:** Subtle animations on button clicks, successful saves
- **Empty states:** Friendly guidance when user has no data yet ("Add your first pet!")
- **Success moments:** Celebrate milestones (first health record, first month tracked)
- **Pet-centric personality:** Use pet photos prominently, warm but not cutesy tone

### Visual Design Language

**Color Palette:**
- **Primary:** Warm teal/turquoise (calm, trustworthy, pet-friendly)
- **Success:** Green (healthy, positive)
- **Warning:** Amber (budget alerts, upcoming reminders)
- **Danger:** Red (overdue vaccines, critical budget alerts)
- **Neutral:** Clean grays for text and backgrounds (professional, readable)

**Typography:**
- **Font family:** Modern sans-serif (Inter, Poppins, or similar)
- **Size hierarchy:** Clear distinction between headings, body, and labels
- **Readability:** 16px minimum body text, high contrast ratios (WCAG AA)

**Iconography:**
- **Style:** Rounded, friendly icons (not corporate/sharp)
- **Usage:** Icons + labels (never icons alone for critical actions)
- **Consistency:** Use shadcn/ui icon library throughout

**Photography:**
- **Pet photos:** User-uploaded pet photos are the star (large, prominent)
- **Empty states:** Friendly illustrations when no data exists
- **Stock photos:** Avoid generic stock photos of pets (users provide real photos)

### Key Interactions

**Critical User Flows:**

**1. First-Time User Onboarding (Goal: <3 minutes to "wow moment")**
- Sign up (email or Google OAuth) → Email verification → Welcome screen
- "Add your first pet" (name + species required, everything else optional) → Pet created
- Inline prompt: "Track your first health record" → Add vaccine → See timeline
- Success animation: "Your pet's health is now being tracked!"
- Next steps prompt: "Set a budget to track spending"

**2. Adding a Health Record (Most frequent interaction)**
- From pet detail page → Floating "+" button → Health record type selector
- Smart form: Record type determines fields (vaccine needs expiration, medication needs dosage)
- Option to attach photo/document → Save → Timeline updates with color-coded entry
- Contextual prompt: "Want a reminder before this expires?"

**3. Adding an Expense (Second most frequent)**
- From expenses page → "Add Expense" button → Quick form
- Smart categories with icons (vet, food, grooming, etc.)
- Date defaults to today, category remembers last choice
- Save → Dashboard updates with new total and chart
- Budget alert appears if threshold crossed (80% warning, 100% critical)

**4. Checking Budget Status (Quick glance)**
- Dashboard shows progress bar immediately (green → amber → red)
- Tap for details: This month, this year, category breakdown
- Visual: Pie chart for spending by category
- Quick action: "Adjust budget" or "See all expenses"

**5. Setting a Reminder (Proactive peace of mind)**
- From health record or standalone → "Set Reminder" → Quick form
- Smart defaults: Vaccine expiration reminder set to 1 week before
- Recurring options: Daily, weekly, monthly, yearly
- Notification preferences: Push + email (both enabled by default)

**6. Exporting Data (Vet visit or tax time)**
- From pet detail → "Export" → Choose format (PDF profile or CSV expenses)
- PDF: Branded, professional pet health summary
- CSV: Date range selector → Download or email directly
- Success: "Ready to share with your vet" or "Ready for tax filing"

**7. Upgrading to Premium (Conversion moment)**
- Hit free tier limit → Friendly upgrade prompt appears
- Show value clearly: "Unlimited pets, unlimited records, no ads"
- One-click to Stripe checkout → Return to app with Premium unlocked
- Celebrate: "Welcome to Premium! All limits removed."

### Accessibility Considerations

**WCAG AA Compliance (Minimum):**
- **Color contrast:** 4.5:1 for normal text, 3:1 for large text
- **Keyboard navigation:** All actions accessible via keyboard
- **Screen reader support:** ARIA labels, semantic HTML
- **Focus indicators:** Clear visual focus states for keyboard users
- **Form labels:** All inputs have visible, associated labels

**Mobile Accessibility:**
- **Large touch targets:** 44x44px minimum (exceeds WCAG 2.5.5)
- **Orientation:** Works in portrait and landscape
- **Zoom:** Content remains readable at 200% zoom
- **Text resize:** Layouts adapt to user's preferred text size

**Future Enhancements (Post-MVP):**
- High contrast mode for low vision users
- Voice navigation for hands-free use
- Multi-language support for EU markets

---

## Functional Requirements

**Organization Principle:** Requirements are organized by user-facing capability, not technical implementation. Each requirement connects directly to solving the core user problems (health management, financial visibility, organization chaos).

### FR-1: User Account Management

**User Value:** Secure, frictionless access to pet data from any device

**FR-1.1: User Registration**
- Users can create accounts using email/password or Google OAuth
- Email verification required before accessing core features
- User profile stores: email, name, subscription tier, created date
- **Acceptance Criteria:**
  - Email signup flow completes in <60 seconds
  - Email verification link valid for 24 hours
  - Google OAuth completes in <10 seconds
  - Duplicate emails rejected with clear error message

**FR-1.2: User Authentication**
- Users can log in with email/password or Google OAuth
- Session persists across browser sessions (remember me)
- Automatic session refresh (JWT token renewal)
- **Acceptance Criteria:**
  - Login completes in <5 seconds
  - Session remains active for 30 days (remember me enabled)
  - Invalid credentials show clear, non-specific error ("Invalid email or password")
  - Account lockout after 5 failed attempts (security)

**FR-1.3: Password Management**
- Users can reset forgotten passwords via email
- Password reset link valid for 1 hour
- Minimum password requirements: 8 characters, 1 uppercase, 1 number
- **Acceptance Criteria:**
  - Reset email arrives within 60 seconds
  - Reset flow completes in <2 minutes
  - Old password becomes invalid immediately after reset
  - Users notified via email when password changes

**FR-1.4: Protected Access**
- All app routes require authentication (except public pages)
- Unauthenticated users redirected to login
- Subscription tier enforced for premium features
- **Acceptance Criteria:**
  - Direct URL access to app routes redirects to login if not authenticated
  - Free tier users see upgrade prompt when attempting premium actions
  - Premium users have unrestricted access to all features

### FR-2: Pet Profile Management

**User Value:** Centralized repository for all pet information, instantly accessible

**FR-2.1: Create Pet Profile**
- Users can add pets with: name (required), species (required), breed, birth date, weight, gender, spayed/neutered status, microchip number, photo, notes
- Photo upload supports: JPG, PNG, HEIC (max 5MB)
- Weight units: kg or lbs (user preference)
- **Acceptance Criteria:**
  - Form completes in <30 seconds with only name + species
  - Photo uploads within 10 seconds
  - Free tier users blocked at 1 pet (upgrade prompt shown)
  - Premium users can create unlimited pets

**FR-2.2: View Pet Profiles**
- Users see all pets in card grid layout (photo + name + species)
- Cards show key info: age, last health record date, urgent overdue items
- Tapping card navigates to pet detail page
- **Acceptance Criteria:**
  - Pet grid loads in <2 seconds
  - Pet photos display optimized resolution per device
  - Overdue vaccines show red badge on card
  - Empty state shows "Add your first pet" prompt

**FR-2.3: Edit Pet Profile**
- Users can update all pet fields except creation date
- Changes save immediately
- Photo can be replaced or removed
- **Acceptance Criteria:**
  - Updates persist within 2 seconds
  - Success feedback shown (toast or checkmark animation)
  - Photo replacement maintains aspect ratio
  - Validation prevents invalid data (e.g., future birth date)

**FR-2.4: Delete Pet Profile**
- Users can delete pets with confirmation dialog
- Deletion removes: pet profile, health records, expenses, reminders, documents
- Action is permanent (no undo for MVP)
- **Acceptance Criteria:**
  - Confirmation dialog shows count of items to be deleted
  - Deletion completes within 5 seconds
  - User redirected to pet list after deletion
  - Deleted data removed from database (not soft delete)

### FR-3: Health Record Management

**User Value:** Never miss vaccines, instant access to health history at vet visits

**FR-3.1: Create Health Records**
- Record types: Vaccine, Medication, Vet Visit, Symptom, Weight Check
- Common fields: date, title, notes, attached documents
- Type-specific fields:
  - Vaccine: expiration date, vet clinic, dose
  - Medication: dosage, frequency, start/end date
  - Vet Visit: clinic, vet name, diagnosis, treatment, cost
  - Symptom: severity (mild/moderate/severe), observed behaviors
  - Weight Check: weight, unit (kg/lbs), body condition
- **Acceptance Criteria:**
  - Form adapts based on record type selection
  - Date defaults to today, time defaults to now
  - Document attachment optional (up to 5 files per record)
  - Free tier users blocked at 50 records (upgrade prompt)

**FR-3.2: View Health Timeline**
- Chronological timeline showing all health records (newest first)
- Color-coded by type: Vaccine (blue), Medication (purple), Vet Visit (green), Symptom (orange), Weight Check (teal)
- Overdue vaccines highlighted in red
- Filter by record type (multi-select)
- **Acceptance Criteria:**
  - Timeline loads in <3 seconds for 100+ records
  - Overdue determination: vaccine expiration < today
  - Filters persist during session
  - Empty state shows "Add your first health record" prompt

**FR-3.3: Weight Tracking Visualization**
- Line chart showing weight over time
- Ideal weight range overlay (breed/species-based guidelines)
- Date range selector: 1 month, 3 months, 6 months, 1 year, all time
- **Acceptance Criteria:**
  - Chart displays only Weight Check records
  - Minimum 2 data points required to show chart
  - Ideal range shows as shaded area on chart
  - Chart responsive to mobile screen sizes

**FR-3.4: Edit Health Records**
- Users can update all fields except creation date
- Changes save immediately
- Can add/remove attached documents
- **Acceptance Criteria:**
  - Updates persist within 2 seconds
  - Timeline re-sorts if date changed
  - Document uploads complete before save
  - Validation prevents future dates for past events

**FR-3.5: Delete Health Records**
- Users can delete records with confirmation
- Attached documents deleted from storage
- **Acceptance Criteria:**
  - Confirmation required for deletion
  - Deletion completes within 3 seconds
  - Timeline updates immediately
  - Associated reminders offer to be deleted

### FR-4: Expense Tracking & Budgeting

**User Value:** Financial visibility prevents budget shock, enables tax deductions

**FR-4.1: Create Expenses**
- Fields: pet (dropdown), category (6 options), amount, currency, date, merchant, notes, receipt photo
- Categories: Vet, Food, Grooming, Supplies, Boarding/Pet Sitting, Other
- Currency: EUR (default), USD, GBP (auto-detected from browser locale)
- **Acceptance Criteria:**
  - Form completes in <20 seconds
  - Date defaults to today
  - Category remembers last selection
  - Free tier users blocked at 100 expenses/month (resets monthly)
  - Receipt upload optional (max 10MB)

**FR-4.2: View Expense Dashboard**
- Summary cards: Total this month, Total this year, Most expensive category, Average monthly
- Pie chart: Spending breakdown by category (current month)
- Expense list: Chronological, grouped by month
- **Acceptance Criteria:**
  - Dashboard loads in <3 seconds
  - Charts update immediately when expense added
  - Filter by pet, category, date range
  - Empty state shows "Add your first expense" prompt

**FR-4.3: Budget Management**
- Users set monthly budget per pet or overall
- Progress bar shows spending vs budget (green <80%, amber 80-99%, red ≥100%)
- Alert thresholds: 80% warning, 100% critical
- **Acceptance Criteria:**
  - Budget setting saves immediately
  - Progress bar updates in real-time when expenses added
  - Alerts show as banner on dashboard when threshold crossed
  - Budget resets automatically on first day of month

**FR-4.4: Export Expenses to CSV**
- Date range selector: This month, This year, Last 12 months, Custom range
- CSV columns: Date, Pet, Category, Amount, Currency, Merchant, Notes
- Filename: `petlog-expenses-{start-date}-{end-date}.csv`
- **Acceptance Criteria:**
  - Export generates within 5 seconds for 1000+ expenses
  - CSV opens correctly in Excel, Google Sheets
  - Custom date range validated (start < end)
  - Export button disabled if no expenses in range

**FR-4.5: Edit & Delete Expenses**
- Users can update all expense fields
- Delete with confirmation (no undo)
- **Acceptance Criteria:**
  - Updates save within 2 seconds
  - Dashboard/charts update immediately
  - Deletion removes from monthly count (free tier tracking)
  - Budget progress bar updates after edit/delete

### FR-5: Reminders & Notifications

**User Value:** Proactive peace of mind - never miss critical care milestones

**FR-5.1: Create Reminders**
- Fields: title, pet, date/time, recurrence (one-time, daily, weekly, monthly, yearly), notes
- Notification channels: Push (OneSignal), Email (Resend) - both enabled by default
- Reminder can be linked to health record (e.g., vaccine expiration reminder)
- **Acceptance Criteria:**
  - Form completes in <30 seconds
  - Date/time picker defaults to tomorrow 9 AM
  - Recurrence options clear and intuitive
  - Free tier users blocked at 10 reminders (upgrade prompt)

**FR-5.2: View Reminders List**
- Grouped views: Overdue, Today, This Week, Later
- Each reminder shows: title, pet, date/time, recurrence icon
- Color-coded by urgency: Red (overdue), Green (today), Gray (future)
- **Acceptance Criteria:**
  - List loads in <2 seconds
  - Grouping updates automatically at midnight (timezone aware)
  - Overdue count shows badge on nav icon
  - Empty state shows "Create your first reminder"

**FR-5.3: Reminder Actions**
- Mark complete: Reminder moves to history
- Snooze options: 1 day, 3 days, 1 week
- Recurring reminders auto-create next occurrence when marked complete
- **Acceptance Criteria:**
  - Complete action shows success animation
  - Snooze updates reminder date immediately
  - Recurring logic: Yearly reminder creates next year's instance
  - Completed reminders available in history for 30 days

**FR-5.4: Notification Delivery**
- Push notifications sent via OneSignal at reminder time
- Email notifications sent via Resend at reminder time
- Both notifications include: title, pet name, notes, deeplink to app
- **Acceptance Criteria:**
  - Notifications send within 5 minutes of reminder time
  - Push requires user permission (prompted on first reminder creation)
  - Email falls back if push fails
  - Deeplink opens specific pet detail page

**FR-5.5: Edit & Delete Reminders**
- Users can update all reminder fields
- Delete with confirmation
- Recurring reminders: Delete only this instance or all future instances
- **Acceptance Criteria:**
  - Updates save within 2 seconds
  - Time changes validated (not in past)
  - Recurring delete options clear (radio buttons)
  - Notification schedule updates immediately

### FR-6: Document Management

**User Value:** Paperless pet records, sharable with vets instantly

**FR-6.1: Upload Documents**
- File types: PDF, JPG, PNG, HEIC
- Max file size: 10MB per file
- Categories: Vet Record, Vaccine Card, Receipt, Lab Results, X-ray/Imaging, Insurance Claim, Other
- Documents linked to specific pet
- **Acceptance Criteria:**
  - Upload completes within 15 seconds per file
  - Progress bar shows upload status
  - Free tier limit: 100MB total storage (across all documents)
  - Premium limit: 5GB total storage
  - Storage usage bar shows current vs limit

**FR-6.2: View Document Library**
- Grid view with thumbnails (images) or file icons (PDFs)
- Filter by pet, category
- Sort by: Date uploaded, Filename, File size
- **Acceptance Criteria:**
  - Thumbnails load with lazy loading (performance)
  - Grid responsive (1 column mobile, 3 columns desktop)
  - Empty state shows "Upload your first document"
  - File size displayed in human-readable format (MB, KB)

**FR-6.3: Document Actions**
- Preview: Images open in lightbox, PDFs open in new tab
- Download: Original file downloads to device
- Delete: Confirmation required, frees up storage quota
- **Acceptance Criteria:**
  - Preview loads within 3 seconds
  - Download preserves original filename
  - Delete updates storage usage immediately
  - Lightbox supports pinch-to-zoom on mobile

### FR-7: Data Export & Sharing

**User Value:** Professional, shareable pet health summaries for vets, sitters, travel

**FR-7.1: Export Pet Profile to PDF**
- Branded PDF includes: Pet photo, basic info, health timeline (last 12 months), current medications, allergies/notes, emergency contact
- Professional formatting: Clean typography, PetLog branding (footer)
- Filename: `{PetName}-Health-Profile-{Date}.pdf`
- **Acceptance Criteria:**
  - PDF generates within 10 seconds
  - Free tier: Text-only PDF (no photos)
  - Premium tier: Full PDF with pet photo and document thumbnails
  - PDF renders correctly on all devices
  - File size optimized (<2MB for typical profile)

**FR-7.2: Email Pet Profile to Vet**
- Input: Veterinarian email address
- Email includes PDF attachment + brief message
- Sent via Resend API
- **Acceptance Criteria:**
  - Email sends within 30 seconds
  - User receives confirmation toast ("Email sent to [vet email]")
  - Email from: noreply@petlog.app, Reply-to: user's email
  - Email subject: "[Pet Name] Health Profile from [User Name]"
  - Email body: Friendly intro + PDF attachment notice

**FR-7.3: Export Expenses to CSV**
(Covered in FR-4.4 - cross-reference)

### FR-8: Subscription & Tier Management

**User Value:** Transparent pricing, frictionless upgrades, sustainable business model

**FR-8.1: Free Tier Enforcement**
- Limits: 1 pet, 50 health records, 100 expenses/month, 10 reminders, 100MB storage
- Upgrade prompts shown when limit reached (friendly, not blocking)
- Usage indicators visible in UI (e.g., "9/10 reminders used")
- **Acceptance Criteria:**
  - Limit checks happen before action (proactive blocking)
  - Upgrade prompt includes clear value proposition
  - Usage counts accurate in real-time
  - Free tier users can view but not exceed limits

**FR-8.2: Stripe Payment Integration**
- Pricing: Premium Monthly ($7/month), Premium Annual ($60/year - 17% discount)
- Checkout: Stripe Checkout hosted page (PCI-compliant)
- Payment methods: Credit card, debit card
- **Acceptance Criteria:**
  - Checkout opens in new tab, redirects back on success
  - Payment confirmation updates user tier within 60 seconds
  - Failed payments show clear error message + retry option
  - User receives email receipt from Stripe

**FR-8.3: Subscription Management**
- View current plan, billing date, payment method
- Upgrade: Free → Premium (immediate activation)
- Downgrade: Premium → Free (at period end, no prorating)
- Cancel: Premium → Free at end of billing cycle
- **Acceptance Criteria:**
  - Plan changes process within 60 seconds
  - Downgrade preserves data but enforces free tier limits
  - Cancel confirmation explains data retention policy
  - Billing date shown in user's timezone

**FR-8.4: Premium Feature Unlocks**
- Immediate benefits upon upgrade: All limits removed, ads hidden (if any), premium PDF export enabled
- Features unlock without page refresh (real-time via subscription tier check)
- **Acceptance Criteria:**
  - Upgrade confirmation shows "Welcome to Premium" celebration
  - Usage indicators removed from UI
  - Premium features immediately accessible
  - User can add 2nd pet immediately after upgrade

---

## Non-Functional Requirements

**NFR Philosophy:** PetLog's non-functional requirements focus on what matters for a mobile-first consumer SaaS: performance, security, scalability, and reliable integrations. Accessibility is covered in the UX section above.

### Performance

**Why Performance Matters:** PetLog users need instant access to pet data, especially during vet visits. Slow load times break the "peace of mind" promise.

**NFR-P1: Page Load Performance**
- **Target:** Initial page load <2 seconds on 4G mobile connection
- **Measurement:** Lighthouse Performance score >90
- **Implementation:**
  - Code splitting by route (React.lazy + Suspense)
  - Image optimization (WebP format, responsive sizes)
  - Lazy loading for images and charts
  - Vercel edge network CDN
- **Acceptance:** Lighthouse audit passes in CI/CD pipeline

**NFR-P2: Interaction Responsiveness**
- **Target:** User interactions respond within 100ms (perceived as instant)
- **Critical interactions:** Button clicks, form inputs, navigation
- **Implementation:**
  - Optimistic UI updates (show result before server confirms)
  - Debounced search/filter inputs
  - React suspense boundaries for smooth loading states
- **Acceptance:** Chrome DevTools Performance profiling shows <100ms interaction time

**NFR-P3: Database Query Performance**
- **Target:** API responses <500ms for typical queries
- **Implementation:**
  - Supabase database indexes on frequently queried columns (user_id, pet_id, date fields)
  - Limit query results (pagination: 50 items per page for lists)
  - RLS policies optimized for performance
- **Acceptance:** Supabase query logs show p95 latency <500ms

**NFR-P4: File Upload Performance**
- **Target:** 5MB photo uploads complete within 10 seconds on 4G
- **Implementation:**
  - Client-side image compression before upload (reduce file size 50-70%)
  - Supabase Storage direct uploads (no proxy)
  - Progress bar feedback during upload
- **Acceptance:** Manual testing with 5MB files on simulated 4G completes <10s

**NFR-P5: Bundle Size Optimization**
- **Target:** Initial JavaScript bundle <500KB (gzipped)
- **Implementation:**
  - Tree-shaking unused code
  - Dynamic imports for routes and heavy components
  - Vite production build optimizations
- **Acceptance:** Webpack Bundle Analyzer shows <500KB gzipped main bundle

### Security

**Why Security Matters:** Users trust PetLog with sensitive pet health data and payment information. GDPR compliance is legally required in EU market.

**NFR-S1: Data Privacy & GDPR Compliance**
- **Requirements:**
  - Users can export all their data (JSON format)
  - Users can delete their account and all associated data
  - Privacy policy explains data collection, storage, and usage
  - Cookie consent for analytics (Plausible or PostHog)
- **Implementation:**
  - Supabase RLS policies ensure data isolation per user
  - Account deletion triggers cascade delete of all user data
  - Export function generates complete data dump
  - GDPR-compliant cookie banner (optional analytics only)
- **Acceptance:** Manual GDPR checklist verification, account deletion test

**NFR-S2: Authentication Security**
- **Requirements:**
  - Passwords hashed with industry-standard algorithm (bcrypt)
  - JWT tokens expire after reasonable period (30 days with refresh)
  - Account lockout after 5 failed login attempts
  - Password reset tokens single-use, expire after 1 hour
- **Implementation:**
  - Supabase Auth handles password hashing (bcrypt with salt)
  - JWT auto-refresh via Supabase client
  - Rate limiting on auth endpoints (Supabase built-in)
- **Acceptance:** Penetration testing checklist, auth flow security audit

**NFR-S3: HTTPS & Transport Security**
- **Requirements:**
  - All traffic encrypted via HTTPS/TLS
  - No mixed content (all assets loaded via HTTPS)
  - HSTS headers enforced
- **Implementation:**
  - Vercel enforces HTTPS by default
  - Automatic SSL certificate management
  - Security headers configured in vercel.json
- **Acceptance:** SSL Labs test shows A+ rating

**NFR-S4: XSS & Injection Prevention**
- **Requirements:**
  - All user input sanitized before rendering
  - SQL injection prevented via parameterized queries
  - CSRF protection for state-changing operations
- **Implementation:**
  - React auto-escapes JSX (prevents XSS)
  - Supabase client uses parameterized queries (prevents SQL injection)
  - SameSite cookies prevent CSRF
- **Acceptance:** OWASP ZAP scan shows no critical vulnerabilities

**NFR-S5: Payment Security (PCI Compliance)**
- **Requirements:**
  - No credit card data stored in PetLog database
  - Stripe handles all payment processing (PCI-compliant)
  - Payment webhooks verified via Stripe signature
- **Implementation:**
  - Stripe Checkout hosted page (card data never touches PetLog servers)
  - Webhook signature verification in Supabase Edge Function
  - Stripe API keys stored in environment variables (not code)
- **Acceptance:** Stripe integration security checklist passes

### Scalability

**Why Scalability Matters:** PetLog must grow from 100 to 10,000+ users without performance degradation or infrastructure cost explosion.

**NFR-SC1: Database Scalability**
- **Target:** Support 10,000+ users, 500,000+ records without performance degradation
- **Implementation:**
  - Supabase PostgreSQL with connection pooling
  - Database indexes on high-cardinality columns
  - Vertical scaling: Supabase Pro plan supports millions of rows
- **Acceptance:** Load testing with simulated 10K users, queries remain <500ms

**NFR-SC2: Storage Scalability**
- **Target:** Support 100GB+ of user-uploaded files
- **Implementation:**
  - Supabase Storage (S3-compatible backend)
  - Free tier: 100MB per user (100 users = 10GB)
  - Premium tier: 5GB per user
  - Automatic scaling with Supabase infrastructure
- **Acceptance:** Storage costs remain linear with user growth

**NFR-SC3: Cost Efficiency at Scale**
- **Target:** Infrastructure costs scale linearly with user growth, not exponentially
- **Projections:**
  - 0-500 users: Supabase free tier ($0/month)
  - 500-2,000 users: Supabase Pro ($25/month)
  - 2,000-10,000 users: Supabase Team ($599/month) + OneSignal ($99/month)
- **Implementation:**
  - Supabase BaaS handles backend scaling
  - Vercel scales automatically (unlimited bandwidth on free tier)
  - Monitor costs via Supabase dashboard
- **Acceptance:** Cost per user remains <$0.10/month at 10K users

**NFR-SC4: Frontend Scalability**
- **Target:** App remains responsive with 1,000+ records per user
- **Implementation:**
  - Virtual scrolling for long lists (react-window)
  - Pagination for API queries (50 items per page)
  - Lazy loading for images and charts
  - Infinite scroll pattern for timeline
- **Acceptance:** UI remains smooth with stress test data (1000+ records)

**NFR-SC5: API Rate Limiting**
- **Target:** Prevent abuse, ensure fair usage
- **Implementation:**
  - Supabase built-in rate limiting (60 requests/minute per IP)
  - Frontend debouncing for search/filter inputs
  - Exponential backoff for failed requests
- **Acceptance:** Rate limit testing shows graceful degradation

### Integration Reliability

**Why Integration Matters:** PetLog depends on 5 third-party services. Failures must be handled gracefully to maintain user trust.

**NFR-I1: Supabase (Database, Auth, Storage)**
- **Requirement:** 99.9% uptime (Supabase SLA)
- **Failure Handling:**
  - Display friendly error message if Supabase unreachable
  - Retry failed requests with exponential backoff
  - Offline detection: Show banner "Connection lost, retrying..."
- **Monitoring:** Supabase dashboard monitors uptime and latency
- **Acceptance:** Error handling tested by blocking Supabase API temporarily

**NFR-I2: Stripe (Payments)**
- **Requirement:** 99.99% uptime (Stripe SLA)
- **Failure Handling:**
  - Stripe Checkout errors show user-friendly message + retry button
  - Webhook failures: Stripe auto-retries up to 72 hours
  - Payment status polling: Check payment confirmation via Stripe API if webhook delayed
- **Monitoring:** Stripe dashboard shows payment success rate
- **Acceptance:** Payment failure scenarios tested with Stripe test mode

**NFR-I3: OneSignal (Push Notifications)**
- **Requirement:** 99% delivery rate for push notifications
- **Failure Handling:**
  - If push fails, email notification serves as backup
  - User can manually check reminders list if notification missed
  - Notification delivery tracked in OneSignal dashboard
- **Monitoring:** OneSignal dashboard shows delivery/open rates
- **Acceptance:** Dual delivery system (push + email) ensures redundancy

**NFR-I4: Resend (Email Notifications)**
- **Requirement:** 99% delivery rate for transactional emails
- **Failure Handling:**
  - Email failures logged to Sentry for investigation
  - Critical emails (password reset, subscription confirmation) retried once
  - User shown confirmation when email sent successfully
- **Monitoring:** Resend dashboard shows delivery/bounce rates
- **Acceptance:** Email delivery tested with multiple providers (Gmail, Outlook, etc.)

**NFR-I5: Vercel (Hosting)**
- **Requirement:** 99.99% uptime (Vercel SLA)
- **Failure Handling:**
  - Vercel edge network provides automatic failover
  - Static assets cached at edge (survive temporary origin failures)
  - UptimeRobot monitors uptime, alerts via email if >5min downtime
- **Monitoring:** UptimeRobot + Vercel analytics dashboard
- **Acceptance:** Uptime monitoring configured, alerts tested

**NFR-I6: Error Tracking & Monitoring**
- **Requirement:** Capture and alert on critical errors
- **Implementation:**
  - Sentry SDK integrated in React app
  - Error boundary components catch React errors
  - Supabase errors logged with context (user ID, query)
  - Alert thresholds: >10 errors/hour triggers email notification
- **Monitoring:** Sentry dashboard shows error trends
- **Acceptance:** Test error thrown, appears in Sentry within 60 seconds

---

## Implementation Planning

### Epic Breakdown Required

Requirements must be decomposed into epics and bite-sized stories (200k context limit).

**Next Step:** Run `workflow epics-stories` to create the implementation breakdown.

---

## References

**Source Documents:**
- **Product Brief:** docs/product-brief-PetLog MVP-2025-11-03.md
- **Complete Development Specification:** docs/PetLog MVP - Complete Development Specification.pdf

**Technical Documentation:**
- React 18 Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
- Supabase Documentation: https://supabase.com/docs
- Tailwind CSS Documentation: https://tailwindcss.com/docs
- shadcn/ui Components: https://ui.shadcn.com
- Stripe Documentation: https://stripe.com/docs

**Market & Domain Research:**
- No formal market research document (opportunity identified from product brief)
- EU pet ownership statistics referenced from product brief context
- Competitive landscape analysis embedded in executive summary

---

## Next Steps

**Immediate Next Step:** Epic & Story Breakdown

This PRD must now be decomposed into implementable epics and stories optimized for 200k context development agents.

**To Continue Development:**

1. **Epic & Story Breakdown** (Required Next)
   - Run: `workflow epics-stories` or use the PM agent's *create-epics-and-stories* command
   - Output: Individual epic files with bite-sized stories in docs/epics/ folder
   - Each story will include: description, acceptance criteria, technical notes, dependencies

2. **Architecture Design** (Recommended Before Implementation)
   - Run: `workflow create-architecture` or use the Architect agent
   - Output: Technical architecture document defining system design, data models, integrations
   - Architecture decisions inform story implementation details

3. **UX Design** (Optional, If Detailed Mockups Needed)
   - Run: `workflow ux-design` or use the UX Designer agent
   - Output: Detailed wireframes, component library, interaction specifications
   - UX principles in this PRD may be sufficient for MVP

4. **Sprint Planning** (After Epics Created)
   - Run: `workflow sprint-planning` to generate sprint status tracking
   - Output: Sprint status YAML file tracking epic/story progress through Phase 4 implementation

---

_This PRD captures the essence of **PetLog MVP** - a radically simple, beautifully complete solution that combines health tracking and financial management to give pet owners peace of mind. The magic is in the intersection: knowing your pet's vaccine status while seeing your monthly budget, all in one tap._

_Created through collaborative discovery between Endre and AI Product Manager John on November 3, 2025._
