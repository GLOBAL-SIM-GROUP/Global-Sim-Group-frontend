/**
 * Complément de capture Marchandise : re-capture les dialogues produit sur la
 * carte « Guide-Eau » (et non la 1re carte de la grille), puis réalise une
 * vraie vente via le scan du code-barres 3700000000001 et capture la facture
 * + les statistiques.
 *
 * Usage : node scripts/capture-marchandise-complement.mjs
 *   (BASE_URL, LOGIN, PASSWORD, OUT_DIR comme capture-marchandise-guide.mjs)
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/marchandise/screenshots/marchandise";

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

async function choisirDansSelect(page, triggerLocator, index = 0) {
	await triggerLocator.click({ timeout: 8000 });
	await page.waitForTimeout(800);
	for (let i = 0; i <= index; i += 1) {
		await page.keyboard.press("ArrowDown");
	}
	await page.keyboard.press("Enter");
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
		await page.goto(`${BASE_URL}/marchandise/produits`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page.waitForTimeout(1500);

		// Carte du produit Guide-Eau (ciblée par texte, pas par position)
		const carte = page.locator(".group", { hasText: "Guide-Eau" }).first();
		await carte.scrollIntoViewIfNeeded();

		// Modale « Modifier » sur le produit Guide-Eau
		await carte.getByTitle("Modifier").click();
		await page.locator("#nom").waitFor({ timeout: 8000 });
		await page.waitForTimeout(500);
		await capture(page, "07-modifier-produit", { fullPage: false });
		await page
			.getByRole("button", { name: "Annuler" })
			.last()
			.click()
			.catch(() => page.keyboard.press("Escape"));
		await page.waitForTimeout(800);

		// Modale « Code-barres » sur Guide-Eau (code saisi à la création)
		await carte.getByTitle("Code-barres").click();
		await page.waitForTimeout(1500);
		await capture(page, "08-code-barres", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(600);

		// ── Vente réelle : scan du code-barres puis validation ────────────
		await page.goto(`${BASE_URL}/marchandise/ventes`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("button", { name: "Nouvelle vente" })
			.click();
		await page
			.locator('[aria-label="Produit ligne 1"]')
			.waitFor({ timeout: 8000 });
		await page.waitForTimeout(500);

		// Scan du code-barres (ajoute la ligne Guide-Eau automatiquement)
		const champScan = page.locator(
			'input[placeholder*="Scannez ou saisissez"]',
		);
		await champScan.fill("3700000000001");
		await champScan.press("Enter");
		await page.waitForTimeout(2000);

		// Quantité 2 sur la ligne résolue (la dernière ligne produit)
		const lignes = page.locator('[aria-label^="Quantité ligne"]');
		const nbLignes = await lignes.count();
		await lignes.nth(nbLignes - 1).fill("2");
		await choisirDansSelect(page, page.locator("#vente-moyen"), 0);
		await page.waitForTimeout(400);
		await capture(page, "16-nouvelle-vente", { fullPage: false });

		await page
			.getByRole("button", { name: "Valider la vente" })
			.click();
		await page.waitForTimeout(3000);
		await capture(page, "17-vente-enregistree");

		// Facture de la vente la plus récente (1re ligne du tableau)
		const boutonVoir = page.getByTitle("Voir la facture").first();
		if (await boutonVoir.isVisible().catch(() => false)) {
			await boutonVoir.click();
			await page.waitForTimeout(2000);
			await capture(page, "18-facture-vente", { fullPage: false });
			await page.keyboard.press("Escape");
		}

		// ── Statistiques ──────────────────────────────────────────────────
		await page.goto(`${BASE_URL}/marchandise/statistiques`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.first()
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);
		await capture(page, "19-statistiques");
	} finally {
		await context.close();
		await browser.close();
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
