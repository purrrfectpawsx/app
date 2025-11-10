# Story 2.6: Free Tier Enforcement - 1 Pet Limit

Status: drafted

## Story

As a product owner,
I want free tier users limited to 1 pet,
So that premium subscriptions provide clear value.

## Acceptance Criteria

1. Free tier users attempting to create a 2nd pet see upgrade prompt dialog
2. Dialog explains: "Free plan allows 1 pet. Upgrade to Premium for unlimited pets."
3. Dialog shows upgrade CTA button (links to pricing/checkout - placeholder for now)
4. Premium users can create unlimited pets (no limit check)
5. Upgrade prompt also appears on pets grid if user has 1 pet (banner message)
6. Backend enforces limit (frontend check can be bypassed, backend is source of truth)
7. Usage indicator visible on pets grid: "1/1 pets used (Free plan)"

## Tasks / Subtasks

- [ ] Task 1: Add subscription_tier to profiles table (AC: #4, #6)
  - [ ] Check if profiles table exists from Epic 1 (Story 1.1)
  - [ ] Add subscription_tier column to profiles table
  - [ ] Column type: ENUM or TEXT with CHECK constraint ('free', 'premium')
  - [ ] Default value: 'free' for new users
  - [ ] Migration SQL: ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium'))
  - [ ] Set existing users to 'free' tier (migration data update)
  - [ ] Test: Verify column exists and defaults to 'free'
  - [ ] Test: Verify constraint prevents invalid values

- [ ] Task 2: Create backend pet count check function (AC: #6)
  - [ ] Create Supabase Edge Function or database function for pet limit check
  - [ ] Option 1: PostgreSQL function called via RLS or trigger
  - [ ] Option 2: Supabase Edge Function called before pet creation
  - [ ] Recommendation: Option 1 (PostgreSQL function) for performance and reliability
  - [ ] Function logic: SELECT COUNT(*) FROM pets WHERE user_id = auth.uid()
  - [ ] Check if count >= 1 AND subscription_tier = 'free' → Reject creation
  - [ ] Return 403 Forbidden with error message: "Free plan limit reached. Upgrade to Premium for unlimited pets."
  - [ ] Test: Verify function returns count correctly
  - [ ] Test: Verify rejection when limit exceeded

- [ ] Task 3: Implement RLS policy or trigger for pet creation limit (AC: #6)
  - [ ] Add RLS policy on pets table INSERT operation
  - [ ] Policy checks: User is authenticated AND (subscription_tier = 'premium' OR pet_count < 1)
  - [ ] Alternative: Add trigger BEFORE INSERT to enforce limit
  - [ ] Recommendation: RLS policy for simplicity and consistency
  - [ ] Test: Verify free tier user can create 1st pet
  - [ ] Test: Verify free tier user cannot create 2nd pet (403 error)
  - [ ] Test: Verify premium user can create unlimited pets

- [ ] Task 4: Create UpgradePromptDialog component (AC: #1, #2, #3)
  - [ ] Create src/components/subscription/UpgradePromptDialog.tsx component
  - [ ] Use shadcn/ui Dialog component
  - [ ] Display upgrade message: "Free plan allows 1 pet. Upgrade to Premium for unlimited pets."
  - [ ] Show benefits: "Premium: Unlimited pets, unlimited health records, unlimited expenses, no limits!"
  - [ ] Add "Upgrade to Premium" CTA button
  - [ ] Add "Cancel" or "Maybe Later" button
  - [ ] For MVP: Link to /pricing placeholder page (Stripe integration in Epic 7)
  - [ ] Test: Verify dialog displays upgrade message
  - [ ] Test: Verify CTA button links to /pricing
  - [ ] Test: Verify cancel button closes dialog

- [ ] Task 5: Integrate upgrade prompt in CreatePetForm (AC: #1)
  - [ ] Modify CreatePetForm to check pet count before showing form
  - [ ] Fetch current pet count: SELECT COUNT(*) FROM pets WHERE user_id = auth.uid()
  - [ ] Fetch user subscription tier: SELECT subscription_tier FROM profiles WHERE id = auth.uid()
  - [ ] If subscription_tier = 'free' AND pet_count >= 1 → Show UpgradePromptDialog
  - [ ] If premium or pet_count < 1 → Show create form normally
  - [ ] Test: Verify free tier user with 1 pet sees upgrade prompt
  - [ ] Test: Verify free tier user with 0 pets can create pet
  - [ ] Test: Verify premium user always sees create form

- [ ] Task 6: Add usage indicator to PetsGrid header (AC: #7)
  - [ ] Create usage indicator component or text
  - [ ] Display: "X/Y pets used (Free plan)" or "Unlimited pets (Premium)"
  - [ ] Calculate X = current pet count
  - [ ] For free tier: Y = 1
  - [ ] For premium: Show "Unlimited" instead of count
  - [ ] Position in PetsGrid header near "Add Pet" button
  - [ ] Only show for free tier users (hide for premium)
  - [ ] Test: Verify free tier shows "0/1 pets used"
  - [ ] Test: Verify free tier shows "1/1 pets used" after creating pet
  - [ ] Test: Verify premium tier shows "Unlimited" or no indicator

- [ ] Task 7: Add tier limit banner on PetsGrid (AC: #5)
  - [ ] Create TierLimitBanner component
  - [ ] Display banner if subscription_tier = 'free' AND pet_count >= 1
  - [ ] Banner message: "You've reached the free plan limit (1 pet). Upgrade to Premium for unlimited pets."
  - [ ] Include "Upgrade" CTA button in banner
  - [ ] Style with subtle background color (blue or purple)
  - [ ] Position at top of pets grid (above pet cards)
  - [ ] Dismissible (optional for MVP - use localStorage to remember dismiss)
  - [ ] Test: Verify banner shows when free tier has 1 pet
  - [ ] Test: Verify banner hides for premium tier
  - [ ] Test: Verify banner hides if user has 0 pets

- [ ] Task 8: Handle backend error response (AC: #1, #6)
  - [ ] When pet creation fails with 403 error, show UpgradePromptDialog
  - [ ] Parse error message from Supabase response
  - [ ] Expected error: "Free plan limit reached. Upgrade to Premium for unlimited pets."
  - [ ] Display error in dialog instead of generic error toast
  - [ ] Ensure backend error is primary enforcement (frontend is UX optimization)
  - [ ] Test: Verify backend rejection triggers upgrade prompt
  - [ ] Test: Verify error message displays correctly

- [ ] Task 9: Create placeholder /pricing page (AC: #3)
  - [ ] Create src/pages/PricingPage.tsx (placeholder for Epic 7)
  - [ ] Add route /pricing in App.tsx
  - [ ] Display simple pricing comparison: Free vs Premium
  - [ ] Free: 1 pet, 50 health records, 100 expenses/month, 10 reminders, 100MB storage
  - [ ] Premium: Unlimited pets, unlimited records, unlimited expenses, unlimited reminders, 5GB storage
  - [ ] Price: $7/month or $60/year
  - [ ] "Coming soon" message for checkout (Stripe integration in Epic 7)
  - [ ] Test: Verify /pricing page loads
  - [ ] Test: Verify pricing tiers display correctly

- [ ] Task 10: Testing and edge cases (All ACs)
  - [ ] Test: Free tier user with 0 pets clicks "Add Pet" → Form shows
  - [ ] Test: Free tier user with 1 pet clicks "Add Pet" → Upgrade prompt shows
  - [ ] Test: Free tier user bypasses frontend and calls API directly → Backend rejects
  - [ ] Test: Premium user with 0 pets clicks "Add Pet" → Form shows
  - [ ] Test: Premium user with 10 pets clicks "Add Pet" → Form shows (unlimited)
  - [ ] Test: Usage indicator shows "0/1 pets used" for new free tier user
  - [ ] Test: Usage indicator shows "1/1 pets used" after creating pet
  - [ ] Test: Banner shows on PetsGrid when free tier has 1 pet
  - [ ] Test: Banner includes upgrade CTA button
  - [ ] Test: Upgrade button links to /pricing page
  - [ ] Test: Pricing page displays free vs premium comparison
  - [ ] Test: RLS policy enforces limit at database level
  - [ ] Test: Responsive layout (mobile and desktop)

## Dev Notes

### Technical Stack
- React 19 + Vite
- TypeScript 5.9.3 with strict mode
- Supabase PostgreSQL for database + RLS policies
- React Router v6 for /pricing route
- shadcn/ui components (Dialog, Alert/Banner)
- Tailwind CSS for styling

### Implementation Approach
1. Add subscription_tier column to profiles table (migration)
2. Create PostgreSQL function to check pet count
3. Add RLS policy on pets table INSERT to enforce limit
4. Create UpgradePromptDialog component
5. Integrate upgrade prompt in CreatePetForm (frontend check)
6. Add usage indicator to PetsGrid header
7. Add tier limit banner to PetsGrid
8. Create placeholder /pricing page
9. Test complete flow: free tier limit enforcement + premium unlimited

### Prerequisites
- Story 1.1 completed (profiles table exists)
- Story 2.1 completed (CreatePetForm exists, pets table created)
- Epic 1 completed (authentication flow provides user context)

### Database Schema Changes

**Migration: Add subscription_tier to profiles table**

```sql
-- Add subscription_tier column
ALTER TABLE profiles
ADD COLUMN subscription_tier TEXT DEFAULT 'free'
CHECK (subscription_tier IN ('free', 'premium'));

-- Set existing users to free tier
UPDATE profiles SET subscription_tier = 'free' WHERE subscription_tier IS NULL;

-- Create index for performance
CREATE INDEX idx_profiles_subscription_tier ON profiles(subscription_tier);
```

### RLS Policy for Pet Limit Enforcement

**Option 1: RLS Policy (Recommended)**

```sql
-- Drop existing INSERT policy if needed
DROP POLICY IF EXISTS "Users can insert their own pets" ON pets;

-- Create new policy with tier limit check
CREATE POLICY "Users can insert pets based on tier limit"
ON pets
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND (
    -- Premium users: no limit
    (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) = 'premium'
    OR
    -- Free users: max 1 pet
    (
      (SELECT subscription_tier FROM profiles WHERE id = auth.uid()) = 'free'
      AND (SELECT COUNT(*) FROM pets WHERE user_id = auth.uid()) < 1
    )
  )
);
```

**Option 2: Trigger (Alternative)**

```sql
-- Create function to check pet limit
CREATE OR REPLACE FUNCTION check_pet_limit()
RETURNS TRIGGER AS $$
DECLARE
  user_tier TEXT;
  pet_count INTEGER;
BEGIN
  -- Get user's subscription tier
  SELECT subscription_tier INTO user_tier
  FROM profiles
  WHERE id = NEW.user_id;

  -- If premium, allow unlimited
  IF user_tier = 'premium' THEN
    RETURN NEW;
  END IF;

  -- If free, check pet count
  SELECT COUNT(*) INTO pet_count
  FROM pets
  WHERE user_id = NEW.user_id;

  IF pet_count >= 1 THEN
    RAISE EXCEPTION 'Free plan limit reached. Upgrade to Premium for unlimited pets.'
      USING ERRCODE = '42501'; -- 403 Forbidden
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER enforce_pet_limit
BEFORE INSERT ON pets
FOR EACH ROW
EXECUTE FUNCTION check_pet_limit();
```

**Recommendation:** Use Option 1 (RLS Policy) for consistency with other RLS policies and simpler maintenance.

### Pet Count Query

**Frontend query to check current pet count:**

```typescript
const { count, error } = await supabase
  .from('pets')
  .select('*', { count: 'exact', head: true })
  .eq('user_id', userId)

const petCount = count || 0
```

**Get user subscription tier:**

```typescript
const { data: profile, error } = await supabase
  .from('profiles')
  .select('subscription_tier')
  .eq('id', userId)
  .single()

const tier = profile?.subscription_tier || 'free'
```

### UpgradePromptDialog Component

```typescript
interface UpgradePromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const UpgradePromptDialog = ({
  open,
  onOpenChange,
}: UpgradePromptDialogProps) => {
  const navigate = useNavigate()

  const handleUpgrade = () => {
    navigate('/pricing')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upgrade to Premium</DialogTitle>
          <DialogDescription>
            Free plan allows 1 pet. Upgrade to Premium for unlimited pets.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-muted">
            <h3 className="font-semibold mb-2">Premium Benefits:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Unlimited pets</li>
              <li>Unlimited health records</li>
              <li>Unlimited expenses</li>
              <li>Unlimited reminders</li>
              <li>5GB document storage</li>
              <li>Priority support</li>
            </ul>
          </div>

          <p className="text-sm text-muted-foreground">
            Only $7/month or $60/year
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Maybe Later
          </Button>
          <Button onClick={handleUpgrade}>
            Upgrade to Premium
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

### Usage Indicator Component

```typescript
interface PetUsageIndicatorProps {
  petCount: number
  subscriptionTier: 'free' | 'premium'
}

export const PetUsageIndicator = ({
  petCount,
  subscriptionTier,
}: PetUsageIndicatorProps) => {
  if (subscriptionTier === 'premium') {
    return (
      <span className="text-sm text-muted-foreground">
        Unlimited pets (Premium)
      </span>
    )
  }

  const isAtLimit = petCount >= 1
  const textColor = isAtLimit ? 'text-amber-600' : 'text-muted-foreground'

  return (
    <span className={`text-sm ${textColor}`}>
      {petCount}/1 pets used (Free plan)
    </span>
  )
}
```

### Tier Limit Banner Component

```typescript
interface TierLimitBannerProps {
  show: boolean
}

export const TierLimitBanner = ({ show }: TierLimitBannerProps) => {
  const navigate = useNavigate()

  if (!show) return null

  return (
    <Alert className="mb-4 border-blue-200 bg-blue-50">
      <Info className="h-4 w-4" />
      <AlertTitle>Free Plan Limit Reached</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>
          You've reached the free plan limit (1 pet). Upgrade to Premium for unlimited pets.
        </span>
        <Button
          size="sm"
          onClick={() => navigate('/pricing')}
        >
          Upgrade
        </Button>
      </AlertDescription>
    </Alert>
  )
}
```

### Integration with CreatePetForm

```typescript
// In CreatePetForm or parent component (e.g., PetsGrid)
const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
const [petCount, setPetCount] = useState(0)
const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free')

useEffect(() => {
  fetchPetCountAndTier()
}, [])

const fetchPetCountAndTier = async () => {
  // Get pet count
  const { count } = await supabase
    .from('pets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)

  setPetCount(count || 0)

  // Get subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', userId)
    .single()

  setSubscriptionTier(profile?.subscription_tier || 'free')
}

const handleAddPetClick = () => {
  if (subscriptionTier === 'free' && petCount >= 1) {
    setShowUpgradePrompt(true)
  } else {
    // Show create pet form
    setShowCreateForm(true)
  }
}

// In JSX
<UpgradePromptDialog
  open={showUpgradePrompt}
  onOpenChange={setShowUpgradePrompt}
/>
```

### Integration with PetsGrid

```tsx
const PetsGrid = () => {
  const [petCount, setPetCount] = useState(0)
  const [subscriptionTier, setSubscriptionTier] = useState<'free' | 'premium'>('free')

  // Fetch pet count and tier
  useEffect(() => {
    fetchPetCountAndTier()
  }, [])

  const showBanner = subscriptionTier === 'free' && petCount >= 1

  return (
    <div className="container">
      {/* Header with usage indicator */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">My Pets</h1>
        <div className="flex items-center gap-4">
          <PetUsageIndicator
            petCount={petCount}
            subscriptionTier={subscriptionTier}
          />
          <Button onClick={handleAddPetClick}>
            Add Pet
          </Button>
        </div>
      </div>

      {/* Tier limit banner */}
      <TierLimitBanner show={showBanner} />

      {/* Pet cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pets.map(pet => (
          <PetCard key={pet.id} pet={pet} />
        ))}
      </div>
    </div>
  )
}
```

### Pricing Page (Placeholder)

```tsx
// src/pages/PricingPage.tsx
export const PricingPage = () => {
  return (
    <div className="container max-w-5xl py-12">
      <h1 className="text-4xl font-bold text-center mb-4">
        Choose Your Plan
      </h1>
      <p className="text-center text-muted-foreground mb-12">
        Start free, upgrade anytime
      </p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Perfect for trying PetLog</CardDescription>
            <div className="text-3xl font-bold">$0/month</div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                1 pet
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                50 health records
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                100 expenses/month
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                10 reminders
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                100MB storage
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              Current Plan
            </Button>
          </CardFooter>
        </Card>

        {/* Premium Plan */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardDescription>For serious pet parents</CardDescription>
            <div className="text-3xl font-bold">$7/month</div>
            <p className="text-sm text-muted-foreground">or $60/year (save 17%)</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <strong>Unlimited pets</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <strong>Unlimited health records</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <strong>Unlimited expenses</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <strong>Unlimited reminders</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                <strong>5GB storage</strong>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-600" />
                Priority support
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              Upgrade (Coming Soon)
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground mt-8">
        Stripe payment integration coming in Epic 7
      </p>
    </div>
  )
}
```

### Component Structure

```
src/
├── components/
│   ├── pets/
│   │   └── (existing pet components)
│   ├── subscription/
│   │   ├── UpgradePromptDialog.tsx (NEW)
│   │   ├── TierLimitBanner.tsx (NEW)
│   │   └── PetUsageIndicator.tsx (NEW)
│   └── ui/ (shadcn/ui components)
├── pages/
│   ├── PetsGrid.tsx (MODIFIED - add banner and usage indicator)
│   ├── PricingPage.tsx (NEW)
│   └── (other pages)
└── App.tsx (MODIFIED - add /pricing route)
```

### Error Handling

**Backend RLS policy rejection:**

```typescript
try {
  const { data, error } = await supabase
    .from('pets')
    .insert(petData)

  if (error) {
    if (error.code === '42501') {
      // RLS policy denied (tier limit exceeded)
      setShowUpgradePrompt(true)
      return
    }
    throw error
  }
} catch (error) {
  console.error('Failed to create pet:', error)
  showToast({
    variant: 'destructive',
    title: 'Failed to create pet',
    description: 'Please try again',
  })
}
```

### Testing Approach

**Manual Testing Checklist:**
1. New free tier user (0 pets) clicks "Add Pet" → Form shows
2. Free tier user creates 1st pet successfully → Usage shows "1/1"
3. Free tier user clicks "Add Pet" again → Upgrade prompt shows
4. Upgrade prompt shows benefits and pricing
5. Click "Upgrade" in prompt → Navigates to /pricing
6. Pricing page displays free vs premium comparison
7. PetsGrid shows banner when free tier has 1 pet
8. Banner includes upgrade button
9. Usage indicator shows "0/1" for new users, "1/1" after creating pet
10. Premium user (simulated) can create multiple pets
11. Premium user sees "Unlimited pets" indicator
12. Backend RLS policy rejects 2nd pet for free tier (bypass frontend)
13. Test responsive layout (mobile and desktop)

**Edge Cases:**
- User manually changes subscription_tier in database → Backend enforces correctly
- User bypasses frontend check via API → Backend RLS rejects
- User deletes pet (back to 0) → Can create another pet
- Premium user downgrades to free with 3 pets → Existing pets remain, cannot create more
- Network error fetching tier → Defaults to 'free' (safe default)

**Database Testing:**
- RLS policy allows INSERT for free tier with 0 pets
- RLS policy denies INSERT for free tier with 1 pet
- RLS policy allows INSERT for premium tier with any pet count
- Constraint prevents invalid subscription_tier values

### Learnings from Previous Stories

**From Stories 2.1-2.5:**

- CreatePetForm already exists (Story 2.1) → Extend with tier limit check
- PetsGrid already exists (Story 2.2) → Add banner and usage indicator
- Consistent dialog patterns established (Stories 2.4, 2.5) → Follow same UX
- RLS policies established for pets table → Add tier limit to INSERT policy

**Design Consistency:**
- Use same dialog styling as EditPetForm and DeletePetDialog
- Use same button variants and colors
- Use same toast notification patterns
- Maintain consistent spacing and layout

### Future Enhancements (Post-MVP)

1. **Downgrade handling:**
   - When premium downgrades to free with >1 pet
   - Allow keeping existing pets but block creating more
   - Or prompt to select which pet to keep

2. **Grace period:**
   - Allow free tier to create 2nd pet with 7-day grace period
   - Prompt to upgrade during grace period

3. **Trial period:**
   - Give new users 14-day premium trial
   - Auto-downgrade to free after trial unless upgraded

4. **Usage analytics:**
   - Track how many free tier users hit limit
   - Track conversion rate from upgrade prompt

### References

- [Epic 2: Pet Profile Management - docs/epics.md#Epic-2]
- [Story 2.1: Create Pet Profile - docs/stories/2-1-create-pet-profile-with-basic-info.md]
- [Story 2.2: View All Pets Grid - docs/stories/2-2-view-all-pets-grid.md]
- [PRD: Freemium Business Model - docs/PRD.md#FR-8]
- [Architecture: Subscription Tiers - docs/architecture.md]
- [Supabase RLS Documentation](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [PostgreSQL CHECK Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
- [shadcn/ui Dialog Component](https://ui.shadcn.com/docs/components/dialog)
- [shadcn/ui Alert Component](https://ui.shadcn.com/docs/components/alert)

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-08:** Story drafted from Epic 2.6 requirements (Status: backlog → drafted)
