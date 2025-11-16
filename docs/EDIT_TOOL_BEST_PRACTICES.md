# Edit Tool Best Practices for AI Agents

**Created:** 2025-11-15
**Purpose:** Epic 2 Retrospective Action Item - Document Edit tool best practices
**Context:** Epic 2 encountered Edit tool issues with line number prefix confusion

## Overview

The Edit tool is used by AI agents to make precise changes to files. This document provides best practices to avoid common pitfalls and ensure successful edits.

## The Line Number Prefix Issue

### What Happened in Epic 2

During Epic 2, edits failed because of confusion between:
1. **Line number prefix:** `   123→` (spaces + line number + tab)
2. **Actual file content:** Everything AFTER the tab character

### The Problem

When using the Read tool, output looks like this:

```
     1→import React from 'react'
     2→import { Button } from '@/components/ui/button'
     3→
     4→export const MyComponent = () => {
     5→  return <Button>Click me</Button>
     6→}
```

**Mistake:** Including line number prefix in `old_string`:

```typescript
// ❌ WRONG: Includes line number prefix
old_string: "     4→export const MyComponent = () => {"

// ✅ CORRECT: Only the actual file content (after the tab)
old_string: "export const MyComponent = () => {"
```

### Why This Happens

- Read tool output includes line numbers for reference
- Line numbers are NOT part of the actual file content
- Edit tool expects EXACT file content (without line numbers)
- Including line numbers causes "string not found" errors

## Best Practices

### 1. Always Strip Line Number Prefix

When copying content from Read tool output for Edit tool:

**Read output:**
```
    15→  const handleSubmit = async (data: FormData) => {
```

**Use in Edit:**
```typescript
old_string: "  const handleSubmit = async (data: FormData) => {"
// Notice: Preserves indentation AFTER the tab, removes prefix BEFORE the tab
```

**Rule:** Remove everything up to and including the `→` character, keep everything after.

### 2. Preserve Exact Indentation

The indentation you see AFTER the `→` is the ACTUAL file indentation.

**Read output:**
```
    10→export const MyComponent = () => {
    11→  const [count, setCount] = useState(0)
    12→
    13→  return (
    14→    <div>
```

**Correct Edit:**
```typescript
old_string: "  const [count, setCount] = useState(0)"
// Preserves 2-space indentation
```

**Incorrect Edit:**
```typescript
old_string: "const [count, setCount] = useState(0)"
// ❌ Missing indentation - will not match!
```

### 3. Match Exact Whitespace

Tabs vs spaces, trailing whitespace, blank lines - ALL must match exactly.

**Read output:**
```
    20→  const value = 'hello'
    21→
    22→  return <div>{value}</div>
```

**Correct Edit (includes blank line):**
```typescript
old_string: `  const value = 'hello'

  return <div>{value}</div>`
```

**Incorrect Edit (missing blank line):**
```typescript
old_string: `  const value = 'hello'
  return <div>{value}</div>`
// ❌ Missing blank line between statements
```

### 4. Use Larger Context for Uniqueness

If `old_string` appears multiple times in the file, Edit tool will fail.

**Problem:**
```typescript
// This appears 3 times in the file
old_string: "  const [value, setValue] = useState('')"
// ❌ Error: String appears multiple times
```

**Solution: Add surrounding context:**
```typescript
old_string: `export const CreatePetForm = () => {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)`
// ✅ Now unique within the file
```

### 5. Verify String Uniqueness Before Edit

Before calling Edit tool:

1. Read the file
2. Identify the section to change
3. Copy enough surrounding lines to make it unique
4. Verify the string appears exactly once in the file

**Mental Checklist:**
- [ ] Does this exact string appear elsewhere in the file?
- [ ] Have I included enough context?
- [ ] Is the indentation preserved exactly?
- [ ] Are there any blank lines I need to include?

### 6. Use `replace_all` for Renaming

When renaming a variable/function across a file:

**Scenario:** Rename `oldName` to `newName` in 10 places

```typescript
// ✅ GOOD: Use replace_all
{
  file_path: '/path/to/file.ts',
  old_string: 'oldName',
  new_string: 'newName',
  replace_all: true
}
```

**Not recommended:** Making 10 separate Edit calls with unique contexts.

### 7. Handle Indentation Edge Cases

**Case 1: Function with nested indentation**

