/**
 * Capture Playwright des pages du module Facturation pour le guide
 * utilisateur `docs/guides-utilisation/facturation/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Crée une vraie facture ponctuelle partiellement payée, puis
 * encaisse le solde (statut Partielle → Payée). Les captures sont fullPage,
 * viewport 1440x900, et vont dans
 * `docs/guides-utilisation/facturation/screenshots/facturation/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/facturation/screenshots/facturation)
 *
 * Usage : node scripts/capture-facturation-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/facturation/screenshots/facturation";

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

/**
 * Ouvre un Select Radix puis choisit le premier item au clavier
 * (ArrowDown surligne le premier, Enter valide). Plus fiable que le clic
 * sur l'item, qui peut être instable/détaché pendant l'animation.
 */
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

/** Choisit un client via le champ de recherche (saute si rien trouvé). */
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

	// --- Liste des factures ---------------------------------------------
	await page.goto(`${BASE_URL}/facturation/factures`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "01-factures-liste");

	// Filtre « Statut » ouvert.
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	await statutTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "02-filtre-statut-ouvert");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Filtre « Source » ouvert.
	const sourceTrigger = page.locator('button[aria-label="Source"]');
	await sourceTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "03-filtre-source-ouvert");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// --- Nouvelle facture ponctuelle -------------------------------------
	await page
		.getByRole("button", { name: "Nouvelle facture ponctuelle" })
		.click();
	await page.waitForTimeout(1000);
	await capture(page, "04-nouvelle-facture-vide");

	// Choisir une prestation (remplit le montant automatiquement).
	const prestationTrigger = page.locator('button[aria-label="Prestation"]');
	await prestationTrigger.click();
	await page.waitForTimeout(1200);
	await capture(page, "05-facture-prestation-ouvert");
	await page.keyboard.press("ArrowDown"); // surligne le premier item
	await page.keyboard.press("Enter"); // le choisit
	await page.waitForTimeout(500);

	await choisirClient(page);
	// Refermer tout reste de liste déroulante en cliquant le titre de la
	// modale (pas d'Escape : il fermerait la modale Radix entière).
	await page
		.getByRole("heading", { name: "Nouvelle facture ponctuelle" })
		.click();
	await page.waitForTimeout(400);

	// Payer partiellement (la moitié du montant auto-rempli) pour obtenir
	// une facture « Partielle » et montrer l'encaissement du solde après.
	const montantInput = page.locator("#montant");
	const montantAuto = await montantInput.inputValue().catch(() => "");
	const moitie = Math.max(1, Math.round((Number(montantAuto) || 1000) / 2));
	await montantInput.fill(String(moitie));
	console.log(`montant auto=${montantAuto} → payé=${moitie}`);

	// Moyen de paiement.
	await ouvrirEtChoisirPremier(
		page,
		page.locator('button[aria-label="Moyen de paiement"]'),
	);

	await capture(page, "06-facture-remplie");

	// Facturer : la fiche de la facture créée s'ouvre.
	await page.getByRole("button", { name: "Facturer" }).click();
	const navigated = await page
		.waitForURL("**/facturation/factures/*", { timeout: 15000 })
		.then(() => true)
		.catch(() => false);
	if (!navigated) {
		await capture(page, "debug-facturer-echec");
		throw new Error(
			"La création de la facture n'a pas ouvert la fiche (voir debug-facturer-echec.png).",
		);
	}
	// Attendre la fiche chargée.
	await page
		.getByText("Fiche facture", { exact: false })
		.first()
		.waitFor({ state: "visible", timeout: 20000 })
		.catch(() => {});
	await waitForLoad(page);
	await capture(page, "07-fiche-facture");

	// Menu « Ticket » (58 mm / 80 mm).
	const ticketBouton = page
		.getByRole("button", { name: "Ticket", exact: true })
		.first();
	if (await ticketBouton.isVisible().catch(() => false)) {
		await ticketBouton.click();
		await page.waitForTimeout(800);
		await capture(page, "08-ticket-menu");
		// Le menu Ticket est un simple div : il ne se ferme que par un
		// second clic sur le bouton (pas d'Escape ni de clic dehors).
		await ticketBouton.click();
		await page.waitForTimeout(400);
	}

	// Encaisser le solde : « Enregistrer un paiement ».
	const encaisserBouton = page.getByRole("button", {
		name: "Enregistrer un paiement",
	});
	if (await encaisserBouton.isVisible().catch(() => false)) {
		await encaisserBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "09-paiement-dialog");
		await page
			.getByRole("button", { name: "Encaisser", exact: true })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "10-fiche-payee");
	} else {
		console.log("⚠️ Bouton « Enregistrer un paiement » absent — facture déjà payée ?");
	}

	// --- Catalogue des prestations ---------------------------------------
	await page.goto(`${BASE_URL}/facturation/prestations`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "11-prestations");

	const ajouterPrestation = page.getByRole("button", {
		name: "Ajouter une prestation",
	});
	if (await ajouterPrestation.isVisible().catch(() => false)) {
		await ajouterPrestation.click();
		await page.waitForTimeout(800);
		await capture(page, "12-prestation-form");
		await page
			.getByRole("button", { name: "Annuler" })
			.click();
		await page.waitForTimeout(500);
	}

	// --- Vue mobile (320 px) ----------------------------------------------
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
	await mpage.goto(`${BASE_URL}/facturation/factures`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "13-factures-mobile");

	const mLien = mpage.locator("table tbody tr td a").first();
	if (await mLien.isVisible().catch(() => false)) {
		await mLien.click();
		await mpage.waitForURL("**/facturation/factures/*", {
			timeout: 15000,
		});
		await waitForLoad(mpage);
		await capture(mpage, "14-fiche-mobile");
	}

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures module Facturation terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
