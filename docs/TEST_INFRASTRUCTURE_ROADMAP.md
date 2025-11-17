# Test Infrastructure Improvement Roadmap

**Current State**: Foundations complete (Factories, POMs, Visual Regression)
**Next Phase**: Advanced patterns and quality-of-life improvements

---

## Priority 1: High Impact, Quick Wins (1-3 days)

### 1. Custom Playwright Fixtures
**Problem**: Test setup is duplicated across test files (auth, pet creation, etc.)

**Solution**: Create custom fixtures for common test scenarios

**Implementation**:
```typescript
// tests/fixtures/index.ts
import { test as base } from '@playwright/test'
import { UserFactory, PetFactory } from '../factories'
import { PetDetailPage } from '../page-objects'

export const test = base.extend({
  // Authenticated user fixture
  authenticatedUser: async ({ page }, use) => {
    const user = UserFactory.build()
    await authenticateTestUser(page, user)
    await use(user)
  },

  // Pet with authenticated user fixture
  petWithUser: async ({ page, authenticatedUser }, use) => {
    const pet = PetFactory.buildDog()
    await createPet(page, pet)
    await use(pet)
  },

  // Pet detail page ready for testing
  petDetailReady: async ({ page, petWithUser }, use) => {
    const petDetailPage = new PetDetailPage(page)
    await petDetailPage.goto(await petDetailPage.getPetId() || '')
    await use({ petDetailPage, pet: petWithUser })
  }
})

// Usage in tests:
test('Test with authenticated user', async ({ page, authenticatedUser }) => {
  // User already authenticated!
})

test('Test with pet ready', async ({ page, petDetailReady }) => {
  // Pet created, page loaded, ready to test!
  const { petDetailPage, pet } = petDetailReady
})
```

**Benefits**:
- ✅ Eliminates setup duplication
- ✅ Composable fixtures (stack them)
- ✅ Automatic cleanup
- ✅ Type-safe

---

### 2. Test Data Builder Pattern
**Problem**: Factories are good, but complex scenarios need relationship building

**Solution**: Add builder pattern for complex test data scenarios

**Implementation**:
```typescript
// tests/builders/PetWithHealthRecordsBuilder.ts
export class PetWithHealthRecordsBuilder {
  private pet: ReturnType<typeof PetFactory.build>
  private healthRecords: Array<ReturnType<typeof HealthRecordFactory.build>> = []

  constructor() {
    this.pet = PetFactory.buildDog()
  }

  withName(name: string) {
    this.pet.name = name
    return this
  }

  withVaccines(count: number) {
    for (let i = 0; i < count; i++) {
      this.healthRecords.push(HealthRecordFactory.buildVaccine())
    }
    return this
  }

  withMedications(count: number) {
    for (let i = 0; i < count; i++) {
      this.healthRecords.push(HealthRecordFactory.buildMedication())
    }
    return this
  }

  withCompleteHealthHistory() {
    return this
      .withVaccines(3)
      .withMedications(2)
      .withVetVisits(1)
  }

  async build(page: Page) {
    await createPet(page, this.pet)

    for (const record of this.healthRecords) {
      await createHealthRecord(page, record)
    }

    return { pet: this.pet, healthRecords: this.healthRecords }
  }
}

// Usage:
const scenario = await new PetWithHealthRecordsBuilder()
  .withName('Buddy')
  .withCompleteHealthHistory()
  .build(page)
```

**Benefits**:
- ✅ Fluent API for complex scenarios
- ✅ Readable test setup
- ✅ Reusable scenario builders

---

### 3. Smart Waiters and Retry Logic
**Problem**: Flaky tests due to timing issues

**Solution**: Create intelligent waiting utilities

