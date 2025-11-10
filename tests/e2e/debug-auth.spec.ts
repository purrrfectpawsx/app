import { test, expect } from '../setup/test-env';
import { authenticateTestUser } from '../utils/auth';
import { generateTestUser } from '../fixtures/users';

test('Debug: Check auth flow and page state', async ({ page }) => {
  const user = generateTestUser();
  
  console.log('1. Starting authentication...');
  await authenticateTestUser(page, user);
  
  console.log('2. After auth, URL:', page.url());
  
  // Take screenshot
  await page.screenshot({ path: 'debug-after-auth.png', fullPage: true });
  
  // Check page content
  const pageContent = await page.content();
  console.log('3. Page title:', await page.title());
  console.log('4. Has "My Pets" text:', pageContent.includes('My Pets'));
  console.log('5. Has verify-email text:', pageContent.includes('verify') || pageContent.includes('Verify'));
  
  // Check for specific elements
  const headings = await page.locator('h1,h2').all();
  console.log('6. Number of headings found:', headings.length);
  for (let i = 0; i < headings.length; i++) {
    const text = await headings[i].textContent();
    console.log(`   Heading ${i+1}:`, text);
  }
  
  // Verify logout button
  const logoutButton = page.getByRole('button', { name: /logout/i });
  console.log('7. Logout button visible:', await logoutButton.isVisible());
});
