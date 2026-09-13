/**
 * Capture Playwright des pages du module Restaurant pour le guide utilisateur
 * `docs/guides-utilisation/restaurant/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Crée un vrai plat « Guide-* » et une vraie commande. Les captures
 * sont fullPage, viewport 1440x900, et vont dans
 * `docs/guides-utilisation/restaurant/screenshots/restaurant/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/restaurant/screenshots/restaurant)
 *
 * Usage : node scripts/capture-restaurant-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/restaurant/screenshots/restaurant";

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

/** Sélectionne le premier item d'un Select Radix via le clavier. */
async function selectFirst(page, triggerLocator) {
	await triggerLocator.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await page.keyboard.press("Enter");
	await page.waitForTimeout(500);
}

/** Choisit un client via le champ de recherche (optionnel : saute si rien). */
async function choisirClient(page) {
	const champ = page.locator("#client-recherche");
	if (!(await champ.isVisible().catch(() => false))) return;
	await champ.fill("Guide");
	await page.waitForTimeout(1500);
	const premierResultat = page.locator("ul.divide-y li button").first();
	if (await premierResultat.isVisible().catch(() => false)) {
		await premierResultat.click();
		await page.waitForTimeout(400);
	}
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

	// --- Carte des plats ------------------------------------------------
	await page.goto(`${BASE_URL}/restaurant/plats`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await page.waitForTimeout(1500); // images des plats
	await capture(page, "01-plats-carte");

	// Filtre « Catégorie » ouvert.
	const catTrigger = page.locator('button[aria-label="Catégorie"]');
	await catTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "02-plats-filtre-categorie");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Modale « Ajouter un plat ».
	await page.getByRole("button", { name: "Ajouter un plat" }).click();
	await page.waitForTimeout(1000);
	await capture(page, "03-plat-form-vide");

	// Remplir le formulaire plat.
	await page.locator("#nom").fill("Guide-Attiéké poisson");
	const catField = page.locator("#id_categorie_plat");
	if (await catField.isVisible().catch(() => false)) {
		await selectFirst(page, catField);
	}
	await page.locator("#prix").fill("3500");
	await page.locator("#description").fill("Servi avec riz et sauce tomate");
	await capture(page, "04-plat-form-rempli");

	// Soumettre : la modale se ferme, le plat apparaît sur la carte.
	await page
		.getByRole("button", { name: "Enregistrer", exact: true })
		.click();
	await page.waitForTimeout(2500);
	await capture(page, "05-plat-cree");

	// --- Commandes ------------------------------------------------------
	await page.goto(`${BASE_URL}/restaurant/commandes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "06-commandes-liste");

	// Filtre « Statut » ouvert.
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	await statutTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "07-commandes-filtre-statut");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Filtre « Type » ouvert.
	const typeTrigger = page.locator('button[aria-label="Type"]');
	await typeTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "08-commandes-filtre-type");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Modale « Nouvelle commande ».
	await page.getByRole("button", { name: "Nouvelle commande" }).click();
	await page.waitForTimeout(1000);
	await capture(page, "09-commande-form-vide");

	// Type de commande (choisir « À emporter » pour illustrer).
	const typeCommande = page.locator("#commande-type");
	await typeCommande.click();
	await page.waitForTimeout(1200);
	await capture(page, "10-commande-type-ouvert");
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("Enter");
	await page.waitForTimeout(500);

	await choisirClient(page);

	// Choisir un plat dans la première ligne.
	const platTrigger = page.locator('button[aria-label="Plat"]').first();
	await platTrigger.click();
	await page.waitForTimeout(1200);
	await capture(page, "11-commande-plat-ouvert");
	await page.keyboard.press("Enter");
	await page.waitForTimeout(500);
	await page.locator('input[aria-label="Quantité"]').first().fill("2");

	// Moyen de paiement.
	const moyenTrigger = page.locator("#commande-moyen");
	if (await moyenTrigger.isVisible().catch(() => false)) {
		await selectFirst(page, moyenTrigger);
	}
	await capture(page, "12-commande-remplie");

	// Valider : la commande apparaît dans la liste.
	await page.getByRole("button", { name: "Valider la commande" }).click();
	await page.waitForTimeout(2500);
	await capture(page, "13-commande-creee");

	// Modale « Voir la facture » (icône œil de la première ligne).
	const voirFacture = page
		.getByRole("button", { name: "Voir la facture" })
		.first();
	if (await voirFacture.isVisible().catch(() => false)) {
		await voirFacture.click();
		await page.waitForTimeout(1500);
		await capture(page, "14-facture-dialog");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);
	}

	// Avancer le statut de la première commande (icône « Passer en… »).
	const avancer = page
		.locator('button[title^="Passer en"]')
		.first();
	if (await avancer.isVisible().catch(() => false)) {
		await avancer.click();
		await page.waitForTimeout(2000);
		await capture(page, "15-statut-avance");
	}

	// Modale de confirmation « Annuler la commande » (icône X).
	const annulerBouton = page
		.getByRole("button", { name: "Annuler", exact: true })
		.first();
	if (await annulerBouton.isVisible().catch(() => false)) {
		await annulerBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "16-annuler-dialog");
		await page.getByRole("button", { name: "Fermer" }).click();
		await page.waitForTimeout(500);
	}

	// --- Statistiques ---------------------------------------------------
	await page.goto(`${BASE_URL}/restaurant/statistiques`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	// Période large pour avoir des données : année courante.
	await page
		.locator('input[aria-label="Début de période"]')
		.fill("2026-01-01");
	await page
		.locator('input[aria-label="Fin de période"]')
		.fill("2026-12-31");
	await page.waitForTimeout(2000);
	await capture(page, "17-statistiques");

	// --- Vue mobile (320 px) ---------------------------------------------
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
	await mpage.goto(`${BASE_URL}/restaurant/plats`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await mpage.waitForTimeout(1500);
	await capture(mpage, "18-plats-mobile");

	await mpage.goto(`${BASE_URL}/restaurant/commandes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "19-commandes-mobile");

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures module Restaurant terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