**Implementation**:
```typescript
// tests/utils/smart-wait.ts
export class SmartWait {
  /**
   * Wait for element with automatic retry and better error messages
   */
  static async forElement(
    page: Page,
    selector: string,
    options: {
      timeout?: number
      state?: 'visible' | 'hidden' | 'attached'
      errorContext?: string
    } = {}
  ) {
    const { timeout = 10000, state = 'visible', errorContext } = options

    try {
      await page.waitForSelector(selector, { state, timeout })
    } catch (error) {
      // Take screenshot for debugging
      await page.screenshot({ path: `debug-${Date.now()}.png` })

      // Log page state
      const html = await page.content()
      console.error('Page HTML:', html.substring(0, 500))

      throw new Error(
        `Failed to find ${selector}${errorContext ? ` (${errorContext})` : ''}\n` +
        `Screenshot saved for debugging`
      )
    }
  }

  /**
   * Wait for network to be idle with specific URL patterns
   */
  static async forAPI(
    page: Page,
    urlPattern: string | RegExp,
    options: { timeout?: number } = {}
  ) {
    const { timeout = 10000 } = options

    return page.waitForResponse(
      response => {
        const url = response.url()
        const matches = typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url)
        return matches && response.status() === 200
      },
      { timeout }
    )
  }

  /**
   * Wait for condition with custom retry logic
   */
  static async until(
    condition: () => Promise<boolean>,
    options: {
      timeout?: number
      interval?: number
      errorMessage?: string
    } = {}
  ) {
    const { timeout = 10000, interval = 100, errorMessage = 'Condition not met' } = options
    const start = Date.now()

    while (Date.now() - start < timeout) {
      if (await condition()) return true
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    throw new Error(errorMessage)
  }
}

// Usage:
await SmartWait.forElement(page, '.pet-card', {
  errorContext: 'Waiting for pet card after creation'
})

await SmartWait.forAPI(page, '/api/health_records')

await SmartWait.until(
  async () => (await page.locator('.pet-card').count()) > 0,
  { errorMessage: 'No pet cards found after 10s' }
)
```

**Benefits**:
- ✅ Better error messages
- ✅ Automatic debugging screenshots
- ✅ Reduces flaky tests
- ✅ Easier debugging

---

## Priority 2: Medium Impact, Important (3-5 days)

### 4. Test Database State Management
**Problem**: Tests interfere with each other, no isolation

**Solution**: Database seeding and cleanup utilities

**Implementation**:
```typescript
// tests/utils/database.ts
export class TestDatabase {
  /**
   * Create isolated test data for a test
   */
  static async seed(scenario: 'empty' | 'with-pets' | 'full-history') {
    const userId = await this.createTestUser()

    switch (scenario) {
      case 'empty':
        return { userId, pets: [] }

      case 'with-pets':
        const pets = await this.createTestPets(userId, 3)
        return { userId, pets }

      case 'full-history':
        const petsWithHistory = await this.createPetsWithHistory(userId)
        return { userId, pets: petsWithHistory }
    }
  }

  /**
   * Clean up test data after test
   */
  static async cleanup(userId: string) {
    // Delete all data for test user
    await this.deleteHealthRecords(userId)
    await this.deletePets(userId)
    await this.deleteUser(userId)
  }

  /**
   * Take database snapshot before test, restore after
   */
  static async snapshot() {
    // Return cleanup function
    return async () => {
      // Restore to snapshot state
    }
  }
}

// Usage with fixtures:
export const test = base.extend({
  isolatedDatabase: async ({}, use) => {
    const restore = await TestDatabase.snapshot()
    await use()
    await restore()
  }
})
```

**Benefits**:
- ✅ Test isolation
- ✅ Parallel test execution
- ✅ Predictable test state
- ✅ Faster test cleanup

---

### 5. API Testing Layer
**Problem**: Only testing through UI, missing API validation

**Solution**: Add API testing utilities alongside UI tests

**Implementation**:
```typescript
// tests/api/client.ts
export class APITestClient {
  constructor(private baseURL: string, private authToken: string) {}

  async createPet(pet: PetData) {
    const response = await fetch(`${this.baseURL}/api/pets`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(pet)
    })
    return response.json()
  }

  async getHealthRecords(petId: string) {
    const response = await fetch(
      `${this.baseURL}/api/pets/${petId}/health_records`,
      { headers: { 'Authorization': `Bearer ${this.authToken}` } }
    )
    return response.json()
  }
}

// Hybrid test: Fast API setup + UI verification
test('View health timeline', async ({ page, authenticatedUser }) => {
  const api = new APITestClient(baseURL, authenticatedUser.token)

  // Fast: Create test data via API
  const pet = await api.createPet(PetFactory.buildDog())
  await api.createHealthRecord(pet.id, HealthRecordFactory.buildVaccine())

  // Slow: Verify UI displays correctly
  await page.goto(`/pets/${pet.id}`)
  await expect(page.getByText('Rabies Vaccine')).toBeVisible()
})
```

