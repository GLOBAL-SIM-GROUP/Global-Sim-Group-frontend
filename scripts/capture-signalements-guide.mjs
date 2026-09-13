/**
 * Capture Playwright des pages du module Signalements pour le guide
 * utilisateur `docs/guides-utilisation/signalements/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Crée UN vrai signalement « Guide — Ascenseur du bloc B » (cible
 * Résidence, avec le logo GSG comme photo jointe) et suit son cycle de vie
 * réel : Ouvert → Prise en charge → Résolu (note obligatoire). La donnée
 * reste en base de dev — documentée dans le README du guide.
 *
 * Les captures de menus déroulants et de modales sont prises en viewport
 * (fullPage détache les éléments portalés Radix). Pages en fullPage,
 * viewport 1440x900 + mobile 320 px, dans
 * `docs/guides-utilisation/signalements/screenshots/signalements/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/signalements/screenshots/signalements)
 *
 * Usage : node scripts/capture-signalements-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/signalements/screenshots/signalements";
const PHOTO_PATH = "docs/guides-utilisation/logo-gsg.png";

const TITRE = "Guide — Ascenseur du bloc B en panne";
const DESCRIPTION =
	"L'ascenseur du bloc B ne répond plus depuis ce matin. " +
	"Les résidents des étages 3 à 5 doivent emprunter l'escalier de service.";
const NOTE_RESOLUTION =
	"Technicien intervenu : fusible remplacé, ascenseur remis en service.";

const errors = [];

async function capture(page, name, { fullPage = true } = {}) {
	await page.screenshot({
		path: path.join(OUT_DIR, `${name}.png`),
		fullPage,
	});
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

/** Clique l'option d'un select Radix contenant `texte`. */
async function choisirOptionParTexte(page, triggerLocator, texte) {
	await triggerLocator.click({ timeout: 8000 });
	await page.waitForTimeout(900);
	await page
		.locator('[role="option"]', { hasText: texte })
		.first()
		.click({ timeout: 8000 });
	await page.waitForTimeout(500);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

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

		// ── 1. Liste des signalements ─────────────────────────────────────
		await page.goto(`${BASE_URL}/signalements`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);
		await capture(page, "01-liste");

		// Filtre « Statut » déplié (viewport : menu portalé)
		await page.locator('button[aria-label="Statut"]').first().click();
		await page.waitForTimeout(800);
		await capture(page, "02-filtre-statut", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);

		// Type de cible « Module » + filtre module déplié
		await choisirOptionParTexte(
			page,
			page.locator('button[aria-label="Type de cible"]'),
			"Module",
		);
		await page.locator('button[aria-label="Module concerné"]').click();
		await page.waitForTimeout(800);
		await capture(page, "03-filtre-module", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);
		// Remet le filtre cible sur « Toutes les cibles »
		await choisirOptionParTexte(
			page,
			page.locator('button[aria-label="Type de cible"]'),
			"Toutes les cibles",
		);

		// ── 2. Modale « Nouveau signalement » remplie ─────────────────────
		await page
			.getByRole("button", { name: "Nouveau signalement" })
			.click();
		await page.locator("#titre").waitFor({ timeout: 8000 });
		await page.locator("#titre").fill(TITRE);
		await page.locator("#description").fill(DESCRIPTION);
		await choisirOptionParTexte(
			page,
			page.locator('button[id="moduleCible"]'),
			"Résidence",
		);
		await page.locator("#signalement-photos").setInputFiles(PHOTO_PATH);
		await page.waitForTimeout(600);
		await capture(page, "04-nouveau", { fullPage: false });

		// Soumission réelle : le signalement et sa photo servent aux captures
		// de la fiche (cycle complet documenté dans le guide).
		await page
			.getByRole("button", { name: "Créer le signalement" })
			.click();
		await page.waitForURL(/\/signalements\/[^/]+$/, { timeout: 20000 });
		await waitForLoad(page);

		// ── 3. Fiche du signalement (statut Ouvert) ───────────────────────
		await page.waitForTimeout(1500); // vignette photo le temps de charger
		await capture(page, "05-fiche");

		// Visionneuse de la photo jointe
		const vignette = page.getByRole("button", {
			name: "Agrandir la photo",
		});
		if (await vignette.isVisible().catch(() => false)) {
			await vignette.first().click();
			await page.waitForTimeout(1200);
			await capture(page, "06-photo-viewer", { fullPage: false });
			await page.keyboard.press("Escape");
			await page.waitForTimeout(600);
		} else {
			console.log("⚠️  vignette photo absente — 06 sauté");
		}

		// ── 4. Prendre en charge (OUVERT → EN_COURS) ──────────────────────
		await page
			.getByRole("button", { name: "Prendre en charge" })
			.click();
		await page.waitForTimeout(1800);
		await capture(page, "07-en-cours");

		// ── 5. Résoudre : formulaire de note puis confirmation ────────────
		await page.getByRole("button", { name: "Résoudre" }).click();
		await page.locator("#action-note").waitFor({ timeout: 8000 });
		await page.locator("#action-note").fill(NOTE_RESOLUTION);
		await page.waitForTimeout(400);
		await capture(page, "08-resoudre-note", { fullPage: false });
		await page.getByRole("button", { name: "Confirmer" }).click();
		await page.waitForTimeout(2000);
		await capture(page, "09-resolu");
	} finally {
		await context.close();

		// ── 6. Vue mobile 320 px ──────────────────────────────────────────
		const mobileContext = await browser.newContext({
			viewport: { width: 320, height: 700 },
			locale: "fr-FR",
		});
		const mobile = await mobileContext.newPage();
		mobile.on("console", (msg) => {
			if (msg.type() === "error")
				errors.push(`[console mobile] ${msg.text()}`);
		});
		mobile.on("pageerror", (err) =>
			errors.push(`[pageerror mobile] ${err.message}`),
		);

		try {
			await login(mobile);
			await mobile.goto(`${BASE_URL}/signalements`, {
				waitUntil: "domcontentloaded",
			});
			await waitForLoad(mobile);
			await mobile.waitForTimeout(800);
			await capture(mobile, "10-mobile-liste");

			const lienGuide = mobile.getByRole("link", {
				name: /Ascenseur du bloc B/,
			});
			if (await lienGuide.isVisible().catch(() => false)) {
				await lienGuide.first().click();
				await waitForLoad(mobile);
				await mobile.waitForTimeout(1000);
				await capture(mobile, "11-mobile-fiche");
			} else {
				console.log("⚠️  fiche mobile introuvable — 11 sauté");
			}
		} finally {
			await mobileContext.close();
			await browser.close();
		}
	}

	const errPath = path.join(OUT_DIR, "..", "capture-errors.txt");
	await writeFile(errPath, errors.join("\n"), "utf8");
	console.log(
		errors.length > 0
			? `⚠️  ${errors.length} erreur(s) → ${errPath}`
			: "✅ Aucune erreur console/page",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
