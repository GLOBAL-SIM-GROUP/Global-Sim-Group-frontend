/**
 * Complément de capture Pressing — tarification au kilo (2026-09-16).
 *
 * Recapture les figures modifiées par le nouveau formulaire de dépôt
 * (radio « Tarification », plus d'acompte) et couvre la nouvelle page
 * « Tarif au kilo » (`PRESSING.GERER_TARIFS`) ainsi qu'une commande POIDS
 * (colonne « POIDS (KG) » sur la fiche).
 *
 * Définit un vrai tarif au kilo en dev si aucun n'est configuré (2000 FCFA),
 * puis crée une commande au kilo « Guide-* ».
 *
 * Variables d'environnement : identiques à capture-pressing-guide.mjs.
 *
 * Usage : node scripts/capture-pressing-kilo.mjs
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

/** Re-login si la session a expiré (redirection vers /login), puis re-goto. */
async function gotoAuth(page, url) {
	await page.goto(url, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(800);
	if (page.url().includes("/login")) {
		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page.waitForURL((u) => !u.pathname.includes("/login"), {
			timeout: 20000,
		});
		await waitForLoad(page);
		if (!page.url().startsWith(url)) {
			await page.goto(url, { waitUntil: "domcontentloaded" });
		}
	}
	await waitForLoad(page);
}

function demain() {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
}

async function choisirClient(page) {
	const champ = page.locator("#client-recherche");
	await champ.fill("Guide");
	await page.waitForTimeout(1500);
	const premierResultat = page.locator("ul.divide-y li button").first();
	if (await premierResultat.isVisible().catch(() => false)) {
		await premierResultat.click();
		return;
	}
	await page.getByRole("button", { name: "Créer un client" }).click();
	await page.waitForTimeout(600);
	await page.locator("#nom").fill("Guide-Pressing");
	await page.locator("#prenoms").fill("Client");
	await page.locator("#telPrincipal").fill("+2250700000000");
	await page.locator("#typeClient").click();
	await page.waitForTimeout(1200);
	await page.keyboard.press("ArrowDown");
	await page.keyboard.press("Enter");
	await page.waitForTimeout(400);
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

	// --- Tarif au kilo : définir si absent, puis capturer la page -------
	await gotoAuth(page, `${BASE_URL}/pressing/tarif-kg`);
	// Attendre la résolution de la requête (tarif, absence ou erreur).
	await page
		.waitForSelector("text=/Prix au kilo|Aucun tarif au kilo|Impossible de charger/", {
			timeout: 15000,
		})
		.catch(() => {});
	await page.waitForTimeout(800);
	const aucunTarif = await page
		.getByText("Aucun tarif au kilo n'a encore été configuré")
		.isVisible()
		.catch(() => false);
	if (aucunTarif) {
		await page.locator("#tarif-kg-prix").fill("2000");
		await page
			.getByRole("button", { name: "Définir le tarif" })
			.click();
		await page
			.waitForSelector("text=/Nouveau tarif enregistré/", { timeout: 15000 })
			.catch(() => {});
		await page.waitForTimeout(1500);
	} else {
		// Montre le formulaire rempli pour la capture.
		await page.locator("#tarif-kg-prix").fill("2000");
	}
	await capture(page, "15-tarif-kg");

	// --- Recapture du formulaire de dépôt (radio + sans acompte) --------
	await gotoAuth(page, `${BASE_URL}/pressing/commandes`);
	await page.getByRole("button", { name: "Nouvelle commande" }).click();
	await page.waitForTimeout(1000);
	await capture(page, "04-nouvelle-commande-vide");

	await choisirClient(page);
	await capture(page, "05-commande-client-choisi");

	await page
		.getByPlaceholder("Type de vêtement (ex : Chemise)")
		.first()
		.fill("Chemise");
	await page
		.getByPlaceholder("Prestation (ex : Repassage)")
		.first()
		.fill("Lavage + Repassage");
	await page.locator('input[aria-label="Quantité"]').first().fill("2");
	await page.getByPlaceholder("Tarif (FCFA)").first().fill("1500");
	await page.locator("#commande-retrait").fill(demain());
	await capture(page, "06-commande-remplie");

	await page.getByRole("button", { name: "Enregistrer" }).click();
	await page.waitForTimeout(2500);

	// --- Fiche de la commande à la pièce (badge « Tarification ») -------
	await page.locator("table tbody tr td a").first().click();
	await page.waitForURL("**/pressing/commandes/**", { timeout: 15000 });
	await waitForLoad(page);
	await capture(page, "08-fiche-commande");

	const passerTraitement = page.getByRole("button", {
		name: "Passer en traitement",
	});
	if (await passerTraitement.isVisible().catch(() => false)) {
		await passerTraitement.click();
		await page.waitForTimeout(2000);
		await capture(page, "10-fiche-en-traitement");
	}
	const passerPret = page.getByRole("button", { name: /Passer en « Prêt »/ });
	if (await passerPret.isVisible().catch(() => false)) {
		await passerPret.click();
		await page.waitForTimeout(2000);
		await capture(page, "11-fiche-pret");
	}
	const retirerBouton = page.getByRole("button", {
		name: "Retirer",
		exact: true,
	});
	if (await retirerBouton.isVisible().catch(() => false)) {
		await retirerBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "12-retrait-dialog");
		await page.getByRole("button", { name: "Annuler" }).click();
		await page.waitForTimeout(500);
	}

	// --- Commande au kilo ------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/pressing/commandes`);
	await page.getByRole("button", { name: "Nouvelle commande" }).click();
	await page.waitForTimeout(1000);
	await choisirClient(page);
	await page
		.locator("label", { hasText: "Tarification au kilo" })
		.click();
	await page.waitForTimeout(1000);
	await page
		.getByPlaceholder("Type de vêtement (ex : Chemise)")
		.first()
		.fill("Drap");
	await page
		.getByPlaceholder("Prestation (ex : Repassage)")
		.first()
		.fill("Lavage");
	await page.locator('input[aria-label="Poids (kg)"]').first().fill("4.5");
	await page.locator("#commande-retrait").fill(demain());
	await capture(page, "16-commande-kilo");
	await page.getByRole("button", { name: "Enregistrer" }).click();
	await page.waitForTimeout(2500);

	// Fiche de la commande au kilo : badge + colonne « POIDS (KG) ».
	await page.locator("table tbody tr td a").first().click();
	await page.waitForURL("**/pressing/commandes/**", { timeout: 15000 });
	await waitForLoad(page);
	await capture(page, "17-fiche-poids");

	// --- Mobile : fiche avec badge --------------------------------------
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
	await gotoAuth(mpage, `${BASE_URL}/pressing/commandes`);
	const mLien = mpage.locator("table tbody tr td a").first();
	if (await mLien.isVisible().catch(() => false)) {
		await mLien.click();
		await mpage.waitForURL("**/pressing/commandes/**", { timeout: 15000 });
		await waitForLoad(mpage);
		await capture(mpage, "14-fiche-mobile");
	}

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-kilo-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures Pressing (kilo) terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