**Benefits**:
- ✅ Faster test setup (API vs UI)
- ✅ API contract validation
- ✅ Better error isolation (API vs UI bug)
- ✅ Can test API independently

---

### 6. Enhanced Reporting and Analytics
**Problem**: Hard to understand test failures and trends

**Solution**: Custom reporters and test analytics

**Implementation**:
```typescript
// tests/reporters/custom-reporter.ts
export class EnhancedReporter implements Reporter {
  onTestEnd(test: TestCase, result: TestResult) {
    if (result.status === 'failed') {
      // Log detailed failure info
      console.log('\n❌ FAILURE DETAILS:')
      console.log('Test:', test.title)
      console.log('File:', test.location.file)
      console.log('Duration:', result.duration + 'ms')
      console.log('Error:', result.error?.message)

      // Log screenshots
      const screenshots = result.attachments.filter(a => a.name === 'screenshot')
      screenshots.forEach(s => {
        console.log('Screenshot:', s.path)
      })
    }
  }

  onEnd(result: FullResult) {
    // Generate summary
    console.log('\n📊 TEST SUMMARY:')
    console.log('Total:', result.stats.expected + result.stats.unexpected)
    console.log('Passed:', result.stats.expected)
    console.log('Failed:', result.stats.unexpected)
    console.log('Flaky:', result.stats.flaky)
    console.log('Duration:', result.stats.duration + 'ms')

    // Identify flaky tests
    const flakyTests = this.getFlakyTests()
    if (flakyTests.length > 0) {
      console.log('\n⚠️  FLAKY TESTS DETECTED:')
      flakyTests.forEach(t => console.log('-', t))
    }
  }
}
```

**Integration**: Store test results in database, build dashboard

**Benefits**:
- ✅ Better failure visibility
- ✅ Identify flaky tests
- ✅ Track test trends over time
- ✅ Measure test coverage

---

### 7. Component Testing Infrastructure
**Problem**: E2E tests are slow, want faster component tests

**Solution**: Set up Playwright component testing

**Implementation**:
```typescript
// tests/component/HealthRecordCard.spec.tsx
import { test, expect } from '@playwright/experimental-ct-react'
import { HealthRecordCard } from '@/components/health/HealthRecordCard'
import { HealthRecordFactory } from '../factories'

test('HealthRecordCard displays vaccine data correctly', async ({ mount }) => {
  const vaccine = HealthRecordFactory.buildVaccine()

  const component = await mount(
    <HealthRecordCard record={vaccine} />
  )

  await expect(component.getByText(vaccine.title)).toBeVisible()
  await expect(component.getByText(/vaccine/i)).toBeVisible()
})

test('HealthRecordCard expands on click', async ({ mount }) => {
  const vaccine = HealthRecordFactory.buildVaccine()
  const component = await mount(<HealthRecordCard record={vaccine} />)

  // Initially collapsed
  await expect(component.getByText(vaccine.notes)).not.toBeVisible()

  // Click to expand
  await component.click()
  await expect(component.getByText(vaccine.notes)).toBeVisible()
})
```

**Benefits**:
- ✅ Much faster than E2E (10x+)
- ✅ Test components in isolation
- ✅ Better coverage of edge cases
- ✅ Still uses real browser

---

## Priority 3: Advanced Features (5-10 days)

### 8. Accessibility Testing Automation
**Problem**: Manual accessibility testing is incomplete

**Solution**: Integrate axe-core for automated a11y testing

**Implementation**:
```typescript
// tests/utils/accessibility.ts
import { injectAxe, checkA11y } from 'axe-playwright'

export async function runAccessibilityAudit(
  page: Page,
  context: string,
  options: {
    rules?: string[]
    exclude?: string[]
  } = {}
) {
  await injectAxe(page)

  const results = await checkA11y(page, undefined, {
    detailedReport: true,
    ...options
  })

  if (results.violations.length > 0) {
    console.error(`\n♿ ACCESSIBILITY VIOLATIONS (${context}):`)
    results.violations.forEach(v => {
      console.error(`- [${v.impact}] ${v.description}`)
      console.error(`  Help: ${v.helpUrl}`)
    })
  }

  return results
}

// Usage:
test('Pet detail page is accessible', async ({ page, petDetailReady }) => {
  await runAccessibilityAudit(page, 'Pet Detail Page')
})
```

