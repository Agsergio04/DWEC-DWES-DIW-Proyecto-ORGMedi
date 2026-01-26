import { test, expect } from '@playwright/test';

test('home page loads and app-root exists', async ({ page }) => {
  const response = await page.goto('/');
  expect(response).not.toBeNull();
  expect(response && response.ok()).toBeTruthy();

  // Comprueba que el root del app está presente
  const appRoot = page.locator('app-root');
  await expect(appRoot).toHaveCount(1);
});
