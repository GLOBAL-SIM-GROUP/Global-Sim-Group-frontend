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

		// Un bâtiment existe déjà.
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
							actif: true,
						},
					]),
				});
			} else {
				await route.continue();
			}
		});

		// Un logement DISPONIBLE existe déjà dans ce bâtiment.
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
							equipements: "Lit, Placard, Climatiseur",
							statut: "DISPONIBLE",
							etat: "Bon état",
							id_batiment: idBatiment,
						},
					]),
				});
			} else {
				await route.continue();
			}
		});

		// Liste des séjours vide.
		await page.route("**/api/v1/residence/sejours**", async (route) => {
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

		// Moyens de paiement (module Finances) : un moyen actif.
		await page.route("**/api/v1/finances/moyens-paiement**", async (route) => {
			const req = route.request();
			if (req.method() === "GET") {
				await route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([
						{ id_moyen: "1", libelle: "Espèces", actif: true },
					]),
				});
			} else {
				await route.continue();
			}
		});

		await page.goto(`${BASE_URL}/residence/sejours-courts`);
		await waitForLoad(page);

		// Ouvre le formulaire « Nouveau séjour ».
		await page.getByRole("button", { name: /Nouveau séjour/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "23-sejour-formulaire-vide");

		// Choisir le bâtiment.
		await dialog(page).locator('button[aria-label="Bâtiment"]').click();
		await page.waitForTimeout(300);
		const optionBatiment = page
			.locator('[role="option"]')
			.getByText(new RegExp(batimentNom));
		await optionBatiment.waitFor({ state: "visible", timeout: 8000 });
		await optionBatiment.click();
		await page.waitForTimeout(1000);
		await capture(page, "23b-sejour-batiment-selectionne");

		// Ouvrir le menu du logement : un logement DISPONIBLE doit apparaître.
		await dialog(page).locator('button[aria-label="Logement"]').click();
		await page.waitForTimeout(800);
		await capture(page, "23c-sejour-logement-ouvert");

		// Sélectionner le logement existant.
		const optionLogement = page
			.locator('[role="option"]')
			.getByText(new RegExp(numeroLogement));
		await optionLogement.waitFor({ state: "visible", timeout: 8000 });
		await optionLogement.click();
		await page.waitForTimeout(800);
		await capture(page, "23d-sejour-logement-selectionne");

		console.log("✅ Section 5.2 capturée avec succès (logement existant, API simulée).");
	} finally {
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
