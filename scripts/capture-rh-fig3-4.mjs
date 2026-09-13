/**
 * Re-capture ciblée des figures 3 et 4 du guide RH :
 *   03-employes-filtre-service.png — filtre « Service » déplié
 *   04-employes-filtre-statut.png  — filtre « Statut » déplié
 *
 * Usage : node scripts/capture-rh-fig3-4.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR || "docs/guides-utilisation/rh/screenshots/rh";

const errors = [];

async function capture(page, name) {
	const filePath = path.join(OUT_DIR, `${name}.png`);
	// Viewport (pas fullPage) : les menus Radix sont portalés dans <body> et
	// se positionnent par rapport au viewport — en fullPage ils se détachent.
	await page.screenshot({ path: filePath });
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
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});
	const page = await context.newPage();
	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
	});
	page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

	await login(page);

	await page.goto(`${BASE_URL}/rh/employes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await page
		.waitForSelector("table, text=Aucun employé", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(800);

	// Figure 3 : filtre « Service » déplié.
	const serviceTrigger = page.locator('button[aria-label="Service"]');
	await serviceTrigger.click();
	await page.waitForTimeout(1200);
	await capture(page, "03-employes-filtre-service");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(500);

	// Figure 4 : filtre « Statut » déplié.
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	await statutTrigger.click();
	await page.waitForTimeout(1200);
	await capture(page, "04-employes-filtre-statut");
	await page.keyboard.press("Escape");

	await context.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		await writeFile(
			path.join(OUT_DIR, "capture-fig3-4-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
	}
	console.log("✅ Re-capture figures 3 et 4 terminée.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
