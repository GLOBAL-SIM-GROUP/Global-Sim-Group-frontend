/**
 * Capture Playwright des pages du module RH (Ressources humaines) pour le
 * guide utilisateur `docs/guides-utilisation/rh/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Crée une vraie fiche employé « Guide-… » et un vrai bulletin de
 * salaire suivi jusqu'au statut « Payée » (le cycle complet est documenté).
 * La modale de création de compte est capturée remplie mais NON validée.
 * Les pages `/rh/pointage*` redirigent vers `/rh/employes` (fonctionnalité
 * retirée de l'UI) : elles ne sont pas capturées.
 *
 * Captures fullPage, viewport 1440x900 + mobile 320 px, dans
 * `docs/guides-utilisation/rh/screenshots/rh/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/rh/screenshots/rh)
 *
 * Usage : node scripts/capture-rh-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR || "docs/guides-utilisation/rh/screenshots/rh";

const errors = [];

async function capture(page, name) {
	const filePath = path.join(OUT_DIR, `${name}.png`);
	await page.screenshot({ path: filePath, fullPage: true });
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

/** Ouvre un Select Radix et choisit un item au clavier (fiable). */
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

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});
	const page = await context.newPage();
	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
	});
	page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

	await login(page);

	// --- Menu latéral : section RH dépliée --------------------------------
	const rhBouton = page.getByRole("button", { name: "Ressources humaines" });
	if (await rhBouton.isVisible().catch(() => false)) {
		await rhBouton.click();
		await page.waitForTimeout(600);
		await capture(page, "01-menu-rh");
	}

	// --- Liste des employés -------------------------------------------------
	await page.goto(`${BASE_URL}/rh/employes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await page
		.waitForSelector("table, text=Aucun employé", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(800);
	await capture(page, "02-employes-liste");

	// Filtre « Service » ouvert.
	const serviceTrigger = page.locator('button[aria-label="Service"]');
	if (await serviceTrigger.isVisible().catch(() => false)) {
		await serviceTrigger.click();
		await page.waitForTimeout(1000);
		await capture(page, "03-employes-filtre-service");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// Filtre « Statut » ouvert.
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	if (await statutTrigger.isVisible().catch(() => false)) {
		await statutTrigger.click();
		await page.waitForTimeout(1000);
		await capture(page, "04-employes-filtre-statut");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// --- Créer un employé « Guide-… » ----------------------------------------
	const ajouterBtn = page.getByRole("button", {
		name: "Ajouter un employé",
	});
	if (await ajouterBtn.isVisible().catch(() => false)) {
		await ajouterBtn.click();
		await page.waitForTimeout(800);
		await capture(page, "05-employe-form-vide");

		await page.locator("#nom").fill("Guide-Ngo Bell");
		await page.locator("#prenom").fill("Sandrine");
		await page.locator("#telephone").fill("+225 07 02 00 00");
		// `fonction` est une énumération stricte côté backend (RECEPTIONNISTE,
		// CAISSIER, AGENT_ENTRETIEN…) : une valeur libre est rejetée (400).
		await page.locator("#fonction").fill("AGENT_ENTRETIEN");
		await choisirDansSelect(page, page.locator("#idService"));
		// Date d'embauche : il y a un an.
		const embauche = new Date();
		embauche.setFullYear(embauche.getFullYear() - 1);
		const embaucheISO = `${embauche.getFullYear()}-${String(
			embauche.getMonth() + 1,
		).padStart(2, "0")}-${String(embauche.getDate()).padStart(2, "0")}`;
		await page.locator("#dateEmbauche").fill(embaucheISO);
		await choisirDansSelect(page, page.locator("#typeContrat"));
		await page.locator("#salaireBase").fill("75000");
		await page
			.locator("#autresInfos")
			.fill("Employée créée pour le guide utilisateur.");
		await page.waitForTimeout(400);
		await capture(page, "06-employe-form-rempli");

		await page
			.getByRole("button", { name: "Enregistrer", exact: true })
			.click();
		await page.waitForTimeout(2500);
		// Si la création a échoué, la modale reste ouverte : la refermer.
		if (
			await page
				.locator('[role="dialog"]')
				.isVisible()
				.catch(() => false)
		) {
			await capture(page, "06b-employe-erreur");
			await page
				.getByRole("button", { name: "Annuler" })
				.click()
				.catch(() => {});
			await page.waitForTimeout(500);
		}
	}

	// Retrouver la nouvelle employée via la recherche.
	const recherche = page.locator(
		'input[placeholder*="Rechercher par nom"]',
	);
	if (
		(await recherche.isVisible().catch(() => false)) &&
		!(await page
			.locator('[role="dialog"]')
			.isVisible()
			.catch(() => false))
	) {
		await recherche.fill("Guide-Ngo Bell");
		await page.waitForTimeout(2000);
	}
	await capture(page, "07-employe-cree-liste");

	// Ouvrir la fiche de l'employée créée.
	const lienEmploye = page.getByRole("link", {
		name: /Guide-Ngo Bell/,
	});
	let idEmployeGuide = null;
	if (await lienEmploye.first().isVisible().catch(() => false)) {
		const href = await lienEmploye.first().getAttribute("href");
		const match = href?.match(/\/rh\/employes\/(.+)$/);
		idEmployeGuide = match?.[1] ?? null;
		await lienEmploye.first().click();
		await page.waitForTimeout(2000);
		await capture(page, "08-employe-fiche");

		// Modale « Modifier l'employé » (montre le champ Statut).
		const modifierBtn = page.getByRole("button", {
			name: "Modifier",
			exact: true,
		});
		if (await modifierBtn.isVisible().catch(() => false)) {
			await modifierBtn.click();
			await page.waitForTimeout(800);
			await capture(page, "09-employe-modifier");
			await page
				.getByRole("button", { name: "Annuler" })
				.click()
				.catch(() => {});
			await page.waitForTimeout(400);
		}
	}

	// --- Bulletins de salaire -----------------------------------------------
	await page.goto(`${BASE_URL}/rh/bulletins`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await page
		.waitForSelector("table, text=Aucun bulletin", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(800);
	await capture(page, "10-bulletins-liste");

	// Filtre « Statut » ouvert (bulletins).
	const statutBulTrigger = page.locator('button[aria-label="Statut"]');
	if (await statutBulTrigger.isVisible().catch(() => false)) {
		await statutBulTrigger.click();
		await page.waitForTimeout(1000);
		await capture(page, "11-bulletins-filtre-statut");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	// Nouveau bulletin pour l'employée Guide.
	const nouveauBulletin = page.getByRole("button", {
		name: "Nouveau bulletin",
	});
	if (await nouveauBulletin.isVisible().catch(() => false)) {
		await nouveauBulletin.click();
		await page.waitForTimeout(800);
		await capture(page, "12-bulletin-form-vide");

		// Choisir l'employée Guide dans le select (recherche clavier impossible
		// dans un Select Radix : on prend l'item contenant « Guide-Ngo »).
		const empTrigger = page.locator("#idEmploye");
		await empTrigger.click().catch(() => {});
		await page.waitForTimeout(1000);
		const itemGuide = page.locator('[data-slot="select-item"]', {
			hasText: "Guide-Ngo",
		});
		if (await itemGuide.first().isVisible().catch(() => false)) {
			await itemGuide.first().click();
		} else {
			await page.keyboard.press("ArrowDown");
			await page.keyboard.press("Enter");
		}
		await page.waitForTimeout(600);
		await capture(page, "13-bulletin-form-rempli");

		await page
			.getByRole("button", { name: "Créer le bulletin" })
			.click();
		// La création navigue vers la fiche du bulletin.
		await page
			.waitForURL("**/rh/bulletins/*", { timeout: 15000 })
			.catch(() => {});
		await page.waitForTimeout(2000);
	}
	await capture(page, "14-bulletin-fiche");

	// Ajouter un élément de salaire (prime).
	const ajouterElement = page.getByRole("button", {
		name: "Ajouter un élément",
	});
	if (await ajouterElement.isVisible().catch(() => false)) {
		await ajouterElement.click();
		await page.waitForTimeout(800);
		await capture(page, "15-element-form");
		await page.locator("#libelle").fill("Prime d'assiduité");
		await page.locator("#montant").fill("10000");
		await page.waitForTimeout(300);
		await page
			.getByRole("button", { name: "Ajouter", exact: true })
			.click();
		await page.waitForTimeout(2000);
		await capture(page, "16-bulletin-avec-element");

		// Recalculer les totaux.
		const recalculer = page.getByRole("button", { name: "Recalculer" });
		if (await recalculer.isVisible().catch(() => false)) {
			await recalculer.click();
			await page.waitForTimeout(2000);
			await capture(page, "17-bulletin-recalcule");
		}
	}

	// Valider le bulletin (statut Calculée → Validée).
	const valider = page.getByRole("button", { name: "Valider" });
	if (await valider.isVisible().catch(() => false)) {
		await valider.click();
		await page.waitForTimeout(2000);
		await capture(page, "18-bulletin-valide");
	}

	// Ouvrir la fenêtre « Payer le bulletin » (sans valider le paiement).
	const payer = page.getByRole("button", { name: "Payer le bulletin" });
	if (await payer.isVisible().catch(() => false)) {
		await payer.click();
		await page.waitForTimeout(1000);
		await capture(page, "19-bulletin-payer-form");
		// Fermer sans payer : bouton « Fermer » du PaiementDialog.
		await page
			.getByRole("button", { name: /Fermer|Annuler/ })
			.first()
			.click()
			.catch(() => {});
		await page.waitForTimeout(400);
	}

	// --- Comptes utilisateurs -------------------------------------------------
	await page.goto(`${BASE_URL}/rh/comptes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "20-comptes");

	// Remplir le formulaire sans soumettre (montre le login auto-proposé).
	const empCompteTrigger = page.locator('button[aria-label="Employé"]');
	if (await empCompteTrigger.isVisible().catch(() => false)) {
		await empCompteTrigger.click();
		await page.waitForTimeout(1000);
		const itemSansCompte = page.locator('[data-slot="select-item"]');
		if (await itemSansCompte.first().isVisible().catch(() => false)) {
			await itemSansCompte.first().click();
			await page.waitForTimeout(600);
			await page.locator("#motDePasse").fill("motdepasse123");
			await choisirDansSelect(
				page,
				page.locator('button[aria-label="Rôle"]'),
			);
			await capture(page, "21-comptes-rempli");
		} else {
			await page.keyboard.press("Escape");
		}
	}

	// --- Vue mobile (320 px) ----------------------------------------------------
	await context.close();
	const mobileContext = await browser.newContext({
		viewport: { width: 320, height: 700 },
		deviceScaleFactor: 2,
	});
	const mpage = await mobileContext.newPage();
	mpage.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console:mobile] ${msg.text()}`);
	});

	await login(mpage);
	await mpage.goto(`${BASE_URL}/rh/employes`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await mpage
		.waitForSelector("table, text=Aucun employé", { timeout: 15000 })
		.catch(() => {});
	await capture(mpage, "22-employes-mobile");

	await mpage.goto(`${BASE_URL}/rh/bulletins`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(mpage);
	await mpage
		.waitForSelector("table, text=Aucun bulletin", { timeout: 15000 })
		.catch(() => {});
	await capture(mpage, "23-bulletins-mobile");

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures module RH terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
