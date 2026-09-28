/**
 * Captures du guide « Espace client » (2026-09-28) — compte `client`
 * (rôle CLIENT : MARCHANDISE.COMMANDER, PORTAIL.VOIR, PRESSING.DECLARER,
 * RESIDENCE.DEMANDER, RESTAURANT.COMMANDER, SALLE_FETE.DEMANDER,
 * SIGNALEMENT.CREER/VOIR/DECLARER_TIERS).
 *
 * Crée des données réelles : commande restaurant + demande boutique via le
 * panier, demande de séjour, signalement.
 *
 * Variables d'environnement : BASE_URL, LOGIN, PASSWORD, OUT_DIR.
 * Usage : node scripts/capture-espace-client.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "client";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/espace-client/screenshots/espace-client";

const errors = [];

async function capture(page, name, opts = {}) {
	await page.screenshot({
		path: path.join(OUT_DIR, `${name}.png`),
		fullPage: opts.fullPage ?? true,
	});
	console.log(`📸 ${name}`);
}

async function waitForLoad(page, extra = 1800) {
	await page
		.waitForLoadState("domcontentloaded", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(extra);
}

async function login(page) {
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitForLoad(page);
	await capture(page, "01-connexion");
	await page.locator('input[name="login"]').fill(LOGIN);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL((u) => !u.pathname.includes("/login"), {
		timeout: 30000,
	});
	await waitForLoad(page);
}

async function gotoPage(page, url) {
	await page.goto(url, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(800);
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

function dansJours(n) {
	const d = new Date();
	d.setDate(d.getDate() + n);
	return d.toISOString().slice(0, 10);
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

	// --- Accueil ----------------------------------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client`);
	await page
		.waitForSelector("text=/Bienvenue|Bonjour/", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1200);
	await capture(page, "02-accueil");

	// --- Restaurant : carte + ajout au panier ------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/restaurant`);
	await page
		.waitForSelector('button[aria-label^="Ajouter"]', { timeout: 20000 })
		.catch(() => {});
	await capture(page, "03-restaurant-carte");
	const btnPlat = page
		.locator('button[aria-label^="Ajouter"][aria-label$="au panier"]')
		.first();
	if (await btnPlat.isVisible().catch(() => false)) {
		const label = await btnPlat.getAttribute("aria-label");
		await btnPlat.click();
		await page.waitForTimeout(600);
		await btnPlat.click(); // x2 pour voir la quantité
		await page.waitForTimeout(600);
		console.log("  + ajouté:", label);
		await capture(page, "04-restaurant-ajout-panier");
	} else {
		console.log("⚠ Aucun plat disponible — ajout panier sauté");
	}

	// --- Boutique : catalogue + ajout --------------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/boutique`);
	await page
		.waitForSelector('button[aria-label^="Ajouter"]', { timeout: 20000 })
		.catch(() => {});
	await capture(page, "05-boutique-catalogue");
	const btnProduit = page
		.locator('button[aria-label^="Ajouter"][aria-label$="au panier"]')
		.first();
	if (await btnProduit.isVisible().catch(() => false)) {
		const label = await btnProduit.getAttribute("aria-label");
		await btnProduit.click();
		await page.waitForTimeout(800);
		console.log("  + ajouté:", label);
		await capture(page, "06-boutique-ajout-panier");
	} else {
		console.log("⚠ Aucun produit disponible — ajout panier sauté");
	}

	// --- Panier : récap + envoi des deux demandes ---------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/panier`);
	await capture(page, "07-panier");

	// Restaurant : dialogue de commande
	const btnCommande = page.getByRole("button", {
		name: /Envoyer ma commande/i,
	});
	if (await btnCommande.isVisible().catch(() => false)) {
		await btnCommande.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(600);
		await capture(page, "08-panier-commander", { fullPage: false });
		await dlg.locator('[aria-label="Type de commande"]').click();
		await page.waitForTimeout(500);
		await page
			.getByRole("option", { name: /À emporter|emporter/i })
			.first()
			.click();
		await page.waitForTimeout(400);
		await dlg.locator("#notes").fill("Merci de préparer pour 13h.");
		await page.waitForTimeout(300);
		await dlg.getByRole("button", { name: /Envoyer la commande/i }).click();
		await dlg.waitFor({ state: "hidden", timeout: 20000 }).catch(() => {});
		await page.waitForTimeout(1200);
		await capture(page, "09-panier-resto-envoye");
	} else {
		console.log("⚠ Section restaurant vide — envoi sauté");
	}

	// Boutique : dialogue de demande
	const btnDemande = page.getByRole("button", { name: /Envoyer ma demande/i });
	if (await btnDemande.isVisible().catch(() => false)) {
		await btnDemande.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(600);
		await dlg
			.locator("#note-boutique")
			.fill("À récupérer ce soir après 18h, merci.");
		await capture(page, "10-panier-demande-boutique", { fullPage: false });
		await dlg.getByRole("button", { name: /Envoyer la demande/i }).click();
		await dlg.waitFor({ state: "hidden", timeout: 20000 }).catch(() => {});
		await page.waitForTimeout(1200);
		await capture(page, "11-panier-boutique-envoye");
	} else {
		console.log("⚠ Section boutique vide — envoi sauté");
	}

	// --- Mes demandes (agrégateur) -------------------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/mes-demandes`);
	await page
		.waitForSelector("text=/Commandes restaurant|Signalements/", {
			timeout: 20000,
		})
		.catch(() => {});
	await page.waitForTimeout(1200);
	await capture(page, "12-mes-demandes");

	// Fiche commande restaurant (la plus récente)
	const lienResto = page
		.locator('a[href*="/espace-client/restaurant/"]')
		.first();
	if (await lienResto.isVisible().catch(() => false)) {
		await lienResto.click();
		await waitForLoad(page);
		await capture(page, "13-commande-restaurant-fiche");
		await gotoPage(page, `${BASE_URL}/espace-client/mes-demandes`);
	}
	const lienBoutique = page
		.locator('a[href*="/espace-client/boutique/"]')
		.first();
	if (await lienBoutique.isVisible().catch(() => false)) {
		await lienBoutique.click();
		await waitForLoad(page);
		await capture(page, "14-demande-boutique-fiche");
	}
	const lienSejour = page
		.locator('a[href*="/espace-client/residence/"]')
		.first();
	if (await lienSejour.isVisible().catch(() => false)) {
		await lienSejour.click();
		await waitForLoad(page);
		await capture(page, "15-sejour-fiche-existant");
	}

	// --- Pressing -------------------------------------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/pressing`);
	await page
		.waitForSelector("text=/Aucune commande|CPR-|Progression/", {
			timeout: 20000,
		})
		.catch(() => {});
	await capture(page, "16-pressing");
	const lienPressing = page
		.locator('a[href*="/espace-client/pressing/"]')
		.first();
	if (await lienPressing.isVisible().catch(() => false)) {
		await lienPressing.click();
		await waitForLoad(page);
		await capture(page, "17-pressing-fiche");
	}

	// --- Résidence : demande de séjour réelle ---------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/residence`);
	await page
		.waitForSelector("#sejour-arrivee", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "18-residence");
	await page.locator("#sejour-arrivee").fill(dansJours(35));
	await page.locator("#sejour-depart").fill(dansJours(38));
	await page.waitForTimeout(2500);
	const carteLogement = page.locator("button[aria-pressed]").first();
	if (await carteLogement.isVisible().catch(() => false)) {
		await capture(page, "19-residence-logements");
		await carteLogement.click();
		await page.waitForTimeout(600);
		await page
			.getByRole("button", { name: /Envoyer ma demande/i })
			.click();
		await page
			.waitForURL("**/espace-client/residence/**", { timeout: 20000 })
			.catch(() => {});
		await waitForLoad(page);
		await capture(page, "20-residence-fiche");
	} else {
		console.log("⚠ Aucun logement disponible — demande séjour sautée");
	}

	// --- Salle de fête ---------------------------------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/salle-fete`);
	await page
		.waitForSelector("#sf-date-dispo, text=/Aucune/", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1500);
	await capture(page, "21-salle-fete");
	const sfDate = page.locator("#sf-date");
	if (await sfDate.isVisible().catch(() => false)) {
		await sfDate.fill(dansJours(60));
		await page.locator("#sf-heure").fill("15:00");
		await page.locator("#sf-duree").fill("4");
		await page.locator("#sf-type").fill("Mariage");
		await page
			.locator("#sf-observations")
			.fill("Environ 80 invités — traiteur externe prévu.");
		await page.waitForTimeout(600);
		await capture(page, "22-salle-fete-demande", { fullPage: false });
	}
	const lienSf = page
		.locator('a[href*="/espace-client/salle-fete/"]')
		.first();
	if (await lienSf.isVisible().catch(() => false)) {
		await lienSf.click();
		await waitForLoad(page);
		await capture(page, "23-salle-fete-fiche");
	}

	// --- Abonnements -------------------------------------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/abonnements`);
	await page
		.waitForSelector("text=/Aucun abonnement|abonnement/i", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "24-abonnements");
	const lienAbo = page
		.locator('a[href*="/espace-client/abonnements/"]')
		.first();
	if (await lienAbo.isVisible().catch(() => false)) {
		await lienAbo.click();
		await waitForLoad(page);
		await capture(page, "25-abonnement-fiche");
	}

	// --- Signalement : formulaire + envoi réel -----------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/signalement`);
	await page
		.waitForSelector("#titre, #sujet", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "26-signalement");
	const champSujet = page.locator("#titre").or(page.locator("#sujet"));
	if (await champSujet.isVisible().catch(() => false)) {
		await champSujet.fill("Serviettes manquantes en chambre");
		const selModule = page.locator("#moduleCible");
		if (await selModule.isVisible().catch(() => false)) {
			await selModule.click();
			await page.waitForTimeout(500);
			await page
				.getByRole("option", { name: /Résidence/i })
				.first()
				.click()
				.catch(() => page.keyboard.press("Escape"));
		}
		const champLieu = page.locator("#lieu");
		if (await champLieu.isVisible().catch(() => false)) {
			await champLieu.fill("Chambre 102");
		}
		await page
			.locator("#description")
			.fill(
				"Il manque des serviettes de toilette dans la chambre depuis le passage du matin.",
			);
		await capture(page, "27-signalement-rempli");
		await page
			.getByRole("button", { name: /Envoyer|Signaler|Créer/i })
			.last()
			.click();
		await page
			.waitForURL("**/espace-client/signalement/**", { timeout: 20000 })
			.catch(() => {});
		await waitForLoad(page);
		await capture(page, "28-signalement-fiche");
	}

	// --- Mon compte ----------------------------------------------------------------
	await gotoPage(page, `${BASE_URL}/espace-client/mon-compte`);
	await capture(page, "29-mon-compte");

	// --- Mobile ---------------------------------------------------------------------
	await context.close();
	const mobileContext = await browser.newContext({
		viewport: { width: 390, height: 844 },
		deviceScaleFactor: 2,
		isMobile: true,
		hasTouch: true,
	});
	const mpage = await mobileContext.newPage();
	mpage.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console:mobile] ${msg.text()}`);
	});
	await mpage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await mpage.waitForTimeout(1200);
	await mpage.locator('input[name="login"]').fill(LOGIN);
	await mpage.locator('input[name="motDePasse"]').fill(PASSWORD);
	await mpage.getByRole("button", { name: "Se connecter" }).click();
	await mpage
		.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 })
		.catch(() => {});
	await mpage.goto(`${BASE_URL}/espace-client`);
	await mpage.waitForTimeout(3000);
	await mpage.screenshot({
		path: path.join(OUT_DIR, "30-mobile-accueil.png"),
	});
	console.log("📸 30-mobile-accueil");
	await mpage.goto(`${BASE_URL}/espace-client/restaurant`);
	await mpage.waitForTimeout(3000);
	await mpage.screenshot({
		path: path.join(OUT_DIR, "31-mobile-restaurant.png"),
	});
	console.log("📸 31-mobile-restaurant");

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		await writeFile(
			path.join(OUT_DIR, "capture-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
	}
	console.log("✅ Captures espace client terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