**Benefits**:
- ✅ Catch a11y issues early
- ✅ WCAG compliance
- ✅ Better UX for all users
- ✅ Legal compliance

---

### 9. Performance Testing
**Problem**: No performance benchmarking or regression detection

**Solution**: Add performance metrics and thresholds

**Implementation**:
```typescript
// tests/performance/metrics.ts
export class PerformanceMonitor {
  async measurePageLoad(page: Page, url: string) {
    const start = Date.now()
    await page.goto(url)
    await page.waitForLoadState('networkidle')
    const duration = Date.now() - start

    // Get Web Vitals
    const metrics = await page.evaluate(() => {
      return {
        FCP: performance.getEntriesByType('paint')
          .find(e => e.name === 'first-contentful-paint')?.startTime,
        LCP: performance.getEntriesByType('largest-contentful-paint')
          .pop()?.startTime,
        CLS: 0, // Would need layout shift observer
      }
    })

    return { duration, ...metrics }
  }

  assertPerformance(metrics: PerformanceMetrics, thresholds: {
    pageLoad?: number
    FCP?: number
    LCP?: number
  }) {
    if (thresholds.pageLoad && metrics.duration > thresholds.pageLoad) {
      throw new Error(
        `Page load too slow: ${metrics.duration}ms (threshold: ${thresholds.pageLoad}ms)`
      )
    }
    // ... other assertions
  }
}

// Usage:
test('Pet detail page loads quickly', async ({ page, petDetailReady }) => {
  const perf = new PerformanceMonitor()
  const metrics = await perf.measurePageLoad(page, `/pets/${petId}`)

  perf.assertPerformance(metrics, {
    pageLoad: 3000, // 3 seconds max
    FCP: 1500,      // 1.5 seconds max
    LCP: 2500       // 2.5 seconds max
  })
})
```

**Benefits**:
- ✅ Detect performance regressions
- ✅ Meet performance SLAs
- ✅ Improve user experience
- ✅ Track Core Web Vitals

---

### 10. AI-Powered Test Generation
**Problem**: Writing tests is time-consuming

**Solution**: Use AI to generate test scaffolding

**Implementation**:
```typescript
// tests/generators/ai-test-generator.ts
export class AITestGenerator {
  async generateTestsForPage(pageUrl: string) {
    // 1. Crawl page and extract elements
    const elements = await this.extractPageElements(pageUrl)

    // 2. Identify user flows
    const flows = await this.identifyUserFlows(elements)

    // 3. Generate test scaffolding
    const tests = flows.map(flow => this.generateTest(flow))

    return tests
  }

  private generateTest(flow: UserFlow) {
    return `
test('${flow.description}', async ({ page }) => {
  ${flow.steps.map(step => this.generateStepCode(step)).join('\n  ')}
})
    `
  }
}

// CLI tool:
// npx generate-tests /pets/:id
// Creates test scaffolding that developers fill in
```

**Benefits**:
- ✅ Faster test creation
- ✅ Better coverage (AI finds edge cases)
- ✅ Consistent test structure
- ✅ Less manual work

---

### 11. Visual Diff Workflow Integration
**Problem**: Visual regression failures need manual review

**Solution**: Build visual diff review workflow

**Implementation**:
```bash
# After test run with visual failures:
npx playwright show-report

# Opens interactive viewer showing:
# - Baseline image
# - Current image
# - Diff highlighting
# - Accept/Reject buttons

# Accepted changes update baselines automatically
```

**Features**:
- Image comparison viewer
- Side-by-side comparison
- Highlighting differences
- Batch accept/reject
- Git integration (commit baseline updates)

**Benefits**:
- ✅ Faster visual review
- ✅ Better change visibility
- ✅ Team collaboration
- ✅ Version control for visuals

---

### 12. Test Data Scenarios Library
**Problem**: Complex test scenarios aren't reusable

**Solution**: Create pre-built scenario library

