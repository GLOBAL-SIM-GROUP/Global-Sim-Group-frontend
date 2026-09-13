/**
 * Re-capture ciblée Finances : le sélecteur de caisses « Ma caisse » (20)
 * pris pendant le chargement, et le filtre « Type de paiement » des
 * encaissements (07) sauté au premier passage.
 * Usage : node scripts/capture-finances-complement.mjs
 */
import { chromium } from "playwright";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/finances/screenshots/finances";

async function capture(page, name) {
	await page.screenshot({
		path: path.join(OUT_DIR, `${name}.png`),
		fullPage: true,
	});
	console.log(`📸 ${name}`);
}

async function waitForLoad(page) {
	await page
		.waitForLoadState("domcontentloaded", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(1500);
}

async function login(page) {
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitForLoad(page);
	await page.locator('input[name="login"]').fill(LOGIN);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(page);
}

async function main() {
	const browser = await chromium.launch({ headless: true });
	const page = await (
		await browser.newContext({ viewport: { width: 1440, height: 900 } })
	).newPage();

	await login(page);

	// 07 : filtre « Type de paiement » sur Encaissements.
	await page.goto(`${BASE_URL}/finances/encaissements`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	const typeTrigger = page.locator('button[aria-label="Type de paiement"]');
	await typeTrigger.waitFor({ state: "visible", timeout: 10000 });
	await typeTrigger.click();
	await page.waitForTimeout(1200);
	await capture(page, "07-encaissements-type-ouvert");
	await page.keyboard.press("Escape");

	// 20 : sélecteur de caisses de « Ma caisse » (admin → plusieurs caisses).
	await page.goto(`${BASE_URL}/finances/caissier/dashboard`, {
		waitUntil: "domcontentloaded",
	});
	// Attendre la fin du chargement : le titre « Ma caisse » ou le sélecteur.
	await page
		.getByText("Ma caisse", { exact: false })
		.first()
		.waitFor({ state: "visible", timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1500);
	await capture(page, "20-ma-caisse");

	await browser.close();
	console.log("✅ Re-captures terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
