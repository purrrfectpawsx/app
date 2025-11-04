# Product Brief: PetLog MVP

**Date:** 2025-11-03
**Author:** Endre
**Context:** EU Market - Freemium SaaS Startup
**Tagline:** "Never miss a vet appointment, track every dollar, keep your pet healthy"

---

## Executive Summary

PetLog is a simple, mobile-first web application designed to bring pet health and expense management into the digital age for EU pet owners. While the EU still requires paper-based pet passports, PetLog offers a complementary digital solution that not only tracks health records but also adds financial tracking, smart reminders, and document management - features that paper passports simply cannot provide.

**The Opportunity:** 67% of US households own pets ($140B+ industry), and the EU market presents a similar opportunity where digital transformation of pet care is lagging. Existing solutions are either too expensive ($15-30/month), too complex, or don't address the full spectrum of pet ownership needs (health + financial tracking together).

**The Solution:** PetLog combines health tracking, expense management with budget alerts, document storage, and smart notifications in an affordable ($7/month premium, free tier available) mobile-first web app that works alongside required EU pet passports.

**Business Model:** Freemium SaaS with extremely low infrastructure costs ($0-30/month initially, scaling to <$200/month at 1,000+ users) enabling aggressive pricing and high margins.

---

## Core Vision

### Problem Statement

Pet owners in the EU face three critical, interconnected challenges that current solutions fail to address holistically:

**1. Health Management Crisis**
- Missed vaccines lead to $150+ emergency vet visits
- No centralized system to track health records, medications, and appointments
- Critical information scattered across paper documents, emails, and phones
- When switching vets or facing emergencies, owners can't quickly access vital health history

**2. Financial Blindness**
- Pet owners spend $1,500-3,000+/year per pet but have zero visibility into costs
- Vet emergencies create financial stress because pricing is opaque
- No way to budget or track spending by category (vet, food, grooming, supplies, boarding)
- Tax deductions and insurance claims require expense documentation that doesn't exist

**3. Organization Chaos**
- EU pet passports are paper-based and easily lost or damaged
- Medical records scattered across multiple vets, email attachments, and photo libraries
- No reminders for recurring needs (vaccine boosters, medication refills, grooming appointments)
- Difficult to share complete pet history with pet sitters, boarders, or new veterinarians

### Problem Impact

**For Individual Pet Owners:**
- Average $150 in preventable emergency costs per year from missed preventive care
- 2-3 hours per month managing scattered documents and records
- Stress and anxiety during vet emergencies when critical information isn't accessible
- Missed tax deductions due to poor expense tracking

**For the EU Market:**
- 85+ million EU households own pets (comparable to US market size)
- $140B+ annual pet industry spending globally
- Growing trend toward digital health management across all sectors
- Regulatory gap: EU still mandates paper passports while everything else goes digital

### Why Existing Solutions Fall Short

**Too Expensive:**
- Competitors charge $15-30/month
- Not sustainable for average pet owners managing $1,500-3,000/year in pet expenses
- Creates barrier to adoption for mass market

**Too Complex:**
- Solutions target veterinary professionals, not pet owners
- Feature bloat makes core tasks difficult
- Steep learning curve deters casual users

**Incomplete Coverage:**
- Most apps focus ONLY on health OR finances, not both
- No solution combines health tracking + expense management + budgeting
- Lack of integration with EU pet passport requirements
- Poor mobile experience despite 70% of users accessing on phones

### Proposed Solution

PetLog is a **simple, mobile-first web application** that brings pet health and expense management into the digital age, designed specifically for EU pet owners.

**Core Value Proposition:**
"Never miss a vet appointment, track every dollar, keep your pet healthy"

**What PetLog Does:**

1. **Health Tracking**
   - Digital health timeline with multiple record types (vaccines, medications, vet visits, symptoms, weight checks)
   - Color-coded timeline showing overdue items in red
   - Upload and store supporting documents (vet records, vaccine cards, x-rays, lab results)
   - Weight tracking chart showing trends over time with breed/species-based ideal ranges

2. **Expense Management**
   - Track all pet expenses across 6 categories (vet, food, grooming, supplies, boarding/pet sitting, other)
   - Monthly spending dashboard with visual breakdown (pie charts, summary cards)
   - Budget setting with intelligent alerts (80% warning threshold, 100% critical)
   - Export to CSV for tax deductions and reimbursements

3. **Smart Reminders & Notifications**
   - One-time and recurring reminders for vaccines, medications, vet checkups, grooming, custom events
   - Push notifications (via OneSignal) and email notifications (via Resend) at 9 AM on reminder date
   - Automatic next reminder creation for recurring items (e.g., annual vaccine → next reminder in 1 year)
   - Grouped view: Overdue, Today, This Week, Later

