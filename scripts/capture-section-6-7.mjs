import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR = process.env.OUT_DIR || "docs/guides-utilisation/screenshots/residence";

async function capture(page, name) {
	const filePath = path.join(OUT_DIR, `${name}.png`);
	await page.screenshot({ path: filePath, fullPage: true });
	console.log(`📸 ${name}`);
}

async function waitForLoad(page) {
	await page.waitForLoadState("networkidle", { timeout: 8000 }).catch(() => {});
	await page.waitForTimeout(600);
}

function dialog(page) {
	return page.locator('[role="dialog"]');
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();

	const uniqueId = Date.now().toString(36);

	const categoriesCharges = [
		{ id_categorie_charge: "ch1", libelle: "Électricité", actif: true },
		{ id_categorie_charge: "ch2", libelle: "Eau", actif: true },
		{ id_categorie_charge: "ch3", libelle: "Ordures ménagères", actif: false },
	];

	const charges = [
		{
			id_charge: "c1",
			id_logement: "l1",
			id_categorie_charge: "ch1",
			periode: "2026-11",
			compteur_numero: null,
			lecture_debut: null,
			lecture_fin: null,
			consommation: null,
			montant: "25000",
			montant_paye: "0",
			reste_a_payer: "25000",
			statut: "IMPAYEE",
			numero_logement: `GSG-ST01-${uniqueId}`,
			categorie_libelle: "Électricité",
		},
		{
			id_charge: "c2",
			id_logement: "l2",
			id_categorie_charge: "ch2",
			periode: "2026-11",
			compteur_numero: null,
			lecture_debut: null,
			lecture_fin: null,
			consommation: null,
			montant: "10000",
			montant_paye: "5000",
			reste_a_payer: "5000",
			statut: "PARTIELLE",
			numero_logement: `GSG-CH02-${uniqueId}`,
			categorie_libelle: "Eau",
		},
		{
			id_charge: "c3",
			id_logement: "l3",
			id_categorie_charge: "ch1",
			periode: "2026-10",
			compteur_numero: null,
			lecture_debut: null,
			lecture_fin: null,
			consommation: null,
			montant: "25000",
			montant_paye: "25000",
			reste_a_payer: "0",
			statut: "PAYEE",
			numero_logement: `GSG-ST03-${uniqueId}`,
			categorie_libelle: "Électricité",
		},
	];

	const categoriesAbonnements = [
		{ id_categorie_abonnement: "a1", code: "INTERNET", libelle: "Internet fibre", actif: true },
		{ id_categorie_abonnement: "a2", code: "EAU", libelle: "Forfait eau", actif: true },
		{ id_categorie_abonnement: "a3", code: "RESTAU", libelle: "Restaurant", actif: true },
	];

	const abonnements = [
		{
			id_abonnement: "ab1",
			id_client: "cl1",
			id_logement: "l1",
			service: "Internet fibre",
			type: "MENSUEL",
			montant: "15000",
			date_debut: "2026-10-01",
			date_fin: "2027-10-01",
			montant_paye: "15000",
			statut: "ACTIF",
			client_nom: "Nkoulou",
			client_prenoms: "Marie",
			numero_logement: `GSG-ST01-${uniqueId}`,
		},
		{
			id_abonnement: "ab2",
			id_client: "cl2",
			id_logement: "l2",
			service: "Restaurant",
			type: "PERIODIQUE",
			montant: "30000",
			date_debut: "2026-09-01",
			date_fin: "2026-12-31",
			montant_paye: "30000",
			statut: "SUSPENDU",
			client_nom: "Kamga",
			client_prenoms: "Paul",
			numero_logement: `GSG-CH02-${uniqueId}`,
		},
	];

	// Bâtiments et logements occupés (pour le formulaire « Nouvelle charge »).
	const batiments = [
		{ id_batiment: "b1", code: "BAT-A", nom: "Bâtiment A", adresse: "Rue 1", actif: true },
	];
	const logementsOccupes = [
		{
			id_logement: "l1",
			numero: `GSG-ST01-${uniqueId}`,
			nom: null,
			type: "STUDIO",
			tarif: "75000",
			equipements: null,
			statut: "OCCUPE",
			etat: null,
			id_batiment: "b1",
		},
		{
			id_logement: "l2",
			numero: `GSG-CH02-${uniqueId}`,
			nom: null,
			type: "CHAMBRE",
			tarif: "60000",
			equipements: null,
			statut: "OCCUPE",
			etat: null,
			id_batiment: "b1",
		},
	];

	try {
		await page.goto(`${BASE_URL}/login`);
		await waitForLoad(page);

		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page.waitForURL("**/home");
		await waitForLoad(page);

		// --- Mocks ----------------------------------------------------------
		await page.route("**/api/v1/residence/charges**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(charges),
				});
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/residence/categories-charges**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(categoriesCharges),
				});
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/residence/abonnements**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(abonnements),
				});
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/abonnement/categories**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(categoriesAbonnements),
				});
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/finances/moyens-paiement**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([
					{ id_moyen: "1", libelle: "Espèces", actif: true },
					{ id_moyen: "2", libelle: "Mobile Money", actif: true },
				]),
			});
		});
		await page.route("**/api/v1/residence/batiments**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(batiments),
				});
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/residence/logements**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(logementsOccupes),
				});
			} else {
				await route.continue();
			}
		});

		// --- 1. Page charges facturées -------------------------------------
		await page.goto(`${BASE_URL}/residence/charges`);
		await waitForLoad(page);
		await capture(page, "26-charges-liste");

		// Filtre par statut.
		await page.locator('button[aria-label="Statut"]').click();
		await page.waitForTimeout(400);
		await capture(page, "26b-charges-filtre-statut");
		await page.locator('[role="option"]').getByText("Impayée").click();
		await page.waitForTimeout(600);
		await capture(page, "26c-charges-filtre-impayees");
		await page.locator('button[aria-label="Statut"]').click();
		await page.waitForTimeout(300);
		await page.locator('[role="option"]').getByText("Tous les statuts").click();
		await page.waitForTimeout(500);

		// Enregistrer un paiement sur une charge impayée.
		await page.getByRole("button", { name: "Enregistrer le paiement" }).first().click();
		await page.waitForTimeout(700);
		await capture(page, "26d-charges-payer");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(400);

		// Formulaire « Nouvelle charge ».
		await page.getByRole("button", { name: /Nouvelle charge/i }).click();
		await page.waitForTimeout(700);
		await capture(page, "27-charge-formulaire-vide");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(400);

		// --- 2. Page catégories de charges ---------------------------------
		await page.goto(`${BASE_URL}/residence/categories-charges`);
		await waitForLoad(page);
		await capture(page, "28-categories-charges");

		// Ajouter une catégorie.
		await page.getByRole("button", { name: /Ajouter une catégorie/i }).click();
		await page.waitForTimeout(700);
		await capture(page, "28b-categorie-charge-form");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(400);

		// --- 3. Page abonnements -------------------------------------------
		await page.goto(`${BASE_URL}/residence/abonnements`);
		await waitForLoad(page);
		await capture(page, "30-abonnements-liste");

		// Filtre par statut.
		await page.locator('button[aria-label="Statut"]').click();
		await page.waitForTimeout(400);
		await capture(page, "30b-abonnements-filtre-statut");
		await page.locator('[role="option"]').getByText("Actif").click();
		await page.waitForTimeout(600);
		await capture(page, "30c-abonnements-filtre-actifs");
		await page.locator('button[aria-label="Statut"]').click();
		await page.waitForTimeout(300);
		await page.locator('[role="option"]').getByText("Tous les statuts").click();
		await page.waitForTimeout(500);

		// Résilier un abonnement (bouton croix sur la ligne ACTIF).
		await page.getByRole("button", { name: "Résilier" }).first().click();
		await page.waitForTimeout(700);
		await capture(page, "30d-abonnement-resilier");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(400);

		// --- 4. Page catégories d'abonnement -------------------------------
		await page.goto(`${BASE_URL}/residence/categories-abonnements`);
		await waitForLoad(page);
		await capture(page, "32-categories-abonnements");

		// Ajouter une catégorie.
		await page.getByRole("button", { name: /Ajouter une catégorie/i }).click();
		await page.waitForTimeout(700);
		await capture(page, "32b-categorie-abonnement-form");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(400);

		console.log("✅ Charges, abonnements et catégories capturés avec succès (API simulée).");
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
