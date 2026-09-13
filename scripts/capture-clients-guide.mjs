/**
 * Capture Playwright des pages du module Clients pour le guide utilisateur
 * `docs/guides-utilisation/clients/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Crée de vraies données « Guide-… » :
 *   - un locataire complet « Guide-Koffi Marius Jean » (création via la
 *     modale « Ajouter un locataire », avec pièce d'identité et contact
 *     d'urgence renseignés dans le formulaire),
 *   - un client de passage « Guide-Passage Awa » (modale « Ajouter un client
 *     de passage »),
 *   - une pièce d'identité CNI avec photo recto (PNG de test) ajoutée depuis
 *     la fiche, puis un contact d'urgence.
 *
 * Les captures de menus déroulants et de modales sont prises en viewport
 * (fullPage détache les éléments portalés Radix). Les pages sont en
 * fullPage, viewport 1440x900 + mobile 320 px, dans
 * `docs/guides-utilisation/clients/screenshots/clients/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/clients/screenshots/clients)
 *
 * Usage : node scripts/capture-clients-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR || "docs/guides-utilisation/clients/screenshots/clients";

const errors = [];

/** PNG 1x1 minimal pour l'upload de la photo de pièce (recto). */
const PNG_1PX = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
	"base64",
);
const RECTO_PATH = path.join(OUT_DIR, "..", "__test-recto.png");

