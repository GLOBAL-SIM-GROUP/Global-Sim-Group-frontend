import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR = process.env.OUT_DIR || "docs/guides-utilisation/screenshots/residence";

const errors = [];

async function capture(page, name) {
	const filePath = path.join(OUT_DIR, `${name}.png`);
	await page.screenshot({ path: filePath, fullPage: true });
	console.log(`📸 ${name}`);
}

async function waitForLoad(page) {
	await page.waitForLoadState("networkidle");
	await page.waitForTimeout(600);
}

async function dismissToasts(page) {
	await page.waitForTimeout(2500);
}

function dialog(page) {
	return page.locator('[role="dialog"]');
}

async function safeClickSelect(page, label) {
	await dialog(page).locator(`button[aria-label="${label}"]`).click();
	await page.waitForTimeout(300);
}

async function selectFirstOption(page, textMatcher) {
	const option = textMatcher
		? page.locator('[role="option"]').getByText(textMatcher).first()
		: page.locator('[role="option"]').first();
	await option.waitFor({ state: "visible", timeout: 8000 });
	await option.click();
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await context.newPage();

	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
	});
	page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));
	page.on("response", (res) => {
		if (res.status() >= 500) errors.push(`[http ${res.status()}] ${res.url()}`);
	});

	const uniqueId = Date.now().toString(36);

	try {
		// 01-02. Connexion + tableau de bord
		await page.goto(`${BASE_URL}/login`);
		await waitForLoad(page);
		await capture(page, "01-login");

		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page.waitForURL("**/home");
		await waitForLoad(page);
		await capture(page, "02-dashboard");

		// 03. Sidebar Résidence
		await page.getByRole("button", { name: "Résidence" }).click();
		await page.waitForTimeout(500);
		await capture(page, "03-sidebar-residence");

		// 04-07. Bâtiments
		await page.goto(`${BASE_URL}/residence/batiments`);
		await waitForLoad(page);
		await capture(page, "04-batiments-liste");

		await page.getByRole("button", { name: /Ajouter un bâtiment/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "05-batiment-formulaire-vide");

		await dialog(page).getByLabel("Code").fill(`BAT-${uniqueId}`);
		await dialog(page).getByLabel("Nom").fill(`Bâtiment Guide ${uniqueId}`);
		await dialog(page).getByLabel("Adresse").fill("123 Avenue de la Résidence");
		await capture(page, "06-batiment-formulaire-rempli");

		await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();
		await waitForLoad(page);
		await dismissToasts(page);
		await page.waitForTimeout(1000);
		await capture(page, "07-batiments-liste-avec-nouveau");

		// 08-11. Logements
		await page.getByPlaceholder(/Rechercher un bâtiment/i).fill(`Guide ${uniqueId}`);
		await page.waitForTimeout(800);
		await page.getByText(`Bâtiment Guide ${uniqueId}`).first().click();
		await page.waitForURL("**/residence/logements**");
		await waitForLoad(page);
		await capture(page, "08-logements-liste");

		await page.getByRole("button", { name: /Ajouter un logement/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "09-logement-formulaire-vide");

		await safeClickSelect(page, "Type");
		await selectFirstOption(page, "Studio");
		await dialog(page).getByLabel("Tarif (FCFA)").fill("75000");
		// Le statut est "Disponible" par défaut ; on le laisse tel quel.
		await capture(page, "10-logement-formulaire-rempli");

		await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();
		await waitForLoad(page);
		await page.waitForTimeout(1000);
		await capture(page, "10b-logement-formulaire-erreur");

		// Fermer la modale pour reprendre la liste (l'enregistrement a échoué).
		await dialog(page).getByRole("button", { name: /Annuler/i }).click();
		await page.waitForTimeout(600);
		await capture(page, "11-logements-liste-apres-erreur");

		// 12-18. Contrats (résilient en cas d'erreur backend)
		await page.goto(`${BASE_URL}/residence/contrats`);
		await waitForLoad(page);
		await capture(page, "12-contrats-liste");

		try {
			await page.getByRole("button", { name: /Nouveau contrat/i }).click();
			await page.waitForTimeout(800);
			await capture(page, "13-contrat-formulaire-vide");

			await dialog(page).getByPlaceholder(/Rechercher par nom/i).fill("GuideClient");
			await page.waitForTimeout(800);
			await capture(page, "14-contrat-recherche-client-vide");

			await dialog(page).getByRole("button", { name: /Créer un locataire/i }).first().click();
			await page.waitForTimeout(800);
			await capture(page, "15-contrat-creation-rapide-client");

			await dialog(page).getByLabel("Nom").first().fill(`Guide${uniqueId}`);
			await dialog(page).getByLabel(/Prénom/i).first().fill("Client");
			await dialog(page).getByLabel("Téléphone principal").fill("0123456789");
			await dialog(page).getByLabel("Date de naissance").fill("1990-01-01");
			await dialog(page).getByLabel("Lieu de naissance").fill("Yaoundé");
			await safeClickSelect(page, "Sexe");
			await selectFirstOption(page, "Masculin");
			await dialog(page).getByLabel("Nationalité").fill("Camerounaise");
			await dialog(page).getByLabel("Profession").fill("Ingénieur");
			await dialog(page).getByLabel(/Adresse e-mail/i).fill(`client${uniqueId}@test.com`);
			await dialog(page).getByLabel("Adresse habituelle").fill("Rue 123");
			await dialog(page).getByLabel("Ville").fill("Douala");
			await dialog(page).getByLabel("Pays").fill("Cameroun");
			await capture(page, "16-contrat-client-rempli");

			await dialog(page).getByRole("button", { name: "Enregistrer" }).click();
			await waitForLoad(page);
			await page.waitForTimeout(1000);
			await capture(page, "17-contrat-client-selectionne");

			await safeClickSelect(page, "Bâtiment");
			await selectFirstOption(page, new RegExp(`Bâtiment Guide ${uniqueId}`));
			await page.waitForTimeout(2000);
			await capture(page, "17b-contrat-batiment-selectionne");

			await safeClickSelect(page, "Logement");
			await page.waitForTimeout(500);
			await capture(page, "17c-contrat-logement-ouvert");
			await selectFirstOption(page);
			await dialog(page).getByLabel("Date de début").fill("2026-10-01");
			await dialog(page).getByLabel("Durée").fill("12");
			await dialog(page).getByLabel("Montant du loyer").fill("75000");
			await dialog(page).getByLabel("Caution").fill("150000");
			await capture(page, "18-contrat-formulaire-rempli");

			await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();
			await waitForLoad(page);
			await dismissToasts(page);
			await capture(page, "19-contrats-liste-avec-nouveau");

			await page.getByRole("link", { name: new RegExp(`Guide.*${uniqueId}`) }).first().click();
			await page.waitForURL("**/residence/contrats/**");
			await waitForLoad(page);
			await capture(page, "20-contrat-fiche");

			await page.getByRole("button", { name: /^Activer$/i }).click();
			await page.waitForTimeout(800);
			await dismissToasts(page);
			await capture(page, "21-contrat-active");
		} catch (err) {
			errors.push(`[contrat] ${err.message}`);
			console.log("⚠️ Étape contrat interrompue :", err.message);
		}

		// 22-25. Séjours courts (résilient)
		await page.goto(`${BASE_URL}/residence/sejours-courts`);
		await waitForLoad(page);
		await capture(page, "22-sejours-liste");

		try {
			await page.getByRole("button", { name: /Nouveau séjour/i }).click();
			await page.waitForTimeout(800);
			await capture(page, "23-sejour-formulaire-vide");

			await dialog(page).getByPlaceholder(/Rechercher par nom/i).fill("Guide");
			await page.waitForTimeout(800);
			await page.getByText(/Guide.*Client/i).first().click();
			await safeClickSelect(page, "Bâtiment");
			await selectFirstOption(page, new RegExp(`Bâtiment Guide ${uniqueId}`));
			await page.waitForTimeout(2000);
			await safeClickSelect(page, "Logement");
			await page.waitForTimeout(300);
			await selectFirstOption(page);
			await dialog(page).getByLabel("Date et heure d'arrivée").fill("2026-10-05T14:00");
			await dialog(page).getByLabel("Départ prévu").fill("2026-10-06T12:00");
			await dialog(page).getByLabel("Tarif").fill("25000");
			await safeClickSelect(page, "Moyen de paiement");
			await selectFirstOption(page, "Espèces");
			await capture(page, "24-sejour-formulaire-rempli");

			await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();
			await waitForLoad(page);
			await dismissToasts(page);
			await capture(page, "25-sejours-liste-avec-nouveau");
		} catch (err) {
			errors.push(`[sejour] ${err.message}`);
			console.log("⚠️ Étape séjour interrompue :", err.message);
		}

		// 26-29. Charges (résilient)
		await page.goto(`${BASE_URL}/residence/charges`);
		await waitForLoad(page);
		await capture(page, "26-charges-liste");

		try {
			await page.getByRole("button", { name: /Nouvelle charge/i }).click();
			await page.waitForTimeout(800);
			await capture(page, "27-charge-formulaire-vide");

			await safeClickSelect(page, "Bâtiment");
			await selectFirstOption(page, new RegExp(`Bâtiment Guide ${uniqueId}`));
			await page.waitForTimeout(2000);
			await safeClickSelect(page, "Logement");
			await page.waitForTimeout(300);
			await selectFirstOption(page);
			await safeClickSelect(page, "Catégorie");
			await selectFirstOption(page);
			await dialog(page).getByLabel("Période").fill("2026-10");
			await dialog(page).getByLabel("Montant").fill("5000");
			await capture(page, "28-charge-formulaire-rempli");

			await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();
			await waitForLoad(page);
			await dismissToasts(page);
			await capture(page, "29-charges-liste-avec-nouveau");
		} catch (err) {
			errors.push(`[charge] ${err.message}`);
			console.log("⚠️ Étape charge interrompue :", err.message);
		}

		// 30-33. Abonnements (résilient)
		await page.goto(`${BASE_URL}/residence/abonnements`);
		await waitForLoad(page);
		await capture(page, "30-abonnements-liste");

		try {
			await page.getByRole("button", { name: /Nouvel abonnement/i }).click();
			await page.waitForTimeout(800);
			await capture(page, "31-abonnement-formulaire-vide");

			await dialog(page).getByPlaceholder(/Rechercher par nom/i).fill("Guide");
			await page.waitForTimeout(800);
			await page.getByText(/Guide.*Client/i).first().click();
			await safeClickSelect(page, "Service");
			await selectFirstOption(page);
			await safeClickSelect(page, "Type");
			await selectFirstOption(page, "Mensuel");
			await dialog(page).getByLabel("Montant").fill("5000");
			await dialog(page).getByLabel("Date de début").fill("2026-10-01");
			await dialog(page).getByLabel("Date de fin").fill("2027-10-01");
			await capture(page, "32-abonnement-formulaire-rempli");

			await dialog(page).getByRole("button", { name: /Enregistrer/i }).click();
			await waitForLoad(page);
			await dismissToasts(page);
			await capture(page, "33-abonnements-liste-avec-nouveau");
		} catch (err) {
			errors.push(`[abonnement] ${err.message}`);
			console.log("⚠️ Étape abonnement interrompue :", err.message);
		}

		// 34. Échéances
		await page.goto(`${BASE_URL}/residence/echeances`);
		await waitForLoad(page);
		await capture(page, "34-echeances-liste");

		// 35. Portail résident
		await page.goto(`${BASE_URL}/residence/portail`);
		await waitForLoad(page);
		await capture(page, "35-portail-resident");

		console.log("\n✅ Captures terminées");
	} catch (err) {
		console.error("\n❌ Échec des captures :", err);
		errors.push(`[script] ${err.message}`);
		throw err;
	} finally {
		if (errors.length > 0) {
			console.log("\n⚠️ Erreurs détectées :");
			errors.forEach((e) => console.log(` - ${e}`));
		}
		await browser.close();
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
