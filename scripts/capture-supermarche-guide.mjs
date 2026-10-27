/**
 * Capture Playwright des pages du module Super-Marché (anciennement
 * Marchandise/Market) pour le guide utilisateur `guides-utilisation/supermarche/`.
 *
 * Utilise le backend réel (localhost:5173 par défaut) avec l'utilisateur
 * `admin`. Crée de vraies données « Guide-… » :
 *   - un produit « Guide-Eau minérale 1L » (référence auto-générée GSG-REF-…),
 *   - un mouvement d'entrée de stock (+12) en mode multi-lignes,
 *   - une vente réelle de 2 bouteilles (moyen de paiement : premier
 *     disponible).
 * La modale de catégorie est capturée remplie mais NON validée.
 *
 * Les captures de menus déroulants et de modales sont prises en viewport
 * (fullPage détache les éléments portalés Radix). Pages en fullPage,
 * viewport 1440x900 + mobile 320 px.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:5173)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut ../../Documentation/sim-docs/guides-utilisation/supermarche/screenshots/supermarche)
 *
 * Usage : node scripts/capture-supermarche-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:5173";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"../../Documentation/sim-docs/guides-utilisation/supermarche/screenshots/supermarche";

const errors = [];

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

/** Ouvre le Combobox `ariaLabel`, tape `texte`, choisit le 1er résultat. */
async function choisirDansCombobox(page, ariaLabel, texte) {
	await page.locator(`button[aria-label="${ariaLabel}"]`).click();
	await page.waitForTimeout(700);
	const recherche = page.locator('[data-slot="combobox-content"] input');
	await recherche.fill(texte);
	await page.waitForTimeout(700);
	await page.locator('[data-slot="combobox-item"]').first().click();
	await page.waitForTimeout(400);
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

		// ── 1. Catalogue produits ─────────────────────────────────────────
		await page.goto(`${BASE_URL}/supermarche/produits`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.locator(".grid")
			.first()
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(1200);
		await capture(page, "01-produits");

		// ── 2. Filtre « Catégorie » déplié (viewport) ─────────────────────
		const filtreCategorie = page.locator('button[aria-label="Catégorie"]');
		await ouvrirSelect(page, filtreCategorie);
		await capture(page, "02-filtre-categorie", { fullPage: false });
		await page.keyboard.press("ArrowDown");
		await page.keyboard.press("Enter");
		await page.waitForTimeout(1200);
		await capture(page, "03-produits-filtres");

		// Recherche texte puis retour à « Tous »
		await choisirDansSelect(page, filtreCategorie, 0);
		const champRecherche = page
			.locator('input[placeholder*="Rechercher"]')
			.first();
		await champRecherche.fill("eau");
		await page.waitForTimeout(1500);
		await capture(page, "04-recherche-produit");
		await champRecherche.fill("");
		await page.waitForTimeout(1200);

		// ── 3. Modale « Ajouter un produit » : réf auto + saisie libre ────
		await page.getByRole("button", { name: "Ajouter un produit" }).click();
		await page.locator("#reference").waitFor({ timeout: 8000 });
		await page.waitForTimeout(400);
		// Capture du lien « Saisir manuellement » ouvert sur la catégorie —
		// illustre la création inline d'une entrée de catalogue.
		await page
			.getByRole("button", { name: "Saisir manuellement" })
			.first()
			.click();
		await page.waitForTimeout(400);
		await page.locator("#idCategorieProduit").fill("Guide-Boissons");
		await page.waitForTimeout(300);
		await capture(page, "05a-categorie-saisie-libre", { fullPage: false });
		// Valider la création inline « Ajouter « Guide-Boissons » »
		await page
			.getByRole("button", { name: /Ajouter « Guide-Boissons »/ })
			.click();
		await page.waitForTimeout(800);

		// Formulaire rempli — référence volontairement vide (auto GSG-REF-…)
		await page.locator("#nom").fill("Guide-Eau minérale 1L");
		await choisirDansSelect(page, page.locator("#idFournisseur"), 0);
		await page.locator("#prixAchat").fill("300");
		await page.locator("#prixVente").fill("500");
		await page.locator("#stockInitial").fill("24");
		await page.locator("#seuilAlerte").fill("6");
		await page
			.locator("#codeBarre")
			.fill(`37${String(Date.now()).slice(-11)}`);
		await page.waitForTimeout(300);
		await capture(page, "05-nouveau-produit", { fullPage: false });
		await page
			.getByRole("button", { name: "Enregistrer" })
			.last()
			.click();
		await page.waitForTimeout(3000);
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "Annuler" })
			.click()
			.catch(() => {});
		await page.waitForTimeout(600);

		// ── 4. Le produit dans la grille + modale Modifier + code-barres ──
		await champRecherche.fill("Guide-Eau");
		await page.waitForTimeout(1500);
		await capture(page, "06-produit-cree");

		const carte = page.locator(".group", { hasText: "Guide-Eau" }).first();
		await carte.scrollIntoViewIfNeeded();
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

		await carte.getByTitle("Code-barres").click();
		await page.waitForTimeout(1500);
		await capture(page, "08-code-barres", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(600);
		await champRecherche.fill("");
		await page.waitForTimeout(1000);

		// ── 5. Catégories de produits ─────────────────────────────────────
		await page.goto(`${BASE_URL}/supermarche/categories-produits`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await capture(page, "09-categories");
		await page
			.getByRole("button", { name: "Ajouter une catégorie" })
			.click();
		await page.locator("#libelle").waitFor({ timeout: 8000 });
		await page.locator("#libelle").fill("Guide-Divers");
		await page.waitForTimeout(300);
		await capture(page, "10-nouvelle-categorie", { fullPage: false });
		await page
			.getByRole("button", { name: "Annuler" })
			.last()
			.click()
			.catch(() => page.keyboard.press("Escape"));
		await page.waitForTimeout(600);

		// ── 6. Mouvements de stock (formulaire multi-produits) ────────────
		await page.goto(`${BASE_URL}/supermarche/mouvements`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await capture(page, "11-mouvements");

		// Modale « Ajouter un mouvement » : type Entrée + 2 lignes produit
		await page
			.getByRole("button", { name: "Ajouter un mouvement" })
			.click();
		await page.locator("#mouvement-type").waitFor({ timeout: 8000 });
		await page.waitForTimeout(400);
		// « Entrée » est la valeur par défaut — pas besoin de changer le type.
		await choisirDansCombobox(page, "Produit ligne 1", "Guide-Eau");
		await page.locator('input[aria-label="Quantité ligne 1"]').fill("12");
		// Deuxième ligne pour illustrer le lot multi-produits.
		await page
			.getByRole("button", { name: "Ajouter une ligne" })
			.click();
		await page.waitForTimeout(400);
		await choisirDansCombobox(page, "Produit ligne 2", "Guide-Eau");
		await page.locator('input[aria-label="Quantité ligne 2"]').fill("3");
		await page.locator("#mouvement-motif").fill("Réappro fournisseur");
		await page.locator("#mouvement-document-ref").fill("BL-2026-GUIDE");
		await page.waitForTimeout(300);
		await capture(page, "12-nouveau-mouvement", { fullPage: false });
		await page
			.getByRole("button", { name: "Enregistrer" })
			.last()
			.click();
		await page.waitForTimeout(3500);
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "Annuler" })
			.click()
			.catch(() => {});
		await page.waitForTimeout(600);

		// Modale « Alerte stock »
		await page.getByRole("button", { name: "Alerte stock" }).click();
		await page.waitForTimeout(1800);
		await capture(page, "13-alerte-stock", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(600);

		// Modale « Réception par scan »
		await page
			.getByRole("button", { name: "Réception par scan" })
			.click();
		await page.waitForTimeout(1200);
		await capture(page, "14-reception-scan", { fullPage: false });
		await page.keyboard.press("Escape");
		await page.waitForTimeout(600);

		// ── 7. Ventes ─────────────────────────────────────────────────────
		await page.goto(`${BASE_URL}/supermarche/ventes`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await capture(page, "15-ventes");

		// Modale « Nouvelle vente » → vraie vente de 2 bouteilles
		await page.getByRole("button", { name: "Nouvelle vente" }).click();
		await page.waitForTimeout(1200);
		const champScan = page.locator(
			'input[placeholder*="Scannez ou saisissez"]',
		);
		await champScan.fill("3700000000001");
		await champScan.press("Enter");
		await page.waitForTimeout(2000);
		const lignes = page.locator('[aria-label^="Quantité ligne"]');
		if ((await lignes.count()) > 0) {
			await lignes.nth((await lignes.count()) - 1).fill("2");
		}
		await choisirDansSelect(page, page.locator("#vente-moyen"), 0);
		// Le CaissePicker présélectionne la caisse ouverte du secteur si
		// l'admin en a plusieurs — on laisse l'état affiché tel quel.
		await page.waitForTimeout(600);
		await capture(page, "16-nouvelle-vente", { fullPage: false });
		await page
			.getByRole("button", { name: "Valider la vente" })
			.click();
		await page.waitForTimeout(3000);
		await capture(page, "17-vente-enregistree");

		// Facture de la vente (première ligne — la plus récente)
		const boutonVoir = page.getByTitle("Voir la facture").first();
		if (await boutonVoir.isVisible().catch(() => false)) {
			await boutonVoir.click();
			await page.waitForTimeout(2000);
			await capture(page, "18-facture-vente", { fullPage: false });
			await page.keyboard.press("Escape");
			await page.waitForTimeout(600);
		}

		// ── 8. Statistiques ───────────────────────────────────────────────
		await page.goto(`${BASE_URL}/supermarche/statistiques`, {
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
			await mobile.goto(`${BASE_URL}/supermarche/produits`, {
				waitUntil: "domcontentloaded",
			});
			await waitForLoad(mobile);
			await mobile.waitForTimeout(800);
			await capture(mobile, "20-mobile-produits");

			await mobile.goto(`${BASE_URL}/supermarche/ventes`, {
				waitUntil: "domcontentloaded",
			});
			await waitForLoad(mobile);
			await mobile.waitForTimeout(800);
			await capture(mobile, "21-mobile-ventes");
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