4. **Document Library**
   - Store and categorize all pet documents (vet records, vaccine cards, receipts, lab results, x-rays, insurance claims)
   - 100MB free storage, Premium: 5GB
   - Preview images, download PDFs
   - Export complete pet profile to PDF for sharing with vets, sitters, or boarders

5. **Export & Reporting**
   - Export pet health profile to branded PDF (clean, professional formatting)
   - Export expense report to CSV with date range selection
   - Email PDF to veterinarians directly from the app

**Technical Approach:**
- Mobile-first responsive web app (works on any device, no app store required)
- Built on modern, cost-effective stack: React 18 + Vite, Tailwind CSS, shadcn/ui, Supabase (BaaS)
- Leverages free tiers of services to keep costs near-zero initially
- Scales to millions of users while maintaining low infrastructure costs

### Key Differentiators

**1. Simpler Than Competitors (No Bloat)**
- Every page has one clear purpose
- Clean, intuitive UI using accessible shadcn/ui components
- No feature bloat - just the essentials done exceptionally well
- Lightning-fast development builds with Vite

**2. Unique Combination: Health + Financial Tracking**
- Only solution that combines both in one place
- Recognizes that health decisions and financial decisions are interconnected
- Budget alerts help owners avoid financial stress while maintaining pet health

**3. Extremely Affordable**
- $7/month vs $15-30/month competitors
- Generous free tier (1 pet, 50 health records, 100 expenses/month, 100MB storage)
- Infrastructure costs enable sustainable pricing: $0-30/month initially, <$200/month at 1,000+ users

**4. Works on Any Device (Web App, No App Store)**
- No iOS/Android app needed - just visit the URL
- Responsive design works perfectly on mobile (640px), tablet (640-1024px), desktop (>1024px)
- No app store approval delays or restrictions
- Faster iteration and deployment via Vercel

---

## Target Users

### Primary Users

**EU Pet Owners (Dog & Cat Owners) Managing Health and Expenses**

**Profile:**
- Own 1-3 pets (dogs or cats)
- Age: 25-55 years old
- Tech comfort: Intermediate (comfortable with web apps, mobile banking, online shopping)
- Income: Middle class ($30K-$80K/year household)
- Location: European Union (starting with English-speaking markets, expandable to localized versions)

**Current Behavior:**
- Keep paper EU pet passport in a drawer, often can't find it when needed
- Store vet records as email attachments, photos on phone, or paper files
- Use spreadsheets or paper receipts to track expenses (if they track at all)
- Set phone calendar reminders for vet appointments, often forget medication schedules
- Spend 2-3 hours/month searching for documents or reconstructing expense history

**Specific Pain Points:**
- Panic when vet asks "When was the last rabies vaccine?" and they don't know
- Financial stress from unexpected vet bills with no budget visibility
- Can't quickly generate expense reports for insurance claims or tax deductions
- Difficulty sharing complete pet history when boarding, switching vets, or traveling

**What They Value Most:**
- **Simplicity:** Must be as easy as mobile banking - no learning curve
- **Peace of mind:** Never miss important health milestones
- **Financial control:** Know where money is going, avoid bill shock
- **Accessibility:** Access records anywhere, especially during emergencies

**Success Looks Like:**
- Can answer any vet question instantly by pulling up health timeline on phone
- Monthly budget notification keeps spending in check
- Smooth vet visits because all records are digital and shareable
- Tax time: Export expenses to CSV in 30 seconds

---

## MVP Scope

### Core Features (Must-Have for Launch)

**Week 1-2: Foundation & Authentication**
1. Email/password signup and login
2. Google OAuth integration
3. Password reset flow
4. Email verification
5. Protected routes (redirect to login if not authenticated)

**Days 3-4: Pet Management**
6. Add new pet (name, species, breed, birth date, weight, gender, spayed/neutered, microchip, photo, notes)
7. View all pets (card grid layout)
8. Edit pet information
9. Delete pet (with confirmation)
10. Pet detail page
11. Free tier limit: Maximum 1 pet (show upgrade prompt when attempting to add 2nd pet)

**Days 5-7: Health Tracking**
12. Add health records (multiple types: vaccine, medication, vet visit, symptom, weight check)
13. View health timeline (chronological, color-coded by type, overdue vaccines in red)
14. Edit/delete records
15. Filter by record type
16. Upload supporting documents (vet records, vaccine cards, etc.)
17. Weight tracking chart (line chart showing weight over time with ideal range)

