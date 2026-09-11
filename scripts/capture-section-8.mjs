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
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(600);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();

	const uniqueId = Date.now().toString(36);

	const echeances = [
		{
			numero_contrat: `CTR-A-${uniqueId}`,
			client: "Nkoulou Marie",
			logement: `GSG-ST01-${uniqueId}`,
			batiment: "Bâtiment A",
			mois: 12,
			annee: 2026,
			loyer_applique: "75000",
			date_echeance: "2026-12-01",
			statut: "A_VENIR",
			date_paiement: null,
			montant_paye: null,
			ancien_montant: null,
			nouveau_montant: null,
			date_effet_revision: null,
		},
		{
			numero_contrat: `CTR-B-${uniqueId}`,
			client: "Kamga Paul",
			logement: `GSG-CH02-${uniqueId}`,
			batiment: "Bâtiment A",
			mois: 11,
			annee: 2026,
			loyer_applique: "60000",
			date_echeance: "2026-11-01",
			statut: "IMPAYE",
			date_paiement: null,
			montant_paye: null,
			ancien_montant: null,
			nouveau_montant: null,
			date_effet_revision: null,
		},
		{
			numero_contrat: `CTR-C-${uniqueId}`,
			client: "Tchoupo Claire",
			logement: `GSG-ST03-${uniqueId}`,
			batiment: "Bâtiment B",
			mois: 10,
			annee: 2026,
			loyer_applique: "75000",
			date_echeance: "2026-10-01",
			statut: "PARTIEL",
			date_paiement: "2026-10-05",
			montant_paye: "40000",
			ancien_montant: null,
			nouveau_montant: null,
			date_effet_revision: null,
		},
		{
			numero_contrat: `CTR-D-${uniqueId}`,
			client: "Mballa Jean",
			logement: `GSG-ST04-${uniqueId}`,
			batiment: "Bâtiment B",
			mois: 9,
			annee: 2026,
			loyer_applique: "75000",
			date_echeance: "2026-09-01",
			statut: "PAYE",
			date_paiement: "2026-09-02",
			montant_paye: "75000",
			ancien_montant: null,
			nouveau_montant: null,
			date_effet_revision: null,
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

		// Suivi des échéances (GET /residence/suivi).
		await page.route("**/api/v1/residence/suivi**", async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(echeances),
				});
			} else {
				await route.continue();
			}
		});

		// Liste des contrats (pour résoudre les liens « Voir le contrat »).
		await page.route("**/api/v1/residence/contrats**", async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([
						{
							id_contrat: `c1-${uniqueId}`,
							numero_contrat: `CTR-A-${uniqueId}`,
							id_client: "x",
							id_logement: "y",
							date_debut: "2026-10-01",
							date_fin_prevue: "2027-09-30",
							duree_mois: 12,
							type_location: "MENSUEL",
							montant_loyer: "75000",
							periodicite: "MENSUEL",
							statut: "ACTIF",
							date_signature: "2026-09-30",
						},
						{
							id_contrat: `c2-${uniqueId}`,
							numero_contrat: `CTR-B-${uniqueId}`,
							id_client: "x",
							id_logement: "y",
							date_debut: "2026-09-01",
							date_fin_prevue: "2027-08-31",
							duree_mois: 12,
							type_location: "MENSUEL",
							montant_loyer: "60000",
							periodicite: "MENSUEL",
							statut: "ACTIF",
							date_signature: "2026-08-31",
						},
						{
							id_contrat: `c3-${uniqueId}`,
							numero_contrat: `CTR-C-${uniqueId}`,
							id_client: "x",
							id_logement: "y",
							date_debut: "2026-08-01",
							date_fin_prevue: "2027-07-31",
							duree_mois: 12,
							type_location: "MENSUEL",
							montant_loyer: "75000",
							periodicite: "MENSUEL",
							statut: "ACTIF",
							date_signature: "2026-07-31",
						},
						{
							id_contrat: `c4-${uniqueId}`,
							numero_contrat: `CTR-D-${uniqueId}`,
							id_client: "x",
							id_logement: "y",
							date_debut: "2026-07-01",
							date_fin_prevue: "2027-06-30",
							duree_mois: 12,
							type_location: "MENSUEL",
							montant_loyer: "75000",
							periodicite: "MENSUEL",
							statut: "ACTIF",
							date_signature: "2026-06-30",
						},
					]),
				});
			} else {
				await route.continue();
			}
		});

		// 1. Liste complète des échéances.
		await page.goto(`${BASE_URL}/residence/echeances`);
		await waitForLoad(page);
		await capture(page, "34-echeances-liste");

		// 2. Filtre par statut (ouvrir le menu Statut).
		await page.locator('button[aria-label="Statut"]').click();
		await page.waitForTimeout(500);
		await capture(page, "34b-echeances-filtre-statut");

		// Choisir « Impayé ».
		await page.locator('[role="option"]').getByText("Impayé").click();
		await page.waitForTimeout(800);
		await capture(page, "34c-echeances-filtre-impayes");

		console.log("✅ Page échéances capturée avec succès (API simulée).");
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
