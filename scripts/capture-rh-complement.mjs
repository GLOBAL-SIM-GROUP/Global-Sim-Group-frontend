/**
 * Complément de captures RH : page « Comptes utilisateurs » — la capture
 * initiale a été prise avant le chargement des permissions (message « Vous
 * n'avez pas accès » affiché par transit). Attente explicite du formulaire.
 *
 * Usage : node scripts/capture-rh-complement.mjs
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

	await page.goto(`${BASE_URL}/rh/comptes`, {
		waitUntil: "domcontentloaded",
	});
	// Attendre que le formulaire (ou le message d'accès refusé) soit rendu.
	await page
		.waitForSelector('button[aria-label="Employé"], text=accès', {
			timeout: 20000,
		})
		.catch(() => {});
	await page.waitForTimeout(1500);
	await capture(page, "20-comptes");

	// Remplir le formulaire sans soumettre (montre le login auto-proposé).
	const empTrigger = page.locator('button[aria-label="Employé"]');
	if (await empTrigger.isVisible().catch(() => false)) {
		await empTrigger.click();
		await page.waitForTimeout(1200);
		// Préférer l'employée Guide ; sinon le premier employé sans compte.
		const itemGuide = page.locator('[data-slot="select-item"]', {
			hasText: "Guide-Ngo",
		});
		if (await itemGuide.first().isVisible().catch(() => false)) {
			await itemGuide.first().click();
		} else {
			const premier = page.locator('[data-slot="select-item"]').first();
			if (await premier.isVisible().catch(() => false)) {
				await premier.click();
			} else {
				await page.keyboard.press("Escape");
			}
		}
		await page.waitForTimeout(600);
		const roleTrigger = page.locator('button[aria-label="Rôle"]');
		if (await roleTrigger.isVisible().catch(() => false)) {
			await page.locator("#motDePasse").fill("motdepasse123");
			await roleTrigger.click();
			await page.waitForTimeout(1000);
			const roleItem = page.locator('[data-slot="select-item"]').first();
			if (await roleItem.isVisible().catch(() => false)) {
				await roleItem.click();
			} else {
				await page.keyboard.press("ArrowDown");
				await page.keyboard.press("Enter");
			}
			await page.waitForTimeout(500);
		}
		await capture(page, "21-comptes-rempli");
	}

	await context.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
	}
	console.log("✅ Complément RH terminé.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
