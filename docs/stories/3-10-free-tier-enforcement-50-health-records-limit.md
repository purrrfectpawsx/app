# Story 3.10: Free Tier Enforcement - 50 Health Records Limit

Status: ready-for-dev

## Story

As a product owner,
I want free tier users limited to 50 health records per pet,
So that premium provides clear value for power users.

## Acceptance Criteria

1. Free tier users blocked from creating 51st health record
2. Upgrade prompt dialog: "Free plan allows 50 health records. Upgrade to Premium for unlimited."
3. Usage indicator on Health tab: "45/50 health records used (Free plan)"
4. Premium users have no limit
5. Limit enforced in backend (frontend check can be bypassed)
6. Count includes all record types (vaccines + medications + vet visits + symptoms + weight checks)

## Tasks / Subtasks

- [ ] Task 1: Create health record count check function (AC: #5, #6)
  - [ ] Create backend function: checkHealthRecordLimit(petId, userId)
  - [ ] Query: SELECT COUNT(*) FROM health_records WHERE pet_id = $1 AND user_id = $2
  - [ ] Count all record types (not filtered by record_type)
  - [ ] Return current count
  - [ ] Test: Function returns accurate count
  - [ ] Test: Count includes all record types

- [ ] Task 2: Check user subscription tier (AC: #4, #5)
  - [ ] Query profiles table: SELECT subscription_tier FROM profiles WHERE id = auth.uid()
  - [ ] Create helper function: isUserPremium()
  - [ ] Return true if subscription_tier = 'premium', false if 'free'
  - [ ] Test: Function correctly identifies premium users
  - [ ] Test: Function correctly identifies free tier users

- [ ] Task 3: Implement limit check before creating health record (AC: #1, #5)
  - [ ] Update CreateHealthRecordForm submit handler
  - [ ] Before insert: call checkHealthRecordLimit and isUserPremium
  - [ ] If free tier AND count >= 50 → block creation, show upgrade dialog
  - [ ] If premium OR count < 50 → allow creation
  - [ ] Implement check in backend (Supabase Edge Function or RLS)
  - [ ] Test: Free tier user blocked at 51st record
  - [ ] Test: Premium user can create unlimited records
  - [ ] Test: Free tier user can create up to 50 records

- [ ] Task 4: Create UpgradePromptDialog component (AC: #2)
  - [ ] Create src/components/upgrade/UpgradePromptDialog.tsx (reusable)
  - [ ] Dialog title: "Upgrade to Premium"
  - [ ] Dialog message: "Free plan allows 50 health records per pet. Upgrade to Premium for unlimited health records and all premium features."
  - [ ] Show current usage: "You have 50/50 health records"
  - [ ] Add "Upgrade to Premium" button (links to /pricing)
  - [ ] Add "Maybe Later" button (closes dialog)
  - [ ] Test: Dialog displays when limit reached
  - [ ] Test: Upgrade button links to pricing page

- [ ] Task 5: Display usage indicator on Health tab (AC: #3)
  - [ ] Create UsageIndicator component
  - [ ] Calculate usage: current count / 50
  - [ ] Display for free tier users only
  - [ ] Format: "45/50 health records used (Free plan)"
  - [ ] Position: Top of Health tab, below "Add Health Record" button
  - [ ] Color coding:
    - Green: < 40 records (< 80%)
    - Yellow: 40-47 records (80-94%)
    - Red: 48-50 records (96-100%)
  - [ ] Hide for premium users or show "Unlimited (Premium plan)"
  - [ ] Test: Indicator shows correct usage count
  - [ ] Test: Color changes based on usage percentage
  - [ ] Test: Hidden for premium users

- [ ] Task 6: Implement backend enforcement (AC: #5)
  - [ ] Create Supabase Edge Function: enforce-health-record-limit
  - [ ] Function triggered before INSERT on health_records
  - [ ] Check user subscription tier from profiles table
  - [ ] If free tier: count existing records for this pet
  - [ ] If count >= 50: return 403 Forbidden error
  - [ ] If premium or count < 50: allow insert
  - [ ] Return error message: "Free plan limit reached. Upgrade to Premium for unlimited health records."
  - [ ] Test: Backend blocks 51st record for free tier
  - [ ] Test: Backend allows unlimited for premium
  - [ ] Test: Frontend cannot bypass limit (tested with direct API calls)

- [ ] Task 7: Handle limit error in frontend (AC: #1, #2)
  - [ ] Catch 403 Forbidden error from Supabase insert
  - [ ] Detect limit error from error message
  - [ ] Open UpgradePromptDialog automatically
  - [ ] Show error toast: "Health record limit reached"
  - [ ] Do not create record
  - [ ] Test: Limit error caught and handled gracefully
  - [ ] Test: Upgrade dialog opens automatically

- [ ] Task 8: Count all record types (AC: #6)
  - [ ] Verify count query includes all record_type values:
    - vaccine
    - medication
    - vet_visit
    - symptom
    - weight_check
  - [ ] No filtering by record_type in count query
  - [ ] Test: Creating vaccine increases count
  - [ ] Test: Creating medication increases count
  - [ ] Test: All record types count toward limit

- [ ] Task 9: Update usage indicator after creating/deleting records (AC: #3)
  - [ ] Refetch count after successful health record creation
  - [ ] Refetch count after health record deletion
  - [ ] Update usage indicator in real-time
  - [ ] Test: Usage indicator updates after creating record
  - [ ] Test: Usage indicator updates after deleting record

- [ ] Task 10: E2E testing (All ACs)
  - [ ] Test: Free tier user blocked from creating 51st health record
  - [ ] Test: Upgrade dialog displays with correct message
  - [ ] Test: Usage indicator shows on Health tab
  - [ ] Test: Premium user has no limit (can create 50+ records)
  - [ ] Test: Backend enforces limit (cannot bypass with API calls)
  - [ ] Test: Count includes all record types
  - [ ] Test: Usage indicator color-coded correctly
  - [ ] Test: Deleting record frees up slot (49/50 after delete from 50/50)
  - [ ] Test: Usage indicator hidden for premium users

## Dev Notes

### Technical Stack
- Supabase Edge Function for backend enforcement
- React state for usage tracking
- Reusable UpgradePromptDialog component
- Color-coded usage indicator
- Backend count validation

### Implementation Approach
1. Create health record count check function (backend)
2. Check user subscription tier (from profiles table)
3. Implement limit check before insert (frontend and backend)
4. Create UpgradePromptDialog component
5. Display usage indicator on Health tab
6. Implement backend enforcement via Edge Function or RLS
7. Handle limit errors gracefully in frontend
8. Ensure count includes all record types

### Backend Enforcement (Supabase Edge Function)

```typescript
// Edge Function: enforce-health-record-limit
import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { pet_id, user_id } = await req.json()

  // Check subscription tier
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier')
    .eq('id', user_id)
    .single()

  if (profile?.subscription_tier === 'premium') {
    return new Response(JSON.stringify({ allowed: true }), { status: 200 })
  }

  // Count existing records for this pet
  const { count } = await supabase
    .from('health_records')
    .select('*', { count: 'exact', head: true })
    .eq('pet_id', pet_id)
    .eq('user_id', user_id)

  if (count >= 50) {
    return new Response(
      JSON.stringify({
        error: 'Free plan limit reached',
        message: 'Free plan allows 50 health records per pet. Upgrade to Premium for unlimited.'
      }),
      { status: 403 }
    )
  }

  return new Response(JSON.stringify({ allowed: true }), { status: 200 })
})
```

### Usage Indicator Component

```typescript
const HealthRecordUsageIndicator = ({ petId }: { petId: string }) => {
  const { data: profile } = useProfile()
  const { data: count } = useHealthRecordCount(petId)

  if (profile?.subscription_tier === 'premium') {
    return <div className="text-sm text-gray-600">Unlimited (Premium plan)</div>
  }

  const usagePercent = (count / 50) * 100
  const color = usagePercent < 80 ? 'green' : usagePercent < 96 ? 'yellow' : 'red'

  return (
    <div className={`text-sm text-${color}-600`}>
      {count}/50 health records used (Free plan)
    </div>
  )
}
```

### Per-Pet Limit
The 50 record limit is **per pet**, not total across all pets. Each pet can have up to 50 health records.

### Prerequisites
- Story 3.2 completed (health record creation exists)
- Story 2.6 completed (free tier infrastructure established)
- Subscription tier tracking in profiles table

### References

- [Epic 3: Health Tracking & Timeline - docs/epics.md#Epic-3]
- [Story 2.6: Free Tier Enforcement - Pets - docs/stories/2-6-free-tier-enforcement-1-pet-limit.md]
- [Architecture: Subscription & Tier Management - docs/architecture.md]
- [PRD: Free Tier Limits - docs/PRD.md]

## Dev Agent Record

### Context Reference

- docs/stories/3-10-free-tier-enforcement-50-health-records-limit.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- **2025-11-15:** Story created with comprehensive tasks and acceptance criteria (Status: ready-for-dev)