**Days 8-9: Expense Tracking**
18. Add expenses (pet, category, amount, date, merchant, notes, receipt upload)
19. View all expenses (list + charts: pie chart for category breakdown)
20. Edit/delete expenses
21. Monthly spending summary cards (total this month, total this year, most expensive category, average monthly)
22. Budget feature (set monthly budget, progress bar, color-coded alerts at 80% and 100%)
23. Export to CSV (date range selector, filename: petlog-expenses-{date}.csv)

**Days 10-11: Reminders & Notifications**
24. Create reminders (one-time or recurring: daily, weekly, monthly, yearly)
25. View upcoming reminders (grouped: Overdue, Today, This Week, Later)
26. Mark complete / Snooze (1 day, 3 days, 1 week)
27. Push notifications via OneSignal (sent at 9 AM on reminder date)
28. Email notifications via Resend (same time as push)
29. For recurring reminders: Auto-create next occurrence when marked complete

**Days 12-13: Documents & Export**
30. Upload multiple files per pet (PDF, JPG, PNG, HEIC; max 10MB per file)
31. Categorize documents (vet record, vaccine card, receipt, lab results, x-ray/imaging, insurance claim, other)
32. View/download files
33. Delete files (with confirmation)
34. Free tier: 100MB total storage (Premium: 5GB)
35. Show storage usage bar
36. Export pet profile to PDF (pet photo, basic info, health history, current medications, allergies, emergency contact, recent expenses)
37. Email pet profile to vet (input vet email, send PDF via Resend API)

**Day 14: Testing, Polish & Launch**
38. Manual testing of all user flows
39. Test free tier limits (1 pet max, 50 health records, 100 expenses/month, 100MB storage)
40. Test premium features (upgrade/downgrade flow)
41. Set up Stripe (Premium Monthly $7/month, Premium Annual $60/year)
42. Build simple landing page
43. Set up error tracking (Sentry)
44. Set up uptime monitoring (UptimeRobot)
45. Privacy policy page
46. Terms of service page
47. Final deploy to production
48. Test production environment
49. Prepare launch posts (Reddit, Twitter, Facebook)

### Free Tier vs Premium

**Free Tier:**
- 1 pet only
- 50 health records max
- 100 expenses per month
- 10 reminders max
- 100MB document storage
- Basic export (text only)
- Ads in sidebar

**Premium ($7/month or $60/year):**
- Unlimited pets
- Unlimited health records
- Unlimited expenses
- Unlimited reminders
- 5GB document storage
- Premium PDF exports (branded, formatted)
- Budget analytics dashboard
- Priority email support
- No ads
- Early access to new features (AI food tracking, etc.)

### Out of Scope for MVP

**Deferred to Post-Launch (Phase 2+):**
- Mobile native apps (iOS/Android)
- Multi-user accounts (family sharing)
- Vet portal integration
- Automatic receipt scanning / OCR
- AI-powered food tracking
- Social features (pet profiles, sharing)
- Breeder/shelter management features
- Prescription refill reminders with pharmacy integration
- Integration with pet insurance providers
- Telemedicine vet consultations
- Community forums

### MVP Success Criteria

**Launch within 14 days:**
- All 49 core features implemented and tested
- Free tier and Premium tier functional
- Stripe integration working (test mode initially)
- Deployed to Vercel production
- Error tracking and uptime monitoring active

**First 30 Days Post-Launch:**
- 100+ signups
- 20%+ conversion to Premium ($7/month)
- <5% error rate (via Sentry)
- >99% uptime (via UptimeRobot)
- Positive user feedback on simplicity and value

**First 90 Days:**
- 500-1,000 users
- $25-50/month MRR (Monthly Recurring Revenue)
- Infrastructure costs remain <$50/month
- Identify top 3 feature requests for Phase 2

---

## Market Context

**Global Pet Industry:**
- $140B+ annual spending globally
- 67% of US households own pets (85+ million households)
- EU market comparable in size and spending patterns
- Pet owners spend $1,500-3,000+/year per pet on average

**Digital Transformation Gap in EU:**
- EU still mandates paper-based pet passports for travel and health tracking
- Veterinary records remain largely paper-based or siloed in vet clinic systems
- No digital standard for pet health records across EU countries
- Growing consumer expectation for digital health management (accelerated by COVID-19)

**Competitive Landscape:**
- **High-priced competitors:** $15-30/month (examples: PetDesk, VitusVet, PetPro Connect)
- **Complex solutions:** Target vet clinics, not individual owners
- **Single-focus apps:** Health-only (no expense tracking) or expense-only (no health tracking)
- **Poor mobile experience:** Desktop-first designs, clunky on phones

