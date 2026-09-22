/**
 * Complément de capture Pressing — demandes portail EN_ATTENTE + catalogue
 * (2026-09-21).
 *
 * Une demande « Guide » EN_ATTENTE doit exister (créée via
 * `POST /pressing/portail/commandes` avec un compte client). Le script la
 * valide réellement (chiffrage → DEPOSE).
 *
 * Usage : node scripts/capture-pressing-portail.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/pressing/screenshots/pressing";

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
	await page.waitForURL("**/home", { timeout: 30000 });
	await waitForLoad(page);
}

async function gotoAuth(page, url) {
	await page.goto(url, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(1000);
	if (page.url().includes("/login")) {
		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page
			.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 })
			.catch(() => {});
		await page.goto(url, { waitUntil: "domcontentloaded" });
	}
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

	// --- Catalogue -------------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/pressing/catalogue`);
	await page
		.waitForSelector("text=/Types de vêtement|Prestations/", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1000);
	await capture(page, "18-catalogue");

	// --- Liste : repérer la demande EN_ATTENTE ---------------------------
	await gotoAuth(page, `${BASE_URL}/pressing/commandes`);
	await page
		.waitForSelector("table tbody tr", { timeout: 20000 })
		.catch(() => {});
	// Filtre statut « En attente de validation » pour isoler la demande.
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	await statutTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "02-filtre-statut-ouvert");
	await page
		.getByRole("option", { name: /En attente/ })
		.first()
		.click()
		.catch(async () => {
			await page.keyboard.press("Escape");
		});
	await page.waitForTimeout(1500);
	await capture(page, "19-demandes-attente");

	// --- Valider la demande (chiffrage) ----------------------------------
	const validerBtn = page
		.getByRole("button", { name: /Valider et chiffrer/ })
		.first();
	if (await validerBtn.isVisible().catch(() => false)) {
		await validerBtn.click();
		await page.waitForTimeout(1500);
		// Chiffrer les lignes (tarif par article, mode à la pièce par défaut).
		const tarifs = page.getByPlaceholder("Tarif (FCFA)");
		const n = await tarifs.count();
		for (let i = 0; i < n; i++) {
			await tarifs.nth(i).fill(i === 0 ? "3000" : "800");
		}
		const dateRetrait = page.locator(
			'input[type="date"], #demande-retrait, [id*="retrait"]',
		);
		if (await dateRetrait.first().isVisible().catch(() => false)) {
			const d = new Date();
			d.setDate(d.getDate() + 2);
			await dateRetrait.first().fill(d.toISOString().slice(0, 10));
		}
		await capture(page, "20-valider-demande");
		// Valider pour de vrai → DEPOSE.
		await page
			.getByRole("button", { name: /Valider|Confirmer|Enregistrer/ })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "21-demande-validee");
	} else {
		console.log("⚠ Aucune demande EN_ATTENTE trouvée — captures sautées");
	}

	await browser.close();
	if (errors.length > 0) {
		console.log("\n--- Erreurs ---");
		for (const e of errors) console.log(e);
		await writeFile(
			path.join(OUT_DIR, "capture-portail-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
	}
	console.log("✅ Captures Pressing (portail) terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