async function capture(page, name, { fullPage = true } = {}) {
	const filePath = path.join(OUT_DIR, `${name}.png`);
	await page.screenshot({ path: filePath, fullPage });
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

/** Ouvre un Select Radix et choisit l'item `index` au clavier (fiable). */
async function choisirDansSelect(page, triggerLocator, index = 0) {
	const clique = await triggerLocator
		.click({ timeout: 8000 })
		.then(() => true)
		.catch(() => false);
	if (!clique) {
		await triggerLocator.focus();
		await page.keyboard.press("Enter");
	}
	await page.waitForTimeout(1000);
	for (let i = 0; i <= index; i += 1) {
		await page.keyboard.press("ArrowDown");
	}
	await page.keyboard.press("Enter");
	await page.waitForTimeout(500);
}

/** Ouvre un Select Radix sans choisir (pour capturer le menu déplié). */
async function ouvrirSelect(page, triggerLocator) {
	const clique = await triggerLocator
		.click({ timeout: 8000 })
		.then(() => true)
		.catch(() => false);
	if (!clique) {
		await triggerLocator.focus();
		await page.keyboard.press("Enter");
	}
	await page.waitForTimeout(800);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	await writeFile(RECTO_PATH, PNG_1PX);

	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		locale: "fr-FR",
	});
	const page = await context.newPage();

	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
	});
	page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

	try {
		await login(page);

		// ── 1. Liste des clients ──────────────────────────────────────────
		await page.goto(`${BASE_URL}/client/clients`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);
		await capture(page, "01-liste-clients");

		// ── 2. Filtre « Type » déplié (viewport : menu portalé) ───────────
		const filtreType = page
			.locator('button[aria-label="Type de client"]')
			.first();
		await ouvrirSelect(page, filtreType);
		await capture(page, "02-filtre-type", { fullPage: false });

		// ── 3. Filtrée sur « Locataire » ──────────────────────────────────
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await page.waitForTimeout(1200);
		await capture(page, "03-liste-locataires");

		// Retour à « Tous » puis recherche texte
		await choisirDansSelect(page, filtreType, 0);
		const champRecherche = page
			.locator('input[placeholder*="Rechercher"], input[type="search"]')
			.first();
		await champRecherche.fill("KOU");
		await page.waitForTimeout(1500);
		await capture(page, "04-recherche");
		await champRecherche.fill("");
		await page.waitForTimeout(1200);

		// ── 4. Modale « Nouveau locataire » remplie ───────────────────────
		await page
			.getByRole("button", { name: "Ajouter un locataire" })
			.click();
		await page
			.locator("#nom")
			.waitFor({ timeout: 8000 });
		await page.waitForTimeout(500);

		await page.locator("#nom").fill("Guide-Koffi");
		await page.locator("#prenoms").fill("Marius Jean");
		await page.locator("#telPrincipal").fill("+2250701020304");
		await page.locator("#dateNaissance").fill("1988-03-15");
		await page.locator("#lieuNaissance").fill("Abidjan");
		await choisirDansSelect(page, page.locator("#sexe"), 0); // Masculin
		await page.locator("#nationalite").fill("Ivoirienne");
		await page.locator("#profession").fill("Commerçant");
		await page.locator("#email").fill("marius.guide-koffi@example.ci");
		await page.locator("#adresse").fill("Cocody, Rue des Jardins");
		await page.locator("#ville").fill("Abidjan");
		await page.locator("#pays").fill("Côte d'Ivoire");
		await capture(page, "05-nouveau-locataire", { fullPage: false });

		// Scroll de la modale vers les sections pièce / contact
		const modale = page.locator('[role="dialog"]').last();
		await modale.evaluate((el) => {
			el.scrollTop = el.scrollHeight;
		});
		await page.waitForTimeout(600);
		await page.locator("#piece-numero").fill("CI-2026-0001-GUIDE");
		await page.locator("#piece-delivrance").fill("2024-01-10");
		await page.locator("#piece-expiration").fill("2034-01-10");
		await page.locator("#piece-recto").setInputFiles(RECTO_PATH);
		await page.locator("#contact-nom").fill("Guide-Yao");
		await page.locator("#contact-prenom").fill("Affoué");
		await page.locator("#contact-lien").fill("Sœur");
		await page.locator("#contact-tel-principal").fill("+2250506070809");
		await page.waitForTimeout(400);
		await capture(page, "06-locataire-piece-contact", { fullPage: false });

		// Soumettre la création du locataire
		await modale.evaluate((el) => {
			el.scrollTop = el.scrollHeight;
		});
		await page
			.getByRole("button", { name: "Enregistrer" })
			.last()
			.click();
		await page.waitForTimeout(3000);

		// ── 5. Modale « Nouveau client » (passage) ────────────────────────
		await page
			.getByRole("button", { name: "Ajouter un client", exact: true })
			.click();
		await page.locator("#telPrincipal").waitFor({ timeout: 8000 });
		await page.waitForTimeout(400);
		await page.locator("#nom").fill("Guide-Passage");
		await page.locator("#prenoms").fill("Awa");
		await page.locator("#telPrincipal").fill("+2250700000011");
		await page.waitForTimeout(300);
		await capture(page, "07-nouveau-passage", { fullPage: false });
		await page
			.getByRole("button", { name: "Enregistrer" })
			.last()
			.click();
		await page.waitForTimeout(2500);

		// ── 6. Fiche du locataire créé ────────────────────────────────────
		await champRecherche.fill("Guide-Koffi");
		await page.waitForTimeout(1500);
		await page
			.getByRole("link", { name: /Guide-Koffi/ })
			.first()
			.click();
		await waitForLoad(page);
		await page
			.getByRole("heading", { name: /Fiche client/ })
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(1200);
		await capture(page, "08-fiche-client");

		// ── 7. Modale « Modifier le client » ──────────────────────────────
		await page
			.getByRole("button", { name: "Modifier", exact: true })
			.click();
		await page.locator("#nom").waitFor({ timeout: 8000 });
		await page.waitForTimeout(500);
		await capture(page, "09-modifier-client", { fullPage: false });
		await page
			.getByRole("button", { name: "Annuler" })
			.last()
			.click();
		await page.waitForTimeout(800);

		// ── 8. Ajouter une pièce d'identité depuis la fiche ───────────────
		await page
			.getByRole("button", { name: "Ajouter une pièce" })
			.click();
		await page.locator("#numero").waitFor({ timeout: 8000 });
		await page.locator("#numero").fill("P-2026-GUIDE-777");
		await page.locator("#fileRecto").setInputFiles(RECTO_PATH);
		await page.locator("#dateDelivrance").fill("2024-06-01");
		await page.locator("#dateExpiration").fill("2034-06-01");
		await page.waitForTimeout(400);
		await capture(page, "10-nouvelle-piece", { fullPage: false });
		await page
			.getByRole("button", { name: "Enregistrer" })
			.last()
			.click();
		await page.waitForTimeout(3000);
		await capture(page, "11-fiche-avec-piece");

		// ── 9. Consulter les photos de la pièce ───────────────────────────
		const boutonVoir = page.getByRole("button", { name: "Voir" }).first();
		if (await boutonVoir.isVisible().catch(() => false)) {
			await boutonVoir.click();
			await page.waitForTimeout(2500);
			await capture(page, "12-photos-piece", { fullPage: false });
			await page
				.getByRole("button", { name: "Fermer" })
				.click()
				.catch(() => page.keyboard.press("Escape"));
			await page.waitForTimeout(800);
		}

		// ── 10. Ajouter un contact d'urgence ──────────────────────────────
		await page
			.getByRole("button", { name: "Ajouter un contact" })
			.click();
		await page.locator("#nom").waitFor({ timeout: 8000 });
		await page.locator("#nom").fill("Guide-Yao");
		await page.locator("#prenom").fill("Affoué");
		await page.locator("#lien").fill("Sœur");
		await page.locator("#telPrincipal").fill("+2250506070809");
		await page.waitForTimeout(300);
		await capture(page, "13-nouveau-contact", { fullPage: false });
		await page
			.getByRole("button", { name: "Enregistrer" })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "14-fiche-complete");
	} finally {
		await context.close();

		// ── 11. Vue mobile 320 px ─────────────────────────────────────────
		const mobileContext = await browser.newContext({
			viewport: { width: 320, height: 700 },
			locale: "fr-FR",
		});
		const mobile = await mobileContext.newPage();
		mobile.on("console", (msg) => {
			if (msg.type() === "error") errors.push(`[console mobile] ${msg.text()}`);
		});
		mobile.on("pageerror", (err) =>
			errors.push(`[pageerror mobile] ${err.message}`),
		);

		try {
			await login(mobile);
			await mobile.goto(`${BASE_URL}/client/clients`, {
				waitUntil: "domcontentloaded",
			});
			await waitForLoad(mobile);
			await mobile
				.getByRole("table")
				.waitFor({ timeout: 10000 })
				.catch(() => {});
			await capture(mobile, "15-mobile-liste");

			await mobile
				.getByRole("link", { name: /Guide-Koffi/ })
				.first()
				.click()
				.catch(() => {});
			await waitForLoad(mobile);
			await mobile.waitForTimeout(1000);
			await capture(mobile, "16-mobile-fiche");
		} finally {
			await mobileContext.close();
			await browser.close();
		}
	}

	const errPath = path.join(OUT_DIR, "..", "capture-errors.txt");
	if (errors.length > 0) {
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`⚠️  ${errors.length} erreur(s) → ${errPath}`);
	} else {
		await writeFile(errPath, "", "utf8");
		console.log("✅ Aucune erreur console/page");
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
