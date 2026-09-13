/**
 * Capture Playwright des pages du module Administration pour le guide
 * utilisateur `docs/guides-utilisation/admin/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Aucune donnée n'est créée : les modales « Ajouter un
 * utilisateur », « Ajouter un rôle » et « Réinitialiser le mot de passe »
 * sont capturées remplies puis ANNULÉES (pas de compte/rôle de test en
 * base).
 *
 * Les captures de menus déroulants et de modales sont prises en viewport
 * (fullPage détache les éléments portalés Radix). Pages en fullPage,
 * viewport 1440x900 + mobile 320 px, dans
 * `docs/guides-utilisation/admin/screenshots/admin/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/admin/screenshots/admin)
 *
 * Usage : node scripts/capture-admin-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR || "docs/guides-utilisation/admin/screenshots/admin";

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

async function fermerModale(page) {
	await page
		.getByRole("button", { name: "Annuler" })
		.last()
		.click()
		.catch(() => page.keyboard.press("Escape"));
	await page.waitForTimeout(700);
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

		// ── 1. Utilisateurs ───────────────────────────────────────────────
		await page.goto(`${BASE_URL}/admin/utilisateurs`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);
		await capture(page, "01-utilisateurs");

		// Filtre « Rôle » déplié (viewport : menu portalé)
		const filtreRole = page.locator('button[aria-label="Rôle"]').first();
		await ouvrirSelect(page, filtreRole);
		await capture(page, "02-filtre-role", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);

		// ── 2. Modale « Ajouter un utilisateur » remplie (non validée) ────
		await page
			.getByRole("button", { name: "Ajouter un utilisateur" })
			.click();
		await page.locator("#login").waitFor({ timeout: 8000 });
		await page.waitForTimeout(400);
		await page.locator("#login").fill("guide.operateur");
		await page.locator("#motDePasse").fill("motdepasse123");
		await choisirOptionParTexte(page, page.locator("#idRole"), "ai");
		await page.waitForTimeout(300);
		await capture(page, "03-nouvel-utilisateur", { fullPage: false });
		await fermerModale(page);

		// ── 3. Modale « Modifier l'utilisateur » ──────────────────────────
		await page.getByTitle("Modifier").first().click();
		await page.locator("#login").waitFor({ timeout: 8000 });
		await page.waitForTimeout(500);
		await capture(page, "04-modifier-utilisateur", { fullPage: false });
		await fermerModale(page);

		// ── 4. Modale « Réinitialiser le mot de passe » ───────────────────
		await page
			.getByTitle("Réinitialiser le mot de passe")
			.first()
			.click();
		await page.locator("#nouveau-mdp").waitFor({ timeout: 8000 });
		await page.locator("#nouveau-mdp").fill("nouveaumotdepasse");
		await page.waitForTimeout(300);
		await capture(page, "05-reinitialiser-mdp", { fullPage: false });
		await fermerModale(page);

		// ── 5. Rôles ──────────────────────────────────────────────────────
		await page.goto(`${BASE_URL}/admin/roles`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(1500);
		await capture(page, "06-roles");

		// Modale « Ajouter un rôle » remplie (non validée)
		await page
			.getByRole("button", { name: "Ajouter un rôle" })
			.click();
		await page.locator("#code").waitFor({ timeout: 8000 });
		await page.locator("#code").fill("GUIDE_SUPERVISEUR");
		await page.locator("#libelle").fill("Superviseur guide");
		await page.locator("#description").fill("Rôle de démonstration");
		await page.waitForTimeout(300);
		await capture(page, "07-nouveau-role", { fullPage: false });
		await fermerModale(page);

		// ── 6. Permissions d'un rôle ──────────────────────────────────────
		const lienPermissions = page
			.getByRole("link", { name: "Modifier les permissions" })
			.first();
		await lienPermissions.click();
		await waitForLoad(page);
		await page
			.locator('input[type="checkbox"]')
			.first()
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(1000);
		await capture(page, "08-permissions");

		// ── 7. Journal d'audit ────────────────────────────────────────────
		await page.goto(`${BASE_URL}/admin/journal`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);
		await capture(page, "09-journal");

		// Filtre « Module » déplié
		const filtreModule = page.locator('button[aria-label="Module"]').first();
		await ouvrirSelect(page, filtreModule);
		await capture(page, "10-filtre-module", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);

		// ── 8. Sauvegardes ────────────────────────────────────────────────
		await page.goto(`${BASE_URL}/admin/sauvegardes`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page.waitForTimeout(800);
		await capture(page, "11-sauvegardes");
	} finally {
		await context.close();

		// ── 9. Vue mobile 320 px ──────────────────────────────────────────
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
			await mobile.goto(`${BASE_URL}/admin/utilisateurs`, {
				waitUntil: "domcontentloaded",
			});
			await waitForLoad(mobile);
			await mobile.waitForTimeout(800);
			await capture(mobile, "12-mobile-utilisateurs");

			await mobile.goto(`${BASE_URL}/admin/sauvegardes`, {
				waitUntil: "domcontentloaded",
			});
			await waitForLoad(mobile);
			await mobile.waitForTimeout(800);
			await capture(mobile, "13-mobile-sauvegardes");
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
