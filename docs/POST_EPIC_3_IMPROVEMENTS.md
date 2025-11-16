# Post-Epic 3 Improvements

This document tracks UX/UI improvements and enhancements to be implemented after Epic 3 stories are completed.

**Status**: Planned for implementation after Epic 3
**Priority**: Medium
**Category**: UX/UI Polish

---

## 1. Update Button Text in Edit Mode

**Component**: `CreatePetForm.tsx`
**Current Behavior**: When editing a pet, the form button still says "Create Pet"
**Expected Behavior**: Button should say "Update Pet" when in edit mode

**Implementation Details**:
- The `CreatePetForm` component now supports `mode` prop ('create' | 'edit')
- Button text should change based on mode:
  - Create mode: "Create Pet"
  - Edit mode: "Update Pet"
- Loading states should also update:
  - Create mode: "Creating..."
  - Edit mode: "Updating..."

**Affected Files**:
- `src/components/pets/CreatePetForm.tsx`

**Acceptance Criteria**:
- [ ] Button displays "Update Pet" when form is in edit mode
- [ ] Button displays "Create Pet" when form is in create mode
- [ ] Loading state shows appropriate text for each mode
- [ ] Visual design remains consistent

---

## 2. Calendar Component UX/UI Redesign

**Component**: `calendar.tsx` (shadcn/ui)
**Current Issue**: Day names are misaligned/offset from the actual date numbers
**Impact**: Confusing UX, users may select wrong dates

**Proposed Improvements**:
1. **Fix Alignment**: Ensure day names (Mon, Tue, Wed, etc.) align correctly with date columns
2. **Better Visual Design**:
   - Clearer date selection indicators
   - Better contrast for current date
   - Hover states for better interactivity
   - Selected date highlighting
3. **Accessibility**:
   - Keyboard navigation
   - Screen reader support
   - Focus indicators

**Affected Files**:
- `src/components/ui/calendar.tsx`
- Potentially need to check if using react-day-picker or similar library

**Research Needed**:
- Check current calendar implementation (likely shadcn/ui's Calendar component)
- Investigate if alignment issue is CSS-related or configuration-related
- Consider alternative calendar libraries if current one is problematic

**Acceptance Criteria**:
- [ ] Day names align perfectly with date columns
- [ ] Selected date is clearly visible
- [ ] Current date is highlighted distinctly
- [ ] Hover states provide clear feedback
- [ ] Calendar is responsive on mobile devices
- [ ] Keyboard navigation works properly
- [ ] No visual glitches or alignment issues

**Testing Checklist**:
- [ ] Test in Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (iOS/Android)
- [ ] Test with different date formats
- [ ] Test accessibility with screen readers
- [ ] Verify birth date selection in pet creation/edit forms
- [ ] Verify date selection in health record forms

---

## Implementation Order

After Epic 3 completion:

1. **Quick Win**: Update button text in edit mode (~30 min)
2. **Research Phase**: Investigate calendar alignment issue (~1-2 hours)
3. **Calendar Redesign**: Implement fixes and improvements (~3-4 hours)
4. **Testing**: Comprehensive testing across browsers/devices (~1-2 hours)

**Total Estimated Time**: ~6-8 hours

---

## Related Stories

These improvements enhance the following completed stories:
- Story 2.1: Create Pet Profile with Basic Info
- Story 2.4: Edit Pet Profile
- Story 3.1-3.3: Health Record Creation

---

## Notes

- Calendar component is used in multiple places:
  - Pet birth date selection (CreatePetForm)
  - Health record date selection (CreateHealthRecordForm)
  - Any future date selection needs
- Fixing calendar will improve UX across all these features
- Consider creating reusable date picker component with consistent styling

---

**Created**: 2025-11-16
**Last Updated**: 2025-11-16
**Assigned To**: TBD
**Epic**: Post-Epic 3 Polish
