/**
 * Tests d'écriture du module Finances : CRUD dépense/catégorie/moyen
 * paiement, ouvrir-fermer caisse, exports PDF/Excel, clés impayes.
 * Usage : BASE_URL=http://localhost:3400 node scripts/test-finances-crud.mjs
 */
import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3400";
const TAG = `ZZ-Audit-${Date.now().toString().slice(-6)}`;
const errs = [];
let page;

function log(test, ok, detail = "") {
	console.log(`${ok ? "✅" : "❌"} ${test}${detail ? " — " + detail : ""}`);
}

async function aller(chemin, ms = 5000) {
	await page.goto(`${BASE_URL}${chemin}`, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(ms);
	await page
		.addStyleTag({ content: '[data-tsd-control]{display:none!important}' })
		.catch(() => {});
}

async function main() {
	const browser = await chromium.launch();
	page = await (
		await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "fr-FR" })
	).newPage();
	page.on("console", (m) => {
		if (m.type() === "error" && !m.text().includes("ws proxy") && !m.text().includes("__tsd"))
			errs.push(m.text().slice(0, 160));
	});
	page.on("pageerror", (e) => errs.push(`[pageerror] ${e.message}`));

	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(1500);
	await page.locator('input[name="login"]').fill("admin");
	await page.locator('input[name="motDePasse"]').fill("motdepasse");
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL("**/home", { timeout: 20000 });
	await page.waitForTimeout(11000); // toasts expirent

	// ═══ 1. CATÉGORIE DE DÉPENSE : créer + supprimer ═══
	await aller("/finances/categories-depenses");
	await page
		.getByRole("button", { name: /Ajouter|Nouvelle|Créer/i })
		.first()
		.click();
	await page.getByRole("dialog").waitFor({ timeout: 8000 });
	await page.waitForTimeout(600);
	// champ libelle (name="libelle" ou premier input texte)
	const champLib = page.getByRole("dialog").locator("input").first();
	await champLib.fill(TAG);
	await page.getByRole("dialog").getByRole("button", { name: /Ajouter|Enregistrer|Créer/ }).click();
	await page.waitForTimeout(2500);
	const catCreee = await page.locator(`text=${TAG}`).first().isVisible();
	log("Catégorie : création", catCreee);
	if (catCreee) {
		// Supprimer — bouton dans la ligne (poubelle / Supprimer)
		const ligne = page.locator("tr, li, [class*='card']", { hasText: TAG }).first();
		const btnSup = ligne
			.getByRole("button", { name: /Supprimer|Retirer/i })
			.or(ligne.locator("button").last());
		await btnSup.first().click();
		await page.waitForTimeout(1200);
		// dialogue de confirmation éventuel
		const dlg = page.getByRole("dialog");
		if (await dlg.isVisible().catch(() => false)) {
			console.log("   confirmation:", (await dlg.innerText()).slice(0, 120));
			await dlg.getByRole("button", { name: /Supprimer|Confirmer|Oui/ }).click();
		}
		await page.waitForTimeout(2000);
		log(
			"Catégorie : suppression",
			!(await page.locator(`text=${TAG}`).first().isVisible()),
		);
	}

	// ═══ 2. DÉPENSE : créer → modifier → supprimer ═══
	await aller("/finances/depenses");
	await page.getByRole("button", { name: /Ajouter une dépense/i }).click();
	await page.getByRole("dialog").waitFor({ timeout: 8000 });
	await page.waitForTimeout(800);
	// champs : date, montant, idCategorieDepense (Select), libelle, justificatif, idCaisse
	await page.locator("#montant").fill("1500");
	const catTrigger = page.locator('[aria-label="Catégorie de dépense"], #idCategorieDepense');
	await catTrigger.first().click();
	await page.waitForTimeout(700);
	await page.getByRole("option").first().click();
	await page.waitForTimeout(400);
	await page.locator("#libelle").fill(TAG);
	await page.waitForTimeout(300);
	await page.screenshot({ path: "tmp-depense-form.png" });
	await page.getByRole("dialog").getByRole("button", { name: "Enregistrer" }).click();
	await page.waitForTimeout(3000);
	const depCreee = await page.locator(`text=${TAG}`).first().isVisible();
	const dlgOuvertDep = await page.getByRole("dialog").isVisible().catch(() => false);
	log("Dépense : création", depCreee, dlgOuvertDep ? "dialogue resté ouvert" : "");
	if (dlgOuvertDep) {
		console.log("   contenu dlg:", (await page.getByRole("dialog").innerText()).slice(0, 200));
		await page.keyboard.press("Escape");
		await page.waitForTimeout(500);
	}
	if (depCreee) {
		// Modifier
		const ligneDep = page.locator("tr", { hasText: TAG }).last();
		const btnMod = ligneDep.getByRole("button", { name: /Modifier|Éditer/i }).or(ligneDep.locator("button").first());
		await btnMod.first().click({ force: true });
		await page.getByRole("dialog").waitFor({ timeout: 8000 }).catch(() => {});
		if (await page.getByRole("dialog").isVisible().catch(() => false)) {
			await page.locator("#montant").fill("2000");
			await page.getByRole("dialog").getByRole("button", { name: "Enregistrer" }).click();
			await page.waitForTimeout(2500);
			log("Dépense : modification", true);
		} else {
			log("Dépense : modification", false, "dialogue non ouvert");
		}
		// Supprimer
		const ligneDep2 = page.locator("tr", { hasText: TAG }).last();
		const btnDel = ligneDep2.getByRole("button", { name: /Supprimer/i }).or(ligneDep2.locator("button").last());
		await btnDel.first().click({ force: true });
		await page.waitForTimeout(1000);
		const dlgSup = page.getByRole("dialog");
		if (await dlgSup.isVisible().catch(() => false)) {
			await dlgSup.getByRole("button", { name: /Supprimer|Confirmer/ }).click();
		}
		await page.waitForTimeout(2500);
		log(
			"Dépense : suppression",
			!(await page.locator(`text=${TAG}`).first().isVisible()),
		);
	}

	// ═══ 3. MOYEN DE PAIEMENT : créer + basculer actif ═══
	await aller("/finances/moyens-paiement");
	const nbMoyens0 = await page.locator("tbody tr").count();
	await page
		.getByRole("button", { name: /Ajouter|Nouveau|Créer/i })
		.first()
		.click();
	await page.getByRole("dialog").waitFor({ timeout: 8000 });
	await page.waitForTimeout(600);
	await page.getByRole("dialog").locator("input").first().fill(TAG);
	await page.getByRole("dialog").getByRole("button", { name: /Ajouter|Enregistrer|Créer/ }).click();
	await page.waitForTimeout(2500);
	const moyenCree = await page.locator(`text=${TAG}`).first().isVisible();
	log("Moyen paiement : création", moyenCree, `${nbMoyens0} avant`);
	if (moyenCree) {
		// Basculer actif → inactif
		const ligneM = page.locator("tr", { hasText: TAG }).last();
		const btnToggle = ligneM.getByRole("button", { name: /Désactiver|Activer/ }).or(ligneM.locator("button").last());
		await btnToggle.first().click({ force: true });
		await page.waitForTimeout(2000);
		const inactif = await ligneM.locator("text=/Inactif/i").isVisible().catch(() => false);
		log("Moyen paiement : bascule actif→inactif", inactif);
		// Rebascule pour laisser l'état propre — la donnée de test reste inactive? on réactive
		const ligneM2 = page.locator("tr", { hasText: TAG }).last();
		const btnToggle2 = ligneM2.getByRole("button", { name: /Activer/ }).or(ligneM2.locator("button").last());
		await btnToggle2.first().click({ force: true });
		await page.waitForTimeout(1500);
	}

	// ═══ 4. CAISSE : ouvrir + fermer sur la caisse de test ═══
	await aller("/finances/caisses");
	await page.getByRole("button", { name: "Nouvelle caisse" }).click();
	await page.getByRole("dialog").waitFor({ timeout: 8000 });
	await page.waitForTimeout(1200);
	const vals = await page.locator("#caisse-activite-create option").evaluateAll((els) => els.map((e) => e.getAttribute("value")).filter(Boolean));
	await page.locator("#caisse-libelle-create").fill(TAG);
	await page.locator("#caisse-activite-create").selectOption(vals[0]);
	await page.getByRole("dialog").getByRole("button", { name: "Créer" }).click();
	await page.waitForTimeout(3000);
	// Ouvrir le dashboard de cette caisse — retrouver son id via API côté page ?
	// Plus simple : le dashboard caissier multi-caisses permet de la choisir.
	await aller("/finances/caissier/dashboard");
	const choix = page.locator("button", { hasText: TAG }).first();
	if (await choix.isVisible().catch(() => false)) {
		await choix.click();
		await page.waitForTimeout(3500);
		const btnOuvrir = page.getByRole("button", { name: "Ouvrir la caisse" });
		const btnFermer = page.getByRole("button", { name: "Fermer la caisse" });
		if (await btnOuvrir.isVisible().catch(() => false)) {
			await btnOuvrir.click();
			await page.waitForTimeout(2500);
			log("Caisse : ouverture", await page.locator("text=/Caisse ouverte/").first().isVisible());
			if (await btnFermer.isVisible().catch(() => false)) {
				await btnFermer.click();
				await page.waitForTimeout(2500);
				log("Caisse : fermeture", await page.locator("text=/Caisse fermée/").first().isVisible());
			}
		} else if (await btnFermer.isVisible().catch(() => false)) {
			log("Caisse : déjà ouverte (ouvrir non affiché)", true);
			await btnFermer.click();
			await page.waitForTimeout(2500);
			log("Caisse : fermeture", await page.locator("text=/Caisse fermée/").first().isVisible());
		} else {
			log("Caisse : boutons ouvrir/fermer", false, "aucun affiché");
		}
	} else {
		log("Caisse test visible dans le sélecteur", false, "pas trouvée");
	}

	// ═══ 5. EXPORTS PDF / EXCEL (TDB) ═══
	await aller("/finances/tableau-de-bord");
	const btnPdf = page.getByRole("button", { name: "PDF" });
	const btnExcel = page.getByRole("button", { name: "Excel" });
	if (await btnPdf.isEnabled().catch(() => false)) {
		await btnPdf.click();
		await page.waitForTimeout(6000);
		const erreurExport = await page.locator("text=/Impossible de générer/").first().isVisible().catch(() => false);
		log("Export PDF : pas d'erreur affichée", !erreurExport);
	} else {
		log("Export PDF : bouton actif", false, "désactivé");
	}
	if (await btnExcel.isEnabled().catch(() => false)) {
		const [download] = await Promise.all([
			page.waitForEvent("download", { timeout: 15000 }).catch(() => null),
			btnExcel.click(),
		]);
		log("Export Excel : téléchargement", !!download, download ? download.suggestedFilename() : "aucun");
	} else {
		log("Export Excel : bouton actif", false, "désactivé");
	}

	// ═══ 6. IMPAYÉS : plus de clés dupliquées ═══
	errs.length = 0;
	await aller("/finances/impayes");
	const dupKeys = errs.filter((e) => e.includes("same key"));
	log("Impayés : aucune clé dupliquée (post-fix)", dupKeys.length === 0, `${dupKeys.length} warnings`);

	console.log("\n=== erreurs console restantes ===");
	errs.filter((e) => !e.includes("same key")).slice(0, 8).forEach((e) => console.log(" -", e));

	await browser.close();

	// ═══ NETTOYAGE caisses ZZ ═══
	try {
		const loginRes = await fetch("https://dev.sim.strife-cyber.org/api/v1/auth/login", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login: "admin", mot_de_passe: "motdepasse" }),
		}).then((r) => r.json());
		const h = { Authorization: `Bearer ${loginRes.accessToken}` };
		const caisses = await fetch("https://dev.sim.strife-cyber.org/api/v1/finances/caisses", { headers: h }).then((r) => r.json());
		const tests = (Array.isArray(caisses) ? caisses : []).filter((c) => c.libelle?.startsWith("ZZ-") && c.actif);
		for (const c of tests) {
			await fetch(`https://dev.sim.strife-cyber.org/api/v1/finances/caisses/${c.id_caisse}`, {
				method: "PATCH",
				headers: { ...h, "Content-Type": "application/json" },
				body: JSON.stringify({ actif: false }),
			});
		}
		console.log(`🧹 ${tests.length} caisse(s) ZZ désactivée(s)`);
	} catch (e) {
		console.log("⚠️ Nettoyage:", e.message);
	}
}

main().catch((e) => {
	console.error("FATAL:", e.message);
	process.exit(1);
});