```
    10→export const MyComponent = () => {
    11→  const handleClick = () => {
    12→    console.log('clicked')
    13→  }
    14→}
```

**Correct Edit:**
```typescript
old_string: `  const handleClick = () => {
    console.log('clicked')
  }`
// Notice: 4-space indent for console.log (nested), 2-space for closing brace
```

**Case 2: No indentation (top-level)**

```
     1→import React from 'react'
     2→import { useState } from 'react'
```

**Correct Edit:**
```typescript
old_string: "import React from 'react'"
// No leading spaces - this is at column 0
```

### 8. Multi-Line String Formatting

For multi-line edits, use template literals:

```typescript
// ✅ GOOD: Template literal preserves formatting
old_string: `export const MyComponent = () => {
  const value = 'hello'
  return <div>{value}</div>
}`

// ❌ BAD: String concatenation is error-prone
old_string: "export const MyComponent = () => {\n" +
            "  const value = 'hello'\n" +
            "  return <div>{value}</div>\n" +
            "}"
```

### 9. Common Failure Scenarios

**Scenario 1: "String not found" error**

**Causes:**
- Line number prefix included in `old_string`
- Indentation doesn't match exactly
- Extra/missing whitespace
- String appears multiple times (need more context)
- Typo in the string

**Debug Steps:**
1. Re-read the file
2. Copy EXACT content (after `→`)
3. Verify indentation matches
4. Check for duplicate strings

**Scenario 2: Edit succeeds but wrong location**

**Cause:** String appears multiple times, Edit tool picked first occurrence

**Solution:** Add more surrounding context to make string unique

**Scenario 3: File modified unexpectedly error**

**Cause:** File changed since last Read

**Solution:** Read file again and retry Edit

## Step-by-Step Edit Workflow

### Recommended Process

**Step 1: Read the file**
```typescript
Read({ file_path: '/path/to/file.ts' })
```

**Step 2: Identify target section**
- Find line numbers of section to change
- Note the exact indentation
- Check if string appears multiple times

**Step 3: Extract old_string**
- Copy EXACT content (remove line number prefix)
- Include enough context for uniqueness
- Preserve all whitespace exactly

**Step 4: Prepare new_string**
- Match indentation of old_string
- Use same whitespace style (tabs/spaces)
- Preview the change mentally

**Step 5: Execute Edit**
```typescript
Edit({
  file_path: '/path/to/file.ts',
  old_string: '...',  // Exact match from file
  new_string: '...',  // Desired replacement
})
```

**Step 6: Verify (Optional)**
- Read file again to confirm change
- Check surrounding code wasn't affected

## Examples from Epic 2

### Example 1: Adding Import Statement

**Read output:**
```
     1→import React from 'react'
     2→import { useState } from 'react'
     3→
     4→export const MyComponent = () => {
```

**Correct Edit:**
```typescript
Edit({
  file_path: '/path/to/file.tsx',
  old_string: `import React from 'react'
import { useState } from 'react'`,
  new_string: `import React from 'react'
import { useState } from 'react'
import { useToast } from '@/hooks/useToast'`
})
```

**Note:** No indentation, exact match of imports section.

### Example 2: Updating Function Body

**Read output:**
```
    45→  const handleSubmit = async (data: FormData) => {
    46→    console.log(data)
    47→  }
```

**Correct Edit:**
```typescript
Edit({
  file_path: '/path/to/file.tsx',
  old_string: `  const handleSubmit = async (data: FormData) => {
    console.log(data)
  }`,
  new_string: `  const handleSubmit = async (data: FormData) => {
    try {
      await createPet(data)
      toast({ title: 'Success!' })
    } catch (error) {
      toast({ title: 'Error', variant: 'destructive' })
    }
  }`
})
```

**Note:** Preserves 2-space indentation for function, 4-space for body.

### Example 3: Renaming Variable

**Scenario:** Rename `petName` to `name` throughout file

**Option 1: Use replace_all**
```typescript
Edit({
  file_path: '/path/to/file.tsx',
  old_string: 'petName',
  new_string: 'name',
  replace_all: true
})
```

