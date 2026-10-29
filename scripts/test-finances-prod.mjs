/**
 * Audit PRODUCTION du module Finances — https://global-sim-group.com.
 * Lecture sur les 10 pages + vérification du fix déployé (création caisse).
 * Seule écriture volontaire : une caisse « ZZ-Prod-Test » créée puis
 * désactivée par API (vérifie le 400 corrigé de bout en bout).
 * Usage : node scripts/test-finances-prod.mjs [LOGIN PASSWORD]
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "https://global-sim-group.com";
const API = "https://api.global-sim-group.com/api/v1";
const LOGIN = process.argv[2] || "admin";
const PASSWORD = process.argv[3] || "motdepasse";
const TAG = `ZZ-Prod-${Date.now().toString().slice(-6)}`;

let page;
const errs = [];
const apiCalls = [];

function log(test, ok, detail = "") {
	console.log(`${ok ? "✅" : "❌"} ${test}${detail ? " — " + detail : ""}`);
}

async function aller(chemin, ms = 4500) {
	await page.goto(`${BASE_URL}${chemin}`, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(ms);
}

async function main() {
	const browser = await chromium.launch();
	page = await (
		await browser.newContext({
			viewport: { width: 1440, height: 900 },
			locale: "fr-FR",
			// Pas de service worker : contexte frais = la nouvelle version déployée.
			serviceWorkers: "block",
		})
	).newPage();
	page.on("console", (m) => {
		if (m.type() === "error") errs.push(m.text().slice(0, 160));
	});
	page.on("pageerror", (e) => errs.push(`[pageerror] ${e.message}`));
	page.on("response", (r) => {
		if (r.url().includes("/api/v1/") && r.status() >= 400) {
			apiCalls.push(`${r.status()} ${r.url().replace("https://api.global-sim-group.com", "")}`);
		}
	});

	// ═══ LOGIN ═══
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(2000);
	await page.locator('input[name="login"]').fill(LOGIN);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: "Se connecter" }).click();
	try {
		await page.waitForURL("**/home", { timeout: 20000 });
		log("Login prod", true);
	} catch {
		log("Login prod", false, "pas de redirection — identifiants ?");
		await page.screenshot({ path: "prod-login.png" });
		await browser.close();
		return;
	}
	await page.waitForTimeout(9000); // toasts

	// ═══ 1. TABLEAU DE BORD ═══
	await aller("/finances/tableau-de-bord");
	log(
		"TDB : page chargée",
		await page.locator("text=/Tableau de bord|Période/i").first().isVisible(),
		`${await page.locator("tbody tr").count()} lignes`,
	);
	const pdfOk = await page.getByRole("button", { name: "PDF" }).isEnabled().catch(() => false);
	const xlsOk = await page.getByRole("button", { name: "Excel" }).isEnabled().catch(() => false);
	log("TDB : boutons PDF/Excel actifs", pdfOk && xlsOk);

	// ═══ 2. CAISSES — vérification du fix déployé ═══
	await aller("/finances/caisses");
	const nbCaisses = await page.locator("tbody tr").count();
	log("Caisses : liste", nbCaisses > 0, `${nbCaisses} caisses`);
	await page.getByRole("button", { name: "Nouvelle caisse" }).click();
	await page.getByRole("dialog").waitFor({ timeout: 8000 });
	await page.waitForTimeout(1500);
	const valeurs = await page
		.locator("#caisse-activite-create option")
		.evaluateAll((els) => els.map((e) => e.getAttribute("value")).filter(Boolean));
	log(
		"Caisses : activités = vrais ids (fix déployé)",
		valeurs.length > 0 && valeurs.every((v) => /^\d+$/.test(v)),
		valeurs.join(","),
	);
	// Création réelle — le 400 doit être corrigé
	await page.locator("#caisse-libelle-create").fill(TAG);
	await page.locator("#caisse-activite-create").selectOption(valeurs[0]);
	await page.getByRole("dialog").getByRole("button", { name: "Créer" }).click();
	await page.waitForTimeout(3500);
	const dlgOuvert = await page.getByRole("dialog").isVisible().catch(() => false);
	const err400 = apiCalls.some((c) => c.startsWith("400") && c.includes("/caisses"));
	log(
		"Caisses : création OK (plus de 400)",
		!dlgOuvert && !err400,
		dlgOuvert ? "dialogue ouvert" : err400 ? "400 vue" : "",
	);
	if (dlgOuvert) {
		console.log("   dlg:", (await page.getByRole("dialog").innerText()).slice(0, 200));
		await page.keyboard.press("Escape");
	}
	log(
		"Caisses : présente dans la liste",
		await page.locator(`text=${TAG}`).first().isVisible(),
	);

	// ═══ 3. DASHBOARD CAISSIER ═══
	await aller("/finances/caissier/dashboard");
	const caissierOk =
		(await page.locator("text=/Caisse ouverte|Caisse fermée|choisissez/i").first().isVisible().catch(() => false));
	log("Caissier dashboard : rendu", caissierOk);

	// ═══ 4. ENCAISSEMENTS ═══
	await aller("/finances/encaissements");
	log(
		"Encaissements : liste",
		(await page.locator("tbody tr").count()) > 0 ||
			(await page.locator("text=/Aucun/i").first().isVisible()),
		`${await page.locator("tbody tr").count()} lignes`,
	);

	// ═══ 5. DÉPENSES (lecture) ═══
	await aller("/finances/depenses");
	log(
		"Dépenses : liste",
		(await page.locator("tbody tr").count()) > 0,
		`${await page.locator("tbody tr").count()} lignes`,
	);
	// Ouvrir la modale création — champs + CaissePicker présents
	const btnDep = page.getByRole("button", { name: /Ajouter une dépense/i });
	if (await btnDep.isVisible().catch(() => false)) {
		await btnDep.click();
		await page.getByRole("dialog").waitFor({ timeout: 8000 });
		await page.waitForTimeout(1200);
		const champs = ["#montant", "#libelle", "#idCaisse"];
		const presents = await Promise.all(
			champs.map((c) => page.locator(c).first().isVisible().catch(() => false)),
		);
		log("Dépenses : form complet (montant, libellé, caisse)", presents.every(Boolean));
		await page.keyboard.press("Escape");
		await page.waitForTimeout(600);
	}

	// ═══ 6. CATÉGORIES DÉPENSES (lecture) ═══
	await aller("/finances/categories-depenses");
	log(
		"Catégories dépenses : liste",
		(await page.locator("tbody tr, [class*='card']").count()) > 0,
	);

	// ═══ 7. IMPAYÉS ═══
	errs.length = 0;
	await aller("/finances/impayes");
	const dupKeys = errs.filter((e) => e.includes("same key"));
	log(
		"Impayés : liste",
		(await page.locator("tbody tr").count()) > 0,
		`${await page.locator("tbody tr").count()} lignes`,
	);
	log(
		"Impayés : clés dupliquées (fix pas encore déployé ?)",
		dupKeys.length === 0,
		`${dupKeys.length} warnings`,
	);

	// ═══ 8. MOYENS DE PAIEMENT ═══
	await aller("/finances/moyens-paiement");
	log(
		"Moyens paiement : liste",
		(await page.locator("tbody tr").count()) > 0,
		`${await page.locator("tbody tr").count()} lignes`,
	);

	// ═══ 9. REVENUS PAR UTILISATEUR ═══
	await aller("/finances/revenus-utilisateur");
	const nbRev = await page.locator("tbody tr").count();
	const videRev = await page.locator("text=/Aucun paiement/").first().isVisible().catch(() => false);
	log(
		"Revenus/utilisateur : données",
		nbRev > 0,
		nbRev > 0 ? `${nbRev} lignes` : videRev ? "« Aucun » (fix non déployé)" : "vide",
	);

	// ═══ 10. API 4xx/5xx observés ═══
	console.log("\n=== appels API en erreur (>=400) ===");
	const uniques = [...new Set(apiCalls)];
	if (uniques.length === 0) console.log("aucun");
	uniques.forEach((c) => console.log(" -", c));

	console.log("\n=== erreurs console ===");
	const propres = errs.filter(
		(e) => !e.includes("favicon") && !e.includes("third-party") && !e.includes("same key"),
	);
	if (!propres.length) console.log("aucune (hors clés impayes déjà vues)");
	propres.slice(0, 10).forEach((e) => console.log(" -", e));

	await browser.close();

	// ═══ NETTOYAGE : désactiver la caisse ZZ via API prod ═══
	try {
		const loginRes = await fetch(`${API}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login: LOGIN, mot_de_passe: PASSWORD }),
		}).then((r) => r.json());
		if (!loginRes.accessToken) {
			console.log("⚠️ nettoyage : login API prod impossible");
			return;
		}
		const h = { Authorization: `Bearer ${loginRes.accessToken}` };
		const caisses = await fetch(`${API}/finances/caisses`, { headers: h }).then((r) => r.json());
		const tests = (Array.isArray(caisses) ? caisses : []).filter(
			(c) => c.libelle?.startsWith("ZZ-") && c.actif,
		);
		for (const c of tests) {
			await fetch(`${API}/finances/caisses/${c.id_caisse}`, {
				method: "PATCH",
				headers: { ...h, "Content-Type": "application/json" },
				body: JSON.stringify({ actif: false }),
			});
		}
		console.log(`🧹 ${tests.length} caisse(s) ZZ désactivée(s) en prod`);
	} catch (e) {
		console.log("⚠️ Nettoyage prod :", e.message);
	}
}

main().catch((e) => {
	console.error("FATAL:", e.message);
	process.exit(1);
});
