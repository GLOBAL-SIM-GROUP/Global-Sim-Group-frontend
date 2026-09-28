/**
 * Captures du guide « Portail résident » (2026-09-28) — compte `resident`
 * (rôle RESIDENT, PORTAIL.VOIR + verbes DEMANDER/COMMANDER/CREER).
 *
 * Crée des données réelles portail : une demande de séjour, une commande
 * restaurant, une demande de réservation salle de fête, un signalement.
 *
 * Variables d'environnement : BASE_URL, LOGIN, PASSWORD, OUT_DIR.
 * Usage : node scripts/capture-portail-resident.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "resident";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/portail-resident/screenshots/portail";

const errors = [];

async function capture(page, name, opts = {}) {
	await page.screenshot({
		path: path.join(OUT_DIR, `${name}.png`),
		fullPage: opts.fullPage ?? true,
	});
	console.log(`📸 ${name}`);
}

async function waitForLoad(page, extra = 1500) {
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

/** Date ISO J+n au format yyyy-mm-dd. */
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

	// --- Accueil du portail ----------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail`);
	await page
		.waitForSelector("text=/Mes services|Contrat en cours/", {
			timeout: 20000,
		})
		.catch(() => {});
	await page.waitForTimeout(1200);
	await capture(page, "02-espace-resident");

	// --- Échéances --------------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/echeances`);
	await page
		.waitForSelector("table tbody tr, text=/Aucune/", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "03-echeances");
	const recuEcheance = page
		.getByRole("button", { name: /Reçu/i })
		.first();
	if (await recuEcheance.isVisible().catch(() => false)) {
		await recuEcheance.click();
		await page.waitForTimeout(1500);
		await capture(page, "04-echeance-recu");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// --- Paiements --------------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/paiements`);
	await page
		.waitForSelector("table tbody tr, text=/Aucun/", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "05-paiements");
	const recuPaiement = page
		.getByRole("button", { name: /Reçu/i })
		.first();
	if (await recuPaiement.isVisible().catch(() => false)) {
		await recuPaiement.click();
		await page.waitForTimeout(1500);
		await capture(page, "06-paiement-recu");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// --- Caution ----------------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/caution`);
	await page
		.waitForSelector("text=/Caution|Aucune/", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "07-caution");

	// --- État des lieux ---------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/etat-des-lieux`);
	await page.waitForTimeout(4000); // vignettes MinIO
	await capture(page, "08-etat-des-lieux");

	// --- Séjours : form + demande réelle ----------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/sejours`);
	await page
		.waitForSelector("#sejour-arrivee", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "09-sejours");
	await page.locator("#sejour-arrivee").fill(dansJours(30));
	await page.locator("#sejour-depart").fill(dansJours(33));
	await page.waitForTimeout(2500); // chargement catalogue logements
	const carteLogement = page
		.locator('button[aria-pressed]')
		.first();
	if (await carteLogement.isVisible().catch(() => false)) {
		await capture(page, "10-sejour-logements-disponibles");
		await carteLogement.click();
		await page.waitForTimeout(600);
		await capture(page, "11-sejour-demande-remplie", { fullPage: false });
		await page
			.getByRole("button", { name: /Envoyer ma demande/i })
			.click();
		await page
			.waitForURL("**/portail/sejours/**", { timeout: 20000 })
			.catch(() => {});
		await waitForLoad(page);
		await capture(page, "12-sejour-fiche");
	} else {
		console.log("⚠ Aucun logement disponible — demande séjour sautée");
	}

	// --- Pressing ----------------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/pressing`);
	await page
		.waitForSelector("text=/Aucune commande|CPR-|Progression/", {
			timeout: 20000,
		})
		.catch(() => {});
	await capture(page, "13-pressing");
	const lienPressing = page.locator('a[href*="/portail/pressing/"]').first();
	if (await lienPressing.isVisible().catch(() => false)) {
		await lienPressing.click();
		await waitForLoad(page);
		await capture(page, "14-pressing-fiche");
	}

	// --- Restaurant : commande réelle -------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/restaurant`);
	await page
		.waitForSelector("text=/Aucune commande|Commande du/", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "15-restaurant");
	const commanderBtn = page.getByRole("button", {
		name: /Passer une commande/i,
	});
	if (await commanderBtn.isVisible().catch(() => false)) {
		await commanderBtn.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(800);
		await dlg.locator('[aria-label="Plat 1"]').click();
		await page.waitForTimeout(700);
		await page.getByRole("option").first().click();
		await page.waitForTimeout(400);
		await dlg.locator("#quantite-plat-0").fill("1");
		await dlg.locator("#notes-commande").fill("Sans piment, merci.");
		await capture(page, "16-restaurant-commander", { fullPage: false });
		await dlg.getByRole("button", { name: /Envoyer la commande/i }).click();
		await page
			.waitForURL("**/portail/restaurant/**", { timeout: 20000 })
			.catch(() => {});
		await waitForLoad(page);
		await capture(page, "17-restaurant-fiche");
	} else {
		console.log("⚠ « Passer une commande » absent — captures sautées");
	}

	// --- Salle de fête : dispos + demande réelle ---------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/salle-fete`);
	await page
		.waitForSelector("#sf-date-dispo, text=/Aucune/", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1500);
	await capture(page, "18-salle-fete");
	const sfDate = page.locator("#sf-date");
	if (await sfDate.isVisible().catch(() => false)) {
		await sfDate.fill(dansJours(45));
		await page.locator("#sf-heure").fill("14:00");
		await page.locator("#sf-duree").fill("3");
		await page.locator("#sf-type").fill("Anniversaire");
		await page
			.locator("#sf-observations")
			.fill("Environ 30 invités — chaises et sonorisation.");
		await page.waitForTimeout(600);
		await capture(page, "19-salle-fete-demande", { fullPage: false });
		await page
			.getByRole("button", { name: /Demander|Envoyer/i })
			.last()
			.click();
		await page
			.waitForURL("**/portail/salle-fete/**", { timeout: 20000 })
			.catch(() => {});
		await waitForLoad(page);
		await capture(page, "20-salle-fete-fiche");
	}

	// --- Boutique ----------------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/boutique`);
	await page
		.waitForSelector("text=/Aucune demande|Demande du/", { timeout: 20000 })
		.catch(() => {});
	await capture(page, "21-boutique");
	const lienBoutique = page
		.locator('a[href*="/portail/boutique/"]')
		.first();
	if (await lienBoutique.isVisible().catch(() => false)) {
		await lienBoutique.click();
		await waitForLoad(page);
		await capture(page, "22-boutique-fiche");
	}

	// --- Abonnements --------------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/abonnements`);
	await page
		.waitForSelector("text=/Aucun abonnement|abonnement/", {
			timeout: 20000,
		})
		.catch(() => {});
	await capture(page, "23-abonnements");

	// --- Signalements : liste + création réelle ------------------------------
	await gotoAuth(page, `${BASE_URL}/residence/portail/signalements`);
	await page
		.waitForSelector("text=/Aucun signalement|signalement/i", {
			timeout: 20000,
		})
		.catch(() => {});
	await capture(page, "24-signalements");
	const lienNouveau = page.locator('a[href*="signalements/nouveau"]').first();
	if (await lienNouveau.isVisible().catch(() => false)) {
		await lienNouveau.click();
		await waitForLoad(page);
		await page.locator("#titre").fill("Ampoule grillée dans le couloir");
		await page.locator("#moduleCible").click();
		await page.waitForTimeout(500);
		await page
			.getByRole("option", { name: /Résidence/i })
			.first()
			.click()
			.catch(async () => {
				await page.keyboard.press("Escape");
			});
		await page.locator("#lieu").fill("Couloir du 2e étage");
		await page
			.locator("#description")
			.fill("L'ampoule du couloir du 2e étage est grillée depuis hier soir.");
		await capture(page, "25-signalement-formulaire");
		await page
			.getByRole("button", { name: /Envoyer|Créer|Signaler/i })
			.last()
			.click();
		await page
			.waitForURL("**/portail/signalements/**", { timeout: 20000 })
			.catch(() => {});
		await waitForLoad(page);
		await capture(page, "26-signalement-fiche");
	}
	const lienSignal = page
		.locator('a[href*="/portail/signalements/"]')
		.first();
	if (!(await lienNouveau.isVisible().catch(() => false)) &&
		(await lienSignal.isVisible().catch(() => false))) {
		await lienSignal.click();
		await waitForLoad(page);
		await capture(page, "26-signalement-fiche");
	}

	// --- Mobile -------------------------------------------------------------
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
	await mpage.goto(`${BASE_URL}/residence/portail`);
	await mpage.waitForTimeout(2500);
	await mpage.screenshot({
		path: path.join(OUT_DIR, "27-mobile-espace.png"),
		fullPage: true,
	});
	console.log("📸 27-mobile-espace");
	await mpage.goto(`${BASE_URL}/residence/portail/echeances`);
	await mpage.waitForTimeout(2500);
	await mpage.screenshot({
		path: path.join(OUT_DIR, "28-mobile-echeances.png"),
		fullPage: true,
	});
	console.log("📸 28-mobile-echeances");

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
	console.log("✅ Captures portail résident terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
