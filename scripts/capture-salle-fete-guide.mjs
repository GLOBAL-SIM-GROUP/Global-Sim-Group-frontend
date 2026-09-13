/**
 * Capture Playwright des pages du module Salle de fête pour le guide
 * utilisateur `docs/guides-utilisation/salle-fete/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Crée une vraie réservation « Guide-* » dans le mois courant
 * (visible sur le calendrier) et la confirme (encaissement réel du solde).
 * Les captures sont fullPage, viewport 1440x900, et vont dans
 * `docs/guides-utilisation/salle-fete/screenshots/salle-fete/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/salle-fete/screenshots/salle-fete)
 *
 * Usage : node scripts/capture-salle-fete-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/salle-fete/screenshots/salle-fete";

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

/** Une date dans le mois courant (jour 20 si possible), format YYYY-MM-DD. */
function dateDansMois() {
	const d = new Date();
	const jour = Math.min(20, new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate());
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(jour).padStart(2, "0")}`;
}

/** Choisit un client via le champ de recherche (ou le crée en inline). */
async function choisirClient(page) {
	const champ = page.locator("#client-recherche");
	await champ.fill("Guide");
	await page.waitForTimeout(1500);
	const premierResultat = page.locator("ul.divide-y li button").first();
	if (await premierResultat.isVisible().catch(() => false)) {
		await premierResultat.click();
		await page.waitForTimeout(400);
		return;
	}
	// Aucun client trouvé → création inline.
	await page.getByRole("button", { name: "Créer un client" }).click();
	await page.waitForTimeout(600);
	await page.locator("#nom").fill("Guide-Fête");
	await page.locator("#prenoms").fill("Client");
	await page.locator("#telPrincipal").fill("+2250700000000");
	await page.getByRole("button", { name: "Créer", exact: true }).click();
	await page.waitForTimeout(2000);
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

	// --- Liste des réservations -------------------------------------------
	await page.goto(`${BASE_URL}/salle-fete/reservations`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "01-reservations-liste");

	// Filtre « Statut » ouvert.
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	await statutTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "02-filtre-statut-ouvert");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// --- Nouvelle réservation ---------------------------------------------
	await page
		.getByRole("button", { name: "Nouvelle réservation" })
		.click();
	await page.waitForTimeout(1000);
	await capture(page, "03-nouvelle-reservation-vide");

	await choisirClient(page);
	await capture(page, "04-reservation-client-choisi");

	// Remplir les champs.
	await page.locator("#dateEvenement").fill(dateDansMois());
	await page.locator("#heureDebut").fill("14:00");
	await page.locator("#duree").fill("5");
	await page.locator("#typeManifestation").fill("Mariage Guide");
	await page.locator("#tarif").fill("150000");
	await page.locator("#acompte").fill("50000");
	await page
		.locator("#observations")
		.fill("Salle décorée en blanc et doré.");
	await capture(page, "05-reservation-remplie");

	// Soumettre : la réservation apparaît dans la liste.
	await page
		.getByRole("button", { name: "Enregistrer", exact: true })
		.click();
	await page.waitForTimeout(2500);
	await capture(page, "06-reservation-creee");

	// --- Fiche réservation -------------------------------------------------
	const lienReservation = page.locator("table tbody tr td a").first();
	await lienReservation.click();
	await page.waitForURL("**/salle-fete/reservations/**", {
		timeout: 15000,
	});
	await waitForLoad(page);
	await capture(page, "07-fiche-reservation");

	// Fenêtre « Confirmer la réservation » (encaissement).
	const confirmerBouton = page.getByRole("button", {
		name: /Confirmer \(encaisser\)/,
	});
	if (await confirmerBouton.isVisible().catch(() => false)) {
		await confirmerBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "08-confirmer-dialog");
		// Valider réellement : la réservation passe « Confirmée » et le
		// paiement apparaît dans le tableau des paiements de la fiche.
		await page
			.getByRole("button", { name: "Confirmer", exact: true })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "09-fiche-confirmee");
	}

	// Fenêtre « Réaliser la réservation » (solde restant) — capturée puis
	// annulée pour garder la réservation « Confirmée ».
	const realiserBouton = page.getByRole("button", {
		name: /Réaliser \(encaisser le solde\)/,
	});
	if (await realiserBouton.isVisible().catch(() => false)) {
		await realiserBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "10-realiser-dialog");
		await page
			.getByRole("button", { name: "Annuler", exact: true })
			.last()
			.click();
		await page.waitForTimeout(500);
	}

	// --- Calendrier -------------------------------------------------------
	await page.goto(`${BASE_URL}/salle-fete/calendrier`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "11-calendrier");

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
	await mpage.goto(`${BASE_URL}/salle-fete/reservations`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "12-reservations-mobile");

	await mpage.goto(`${BASE_URL}/salle-fete/calendrier`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "13-calendrier-mobile");

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures module Salle de fête terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
