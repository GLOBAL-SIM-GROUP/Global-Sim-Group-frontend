/**
 * Capture Playwright des pages du module Rapports pour le guide utilisateur
 * `docs/guides-utilisation/rapports/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Les captures sont fullPage, viewport 1440x900, et vont dans
 * `docs/guides-utilisation/rapports/screenshots/rapports/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/rapports/screenshots/rapports)
 *
 * Usage : node scripts/capture-rapports-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/rapports/screenshots/rapports";

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

/** Clique sur un item d'un Select Radix via le clavier (plus fiable). */
async function selectViaKeyboard(page, triggerSelector, itemIndex) {
	await page.locator(triggerSelector).click({ timeout: 10000 });
	await page.waitForTimeout(1500);
	for (let i = 0; i < itemIndex; i++) {
		await page.keyboard.press("ArrowDown");
		await page.waitForTimeout(150);
	}
	await page.keyboard.press("Enter");
	await page.waitForTimeout(800);
}

/** Scroll vers un heading h2 puis capture. */
async function captureSection(page, headingText, captureName) {
	const heading = page.locator("h2", { hasText: headingText }).first();
	const count = await heading.count();
	if (count === 0) {
		console.log(`⚠️ Section "${headingText}" introuvable, capture sautée`);
		return;
	}
	await heading.scrollIntoViewIfNeeded();
	await page.waitForTimeout(600);
	await capture(page, captureName);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });

	// --- Connexion -----------------------------------------------------
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});
	const page = await context.newPage();
	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
	});
	page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitForLoad(page);
	await page.locator('input[name="login"]').fill(LOGIN);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(page);

	// --- Page d'entrée : Rapports --------------------------------------
	await page.goto(`${BASE_URL}/rapports`, { waitUntil: "domcontentloaded" });
	await waitForLoad(page);
	await capture(page, "01-rapports-page");

	// Ouvrir le sélecteur de type de rapport.
	const typeTrigger = page.locator(
		'button[aria-label="Type de rapport"]',
	);
	await typeTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1500);
	await capture(page, "02-rapports-type-ouvert");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Ouvrir le sélecteur de période.
	const periodeTrigger = page.locator('button[aria-label="Période"]');
	await periodeTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1500);
	await capture(page, "03-rapports-periode-ouvert");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Période personnalisée : montrer les champs de date.
	await selectViaKeyboard(page, 'button[aria-label="Période"]', 3);
	await page.waitForTimeout(500);
	await capture(page, "04-rapports-periode-personnalisee");

	// Remplir les dates personnalisées.
	const duInput = page.locator('input[aria-label="Début de période"]');
	const auInput = page.locator('input[aria-label="Fin de période"]');
	if (await duInput.isVisible().catch(() => false)) {
		await duInput.fill("2026-01-01");
		await auInput.fill("2026-12-31");
		await page.waitForTimeout(400);
		await capture(page, "05-rapports-periode-remplie");
	}

	// Revenir à « Ce mois ».
	await selectViaKeyboard(page, 'button[aria-label="Période"]', 0);

	// --- Générer le rapport de synthèse globale ------------------------
	// Type = "synthese" (déjà par défaut), période = "Ce mois".
	await page.getByRole("button", { name: /Générer le rapport/i }).click();
	await page.waitForURL("**/rapports/synthese-globale**", { timeout: 15000 });
	await waitForLoad(page);
	await capture(page, "06-synthese-globale");

	// Boutons d'export visibles.
	await captureSection(page, "Recettes par activité", "07-synthese-recettes-activite");

	// --- Rapport financier ---------------------------------------------
	await page.goto(`${BASE_URL}/rapports/financier`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "08-rapport-financier");

	await captureSection(page, /Encaissements/, "09-financier-encaissements");
	await captureSection(page, /Dépenses/, "10-financier-depenses");
	await captureSection(page, /Impayés/, "11-financier-impayes");

	// --- Rapport RH -----------------------------------------------------
	await page.goto(`${BASE_URL}/rapports/rh`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "12-rapport-rh");

	await captureSection(page, "Synthèse de la paie", "13-rh-synthese-paie");

	// --- Rapport d'activité : Résidence --------------------------------
	await page.goto(
		`${BASE_URL}/rapports/activites/LOCATION_RESIDENTIEL`,
		{ waitUntil: "domcontentloaded" },
	);
	await waitForLoad(page);
	await capture(page, "14-rapport-activite-residence");

	await captureSection(
		page,
		"Indicateurs de l'activité",
		"15-activite-indicateurs",
	);
	await captureSection(
		page,
		"Locataires ayant payé leur loyer",
		"16-activite-payeurs-loyer",
	);

	// --- Rapport d'activité : Market -----------------------------------
	await page.goto(
		`${BASE_URL}/rapports/activites/VENTE_MARCHANDISES`,
		{ waitUntil: "domcontentloaded" },
	);
	await waitForLoad(page);
	await capture(page, "17-rapport-activite-market");

	// --- Rapport d'activité : Pressing ---------------------------------
	await page.goto(`${BASE_URL}/rapports/activites/PRESSING`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "18-rapport-activite-pressing");

	// --- Rapport d'activité : Restaurant --------------------------------
	await page.goto(`${BASE_URL}/rapports/activites/RESTAURATION`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "19-rapport-activite-restaurant");

	// --- Rapport d'activité : Salle de fête -----------------------------
	await page.goto(`${BASE_URL}/rapports/activites/SALLE_FETE`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "20-rapport-activite-salle-fete");

	// --- Vue mobile (320 px) -------------------------------------------
	await context.close();
	const mobileContext = await browser.newContext({
		viewport: { width: 320, height: 700 },
		deviceScaleFactor: 2,
	});
	const mpage = await mobileContext.newPage();
	mpage.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console:mobile] ${msg.text()}`);
	});

	await mpage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitForLoad(mpage);
	await mpage.locator('input[name="login"]').fill(LOGIN);
	await mpage.locator('input[name="motDePasse"]').fill(PASSWORD);
	await mpage.getByRole("button", { name: "Se connecter" }).click();
	await mpage.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(mpage);

	await mpage.goto(`${BASE_URL}/rapports`, { waitUntil: "domcontentloaded" });
	await waitForLoad(mpage);
	await capture(mpage, "21-rapports-mobile");

	await mpage.goto(`${BASE_URL}/rapports/synthese-globale`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "22-synthese-globale-mobile");

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures module Rapports terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