**Option 2: Targeted replacement (if rename should be scoped)**
```typescript
Edit({
  file_path: '/path/to/file.tsx',
  old_string: `const CreatePetForm = () => {
  const [petName, setPetName] = useState('')`,
  new_string: `const CreatePetForm = () => {
  const [name, setName] = useState('')`
})
```

### Example 4: Adding to Existing Object

**Read output:**
```
    12→const petSchema = z.object({
    13→  name: z.string(),
    14→  species: z.string(),
    15→})
```

**Correct Edit:**
```typescript
Edit({
  file_path: '/path/to/file.ts',
  old_string: `const petSchema = z.object({
  name: z.string(),
  species: z.string(),
})`,
  new_string: `const petSchema = z.object({
  name: z.string(),
  species: z.string(),
  breed: z.string().optional(),
  birth_date: z.string().optional(),
})`
})
```

**Note:** Preserves object indentation, adds trailing comma consistently.

## Quick Reference

### Do's ✅

- Strip line number prefix (everything before and including `→`)
- Preserve exact indentation from file
- Use enough context to make string unique
- Use template literals for multi-line strings
- Use `replace_all` for renaming across file
- Read file again if "file modified" error occurs

### Don'ts ❌

- Include line number prefix in `old_string`
- Guess at indentation (always match exactly)
- Use minimal context if string appears multiple times
- Use string concatenation for multi-line edits
- Make multiple edits when `replace_all` would work
- Skip reading file before editing

## Debugging Failed Edits

### Error: "String not found"

**Checklist:**
1. Did you include line number prefix? → Remove it
2. Does indentation match exactly? → Re-read and copy
3. Are there typos? → Copy-paste from Read output
4. Does string appear multiple times? → Add more context
5. Was file modified? → Read file again

### Error: "String appears multiple times"

**Solution:** Add surrounding context to make unique

**Example:**
```typescript
// ❌ Appears 3 times
old_string: "const [value, setValue] = useState('')"

// ✅ Unique with context
old_string: `export const CreatePetForm = () => {
  const [value, setValue] = useState('')
  const [error, setError] = useState(null)`
```

### Error: "File unexpectedly modified"

**Cause:** File changed between Read and Edit

**Solution:** Read file again and retry Edit

## Tools and Utilities

### Visual Verification

Before Edit, mentally replace `old_string` with `new_string` in Read output:

**Read output:**
```
    10→  const value = 'hello'
    11→  return <div>{value}</div>
```

**Proposed Edit:**
- old_string: `const value = 'hello'`
- new_string: `const value = 'world'`

**Mental verification:**
```
    10→  const value = 'world'  ✅ Looks correct
    11→  return <div>{value}</div>
```

### String Uniqueness Check

Count occurrences before Edit:

1. Read entire file
2. Search for `old_string`
3. If appears >1 time → Add context
4. If appears 0 times → Check for typos

## Advanced Patterns

### Pattern 1: Nested Component Edit

When editing deeply nested JSX, include parent structure:

```typescript
old_string: `<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Old Title</DialogTitle>
    </DialogHeader>
  </DialogContent>
</Dialog>`,
new_string: `<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>New Title</DialogTitle>
      <DialogDescription>Added description</DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>`
```

### Pattern 2: Adding to Array/List

```typescript
old_string: `const items = [
  'item1',
  'item2',
]`,
new_string: `const items = [
  'item1',
  'item2',
  'item3',
]`
```

**Note:** Include array brackets for uniqueness.

### Pattern 3: Conditional Logic Update

```typescript
old_string: `if (condition) {
  doSomething()
}`,
new_string: `if (condition) {
  doSomething()
  doSomethingElse()
}`
```

**Note:** Include entire if block for clarity.

## Testing Edits

Before deploying, verify:

1. File compiles without errors
2. Changed section has correct syntax
3. Indentation matches surrounding code
4. No unintended changes elsewhere in file

## Summary

**Key Takeaway:** The Edit tool requires EXACT file content (no line number prefixes), with EXACT indentation and whitespace. When in doubt, copy MORE context rather than less.

**Remember:**
- Read output includes line numbers for YOUR reference
- Edit tool sees the ACTUAL file (no line numbers)
- Match indentation EXACTLY as shown after the `→`
- Use sufficient context for uniqueness
- Verify before editing

---

**Last Updated:** 2025-11-15
**Version:** 1.0
**Epic 2 Retrospective Action Item:** Document Edit tool best practices
**Related:** Epic 2 Retrospective - docs/retrospectives/epic-2-retrospective.md
