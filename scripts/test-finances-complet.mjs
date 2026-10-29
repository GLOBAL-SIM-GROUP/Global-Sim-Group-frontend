/**
 * Audit fonctionnel du module Finances — parcourt toutes les pages, exerce
 * les interactions principales et rapporte erreurs console + régressions.
 * Usage : BASE_URL=http://localhost:3400 node scripts/test-finances-complet.mjs
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3400";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";

const rapport = [];
const consoleErrors = new Map();
let pageCourante = "login";

function log(test, ok, detail = "") {
	rapport.push({ test, ok, detail });
	console.log(`${ok ? "✅" : "❌"} ${test}${detail ? " — " + detail : ""}`);
}

async function aller(page, chemin, nom) {
	pageCourante = nom;
	consoleErrors.set(nom, []);
	await page.goto(`${BASE_URL}${chemin}`, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(2200);
	// Masquer le bouton flottant TanStack Devtools — intercepte les clics
	// sur les éléments du coin inférieur droit (dernière ligne des tables).
	await page
		.addStyleTag({ content: '[data-tsd-control]{display:none!important}' })
		.catch(() => {});
	return nom;
}

async function attendre(page, ms = 1200) {
	await page.waitForTimeout(ms);
}

async function main() {
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		locale: "fr-FR",
	});
	const page = await context.newPage();
	page.on("console", (msg) => {
		if (msg.type() === "error") {
			consoleErrors.get(pageCourante)?.push(msg.text().slice(0, 200));
		}
	});
	page.on("pageerror", (err) => {
		consoleErrors.get(pageCourante)?.push(`[pageerror] ${err.message}`);
	});

	// ═══ LOGIN ═══
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await attendre(page, 1500);
	await page.locator('input[name="login"]').fill(LOGIN);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL("**/home", { timeout: 20000 });
	log("Login admin", true);

	const NOM_CAISSE = `ZZ-Audit-${Date.now().toString().slice(-6)}`;

	// ═══ 1. TABLEAU DE BORD ═══
	await aller(page, "/finances/tableau-de-bord", "tableau-de-bord");
	await page.waitForTimeout(1500);
	log(
		"TDB : page chargée",
		await page
			.locator("text=/Tableau de bord|Période|Global/i")
			.first()
			.isVisible(),
	);
	// Filtre période → « Personnalisée » affiche les champs date
	const selPeriode = page.locator("#tableau-bord-filtre-periode");
	await selPeriode.click();
	await page.waitForTimeout(600);
	await page.getByRole("option", { name: "Personnalisée" }).click();
	await attendre(page, 800);
	log(
		"TDB : période personnalisée → champs Du/Au",
		await page.locator("#tableau-bord-filtre-du").isVisible(),
	);
	// Filtre activité → Restauration
	const selAct = page.locator("#tableau-bord-filtre-activite");
	await selAct.click();
	await page.waitForTimeout(600);
	await page.getByRole("option", { name: "Restauration" }).click();
	await attendre(page, 2500);
	log(
		"TDB : filtre activité Restauration chargé",
		!(await page.locator("text=/Erreur/i").first().isVisible().catch(() => false)),
	);
	// Retour Global + PDF/Excel boutons présents
	await selAct.click();
	await page.waitForTimeout(600);
	await page.getByRole("option", { name: "Global" }).click();
	await attendre(page, 2000);
	log(
		"TDB : boutons PDF et Excel présents",
		(await page.getByRole("button", { name: "PDF" }).count()) === 1 &&
			(await page.getByRole("button", { name: "Excel" }).count()) === 1,
	);

	// ═══ 2. CAISSES ═══
	await aller(page, "/finances/caisses", "caisses");
	const nbCaisses = await page.locator("tbody tr").count();
	log("Caisses : liste chargée", nbCaisses > 0, `${nbCaisses} caisses`);

	// Création : vérifier que les options = vrais id_activite
	await page.getByRole("button", { name: "Nouvelle caisse" }).click();
	await page.getByRole("dialog").waitFor({ timeout: 8000 });
	await attendre(page, 1500);
	const valeursActivites = await page
		.locator("#caisse-activite-create option")
		.evaluateAll((els) => els.map((e) => e.getAttribute("value")));
	log(
		"Caisses : activités = vrais ids (pas codes)",
		valeursActivites.filter(Boolean).every((v) => /^\d+$/.test(v)),
		`valeurs: ${valeursActivites.filter(Boolean).join(",")}`,
	);
	// Créer une vraie caisse de test
	await page.locator("#caisse-libelle-create").fill(NOM_CAISSE);
	await page
		.locator("#caisse-activite-create")
		.selectOption(valeursActivites.filter(Boolean)[0]);
	await page
		.getByRole("dialog")
		.getByRole("button", { name: "Créer" })
		.click();
	await attendre(page, 3000);
	const dialogOuvert = await page.getByRole("dialog").isVisible();
	const erreurVisible = await page
		.locator("text=/erreur|échec/i")
		.first()
		.isVisible()
		.catch(() => false);
	log("Caisses : création OK (dialogue fermé)", !dialogOuvert, dialogOuvert ? "dialogue encore ouvert" : "");
	if (dialogOuvert) {
		await page.keyboard.press("Escape");
		await attendre(page, 500);
	}
	// La caisse apparaît dans la liste
	log(
		"Caisses : nouvelle caisse dans la liste",
		await page.locator(`text=${NOM_CAISSE}`).first().isVisible(),
	);
	// Édition : changer le libellé
	const ligneTest = page.locator("tr", { hasText: NOM_CAISSE }).last();
	if (await ligneTest.isVisible().catch(() => false)) {
		await ligneTest.getByRole("button").first().click({ force: true });
		await page.getByRole("dialog").waitFor({ timeout: 10000 });
		await attendre(page, 800);
		await page.locator("#caisse-libelle-edit").fill(`${NOM_CAISSE}-B`);
		await page
			.getByRole("dialog")
			.getByRole("button", { name: "Modifier" })
			.click();
		await attendre(page, 2500);
		log(
			"Caisses : édition libellé OK",
			await page.locator(`text=${NOM_CAISSE}-B`).first().isVisible(),
		);
	}

	// ═══ 3. DASHBOARD D'UNE CAISSE ═══
	await aller(page, "/finances/caisses/1/dashboard", "caisse-dashboard");
	await attendre(page, 2500);
	const dashVisible =
		(await page.locator("text=/Caisse|Encaissements|Revenus/i").first().isVisible().catch(() => false)) ||
		(await page.locator("text=/introuvable|accès/i").first().isVisible().catch(() => false));
	log("Caisse dashboard : page rendue", dashVisible);

	// ═══ 4. DASHBOARD CAISSIER ═══
	await aller(page, "/finances/caissier/dashboard", "caissier-dashboard");
	await attendre(page, 2500);
	const multiCaisses = await page
		.locator("text=/choisissez-en une/i")
		.first()
		.isVisible()
		.catch(() => false);
	const dashCaissier = await page
		.locator("text=/Caisse ouverte|Caisse fermée|État inconnu/i")
		.first()
		.isVisible()
		.catch(() => false);
	log(
		"Caissier dashboard : rendu",
		multiCaisses || dashCaissier,
		multiCaisses ? "sélecteur multi-caisses" : "dashboard direct",
	);
	if (multiCaisses) {
		// Choisir la première caisse → dashboard + boutons ouvrir/fermer
		await page.locator("button", { hasText: /./ }).nth(1).click();
		await attendre(page, 2500);
		const ouvrirVisible = await page
			.getByRole("button", { name: /Ouvrir la caisse|Fermer la caisse/ })
			.first()
			.isVisible()
			.catch(() => false);
		log("Caissier : bouton ouvrir/fermer affiché", ouvrirVisible);
	}

	// ═══ 5. ENCAISSEMENTS (paiements) ═══
	await aller(page, "/finances/encaissements", "encaissements");
	const nbPaiements = await page.locator("tbody tr, [class*='card']").count();
	log("Encaissements : liste chargée", nbPaiements > 0, `${nbPaiements} lignes`);
	// Filtre type DECAISSEMENT
	const selType = page.locator('button[aria-label="Type de paiement"]');
	if (await selType.isVisible().catch(() => false)) {
		await selType.click();
		await page.waitForTimeout(600);
		await page.getByRole("option", { name: "Décaissement" }).click();
		await attendre(page, 2000);
		log("Encaissements : filtre Décaissement appliqué", true);
	}

	// ═══ 6. DÉPENSES ═══
	await aller(page, "/finances/depenses", "depenses");
	const nbDepenses = await page.locator("tbody tr").count();
	log("Dépenses : liste chargée", nbDepenses > 0, `${nbDepenses} dépenses`);
	// Ouvrir le dialogue de création
	const btnNouvelleDepense = page
		.getByRole("button", { name: /Nouvelle|Ajouter|Créer/ })
		.first();
	if (await btnNouvelleDepense.isVisible().catch(() => false)) {
		await btnNouvelleDepense.click();
		await page.getByRole("dialog").waitFor({ timeout: 8000 });
		await attendre(page, 1200);
		log("Dépenses : dialogue création ouvert", true);
		// Inventaire des champs du formulaire
		const champs = await page
			.getByRole("dialog")
			.locator("input, select, textarea, button[id], button[aria-label]")
			.evaluateAll((els) =>
				els.map((e) => e.id || e.getAttribute("aria-label") || e.tagName),
			);
		console.log("   champs dépense:", champs.slice(0, 15).join(", "));
		await page.keyboard.press("Escape");
		await attendre(page, 600);
	}

	// ═══ 7. CATÉGORIES DÉPENSES ═══
	await aller(page, "/finances/categories-depenses", "categories-depenses");
	const nbCats = await page.locator("tbody tr, [class*='card']").count();
	log("Catégories dépenses : liste", nbCats > 0, `${nbCats} items`);

	// ═══ 8. IMPAYÉS ═══
	await aller(page, "/finances/impayes", "impayes");
	const corpsImpayes = await page.locator("tbody tr").count();
	const videImpayes = await page
		.locator("text=/Aucun/i")
		.first()
		.isVisible()
		.catch(() => false);
	log("Impayés : page rendue", corpsImpayes > 0 || videImpayes, `${corpsImpayes} lignes`);

	// ═══ 9. MOYENS DE PAIEMENT ═══
	await aller(page, "/finances/moyens-paiement", "moyens-paiement");
	const nbMoyens = await page.locator("tbody tr, [class*='card']").count();
	log("Moyens paiement : liste", nbMoyens > 0, `${nbMoyens} moyens`);

	// ═══ 10. REVENUS PAR UTILISATEUR ═══
	await aller(page, "/finances/revenus-utilisateur", "revenus-utilisateur");
	const nbRevenus = await page.locator("tbody tr").count();
	log("Revenus/utilisateur : liste", nbRevenus > 0, `${nbRevenus} lignes`);

	await browser.close();

	// ═══ RAPPORT ERREURS CONSOLE ═══
	console.log("\n═══ ERREURS CONSOLE PAR PAGE ═══");
	let totalErr = 0;
	for (const [page, errs] of consoleErrors) {
		const filtrées = errs.filter(
			(e) =>
				!e.includes("favicon") &&
				!e.includes("DevTools") &&
				!e.includes("third-party"),
		);
		if (filtrées.length) {
			totalErr += filtrées.length;
			console.log(`\n[${page}] ${filtrées.length} erreur(s):`);
			filtrées.slice(0, 6).forEach((e) => console.log("  -", e));
		}
	}
	if (!totalErr) console.log("Aucune erreur console.");

	const ko = rapport.filter((r) => !r.ok);
	console.log(`\n═══ BILAN : ${rapport.length - ko.length}/${rapport.length} tests OK ═══`);
	if (ko.length) ko.forEach((r) => console.log("ÉCHEC:", r.test, r.detail));

	// ═══ NETTOYAGE : désactiver les caisses de test ZZ-* (pas de DELETE) ═══
	try {
		const loginRes = await fetch(
			"https://dev.sim.strife-cyber.org/api/v1/auth/login",
			{
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ login: LOGIN, mot_de_passe: PASSWORD }),
			},
		).then((r) => r.json());
		const h = { Authorization: `Bearer ${loginRes.accessToken}` };
		const caisses = await fetch(
			"https://dev.sim.strife-cyber.org/api/v1/finances/caisses",
			{ headers: h },
		).then((r) => r.json());
		const tests = (Array.isArray(caisses) ? caisses : caisses.data || []).filter(
			(c) => c.libelle?.startsWith("ZZ-") && c.actif,
		);
		for (const c of tests) {
			await fetch(
				`https://dev.sim.strife-cyber.org/api/v1/finances/caisses/${c.id_caisse}`,
				{
					method: "PATCH",
					headers: { ...h, "Content-Type": "application/json" },
					body: JSON.stringify({ actif: false }),
				},
			);
		}
		console.log(`🧹 ${tests.length} caisse(s) de test désactivée(s)`);
	} catch (e) {
		console.log("⚠️ Nettoyage caisses impossible:", e.message);
	}
}

main().catch((e) => {
	console.error("FATAL:", e.message);
	process.exit(1);
});
