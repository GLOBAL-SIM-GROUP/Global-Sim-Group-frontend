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

function dialog(page) {
	return page.locator('[role="dialog"]');
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();

	const uniqueId = Date.now().toString(36);
	const idContrat = `555-${uniqueId}`;
	const numeroContrat = `CTR-${uniqueId}`;
	const idClient = `333-${uniqueId}`;
	const idLogement = `777-${uniqueId}`;
	const idCaution = `444-${uniqueId}`;

	// Échéances : 2 impayées + 1 payée (pour montrer le bouton lot + le bouton reçu).
	const echeances = [
		{
			id_echeance: `e1-${uniqueId}`,
			id_contrat: idContrat,
			mois: 10,
			annee: 2026,
			montant: "75000",
			montant_paye: null,
			date_echeance: "2026-10-01",
			statut: "IMPAYE",
			id_paiement: null,
		},
		{
			id_echeance: `e2-${uniqueId}`,
			id_contrat: idContrat,
			mois: 11,
			annee: 2026,
			montant: "75000",
			montant_paye: null,
			date_echeance: "2026-11-01",
			statut: "IMPAYE",
			id_paiement: null,
		},
		{
			id_echeance: `e3-${uniqueId}`,
			id_contrat: idContrat,
			mois: 9,
			annee: 2026,
			montant: "75000",
			montant_paye: "75000",
			date_echeance: "2026-09-01",
			statut: "PAYE",
			id_paiement: `p1-${uniqueId}`,
		},
	];

	// Caution : état mutable pour capturer successivement non payée puis payée.
	let caution = {
		id_caution: idCaution,
		id_contrat: idContrat,
		montant: "150000",
		date_versement: null,
		payee: false,
		date_restitution: null,
		montant_restitue: null,
		retenue: null,
		motif_retenue: null,
		statut: "EN_COURS",
		historique: [],
	};

	try {
		await page.goto(`${BASE_URL}/login`);
		await waitForLoad(page);

		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page.waitForURL("**/home");
		await waitForLoad(page);

		// --- Mocks API -------------------------------------------------------
		// Détail du contrat (embarque les échéances).
		await page.route(`**/api/v1/residence/contrats/${idContrat}`, async (route) => {
			const req = route.request();
			if (req.method() !== "GET") return route.continue();
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					id_contrat: idContrat,
					numero_contrat: numeroContrat,
					id_client: idClient,
					id_logement: idLogement,
					date_debut: "2026-10-01",
					date_fin_prevue: "2027-09-30",
					duree_mois: 12,
					type_location: "MENSUEL",
					montant_loyer: "75000",
					periodicite: "MENSUEL",
					statut: "ACTIF",
					date_signature: "2026-09-30",
					echeances,
				}),
			});
		});

		// Client (résolution du nom sur la fiche).
		await page.route(`**/api/v1/client/clients/${idClient}`, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					id_client: idClient,
					nom: "Nkoulou",
					prenoms: "Marie",
					tel_principal: "0123456789",
					tel_secondaire: null,
					email: "marie.nkoulou@test.com",
					adresse: "Rue 123",
					ville: "Douala",
					type_client: "LOCATAIRE",
					date_enregistrement: "2026-01-15",
				}),
			});
		});

		// Logement (numéro sur la fiche).
		await page.route(`**/api/v1/residence/logements/${idLogement}`, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					id_logement: idLogement,
					numero: `GSG-ST01-${uniqueId}`,
					nom: null,
					type: "STUDIO",
					tarif: "75000",
					equipements: "Lit, Placard, Climatiseur",
					statut: "OCCUPE",
					etat: "Bon état",
					id_batiment: "999",
				}),
			});
		});

		// Moyens de paiement.
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

		// Caution (état mutable).
		await page.route(`**/api/v1/residence/contrats/${idContrat}/caution`, async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(caution),
				});
			} else {
				await route.continue();
			}
		});

		// État des lieux : 2 photos (entrée + sortie).
		const photos = [
			{
				id_photo: `ph1-${uniqueId}`,
				id_contrat: idContrat,
				type: "ENTREE",
				piece: "Salon",
				cle_objet: `etat-lieux/1-${uniqueId}.jpg`,
				commentaire: "Murs propres, aucun dégât.",
				id_utilisateur: "1",
				date_ajout: "2026-10-01 10:00:00",
			},
			{
				id_photo: `ph2-${uniqueId}`,
				id_contrat: idContrat,
				type: "SORTIE",
				piece: "Chambre",
				cle_objet: `etat-lieux/2-${uniqueId}.jpg`,
				commentaire: "Peinture à refaire sur un mur.",
				id_utilisateur: "1",
				date_ajout: "2026-11-15 16:30:00",
			},
		];
		await page.route(`**/api/v1/residence/contrats/${idContrat}/etat-des-lieux`, async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(photos),
				});
			} else {
				await route.continue();
			}
		});

		// Envoi par email (feedback succès).
		await page.route(`**/api/v1/residence/contrats/${idContrat}/envoyer-email`, async (route) => {
			if (route.request().method() === "POST") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({ envoye: true }),
				});
			} else {
				await route.continue();
			}
		});

		// --- 1. Fiche contrat (onglet Échéances par défaut) -----------------
		await page.goto(`${BASE_URL}/residence/contrats/${idContrat}`);
		await waitForLoad(page);
		await capture(page, "18-contrat-fiche");

		// 2. Envoyer par email → feedback succès.
		await page.getByRole("button", { name: /Envoyer par email/i }).click();
		await page.waitForTimeout(1200);
		await capture(page, "18b-contrat-fiche-email");

		// 3. Encaisser une échéance (première ligne impayée).
		await page
			.getByRole("button", { name: /Enregistrer un paiement/i })
			.first()
			.click();
		await page.waitForTimeout(800);
		await capture(page, "18c-contrat-fiche-encaisser-echeance");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(500);

		// 4. Encaissement en lot.
		await page.getByRole("button", { name: /Encaissement en lot/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "18d-contrat-fiche-encaisser-lot");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(500);

		// 5. Onglet Caution (non payée → bouton « Déclarer le versement »).
		await page.getByRole("tab", { name: "Caution" }).click();
		await page.waitForTimeout(800);
		await capture(page, "18e-contrat-fiche-caution");

		// 6. Déclarer le versement de la caution.
		await page.getByRole("button", { name: /Déclarer le versement/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "18f-contrat-fiche-caution-versement");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(500);

		// 7. Caution payée → bouton « Restituer la caution ».
		caution = {
			...caution,
			payee: true,
			date_versement: "2026-10-01",
			historique: [
				{
					evenement: "Versement",
					date: "2026-10-01 09:00:00",
					montant: "150000",
					motif: null,
				},
			],
		};
		// Recharger l'onglet (re-navigation pour refetch la caution).
		await page.goto(`${BASE_URL}/residence/contrats/${idContrat}`);
		await waitForLoad(page);
		await page.getByRole("tab", { name: "Caution" }).click();
		await page.waitForTimeout(800);
		await capture(page, "18g-contrat-fiche-caution-payee");

		// 8. Restituer la caution.
		await page.getByRole("button", { name: /Restituer la caution/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "18h-contrat-fiche-caution-restitution");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(500);

		// 9. Onglet État des lieux (photos entrée + sortie).
		await page.getByRole("tab", { name: "État des lieux" }).click();
		await page.waitForTimeout(1200);
		await capture(page, "18i-contrat-fiche-etat-des-lieux");

		// 10. Ajouter une photo.
		await page.getByRole("button", { name: /Ajouter une photo/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "18j-contrat-fiche-etat-des-lieux-ajouter");
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(500);

		// --- 11. Portail résident : état des lieux --------------------------
		await page.route("**/api/v1/residence/portail/etat-des-lieux", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					photos: [
						{
							id_photo: `ph1-${uniqueId}`,
							id_contrat: idContrat,
							numero_contrat: numeroContrat,
							type: "ENTREE",
							piece: "Salon",
							cle_objet: `etat-lieux/1-${uniqueId}.jpg`,
							commentaire: "Murs propres, aucun dégât.",
							date_ajout: "2026-10-01 10:00:00",
						},
						{
							id_photo: `ph2-${uniqueId}`,
							id_contrat: idContrat,
							numero_contrat: numeroContrat,
							type: "SORTIE",
							piece: "Chambre",
							cle_objet: `etat-lieux/2-${uniqueId}.jpg`,
							commentaire: "Peinture à refaire sur un mur.",
							date_ajout: "2026-11-15 16:30:00",
						},
					],
				}),
			});
		});

		await page.goto(`${BASE_URL}/residence/portail/etat-des-lieux`);
		await waitForLoad(page);
		await capture(page, "36-portail-etat-des-lieux");

		console.log("✅ Fiche contrat + portail capturés avec succès (API simulée).");
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
