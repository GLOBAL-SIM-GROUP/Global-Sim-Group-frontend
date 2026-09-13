/**
 * Re-capture ciblée des figures 6 et 8 du guide Finances :
 *   06-encaissements.png — historique des encaissements
 *   08-depenses.png      — liste des dépenses
 *
 * Usage : node scripts/capture-finances-fig6-8.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/finances/screenshots/finances";

const errors = [];

async function capture(page, name) {
	const filePath = path.join(OUT_DIR, `${name}.png`);
	await page.screenshot({ path: filePath, fullPage: true });
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

	// Figure 6 : historique des encaissements.
	await page.goto(`${BASE_URL}/finances/encaissements`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await page
		.waitForSelector("table, text=Aucun", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(800);
	await capture(page, "06-encaissements");

	// Figure 8 : liste des dépenses.
	await page.goto(`${BASE_URL}/finances/depenses`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await page
		.waitForSelector("table, text=Aucun", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(800);
	await capture(page, "08-depenses");

	await context.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		await writeFile(
			path.join(OUT_DIR, "capture-fig6-8-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
	}
	console.log("✅ Re-capture figures 6 et 8 terminée.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
