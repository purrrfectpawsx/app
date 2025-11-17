/**
 * Visual Regression Testing Utilities
 *
 * Provides helpers for screenshot-based visual regression testing.
 * Uses Playwright's built-in screenshot and comparison capabilities.
 *
 * Usage:
 * ```typescript
 * import { captureScreenshot, compareScreenshot } from '../utils/visual-regression'
 *
 * // In a test:
 * await captureScreenshot(page, 'pet-detail-page')
 * await compareScreenshot(page, 'pet-detail-page')
 * ```
 */

import { Page, expect } from '@playwright/test'

export interface ScreenshotOptions {
  /**
   * Take a full page screenshot (scrolls to capture entire page)
   * Default: false
   */
  fullPage?: boolean

  /**
   * Hide elements that can cause flakiness (animations, dynamic content)
   * Default: []
   */
  mask?: string[]

  /**
   * Maximum pixel difference threshold (0-1)
   * Default: 0.2 (20% difference allowed)
   */
  threshold?: number

  /**
   * Timeout for screenshot in milliseconds
   * Default: 5000
   */
  timeout?: number
}

/**
 * Capture a screenshot and compare it to the baseline
 *
 * This is the main function for visual regression testing. It will:
 * 1. On first run: Create a baseline screenshot
 * 2. On subsequent runs: Compare against the baseline
 * 3. If differences detected: Save a diff image and fail the test
 *
 * @param page - Playwright page object
 * @param name - Unique name for this screenshot (used for baseline filename)
 * @param options - Screenshot options
 */
export async function compareScreenshot(
  page: Page,
  name: string,
  options: ScreenshotOptions = {}
) {
  const {
    fullPage = false,
    mask = [],
    threshold = 0.2,
    timeout = 5000,
  } = options

  // Wait for page to be stable (no pending animations)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500) // Additional wait for animations

  // Hide or mask elements that can cause flakiness
  const maskLocators = mask.map(selector => page.locator(selector))

  // Take screenshot and compare with baseline
  await expect(page).toHaveScreenshot(`${name}.png`, {
    fullPage,
    mask: maskLocators,
    maxDiffPixels: undefined,
    threshold,
    timeout,
  })
}

/**
 * Capture a screenshot of a specific element
 *
 * @param page - Playwright page object
 * @param selector - CSS selector or locator for the element
 * @param name - Unique name for this screenshot
 * @param options - Screenshot options
 */
export async function compareElementScreenshot(
  page: Page,
  selector: string,
  name: string,
  options: ScreenshotOptions = {}
) {
  const {
    mask = [],
    threshold = 0.2,
    timeout = 5000,
  } = options

  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  const element = page.locator(selector).first()
  await element.waitFor({ state: 'visible', timeout })

  const maskLocators = mask.map(sel => page.locator(sel))

  await expect(element).toHaveScreenshot(`${name}.png`, {
    mask: maskLocators,
    threshold,
    timeout,
  })
}

/**
 * Capture screenshots at different viewport sizes for responsive testing
 *
 * @param page - Playwright page object
 * @param name - Base name for screenshots (will be suffixed with viewport size)
 * @param viewports - Array of viewport sizes to test
 * @param options - Screenshot options
 */
export async function compareResponsiveScreenshots(
  page: Page,
  name: string,
  viewports: Array<{ width: number; height: number; name: string }> = [
    { width: 375, height: 667, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1920, height: 1080, name: 'desktop' },
  ],
  options: ScreenshotOptions = {}
) {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height })
    await page.waitForTimeout(500) // Wait for reflow

    await compareScreenshot(page, `${name}-${viewport.name}`, options)
  }
}

/**
 * Prepare page for stable screenshots by hiding/removing dynamic content
 *
 * Common elements that cause flakiness:
 * - Animations
 * - Timestamps
 * - Random data
 * - Loading spinners
 * - Cursor/focus states
 *
 * @param page - Playwright page object
 */
export async function prepareForScreenshot(page: Page) {
  // Disable CSS animations
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  })

  // Wait for any pending animations to complete
  await page.waitForTimeout(500)

  // Wait for fonts to load
  await page.evaluate(() => document.fonts.ready)

  // Wait for images to load
  await page.evaluate(() => {
    return Promise.all(
      Array.from(document.images)
        .filter(img => !img.complete)
        .map(
          img =>
            new Promise(resolve => {
              img.onload = img.onerror = resolve
            })
        )
    )
  })
}

/**
 * Common mask selectors for elements that frequently cause flakiness
 */
export const COMMON_MASKS = {
  timestamps: '[data-testid*="timestamp"], time, [class*="timestamp"]',
  avatars: '[data-testid*="avatar"], [class*="avatar"]',
  randomData: '[data-testid*="random"]',
  loadingSpinners: '[data-testid*="loading"], [class*="loading"]',
}

/**
 * Preset configurations for common visual regression scenarios
 */
export const VISUAL_PRESETS = {
  // Strict comparison for critical UI elements
  strict: {
    threshold: 0.05,
    mask: [],
  },

  // Lenient comparison for pages with dynamic content
  lenient: {
    threshold: 0.3,
    mask: [COMMON_MASKS.timestamps, COMMON_MASKS.avatars],
  },

  // Full page comparison
  fullPage: {
    fullPage: true,
    threshold: 0.2,
    mask: [COMMON_MASKS.timestamps],
  },
}
