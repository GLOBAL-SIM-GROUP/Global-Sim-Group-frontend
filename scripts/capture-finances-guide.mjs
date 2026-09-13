/**
 * Capture Playwright des pages du module Finances pour le guide utilisateur
 * `docs/guides-utilisation/finances/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Ne crée qu'une dépense de test « Guide — … » si le formulaire
 * aboutit (la caisse peut être fermée : l'erreur éventuelle est capturée).
 * Captures fullPage, viewport 1440x900 + mobile 320 px, dans
 * `docs/guides-utilisation/finances/screenshots/finances/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/finances/screenshots/finances)
 *
 * Usage : node scripts/capture-finances-guide.mjs
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

/** Ouvre un Select Radix et choisit le premier item au clavier. */
async function ouvrirEtChoisirPremier(page, triggerLocator) {
	const clique = await triggerLocator
		.click({ timeout: 8000 })
		.then(() => true)
		.catch(() => false);
	if (!clique) {
		await triggerLocator.focus();
		await page.keyboard.press("Enter");
	}
	await page.waitForTimeout(1200);
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("Enter");
	await page.waitForTimeout(500);
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

	// --- Tableau de bord financier ----------------------------------------
	await page.goto(`${BASE_URL}/finances/tableau-de-bord`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "01-tdb");

	// Filtre « Période » ouvert.
	const periodeTrigger = page.locator("#tableau-bord-filtre-periode");
	await periodeTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "02-tdb-periode-ouvert");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Filtre « Activité » ouvert.
	const activiteTrigger = page.locator("#tableau-bord-filtre-activite");
	await activiteTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "03-tdb-activite-ouvert");
	// Choisir « Pressing » pour montrer le résumé par activité.
	await page
		.locator('[data-slot="select-item"]', { hasText: "Pressing" })
		.click()
		.catch(async () => {
			await page.keyboard.press("Escape");
		});
	await page.waitForTimeout(2000);
	await capture(page, "04-tdb-activite-resume");

	// Revenir à « Global ».
	await activiteTrigger.click();
	await page.waitForTimeout(1200);
	await page
		.locator('[data-slot="select-item"]', { hasText: "Global" })
		.first()
		.click()
		.catch(async () => {
			await page.keyboard.press("Escape");
		});
	await page.waitForTimeout(2000);

	// Modale « Détails par activité ».
	const detailsBtn = page.getByRole("button", { name: "Détails par activité" });
	if (
		(await detailsBtn.isVisible().catch(() => false)) &&
		(await detailsBtn.isEnabled().catch(() => false))
	) {
		await detailsBtn.click();
		await page.waitForTimeout(1500);
		await capture(page, "05-tdb-details-activite");
		await page
			.getByRole("button", { name: "Fermer" })
			.click()
			.catch(() => {});
		await page.waitForTimeout(400);
	}

	// --- Encaissements -----------------------------------------------------
	await page.goto(`${BASE_URL}/finances/encaissements`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "06-encaissements");

	// Filtre « Type de paiement » ouvert.
	const typeTrigger = page.locator('button[aria-label="Type de paiement"]');
	if (await typeTrigger.isVisible().catch(() => false)) {
		await typeTrigger.click();
		await page.waitForTimeout(1200);
		await capture(page, "07-encaissements-type-ouvert");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// --- Dépenses -----------------------------------------------------------
	await page.goto(`${BASE_URL}/finances/depenses`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "08-depenses");

	const ajouterDepense = page.getByRole("button", {
		name: "Ajouter une dépense",
	});
	if (await ajouterDepense.isVisible().catch(() => false)) {
		await ajouterDepense.click();
		await page.waitForTimeout(800);
		await capture(page, "09-depense-form-vide");

		// Remplir : libellé, montant, première catégorie.
		await page.locator("#libelle").fill("Guide — Achat de fournitures");
		await page.locator("#montant").fill("5000");
		await ouvrirEtChoisirPremier(
			page,
			page.locator('button[aria-label="Catégorie de dépense"]'),
		);
		await capture(page, "10-depense-form-remplie");

		// Soumettre : succès → retour liste ; caisse fermée → alerte orange.
		await page
			.getByRole("button", { name: "Enregistrer", exact: true })
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "11-depense-resultat");
		// Si la modale est encore ouverte (erreur caisse fermée), la fermer.
		await page
			.getByRole("button", { name: "Annuler" })
			.click()
			.catch(() => {});
		await page.waitForTimeout(400);
	}

	// --- Impayés -------------------------------------------------------------
	await page.goto(`${BASE_URL}/finances/impayes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "12-impayes");

	const typeImpaye = page.locator('button[aria-label="Type d\'impayé"]');
	if (await typeImpaye.isVisible().catch(() => false)) {
		await typeImpaye.click();
		await page.waitForTimeout(1200);
		await capture(page, "13-impayes-type-ouvert");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// --- Moyens de paiement ---------------------------------------------------
	await page.goto(`${BASE_URL}/finances/moyens-paiement`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "14-moyens-paiement");

	const ajouterMoyen = page.getByRole("button", {
		name: /Ajouter un moyen/,
	});
	if (await ajouterMoyen.isVisible().catch(() => false)) {
		await ajouterMoyen.click();
		await page.waitForTimeout(800);
		await capture(page, "15-moyen-form");
		await page
			.getByRole("button", { name: "Annuler" })
			.click()
			.catch(() => {});
		await page.waitForTimeout(400);
	}

	// --- Catégories de dépenses -----------------------------------------------
	await page.goto(`${BASE_URL}/finances/categories-depenses`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "16-categories-depenses");

	const ajouterCategorie = page.getByRole("button", {
		name: /Ajouter/,
	});
	if (await ajouterCategorie.isVisible().catch(() => false)) {
		await ajouterCategorie.click();
		await page.waitForTimeout(800);
		await capture(page, "17-categorie-form");
		await page
			.getByRole("button", { name: "Annuler" })
			.click()
			.catch(() => {});
		await page.waitForTimeout(400);
	}

	// --- Caisses ---------------------------------------------------------------
	await page.goto(`${BASE_URL}/finances/caisses`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "18-caisses");

	const nouvelleCaisse = page.getByRole("button", { name: "Nouvelle caisse" });
	if (await nouvelleCaisse.isVisible().catch(() => false)) {
		await nouvelleCaisse.click();
		await page.waitForTimeout(800);
		await capture(page, "19-caisse-form");
		await page
			.getByRole("button", { name: "Annuler" })
			.click()
			.catch(() => {});
		await page.waitForTimeout(400);
	}

	// --- Ma caisse (tableau de bord caissier) -----------------------------------
	await page.goto(`${BASE_URL}/finances/caissier/dashboard`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "20-ma-caisse");
	// Admin : plusieurs caisses → choisir la première pour voir le tableau.
	const premiereCaisse = page
		.locator("button", { hasText: /Caisse/i })
		.first();
	if (await premiereCaisse.isVisible().catch(() => false)) {
		await premiereCaisse.click();
		await page.waitForTimeout(2000);
		await capture(page, "21-ma-caisse-dashboard");
	}

	// --- Revenus par employé -----------------------------------------------------
	await page.goto(`${BASE_URL}/finances/revenus-utilisateur`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	// Admin : choisir une caisse dans le select natif pour charger les données.
	const selectCaisse = page.locator("#revenus-filtre-caisse");
	if (await selectCaisse.isVisible().catch(() => false)) {
		const premiereValeur = await selectCaisse
			.locator("option")
			.nth(1)
			.getAttribute("value")
			.catch(() => null);
		if (premiereValeur) {
			await selectCaisse.selectOption(premiereValeur);
			await page.waitForTimeout(2000);
		}
	}
	await capture(page, "22-revenus-employe");

	// --- Vue mobile (320 px) ------------------------------------------------------
	await context.close();
	const mobileContext = await browser.newContext({
		viewport: { width: 320, height: 700 },
		deviceScaleFactor: 2,
	});
	const mpage = await mobileContext.newPage();
	mpage.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console:mobile] ${msg.text()}`);
	});

	await login(mpage);
	await mpage.goto(`${BASE_URL}/finances/tableau-de-bord`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "23-tdb-mobile");

	await mpage.goto(`${BASE_URL}/finances/impayes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "24-impayes-mobile");

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures module Finances terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