**Market Timing:**
- Post-pandemic pet ownership surge (2020-2023) creating large addressable market
- Increasing consumer comfort with SaaS subscriptions
- Mobile-first generation (25-40 year olds) becoming primary pet owner demographic
- Growing focus on pet wellness and preventive care

---

## Technical Preferences

**Frontend:**
- **Framework:** React 18 with Vite (lightning-fast development builds)
- **Styling:** Tailwind CSS (rapid UI development without design skills)
- **UI Components:** shadcn/ui (pre-built, accessible components)
- **State Management:** React Context API
- **Routing:** React Router v6
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts (weight tracking, expense breakdown)
- **PDF Generation:** jsPDF or react-pdf
- **Hosting:** Vercel (free tier, unlimited bandwidth, automatic HTTPS, global CDN)

**Backend:**
- **Backend-as-a-Service:** Supabase
  - PostgreSQL database (500MB free tier)
  - Built-in authentication (email/password + OAuth)
  - Row Level Security (RLS) for data protection
  - File storage (1GB free)
  - Real-time subscriptions
  - Edge Functions (serverless)

**Why Supabase:**
- Replaces need for Express/Node.js backend (saves 20+ hours of development time)
- Built-in auth saves 20+ hours
- Generous free tier supports 500-1,000 users
- Scales to millions of users on $25/month Pro plan

**Payments:**
- **Provider:** Stripe
- **Integration:** Stripe Checkout (hosted, PCI-compliant)
- **Webhooks:** Supabase Edge Functions
- **Cost:** 2.9% + $0.30 per transaction (only when users pay)

**Notifications:**
- **Push Notifications:** OneSignal (free up to 10,000 subscribers)
- **Email:** Resend (3,000 emails/month free)
- **Cost:** $0/month initially

**Monitoring & Analytics:**
- **Analytics:** Plausible Analytics (self-hosted) or PostHog free tier
- **Error Tracking:** Sentry (5,000 events/month free)
- **Uptime Monitoring:** UptimeRobot (50 monitors free)
- **Cost:** $0/month

**Infrastructure Costs Summary:**

| Service | Free Tier | Paid Tier | When to Upgrade |
|---------|-----------|-----------|-----------------|
| Vercel | Unlimited | N/A | Never for MVP |
| Supabase | 500MB DB, 2GB bandwidth | $25/month | ~500-1000 users |
| Stripe | N/A | 2.9% + $0.30 per transaction | Per transaction |
| OneSignal | 10k subscribers | $99/month | >10k users |
| Resend | 3k emails/month | $20/month | >3k emails |
| Domain | N/A | $12/year | Day 1 |
| **Total** | **$1/month** | **$25-50/month** | **After 500+ users** |

---

## Financial Considerations

**Development Investment:**
- **Timeline:** 14 days (solo developer)
- **Cost:** Time investment only (no external costs beyond $12 domain)

**Revenue Model:**
- **Free Tier:** 1 pet, 50 health records, 100 expenses/month, 10 reminders, 100MB storage
- **Premium Monthly:** $7/month
- **Premium Annual:** $60/year ($5/month, 17% discount)

**Unit Economics (at scale):**
- **Average Revenue Per User (ARPU):** $1.40/month (assuming 20% conversion to Premium)
- **Infrastructure Cost Per User:** $0.025/month (at 1,000 users)
- **Gross Margin:** ~98% (excluding payment processing fees)

**Break-Even Analysis:**
- **Fixed Costs:** $25/month (Supabase Pro after scaling)
- **Break-Even Users:** 18 Premium users ($7 × 18 = $126/month revenue)
- **Realistic Break-Even:** 100 total users × 20% conversion = 20 Premium = $140/month revenue

**Growth Projections:**

**Conservative (Year 1):**
- Month 3: 500 users, 100 Premium → $700 MRR
- Month 6: 1,000 users, 200 Premium → $1,400 MRR
- Month 12: 2,500 users, 500 Premium → $3,500 MRR
- **Year 1 Revenue:** ~$25,000

**Moderate (Year 1):**
- Month 3: 1,000 users, 200 Premium → $1,400 MRR
- Month 6: 3,000 users, 600 Premium → $4,200 MRR
- Month 12: 10,000 users, 2,000 Premium → $14,000 MRR
- **Year 1 Revenue:** ~$75,000

**Pricing Strategy Advantages:**
- 50%+ cheaper than competitors ($7 vs $15-30/month)
- Generous free tier drives viral growth
- Low infrastructure costs enable sustainable low pricing
- Premium tier unlocks value (unlimited pets, unlimited records, no ads)

---

## Timeline

**Development: 14 Days (Nov 2024)**

