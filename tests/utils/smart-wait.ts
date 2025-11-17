/**
 * Smart Wait Utilities
 *
 * Intelligent waiting utilities that reduce flaky tests and provide better error messages.
 * Automatically captures debugging information on failures.
 *
 * Usage:
 * ```typescript
 * import { SmartWait } from '../utils/smart-wait'
 *
 * // Wait for element with better error messages
 * await SmartWait.forElement(page, '.pet-card', {
 *   errorContext: 'Waiting for pet card after creation'
 * })
 *
 * // Wait for API response
 * await SmartWait.forAPI(page, '/api/health_records')
 *
 * // Wait for custom condition
 * await SmartWait.until(
 *   async () => (await page.locator('.pet-card').count()) > 0,
 *   { errorMessage: 'No pet cards found' }
 * )
 * ```
 */

import { Page, Locator, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// ============================================================================
// Smart Wait Options
// ============================================================================

export interface WaitOptions {
  /** Maximum time to wait in milliseconds */
  timeout?: number
  /** Additional context for error messages */
  errorContext?: string
  /** Whether to capture screenshot on failure */
  captureScreenshot?: boolean
  /** Whether to log page HTML on failure */
  logHTML?: boolean
}

export interface ElementWaitOptions extends WaitOptions {
  /** Element state to wait for */
  state?: 'visible' | 'hidden' | 'attached' | 'detached'
}

export interface ConditionWaitOptions extends WaitOptions {
  /** Retry interval in milliseconds */
  interval?: number
  /** Custom error message */
  errorMessage?: string
}

export interface APIWaitOptions extends WaitOptions {
  /** Expected status code */
  expectedStatus?: number
  /** Expected response body matcher */
  expectedBody?: RegExp | string
}

// ============================================================================
// Smart Wait Class
// ============================================================================

export class SmartWait {
  private static debugDir = 'test-results/debug'

  /**
   * Initialize debug directory
   */
  private static ensureDebugDir() {
    if (!fs.existsSync(this.debugDir)) {
      fs.mkdirSync(this.debugDir, { recursive: true })
    }
  }

  /**
   * Wait for element with automatic retry and better error messages
   *
   * @example
   * await SmartWait.forElement(page, '.pet-card', {
   *   errorContext: 'Waiting for pet card after creation',
   *   state: 'visible',
   *   timeout: 10000
   * })
   */
  static async forElement(
    page: Page,
    selector: string,
    options: ElementWaitOptions = {}
  ): Promise<void> {
    const {
      timeout = 10000,
      state = 'visible',
      errorContext,
      captureScreenshot = true,
      logHTML = true,
    } = options

    try {
      await page.waitForSelector(selector, { state, timeout })
    } catch (error) {
      // Capture debugging information
      const timestamp = Date.now()
      const debugInfo = await this.captureDebugInfo(page, {
        selector,
        errorContext,
        captureScreenshot,
        logHTML,
        timestamp,
      })

      // Throw enhanced error
      throw new Error(
        this.formatError('Element not found', {
          selector,
          state,
          timeout,
          errorContext,
          debugInfo,
        })
      )
    }
  }

  /**
   * Wait for a locator with better error handling
   *
   * @example
   * await SmartWait.forLocator(page.getByRole('button', { name: /save/i }), {
   *   errorContext: 'Waiting for save button'
   * })
   */
  static async forLocator(
    locator: Locator,
    options: ElementWaitOptions = {}
  ): Promise<void> {
    const {
      timeout = 10000,
      state = 'visible',
      errorContext,
      captureScreenshot = true,
      logHTML = false,
    } = options

    try {
      await locator.waitFor({ state, timeout })
    } catch (error) {
      const page = locator.page()
      const timestamp = Date.now()
      const debugInfo = await this.captureDebugInfo(page, {
        selector: locator.toString(),
        errorContext,
        captureScreenshot,
        logHTML,
        timestamp,
      })

      throw new Error(
        this.formatError('Locator not found', {
          locator: locator.toString(),
          state,
          timeout,
          errorContext,
          debugInfo,
        })
      )
    }
  }

  /**
   * Wait for network response with specific URL pattern
   *
   * @example
   * await SmartWait.forAPI(page, '/api/health_records', {
   *   expectedStatus: 200,
   *   timeout: 5000
   * })
   */
  static async forAPI(
    page: Page,
    urlPattern: string | RegExp,
    options: APIWaitOptions = {}
  ): Promise<void> {
    const {
      timeout = 10000,
      expectedStatus = 200,
      expectedBody,
      errorContext,
    } = options

    try {
      const response = await page.waitForResponse(
        response => {
          const url = response.url()
          const matchesURL =
            typeof urlPattern === 'string'
              ? url.includes(urlPattern)
              : urlPattern.test(url)

          const matchesStatus = response.status() === expectedStatus

          return matchesURL && matchesStatus
        },
        { timeout }
      )

      // Optionally check response body
      if (expectedBody) {
        const body = await response.text()
        const matchesBody =
          typeof expectedBody === 'string'
            ? body.includes(expectedBody)
            : expectedBody.test(body)

        if (!matchesBody) {
          throw new Error(`Response body did not match expected pattern`)
        }
      }
    } catch (error) {
      throw new Error(
        this.formatError('API response not received', {
          urlPattern: urlPattern.toString(),
          expectedStatus,
          timeout,
          errorContext,
        })
      )
    }
  }

  /**
   * Wait for multiple API calls to complete
   *
   * @example
   * await SmartWait.forAPIs(page, [
   *   '/api/pets',
   *   '/api/health_records'
   * ])
   */
  static async forAPIs(
    page: Page,
    urlPatterns: Array<string | RegExp>,
    options: APIWaitOptions = {}
  ): Promise<void> {
    await Promise.all(
      urlPatterns.map(pattern => this.forAPI(page, pattern, options))
    )
  }

  /**
   * Wait for network to be idle (no pending requests)
   *
   * @example
   * await SmartWait.forNetworkIdle(page)
   */
  static async forNetworkIdle(
    page: Page,
    options: { timeout?: number } = {}
  ): Promise<void> {
    const { timeout = 10000 } = options

    try {
      await page.waitForLoadState('networkidle', { timeout })
    } catch (error) {
      throw new Error(
        this.formatError('Network did not become idle', {
          timeout,
        })
      )
    }
  }

  /**
   * Wait for custom condition with retry logic
   *
   * @example
   * await SmartWait.until(
   *   async () => (await page.locator('.pet-card').count()) > 0,
   *   {
   *     errorMessage: 'No pet cards found after 10s',
   *     timeout: 10000,
   *     interval: 100
   *   }
   * )
   */
  static async until(
    condition: () => Promise<boolean>,
    options: ConditionWaitOptions = {}
  ): Promise<void> {
    const {
      timeout = 10000,
      interval = 100,
      errorMessage = 'Condition not met',
      errorContext,
    } = options

    const start = Date.now()

    while (Date.now() - start < timeout) {
      try {
        if (await condition()) {
          return
        }
      } catch (error) {
        // Condition threw error, continue retrying
      }

      await new Promise(resolve => setTimeout(resolve, interval))
    }

    throw new Error(
      this.formatError('Condition timeout', {
        errorMessage,
        timeout,
        errorContext,
      })
    )
  }

  /**
   * Wait for text to appear on page
   *
   * @example
   * await SmartWait.forText(page, 'Pet created successfully')
   */
  static async forText(
    page: Page,
    text: string | RegExp,
    options: WaitOptions = {}
  ): Promise<void> {
    const { timeout = 10000, errorContext } = options
    const textPattern = typeof text === 'string' ? new RegExp(text, 'i') : text

    await this.forElement(page, `text=${textPattern.source}`, {
      timeout,
      errorContext: errorContext || `Waiting for text: ${text}`,
    })
  }

  /**
   * Wait for element to be hidden/removed
   *
   * @example
   * await SmartWait.forElementToDisappear(page, '[role="dialog"]')
   */
  static async forElementToDisappear(
    page: Page,
    selector: string,
    options: WaitOptions = {}
  ): Promise<void> {
    const { timeout = 10000 } = options

    await this.forElement(page, selector, {
      state: 'hidden',
      timeout,
      ...options,
    })
  }

  /**
   * Wait for URL to match pattern
   *
   * @example
   * await SmartWait.forURL(page, /\/pets\/[a-f0-9-]+/)
   */
  static async forURL(
    page: Page,
    urlPattern: string | RegExp,
    options: WaitOptions = {}
  ): Promise<void> {
    const { timeout = 10000, errorContext } = options

    await this.until(
      async () => {
        const url = page.url()
        return typeof urlPattern === 'string'
          ? url.includes(urlPattern)
          : urlPattern.test(url)
      },
      {
        timeout,
        errorMessage: `URL did not match pattern: ${urlPattern}`,
        errorContext,
      }
    )
  }

  /**
   * Wait for element count to match expected value
   *
   * @example
   * await SmartWait.forElementCount(page, '.pet-card', 3)
   */
  static async forElementCount(
    page: Page,
    selector: string,
    expectedCount: number,
    options: WaitOptions = {}
  ): Promise<void> {
    const { timeout = 10000, errorContext } = options

    await this.until(
      async () => {
        const count = await page.locator(selector).count()
        return count === expectedCount
      },
      {
        timeout,
        errorMessage: `Expected ${expectedCount} elements matching ${selector}`,
        errorContext,
      }
    )
  }

  /**
   * Retry an action until it succeeds
   *
   * @example
   * await SmartWait.retry(async () => {
   *   await page.click('.save-button')
   *   await expect(page.getByText('Saved')).toBeVisible()
   * }, { retries: 3 })
   */
  static async retry<T>(
    action: () => Promise<T>,
    options: {
      retries?: number
      delay?: number
      errorMessage?: string
    } = {}
  ): Promise<T> {
    const { retries = 3, delay = 1000, errorMessage = 'Retry failed' } = options

    let lastError: Error | undefined

    for (let i = 0; i < retries; i++) {
      try {
        return await action()
      } catch (error) {
        lastError = error as Error
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }
    }

    throw new Error(
      `${errorMessage} after ${retries} retries\nLast error: ${lastError?.message}`
    )
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private static async captureDebugInfo(
    page: Page,
    options: {
      selector?: string
      errorContext?: string
      captureScreenshot: boolean
      logHTML: boolean
      timestamp: number
    }
  ) {
    const debugInfo: any = {}

    // Capture screenshot
    if (options.captureScreenshot) {
      try {
        this.ensureDebugDir()
        const screenshotPath = path.join(
          this.debugDir,
          `error-${options.timestamp}.png`
        )
        await page.screenshot({ path: screenshotPath, fullPage: true })
        debugInfo.screenshot = screenshotPath
      } catch (error) {
        debugInfo.screenshot = 'Failed to capture screenshot'
      }
    }

    // Log HTML
    if (options.logHTML) {
      try {
        const html = await page.content()
        debugInfo.htmlSnippet = html.substring(0, 500) + '...'
      } catch (error) {
        debugInfo.htmlSnippet = 'Failed to capture HTML'
      }
    }

    // Get page URL
    try {
      debugInfo.url = page.url()
    } catch (error) {
      debugInfo.url = 'Unknown'
    }

    // Get console logs
    try {
      const logs = await page.evaluate(() => {
        // @ts-ignore
        return window.__testLogs || []
      })
      debugInfo.consoleLogs = logs
    } catch (error) {
      // Console logs not available
    }

    return debugInfo
  }

  private static formatError(
    message: string,
    details: Record<string, any>
  ): string {
    let error = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    error += `❌ ${message}\n`
    error += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`

    // Add details
    Object.entries(details).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'debugInfo') {
          error += `\n📋 Debug Information:\n`
          Object.entries(value).forEach(([k, v]) => {
            error += `  ${k}: ${v}\n`
          })
        } else {
          error += `${key}: ${value}\n`
        }
      }
    })

    error += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`

    return error
  }
}

// ============================================================================
// Convenience Exports
// ============================================================================

export const {
  forElement,
  forLocator,
  forAPI,
  forAPIs,
  forNetworkIdle,
  until,
  forText,
  forElementToDisappear,
  forURL,
  forElementCount,
  retry,
} = SmartWait
