/**
 * Re-capture ciblée : modale « Modifier l'utilisateur » sur un vrai compte
 * (la 1re capture montrait l'état périmé du formulaire « Ajouter » annulé —
 * le dialogue TanStack Form conserve les valeurs tant qu'on ne recharge
 * pas la page).
 *
 * Usage : node scripts/capture-admin-fig4.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR || "docs/guides-utilisation/admin/screenshots/admin";

const errors = [];

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
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		locale: "fr-FR",
	});
	const page = await context.newPage();
	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
	});
	page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

	try {
		await login(page);
		await page.goto(`${BASE_URL}/admin/utilisateurs`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);

		// Modifier le compte « caissier » (montre un scope activité réel)
		const ligneCaissier = page.getByRole("row", { name: /caissier/ }).first();
		await ligneCaissier.getByTitle("Modifier").click();
		await page.locator("#login").waitFor({ timeout: 8000 });
		await page.waitForTimeout(600);
		await page.screenshot({
			path: path.join(OUT_DIR, "04-modifier-utilisateur.png"),
			fullPage: false,
		});
		console.log("📸 04-modifier-utilisateur");
		await page
			.getByRole("button", { name: "Annuler" })
			.last()
			.click()
			.catch(() => {});
	} finally {
		await context.close();
		await browser.close();
	}

	const errPath = path.join(OUT_DIR, "..", "capture-fig4-errors.txt");
	await writeFile(errPath, errors.join("\n"), "utf8");
	console.log(
		errors.length > 0
			? `⚠️  ${errors.length} erreur(s) → ${errPath}`
			: "✅ Aucune erreur console/page",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
