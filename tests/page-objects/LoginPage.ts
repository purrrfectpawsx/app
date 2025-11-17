/**
 * Page Object Model: Login/Authentication Page
 *
 * Encapsulates all authentication interactions including:
 * - Login
 * - Signup
 * - Password reset
 * - Session management
 */

import { Page, Locator, expect } from '@playwright/test'

export class LoginPage {
  readonly page: Page

  // Page elements
  readonly pageTitle: Locator
  readonly emailInput: Locator
  readonly passwordInput: Locator
  readonly nameInput: Locator
  readonly loginButton: Locator
  readonly signupButton: Locator
  readonly switchToSignupLink: Locator
  readonly switchToLoginLink: Locator
  readonly forgotPasswordLink: Locator
  readonly errorMessage: Locator

  constructor(page: Page) {
    this.page = page

    // Common elements
    this.pageTitle = page.getByRole('heading', { name: /(sign in|sign up|create account)/i })
    this.emailInput = page.getByLabel(/email/i)
    this.passwordInput = page.getByLabel(/^password$/i)
    this.nameInput = page.getByLabel(/name/i)

    // Action buttons
    this.loginButton = page.getByRole('button', { name: /sign in/i })
    this.signupButton = page.getByRole('button', { name: /(sign up|create account)/i })

    // Navigation links
    this.switchToSignupLink = page.getByRole('link', { name: /sign up|create account/i })
    this.switchToLoginLink = page.getByRole('link', { name: /sign in|log in/i })
    this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i })

    // Error messages
    this.errorMessage = page.locator('[role="alert"]')
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto('/login')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Navigate to signup page
   */
  async gotoSignup() {
    await this.page.goto('/signup')
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Fill login form
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
  }

  /**
   * Fill signup form
   */
  async fillSignupForm(name: string, email: string, password: string) {
    await this.nameInput.fill(name)
    await this.emailInput.fill(email)
    await this.passwordInput.fill(password)
  }

  /**
   * Submit login form
   */
  async submitLogin() {
    await this.loginButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Submit signup form
   */
  async submitSignup() {
    await this.signupButton.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Complete login flow (fill + submit)
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password)
    await this.submitLogin()
  }

  /**
   * Complete signup flow (fill + submit)
   */
  async signup(name: string, email: string, password: string) {
    await this.fillSignupForm(name, email, password)
    await this.submitSignup()
  }

  /**
   * Switch from login to signup form
   */
  async switchToSignup() {
    await this.switchToSignupLink.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Switch from signup to login form
   */
  async switchToLogin() {
    await this.switchToLoginLink.click()
    await this.page.waitForTimeout(300)
  }

  /**
   * Click forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click()
    await this.page.waitForLoadState('networkidle')
  }

  /**
   * Check if user is logged in (by checking URL or presence of logout button)
   */
  async isLoggedIn(): Promise<boolean> {
    // Check if we're on the pets page (successful login redirects here)
    const url = this.page.url()
    return url.includes('/pets')
  }

  /**
   * Logout (if logout functionality exists)
   */
  async logout() {
    // Click user menu or logout button
    const logoutButton = this.page.getByRole('button', { name: /logout|sign out/i })
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
      await this.page.waitForLoadState('networkidle')
    }
  }

  /**
   * Verify login page is loaded
   */
  async assertLoginPageLoaded() {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.emailInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.loginButton).toBeVisible()
  }

  /**
   * Verify signup page is loaded
   */
  async assertSignupPageLoaded() {
    await expect(this.pageTitle).toBeVisible()
    await expect(this.nameInput).toBeVisible()
    await expect(this.emailInput).toBeVisible()
    await expect(this.passwordInput).toBeVisible()
    await expect(this.signupButton).toBeVisible()
  }

  /**
   * Verify error message is displayed
   */
  async assertErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message)
  }

  /**
   * Verify user is logged in
   */
  async assertLoggedIn() {
    const loggedIn = await this.isLoggedIn()
    expect(loggedIn).toBe(true)
  }
}
