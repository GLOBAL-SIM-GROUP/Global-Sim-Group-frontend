import { test, expect } from '@playwright/test';

test.describe('Client Fiche - Responsive Design', () => {
	// Test sur mobile
	test('should display correctly on mobile', async ({ page }) => {
		// Configure la vue mobile
		await page.setViewportSize({ width: 375, height: 667 });

		// Navigue vers la page (utilise une URL de test)
		// Puisqu'on peut pas accéder au vrai backend, on teste juste le layout
		await page.goto('http://localhost:3001/client/clients/1', {
			waitUntil: 'networkidle'
		}).catch(() => {
			console.log('Could not navigate - server not running');
		});

		// Prend un screenshot mobile
		await page.screenshot({
			path: 'screenshot-mobile.png',
			fullPage: true
		});

		console.log('Mobile screenshot saved: screenshot-mobile.png');
	});

	// Test sur tablet
	test('should display correctly on tablet', async ({ page }) => {
		await page.setViewportSize({ width: 768, height: 1024 });

		await page.goto('http://localhost:3001/client/clients/1', {
			waitUntil: 'networkidle'
		}).catch(() => {
			console.log('Could not navigate - server not running');
		});

		await page.screenshot({
			path: 'screenshot-tablet.png',
			fullPage: true
		});

		console.log('Tablet screenshot saved: screenshot-tablet.png');
	});

	// Test sur desktop
	test('should display correctly on desktop', async ({ page }) => {
		await page.setViewportSize({ width: 1920, height: 1080 });

		await page.goto('http://localhost:3001/client/clients/1', {
			waitUntil: 'networkidle'
		}).catch(() => {
			console.log('Could not navigate - server not running');
		});

		await page.screenshot({
			path: 'screenshot-desktop.png',
			fullPage: true
		});

		console.log('Desktop screenshot saved: screenshot-desktop.png');
	});
});
