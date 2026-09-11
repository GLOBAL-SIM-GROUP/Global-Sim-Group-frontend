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

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();

	const uniqueId = Date.now().toString(36);

	const batiments = [
		{ id_batiment: "b1", code: "BAT-A", nom: "Bâtiment A", adresse: "Rue 1", actif: true },
		{ id_batiment: "b2", code: "BAT-B", nom: "Bâtiment B", adresse: "Rue 2", actif: true },
		{ id_batiment: "b3", code: "BAT-C", nom: "Ancien bâtiment C", adresse: "Rue 3", actif: false },
	];

	const logements = [
		{ id_logement: "l1", numero: `GSG-ST01-${uniqueId}`, nom: null, type: "STUDIO", tarif: "75000", equipements: null, statut: "DISPONIBLE", etat: null, id_batiment: "b1" },
		{ id_logement: "l2", numero: `GSG-CH02-${uniqueId}`, nom: null, type: "CHAMBRE", tarif: "60000", equipements: null, statut: "OCCUPE", etat: null, id_batiment: "b1" },
		{ id_logement: "l3", numero: `GSG-ST03-${uniqueId}`, nom: null, type: "STUDIO", tarif: "75000", equipements: null, statut: "EN_MAINTENANCE", etat: null, id_batiment: "b1" },
	];

	const contrats = [
		{ id_contrat: "c1", numero_contrat: `CTR-A-${uniqueId}`, id_client: "cl1", id_logement: "l2", date_debut: "2026-10-01", date_fin_prevue: "2027-09-30", duree_mois: 12, type_location: "MENSUEL", montant_loyer: "75000", periodicite: "MENSUEL", statut: "ACTIF", date_signature: "2026-09-30" },
		{ id_contrat: "c2", numero_contrat: `CTR-B-${uniqueId}`, id_client: "cl2", id_logement: "l1", date_debut: "2026-11-01", date_fin_prevue: "2027-10-31", duree_mois: 12, type_location: "MENSUEL", montant_loyer: "60000", periodicite: "MENSUEL", statut: "EN_ATTENTE", date_signature: null },
		{ id_contrat: "c3", numero_contrat: `CTR-C-${uniqueId}`, id_client: "cl3", id_logement: "l3", date_debut: "2025-10-01", date_fin_prevue: "2026-09-30", duree_mois: 12, type_location: "ANNUEL", montant_loyer: "900000", periodicite: "ANNUEL", statut: "RESILIE", date_signature: "2025-09-30" },
	];

	const clients = {
		cl1: { id_client: "cl1", nom: "Nkoulou", prenoms: "Marie", tel_principal: "0123456789", tel_secondaire: null, email: "marie@test.com", adresse: "Rue 1", ville: "Douala", type_client: "LOCATAIRE", date_enregistrement: "2026-01-15" },
		cl2: { id_client: "cl2", nom: "Kamga", prenoms: "Paul", tel_principal: "0234567890", tel_secondaire: null, email: "paul@test.com", adresse: "Rue 2", ville: "Yaoundé", type_client: "LOCATAIRE", date_enregistrement: "2026-02-20" },
		cl3: { id_client: "cl3", nom: "Tchoupo", prenoms: "Claire", tel_principal: "0345678901", tel_secondaire: null, email: "claire@test.com", adresse: "Rue 3", ville: "Douala", type_client: "LOCATAIRE", date_enregistrement: "2025-08-10" },
	};

	const logementsDetail = {
		l1: { id_logement: "l1", numero: `GSG-ST01-${uniqueId}`, nom: null, type: "STUDIO", tarif: "75000", equipements: null, statut: "DISPONIBLE", etat: null, id_batiment: "b1" },
		l2: { id_logement: "l2", numero: `GSG-CH02-${uniqueId}`, nom: null, type: "CHAMBRE", tarif: "60000", equipements: null, statut: "OCCUPE", etat: null, id_batiment: "b1" },
		l3: { id_logement: "l3", numero: `GSG-ST03-${uniqueId}`, nom: null, type: "STUDIO", tarif: "75000", equipements: null, statut: "EN_MAINTENANCE", etat: null, id_batiment: "b1" },
	};

	const sejours = [
		{ id_sejour: "s1", type_prestation: "NUITEE", id_client: "cl1", id_logement: "l1", date_heure_arrivee: "2026-11-20 20:00:00", date_heure_depart_prevue: "2026-11-21 12:00:00", date_heure_depart_reelle: null, duree: null, tarif: "25000", montant_total: "25000", montant_paye: "25000", reste_a_payer: "0", id_moyen_paiement: "1", statut: "TERMINE", numero_logement: `GSG-ST01-${uniqueId}`, client_nom: "Nkoulou", client_prenoms: "Marie" },
		{ id_sejour: "s2", type_prestation: "SIESTE", id_client: "cl2", id_logement: "l1", date_heure_arrivee: "2026-12-01 13:00:00", date_heure_depart_prevue: "2026-12-01 18:00:00", date_heure_depart_reelle: null, duree: null, tarif: "15000", montant_total: "15000", montant_paye: "0", reste_a_payer: "15000", id_moyen_paiement: null, statut: "EN_COURS", numero_logement: `GSG-ST01-${uniqueId}`, client_nom: "Kamga", client_prenoms: "Paul" },
		{ id_sejour: "s3", type_prestation: "NUITEE", id_client: "cl3", id_logement: "l2", date_heure_arrivee: "2026-11-25 20:00:00", date_heure_depart_prevue: "2026-11-26 12:00:00", date_heure_depart_reelle: null, duree: null, tarif: "25000", montant_total: "25000", montant_paye: "0", reste_a_payer: "25000", id_moyen_paiement: null, statut: "ANNULE", numero_logement: `GSG-CH02-${uniqueId}`, client_nom: "Tchoupo", client_prenoms: "Claire" },
	];

	try {
		await page.goto(`${BASE_URL}/login`);
		await waitForLoad(page);
		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page.waitForURL("**/home");
		await waitForLoad(page);

		// Mocks communs.
		await page.route("**/api/v1/residence/batiments**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(batiments) });
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/residence/logements**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(logements) });
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/residence/contrats**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(contrats) });
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/residence/sejours**", async (route) => {
			if (route.request().method() === "GET") {
				await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(sejours) });
			} else {
				await route.continue();
			}
		});
		await page.route("**/api/v1/finances/moyens-paiement**", async (route) => {
			await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify([{ id_moyen: "1", libelle: "Espèces", actif: true }]) });
		});
		// Détails clients et logements (résolution des noms sur la liste contrats).
		await page.route("**/api/v1/client/clients/**", async (route) => {
			const url = route.request().url();
			const id = url.split("/").pop();
			const client = clients[id];
			await route.fulfill({
				status: client ? 200 : 404,
				contentType: "application/json",
				body: client ? JSON.stringify(client) : "{}",
			});
		});
		await page.route("**/api/v1/residence/logements/**", async (route) => {
			if (route.request().method() !== "GET") return route.continue();
			const url = route.request().url();
			// Ne pas intercepter le lister (déjà géré) ; seulement les /{id}.
			const match = url.match(/\/logements\/([^/?]+)$/);
			if (!match) return route.continue();
			const logement = logementsDetail[match[1]];
			await route.fulfill({
				status: logement ? 200 : 404,
				contentType: "application/json",
				body: logement ? JSON.stringify(logement) : "{}",
			});
		});

		// --- 1. Bâtiments : filtre Actif -----------------------------------
		await page.goto(`${BASE_URL}/residence/batiments`);
		await waitForLoad(page);
		await capture(page, "04-batiments-liste");

		await page.locator('button[aria-label="Actif"]').click();
		await page.waitForTimeout(400);
		await capture(page, "04b-batiments-filtre-actif");
		await page.locator('[role="option"]').getByText("Actif", { exact: true }).click();
		await page.waitForTimeout(600);
		await capture(page, "04c-batiments-filtre-actifs");

		// --- 2. Logements : filtres Type + Statut --------------------------
		await page.goto(`${BASE_URL}/residence/logements?batiment=b1`);
		await waitForLoad(page);
		await capture(page, "08-logements-liste");

		await page.locator('button[aria-label="Type"]').click();
		await page.waitForTimeout(400);
		await capture(page, "08b-logements-filtre-type");
		await page.locator('[role="option"]').getByText("Studio").click();
		await page.waitForTimeout(600);
		await capture(page, "08c-logements-filtre-type-studio");

		// --- 3. Contrats : filtre Statut -----------------------------------
		await page.goto(`${BASE_URL}/residence/contrats`);
		await waitForLoad(page);
		await capture(page, "12-contrats-liste");

		await page.locator('button[aria-label="Statut"]').click();
		await page.waitForTimeout(400);
		await capture(page, "12b-contrats-filtre-statut");
		await page.locator('[role="option"]').getByText("Actif").click();
		await page.waitForTimeout(600);
		await capture(page, "12c-contrats-filtre-actifs");

		// --- 4. Séjours : filtre Type --------------------------------------
		await page.goto(`${BASE_URL}/residence/sejours-courts`);
		await waitForLoad(page);
		await capture(page, "22-sejours-liste");

		await page.locator('button[aria-label="Type"]').click();
		await page.waitForTimeout(400);
		await capture(page, "22b-sejours-filtre-type");
		await page.locator('[role="option"]').getByText("Nuitée").click();
		await page.waitForTimeout(600);
		await capture(page, "22c-sejours-filtre-type-nuitee");

		console.log("✅ Filtres bâtiments, logements, contrats et séjours capturés avec succès (API simulée).");
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