**Implementation**:
```typescript
// tests/scenarios/index.ts
export const Scenarios = {
  // User scenarios
  newUser: () => ({
    user: UserFactory.build(),
    pets: [],
    healthRecords: []
  }),

  userWithOnePet: () => ({
    user: UserFactory.build(),
    pets: [PetFactory.buildDog()],
    healthRecords: []
  }),

  userWithPetHistory: () => ({
    user: UserFactory.build(),
    pets: [PetFactory.buildDog()],
    healthRecords: [
      HealthRecordFactory.buildVaccine({ date: '2025-01-01' }),
      HealthRecordFactory.buildVaccine({ date: '2024-01-01' }),
      HealthRecordFactory.buildMedication({ date: '2025-06-01' }),
    ]
  }),

  freeTierUser: () => ({
    user: UserFactory.build(),
    pets: [PetFactory.buildDog(), PetFactory.buildCat()],
    subscription: 'free'
  }),

  premiumUser: () => ({
    user: UserFactory.build(),
    pets: PetFactory.buildBatch(5),
    subscription: 'premium'
  })
}

// Usage:
test('Premium user can add unlimited pets', async ({ page }) => {
  const scenario = Scenarios.premiumUser()
  await seedDatabase(scenario)
  // ... test
})
```

**Benefits**:
- ✅ Reusable test scenarios
- ✅ Consistent test data
- ✅ Easy to understand test context
- ✅ Share scenarios across tests

---

## Priority 4: Optional Enhancements

### 13. Cross-Browser Testing Matrix
- Test on Chrome, Firefox, Safari, Edge
- Mobile browser testing (iOS Safari, Chrome Mobile)
- Responsive design validation

### 14. Load Testing Integration
- Simulate multiple concurrent users
- Test under stress conditions
- Identify bottlenecks

### 15. Screenshot/Video Artifacts Management
- Automatic upload to cloud storage
- Retention policies
- Easy sharing with team

### 16. Test Code Quality Tools
- ESLint rules for test files
- TypeScript strict mode for tests
- Test-specific linting rules

### 17. Mutation Testing
- Verify tests catch bugs
- Improve test quality
- Measure test effectiveness

---

## Implementation Priority Matrix

| Feature | Impact | Effort | Priority | Timeline |
|---------|--------|--------|----------|----------|
| Custom Fixtures | High | Low | P1 | 1 day |
| Smart Waiters | High | Low | P1 | 1 day |
| Builder Pattern | Medium | Low | P1 | 1 day |
| API Testing | High | Medium | P2 | 2 days |
| Database Management | High | Medium | P2 | 2 days |
| Enhanced Reporting | Medium | Medium | P2 | 2 days |
| Component Testing | High | Medium | P2 | 3 days |
| Accessibility Testing | Medium | Low | P3 | 2 days |
| Performance Testing | Medium | Medium | P3 | 3 days |
| Visual Diff Workflow | Low | High | P3 | 5 days |
| AI Test Generation | Low | High | P4 | 5+ days |

---

## Recommended Next Steps

### Week 1: Quick Wins
1. Implement custom fixtures
2. Add smart waiters
3. Create builder pattern for complex scenarios

### Week 2-3: Core Infrastructure
4. Set up API testing layer
5. Implement database state management
6. Add enhanced reporting

### Month 2: Advanced Features
7. Component testing setup
8. Accessibility testing automation
9. Performance monitoring

### Month 3+: Polish
10. Visual diff workflow
11. Test scenarios library
12. Cross-browser matrix

---

## Success Metrics

Track these metrics to measure improvement:

- **Flaky Test Rate**: Target < 2%
- **Test Execution Time**: Target < 10 minutes for full suite
- **Test Pass Rate**: Target > 95%
- **Test Coverage**: Target > 80% of user flows
- **Time to Write Test**: Target < 30 minutes per test
- **Test Maintenance Time**: Target < 5% of development time

---

## Conclusion

The current infrastructure (Factories, POMs, Visual Regression) is solid. The improvements above will:

1. **Reduce flakiness** (Smart waiters, fixtures, database isolation)
2. **Increase speed** (API testing, component testing, fixtures)
3. **Improve quality** (Accessibility, performance, enhanced reporting)
4. **Enhance DX** (Better errors, AI generation, scenario library)

**Recommended approach**: Start with Priority 1 items (high impact, low effort) and gradually adopt Priority 2-3 based on team needs.
