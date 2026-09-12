/**
 * Capture Playwright des pages du module Pressing pour le guide utilisateur
 * `docs/guides-utilisation/pressing/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Crée une vraie commande « Guide-* » (client existant recherché,
 * ou créé en inline si aucun résultat). Les captures sont fullPage,
 * viewport 1440x900, et vont dans
 * `docs/guides-utilisation/pressing/screenshots/pressing/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/pressing/screenshots/pressing)
 *
 * Usage : node scripts/capture-pressing-guide.mjs
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
	await page.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(page);
}

/** Date du lendemain au format YYYY-MM-DD (input type="date"). */
function demain() {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
}

/** Choisit un client via le champ de recherche, ou le crée en inline. */
async function choisirClient(page) {
	const champ = page.locator("#client-recherche");
	await champ.fill("Guide");
	await page.waitForTimeout(1500);
	const premierResultat = page
		.locator("ul.divide-y li button")
		.first();
	if (await premierResultat.isVisible().catch(() => false)) {
		await premierResultat.click();
		return;
	}
	// Aucun client trouvé → création inline.
	await page.getByRole("button", { name: "Créer un client" }).click();
	await page.waitForTimeout(600);
	await page.locator("#nom").fill("Guide-Pressing");
	await page.locator("#prenoms").fill("Client");
	await page.locator("#telPrincipal").fill("+2250700000000");
	// Type « Passage » : trigger id="typeClient", item index 1.
	await page.locator("#typeClient").click();
	await page.waitForTimeout(1200);
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("Enter");
	await page.waitForTimeout(400);
	await page.getByRole("button", { name: "Créer", exact: true }).click();
	await page.waitForTimeout(2000);
}

/** Remplit la première ligne d'article du formulaire de dépôt. */
async function remplirArticle(page) {
	await page
		.getByPlaceholder("Type de vêtement (ex : Chemise)")
		.first()
		.fill("Chemise");
	await page
		.getByPlaceholder("Prestation (ex : Repassage)")
		.first()
		.fill("Lavage + Repassage");
	await page
		.locator('input[aria-label="Quantité"]')
		.first()
		.fill("2");
	await page
		.getByPlaceholder("Tarif (FCFA)")
		.first()
		.fill("1500");
	await page.locator("#commande-retrait").fill(demain());
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

	// --- Liste des commandes -------------------------------------------
	await page.goto(`${BASE_URL}/pressing/commandes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "01-commandes-liste");

	// Filtre « Statut » ouvert.
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	await statutTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await capture(page, "02-filtre-statut-ouvert");
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);

	// Recherche texte (décorative, sans valider).
	await page
		.locator('input[aria-label="Rechercher une commande"]')
		.fill("CMD");
	await page.waitForTimeout(1200);
	await capture(page, "03-filtre-recherche");
	await page
		.locator('input[aria-label="Rechercher une commande"]')
		.fill("");
	await page.waitForTimeout(1200);

	// --- Nouvelle commande ----------------------------------------------
	await page
		.getByRole("button", { name: "Nouvelle commande" })
		.click();
	await page.waitForTimeout(1000);
	await capture(page, "04-nouvelle-commande-vide");

	await choisirClient(page);
	await capture(page, "05-commande-client-choisi");

	await remplirArticle(page);
	// Acompte + moyen de paiement (si des moyens existent).
	const moyenTrigger = page.locator("#commande-moyen");
	if (await moyenTrigger.isVisible().catch(() => false)) {
		await page.locator("#commande-acompte").fill("2000");
		await moyenTrigger.click();
		await page.waitForTimeout(1200);
		await page.keyboard.press("Enter");
		await page.waitForTimeout(400);
	}
	await capture(page, "06-commande-remplie");

	// Soumettre : la modale se ferme, la commande apparaît dans la liste.
	await page.getByRole("button", { name: "Enregistrer" }).click();
	await page.waitForTimeout(2500);
	await capture(page, "07-commande-creee");

	// --- Fiche commande --------------------------------------------------
	// Ouvre la première commande de la liste (lien numéro de commande).
	const lienCommande = page
		.locator("table tbody tr td a")
		.first();
	await lienCommande.click();
	await page.waitForURL("**/pressing/commandes/**", { timeout: 15000 });
	await waitForLoad(page);
	await capture(page, "08-fiche-commande");

	// Menu « Reçu de dépôt » (dropdown : 58 mm / 80 mm / paramètres).
	const recuBouton = page
		.getByRole("button", { name: /Reçu de dépôt/i })
		.first();
	if (await recuBouton.isVisible().catch(() => false)) {
		await recuBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "09-recu-depot-menu");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// Passage « En traitement » (si la commande est au statut Déposé).
	const passerTraitement = page.getByRole("button", {
		name: "Passer en traitement",
	});
	if (await passerTraitement.isVisible().catch(() => false)) {
		await passerTraitement.click();
		await page.waitForTimeout(2000);
		await capture(page, "10-fiche-en-traitement");
	}

	// Passage « Prêt » (si la commande est En traitement).
	const passerPret = page.getByRole("button", {
		name: /Passer en « Prêt »/,
	});
	if (await passerPret.isVisible().catch(() => false)) {
		await passerPret.click();
		await page.waitForTimeout(2000);
		await capture(page, "11-fiche-pret");
	}

	// Modale « Retirer » (solde restant > 0).
	const retirerBouton = page.getByRole("button", {
		name: "Retirer",
		exact: true,
	});
	if (await retirerBouton.isVisible().catch(() => false)) {
		await retirerBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "12-retrait-dialog");
		await page
			.getByRole("button", { name: "Annuler" })
			.click();
		await page.waitForTimeout(500);
	}

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
	await mpage.goto(`${BASE_URL}/pressing/commandes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await capture(mpage, "13-commandes-mobile");

	const mLien = mpage.locator("table tbody tr td a").first();
	if (await mLien.isVisible().catch(() => false)) {
		await mLien.click();
		await mpage.waitForURL("**/pressing/commandes/**", {
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
	console.log("✅ Captures module Pressing terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