- **Days 1-2:** Foundation & Auth (Vite + React project, Tailwind CSS, Supabase project, Auth pages, Protected routes, Vercel deployment)
- **Days 3-4:** Pet Management (Pets table, Add Pet form, Pet Dashboard, Pet Detail page, Edit/Delete pet, Free tier check)
- **Days 5-7:** Health Tracking (Health records table, Add Record form, Health Timeline component, Weight chart, File upload, Document storage)
- **Days 8-9:** Expense Tracking (Expenses table, Budget settings table, Add Expense form, Expense Dashboard, Charts, Budget alerts, CSV export)
- **Days 10-11:** Reminders & Notifications (Reminders table, Create Reminder form, Reminders List, OneSignal setup, Resend setup, Supabase Edge Function, Recurring logic)
- **Days 12-13:** Documents & Export (Documents table, Upload form, Document Library, PDF export, Email to vet)
- **Day 14:** Testing, Polish & Launch (Manual testing, Stripe setup, Pricing page, Landing page, Error tracking, Uptime monitoring, Privacy/Terms, Production deploy, Launch prep)

**Post-Launch Milestones:**
- **Week 1:** Beta user testing, bug fixes
- **Month 1:** 100+ users, iterate based on feedback
- **Month 3:** 500-1,000 users, evaluate Phase 2 features
- **Month 6:** Consider mobile apps (if demand exists)

---

## Risks and Assumptions

**Key Assumptions:**

1. **Market Demand:** EU pet owners want digital health/expense tracking and will pay $7/month
   - **Validation:** US market validates this (67% pet ownership, $140B industry)
   - **Risk Mitigation:** Generous free tier to drive adoption and validate demand before premium push

2. **Technical Stack:** Supabase + Vercel can support 1,000+ users on free/low-cost tiers
   - **Validation:** Multiple case studies of startups scaling to 10K+ users on Supabase
   - **Risk Mitigation:** Architecture designed for easy migration to self-hosted if needed

3. **Competitive Positioning:** Price ($7) + simplicity + combined health/financial tracking = sustainable competitive advantage
   - **Validation:** Competitors charge $15-30/month and focus on single use case
   - **Risk Mitigation:** MVP validates core value proposition quickly (14 days)

4. **User Acquisition:** Organic growth via Reddit, Twitter, Facebook pet owner communities
   - **Risk:** May need paid acquisition if organic growth is slow
   - **Mitigation:** Launch in multiple communities simultaneously, track conversion by channel

**Key Risks:**

1. **Low Conversion Rate (Free → Premium):**
   - **Risk:** <10% conversion makes business unsustainable
   - **Mitigation:** Test different premium features, pricing, and messaging; generous free tier limits designed to drive upgrades (1 pet max, 50 records max)

2. **Infrastructure Costs Scale Faster Than Revenue:**
   - **Risk:** Supabase/OneSignal costs exceed revenue at scale
   - **Mitigation:** Monitor costs closely, migrate to self-hosted solutions if needed

3. **Regulatory Compliance (GDPR, Pet Data):**
   - **Risk:** EU GDPR requirements for user data handling
   - **Mitigation:** Supabase is GDPR-compliant, implement clear privacy policy, allow data export/deletion

4. **Market Education Required:**
   - **Risk:** Pet owners don't see value in digital tracking vs paper
   - **Mitigation:** Free tier lowers barrier to trial, focus messaging on concrete pain points (missed vaccines = $150 emergency)

5. **Competition from Established Players:**
   - **Risk:** Large competitors lower prices or copy features
   - **Mitigation:** Speed to market (14 days), build loyal user base quickly, focus on EU market niche

---

## Supporting Materials

**Reference Documents:**
- Complete Development Specification (21 pages): `docs/PetLog MVP - Complete Development Specification.pdf`
  - Full technical architecture
  - Database schema with 7 core tables and RLS policies
  - 49 detailed user stories across 7 feature areas
  - Day-by-day development workflow
  - Stripe integration details
  - Infrastructure cost breakdown

**Next Steps:**
- **Workflow:** This Product Brief feeds into the PRD workflow
- **PRD Output:** Will break down 7 feature areas into tactical epics and stories for the development agent
- **Architecture Phase:** Will define system architecture, technology choices, and integration patterns
- **Implementation Phase:** 14-day sprint to build MVP

---

_This Product Brief captures the vision and requirements for PetLog MVP, a freemium SaaS startup targeting the EU pet owner market._

_It was created based on comprehensive technical specifications and market research, reflecting a digital transformation opportunity in the pet health management space._

_**Next:** PRD workflow will transform this brief into detailed product requirements and epic breakdown for implementation._
