/**
 * Re-captures ciblées Résidence (2026-09-21) :
 * - 23-sejour-formulaire-vide : le formulaire de séjour n'a plus d'acompte ni
 *   de moyen de paiement (commit b730b0f).
 * - 31-abonnement-formulaire-vide : nouveau bandeau « résidents uniquement »
 *   + création de locataire complet au vol.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR || "docs/guides-utilisation/screenshots/residence";

const errors = [];

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
	await page.waitForURL("**/home", { timeout: 30000 });
	await waitForLoad(page);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await chromium.launch({ headless: true });
	const page = await (
		await browser.newContext({ viewport: { width: 1440, height: 900 } })
	).newPage();
	page.on("console", (m) => {
		if (m.type() === "error") errors.push(`[console] ${m.text()}`);
	});
	page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

	await login(page);

	// --- Formulaire séjour ------------------------------------------------
	await page.goto(`${BASE_URL}/residence/sejours-courts`, {
		waitUntil: "domcontentloaded",
	});
	await page.waitForTimeout(2000);
	await page
		.getByRole("button", { name: /Nouveau séjour/ })
		.first()
		.click();
	await page.getByRole("dialog").waitFor({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "23-sejour-formulaire-vide");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(800);

	// --- Formulaire abonnement --------------------------------------------
	await page.goto(`${BASE_URL}/residence/abonnements`, {
		waitUntil: "domcontentloaded",
	});
	await page.waitForTimeout(2000);
	await page
		.getByRole("button", { name: /Nouvel abonnement/ })
		.first()
		.click();
	await page.getByRole("dialog").waitFor({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "31-abonnement-formulaire-vide");

	await browser.close();
	if (errors.length) {
		await writeFile(
			path.join(OUT_DIR, "capture-fix-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
		for (const e of errors) console.log(e);
	}
	console.log("✅ Re-captures Résidence terminées.");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
