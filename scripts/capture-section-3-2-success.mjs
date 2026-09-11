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

async function safeClickSelect(page, label) {
	await dialog(page).locator(`button[aria-label="${label}"]`).click();
	await page.waitForTimeout(300);
}

async function selectFirstOption(page, textMatcher) {
	const option = page.locator('[role="option"]').getByText(textMatcher).first();
	await option.waitFor({ state: "visible", timeout: 8000 });
	await option.click();
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();

	const uniqueId = Date.now().toString(36);
	const batimentCode = `BAT-${uniqueId}`;
	const batimentNom = `Bâtiment Guide ${uniqueId}`;
	const idBatiment = `999-${uniqueId}`;
	const idLogement = `777-${uniqueId}`;
	const numeroLogement = `GSG-ST01-${uniqueId}`;

	try {
		await page.goto(`${BASE_URL}/login`);
		await waitForLoad(page);

		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page.waitForURL("**/home");
		await waitForLoad(page);

		// Interception : création du bâtiment (on laisse passer si elle fonctionne).
		await page.route("**/api/v1/residence/batiments", async (route) => {
			const req = route.request();
			if (req.method() === "POST") {
				await route.fulfill({
					status: 201,
					contentType: "application/json",
					body: JSON.stringify({
						id_batiment: idBatiment,
						code: batimentCode,
						nom: batimentNom,
						adresse: "123 Avenue de la Résidence",
					}),
				});
			} else {
				await route.continue();
			}
		});

		// Interception : liste des bâtiments pour qu'elle contienne le nôtre.
		await page.route("**/api/v1/residence/batiments**", async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([
						{
							id_batiment: idBatiment,
							code: batimentCode,
							nom: batimentNom,
							adresse: "123 Avenue de la Résidence",
						},
					]),
				});
			} else {
				await route.continue();
			}
		});

		await page.goto(`${BASE_URL}/residence/batiments`);
		await waitForLoad(page);

		await page.getByRole("button", { name: /Ajouter un bâtiment/i }).click();
		await page.waitForTimeout(800);

		await dialog(page).getByLabel("Code").fill(batimentCode);
		await dialog(page).getByLabel("Nom").fill(batimentNom);
		await dialog(page).getByLabel("Adresse").fill("123 Avenue de la Résidence");
		await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();
		await waitForLoad(page);
		await page.waitForTimeout(1000);
		await capture(page, "07-batiments-liste-avec-nouveau");

		// Navigation vers les logements : liste vide au départ.
		await page.route("**/api/v1/residence/logements**", async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([]),
				});
			} else {
				await route.continue();
			}
		});

		await page.getByText(batimentNom).first().click();
		await page.waitForURL("**/residence/logements**");
		await waitForLoad(page);
		await capture(page, "08-logements-liste");

		await page.getByRole("button", { name: /Ajouter un logement/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "09-logement-formulaire-vide");

		await safeClickSelect(page, "Type");
		await selectFirstOption(page, "Studio");
		await dialog(page).getByLabel("Tarif (FCFA)").fill("75000");
		await capture(page, "10-logement-formulaire-rempli");

		// Interception : création du logement réussie.
		await page.route("**/api/v1/residence/logements", async (route) => {
			const req = route.request();
			if (req.method() === "POST") {
				await route.fulfill({
					status: 201,
					contentType: "application/json",
					body: JSON.stringify({
						id_logement: idLogement,
						numero: numeroLogement,
						nom: null,
						type: "STUDIO",
						tarif: "75000",
						equipements: null,
						statut: "DISPONIBLE",
						etat: null,
						id_batiment: idBatiment,
					}),
				});
			} else {
				await route.continue();
			}
		});

		await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();

		// Après la sauvegarde, la liste doit contenir le nouveau logement.
		await page.route("**/api/v1/residence/logements**", async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([
						{
							id_logement: idLogement,
							numero: numeroLogement,
							nom: null,
							type: "STUDIO",
							tarif: "75000",
							equipements: null,
							statut: "DISPONIBLE",
							etat: null,
							id_batiment: idBatiment,
						},
					]),
				});
			} else {
				await route.continue();
			}
		});

		await waitForLoad(page);
		await page.waitForTimeout(1000);
		await capture(page, "11-logements-liste-avec-nouveau");

		// --- 3.2 bis : Ajout de logements par lot ---
		await page.getByRole("button", { name: /Créer un lot/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "12-lot-formulaire-vide");

		// Le bâtiment est déjà sélectionné par défaut. On choisit le type Studio.
		await dialog(page).locator("#type").click();
		await page.waitForTimeout(300);
		await page.locator('[role="option"]').getByText("Studio").first().click();
		await page.waitForTimeout(300);

		// On remplit le tarif et la quantité.
		await dialog(page).getByLabel("Tarif (FCFA)").fill("60000");
		await dialog(page).getByLabel("Quantité").fill("5");
		await capture(page, "13-lot-formulaire-rempli");

		// Interception : création du lot (POST /logements/lot).
		const idLotBase = `888-${uniqueId}`;
		const logementsLot = Array.from({ length: 5 }, (_, i) => ({
			id_logement: `${idLotBase}-${i}`,
			numero: `GSG-ST${String(i + 2).padStart(2, "0")}-${uniqueId}`,
			nom: null,
			type: "STUDIO",
			tarif: "60000",
			equipements: null,
			statut: "DISPONIBLE",
			etat: null,
			id_batiment: idBatiment,
		}));

		await page.route("**/api/v1/residence/logements/lot", async (route) => {
			const req = route.request();
			if (req.method() === "POST") {
				await route.fulfill({
					status: 201,
					contentType: "application/json",
					body: JSON.stringify(logementsLot),
				});
			} else {
				await route.continue();
			}
		});

		await dialog(page).getByRole("button", { name: /Créer le lot/i }).click();
		await page.waitForTimeout(1500);
		await capture(page, "14-lot-resultat");

		// Fermer la boîte de dialogue.
		await dialog(page).getByRole("button", { name: /Fermer/i }).click();
		await page.waitForTimeout(800);

		// La liste contient maintenant le lot + le logement initial.
		const tousLogements = [
			{
				id_logement: idLogement,
				numero: numeroLogement,
				nom: null,
				type: "STUDIO",
				tarif: "75000",
				equipements: null,
				statut: "DISPONIBLE",
				etat: null,
				id_batiment: idBatiment,
			},
			...logementsLot,
		];
		await page.route("**/api/v1/residence/logements**", async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify(tousLogements),
				});
			} else {
				await route.continue();
			}
		});

		await waitForLoad(page);
		await page.waitForTimeout(1000);
		await capture(page, "15-logements-liste-apres-lot");

		// --- 3.3 : Fiche logement ---
		// Interception : détail du logement (GET /logements/{id}).
		await page.route(`**/api/v1/residence/logements/${idLogement}`, async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					id_logement: idLogement,
					numero: numeroLogement,
					nom: null,
					type: "STUDIO",
					tarif: "75000",
					equipements: "Lit, Placard, Climatiseur",
					statut: "DISPONIBLE",
					etat: "Bon état",
					id_batiment: idBatiment,
				}),
			});
		});

		// Interception : contrats (vide pour la fiche).
		await page.route("**/api/v1/residence/contrats**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([]),
			});
		});

		// Interception : séjours (vide pour la fiche).
		await page.route("**/api/v1/residence/sejours**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([]),
			});
		});

		// Interception : charges (vide pour la fiche).
		await page.route("**/api/v1/residence/charges**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([]),
			});
		});

		// Interception : catégories de charges.
		await page.route("**/api/v1/residence/categories-charges**", async (route) => {
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify([]),
			});
		});

		// Aller sur la fiche du premier logement créé.
		await page.goto(`${BASE_URL}/residence/logements/${idLogement}`);
		await waitForLoad(page);
		await page.waitForTimeout(1000);
		await capture(page, "16-logement-fiche");

		console.log("✅ Section 3.2 + 3.3 (fiche logement) capturées avec succès (API simulée).");
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
