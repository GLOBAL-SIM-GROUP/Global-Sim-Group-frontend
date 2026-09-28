/**
 * Capture complète du guide Résidence (docs/guides-utilisation/residence.tex).
 * Scénario cohérent : bâtiment Guide → logements (+lot) → contrat Guide →
 * encaissements/caution/état des lieux → séjours → charges → échéances.
 *
 * Usage : node scripts/capture-residence-complet.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR || "docs/guides-utilisation/screenshots/residence";

const errors = [];
const uid = Date.now().toString(36);
const BAT_NOM = `Bâtiment Guide ${uid}`;

async function capture(page, name, { fullPage = true } = {}) {
	await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage });
	console.log(`📸 ${name}`);
}

async function waitLoad(page, ms = 1500) {
	await page.waitForLoadState("domcontentloaded").catch(() => {});
	await page.waitForTimeout(ms);
}

function dialog(page) {
	return page.locator('[role="dialog"]').last();
}

/** Ouvre un Select (par aria-label ou id) puis clique l'option par texte. */
async function choisirSelect(page, declencheur, texte) {
	const trigger = declencheur.startsWith("#")
		? page.locator(declencheur)
		: page.locator(`[aria-label="${declencheur}"]`).first();
	await trigger.click();
	await page.waitForTimeout(500);
	const option = page.locator('[role="option"]').getByText(texte).first();
	await option.waitFor({ state: "visible", timeout: 8000 });
	await option.click();
	await page.waitForTimeout(400);
}

/** Ouvre un Select et capture le menu (viewport : fullPage referme le menu). */
async function ouvrirSelectEtCapture(page, declencheur, nom) {
	const trigger = declencheur.startsWith("#")
		? page.locator(declencheur)
		: page.locator(`[aria-label="${declencheur}"]`).first();
	await trigger.click();
	await page.waitForTimeout(700);
	await capture(page, nom, { fullPage: false });
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await chromium.launch({ headless: true });
	const page = await (
		await browser.newContext({ viewport: { width: 1440, height: 900 } })
	).newPage();
	page.on("console", (m) => {
		if (m.type() === "error") errors.push(`[console] ${m.text().slice(0, 160)}`);
	});
	page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
	page.on("response", (r) => {
		if (r.status() >= 500) errors.push(`[http ${r.status()}] ${r.url()}`);
	});

	// Connexion
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitLoad(page, 1000);
	await capture(page, "01-login");
	await page.locator('input[name="login"]').fill(LOGIN);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: /Se connecter/i }).click();
	await page.waitForURL((u) => !u.pathname.includes("login"), {
		timeout: 15000,
	});
	await waitLoad(page, 2000);
	await capture(page, "02-dashboard");

	// Sidebar Résidence ouverte
	const menuResidence = page.getByRole("button", { name: "Résidence" }).first();
	await menuResidence.click().catch(() => {});
	await page.waitForTimeout(600);
	await capture(page, "03-sidebar-residence", { fullPage: false });

	// ---------- Bâtiments ----------
	try {
		await page.goto(`${BASE_URL}/residence/batiments`);
		await waitLoad(page);
		await capture(page, "04-batiments-liste");
		await ouvrirSelectEtCapture(page, "Actif", "04b-batiments-filtre-actif");
		await page
			.locator('[role="option"]')
			.getByText("Actif", { exact: true })
			.first()
			.click();
		await waitLoad(page, 800);
		await capture(page, "04c-batiments-filtre-actifs");

		await page.getByRole("button", { name: /Ajouter un bâtiment/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "05-batiment-formulaire-vide");
		const dlg = dialog(page);
		// code court : le générateur de numéro de logement échoue (500
		// DATABASE_ERROR) quand le code bâtiment est trop long.
		await dlg.locator("#code").fill(`G${uid.slice(-4).toUpperCase()}`);
		await dlg.locator("#nom").fill(BAT_NOM);
		await dlg.locator("#adresse").fill("123 Avenue de la Résidence, Douala");
		await capture(page, "06-batiment-formulaire-rempli");
		await dlg.getByRole("button", { name: /Enregistrer/i }).click();
		await waitLoad(page, 2000);
		await capture(page, "07-batiments-liste-avec-nouveau");
	} catch (e) {
		errors.push(`[batiments] ${e.message}`);
		console.log("⚠️ bâtiments:", e.message);
	}

	// ---------- Logements ----------
	try {
		// Retirer le filtre « Actifs » puis ouvrir le bâtiment créé
		await page.goto(`${BASE_URL}/residence/batiments`);
		await waitLoad(page);
		await page
			.getByPlaceholder(/Rechercher un bâtiment/i)
			.fill(`Guide ${uid}`);
		await page.waitForTimeout(900);
		await page.getByText(BAT_NOM).first().click();
		await page.waitForURL(/residence\/logements/, { timeout: 10000 });
		await waitLoad(page);
		await capture(page, "08-logements-liste");
		await ouvrirSelectEtCapture(page, "Type", "08b-logements-filtre-type");
		await page
			.locator('[role="option"]')
			.getByText("Studio")
			.first()
			.click();
		await waitLoad(page, 800);
		await capture(page, "08c-logements-filtre-type-studio");

		await page.getByRole("button", { name: /Ajouter un logement/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "09-logement-formulaire-vide");
		const dlg = dialog(page);
		await choisirSelect(page, "#type", "Studio");
		await dlg.locator("#tarif").fill("75000");
		await capture(page, "10-logement-formulaire-rempli");
		await dlg.getByRole("button", { name: /Enregistrer/i }).click();
		await waitLoad(page, 2000);
		await capture(page, "11-logements-liste-avec-nouveau");

		// Création par lot : 5 studios à 60 000
		await page.getByRole("button", { name: /Créer un lot/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "12-lot-formulaire-vide");
		const dlgLot = dialog(page);
		await choisirSelect(page, "#type", "Studio");
		await dlgLot.locator("#tarif").fill("60000");
		await dlgLot.locator("#quantite").fill("5");
		await capture(page, "13-lot-formulaire-rempli");
		await dlgLot.getByRole("button", { name: /Créer le lot|Enregistrer/i }).click();
		await waitLoad(page, 2500);
		await capture(page, "14-lot-resultat");
		// Fermer la modale de résultat si ouverte
		const fermer = dialog(page).getByRole("button", {
			name: /Fermer|Terminer/i,
		});
		if (await fermer.isVisible().catch(() => false)) await fermer.click();
		await waitLoad(page, 1000);
		await capture(page, "15-logements-liste-apres-lot");

		// Fiche logement (première ligne)
		await page.locator("table a, tbody a").first().click();
		await waitLoad(page);
		await capture(page, "16-logement-fiche");
	} catch (e) {
		errors.push(`[logements] ${e.message}`);
		console.log("⚠️ logements:", e.message);
	}

	// ---------- Contrats ----------
	let idContrat = null;
	try {
		await page.goto(`${BASE_URL}/residence/contrats`);
		await waitLoad(page);
		await capture(page, "12-contrats-liste");
		await ouvrirSelectEtCapture(page, "Statut", "12b-contrats-filtre-statut");
		await page
			.locator('[role="option"]')
			.getByText(/Actif/)
			.first()
			.click();
		await waitLoad(page, 800);
		await capture(page, "12c-contrats-filtre-actifs");

		await page.getByRole("button", { name: /Nouveau contrat/i }).click();
		await page.waitForTimeout(900);
		await capture(page, "13-contrat-formulaire-vide");
		const dlg = dialog(page);

		// Recherche client (aucun « GuideContrat » encore) → création rapide
		await dlg
			.getByPlaceholder(/Rechercher par nom/i)
			.fill(`GuideContrat${uid}`);
		await page.waitForTimeout(1000);
		await capture(page, "14-contrat-recherche-client-vide");
		const creer = dlg.getByRole("button", {
			name: /Créer un locataire|Créer le client|Nouveau client/i,
		});
		await creer.first().click();
		await page.waitForTimeout(800);
		await capture(page, "15-contrat-creation-rapide-client");

		// Formulaire client rapide — champs par id (noms de fields)
		const inner = dialog(page);
		const remplir = async (id, v) => {
			const el = inner.locator(`#${id}`);
			if (await el.isVisible().catch(() => false)) await el.fill(v);
		};
		await remplir("nom", `GuideContrat${uid}`);
		await remplir("prenoms", "Client");
		await remplir("telPrincipal", "+2250700000099");
		await remplir("email", `guide${uid}@test.dev`);
		await remplir("dateNaissance", "1990-01-01");
		await remplir("lieuNaissance", "Yaoundé");
		await remplir("nationalite", "Camerounaise");
		await remplir("profession", "Ingénieur");
		await remplir("adresse", "Rue 123");
		await remplir("ville", "Douala");
		await remplir("pays", "Cameroun");
		const sexeTrigger = inner.locator('[aria-label="Sexe"]').first();
		if (await sexeTrigger.isVisible().catch(() => false)) {
			await sexeTrigger.click();
			await page.waitForTimeout(400);
			await page
				.locator('[role="option"]')
				.getByText("Masculin")
				.first()
				.click();
		}
		await capture(page, "16-contrat-client-rempli");
		await inner
			.getByRole("button", { name: /Enregistrer|Créer/i })
			.last()
			.click();
		await waitLoad(page, 1500);
		await capture(page, "17-contrat-client-selectionne");

		// Cascade Bâtiment → Logement
		await choisirSelect(page, "#logement-batiment", BAT_NOM);
		await waitLoad(page, 1500);
		await capture(page, "17b-contrat-batiment-selectionne");
		await page.locator("#logement-logement").click();
		await page.waitForTimeout(700);
		await capture(page, "17c-contrat-logement-ouvert", { fullPage: false });
		await page.locator('[role="option"]').first().click();
		await page.waitForTimeout(400);
		await capture(page, "17d-contrat-logement-selectionne");

		// Dates + montants
		const dlg2 = dialog(page);
		const auj = new Date().toISOString().slice(0, 10);
		const champs = {
			dateDebut: auj,
			dureeMois: "12",
			montantLoyer: "60000",
			caution: "120000",
		};
		for (const [id, v] of Object.entries(champs)) {
			const el = dlg2.locator(`#${id}`);
			if (await el.isVisible().catch(() => false)) await el.fill(v);
		}
		// interception de la création pour récupérer l'id du contrat
		const [resp] = await Promise.all([
			page.waitForResponse(
				(r) =>
					r.url().includes("/residence/contrats") &&
					r.request().method() === "POST",
				{ timeout: 15000 },
			),
			dlg2.getByRole("button", { name: /Enregistrer/i }).click(),
		]).catch(() => [null]);
		if (resp) {
			const body = await resp.json().catch(() => null);
			idContrat = String(
				body?.id_contrat ?? body?.contrat?.id_contrat ?? body?.id ?? "",
			);
		}
		await waitLoad(page, 2000);
		console.log("   → contrat créé :", idContrat || "(id non intercepté)");
	} catch (e) {
		errors.push(`[contrats] ${e.message}`);
		console.log("⚠️ contrats:", e.message);
	}

	// ---------- Fiche contrat ----------
	try {
		if (!idContrat) {
			// fallback : le contrat le plus récent via l'API (login côté Node)
			const lr = await fetch(`${BASE_URL}/api/v1/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ login: LOGIN, mot_de_passe: PASSWORD }),
			}).then((r) => r.json());
			const tok = lr.accessToken || lr.access_token || lr.token;
			const c = await fetch(`${BASE_URL}/api/v1/residence/contrats`, {
				headers: { Authorization: `Bearer ${tok}` },
			}).then((r) => r.json());
			const liste = Array.isArray(c) ? c : c.items || c.data || [];
			idContrat = String(liste[0]?.id_contrat);
		}
		// Activer le contrat si EN_ATTENTE (action « Activer le contrat » de la
		// liste → POST /residence/contrats/{id}/activer, via Node avec jeton).
		const lr = await fetch(`${BASE_URL}/api/v1/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login: LOGIN, mot_de_passe: PASSWORD }),
		}).then((r) => r.json());
		const tok = lr.accessToken || lr.access_token || lr.token;
		const det = await fetch(
			`${BASE_URL}/api/v1/residence/contrats/${idContrat}`,
			{ headers: { Authorization: `Bearer ${tok}` } },
		).then((r) => r.json());
		if (det.statut === "EN_ATTENTE") {
			const act = await fetch(
				`${BASE_URL}/api/v1/residence/contrats/${idContrat}/activer`,
				{ method: "POST", headers: { Authorization: `Bearer ${tok}` } },
			);
			console.log("   → activation contrat:", act.status);
		}
		await page.goto(`${BASE_URL}/residence/contrats/${idContrat}`);
		await waitLoad(page, 2500);
		// Onglet Échéances visible (par défaut) → 18
		await capture(page, "18-contrat-fiche");

		// 18b — envoi par email
		const btnEmail = page.getByRole("button", { name: /Envoyer par email/i });
		if (await btnEmail.isVisible().catch(() => false)) {
			await btnEmail.click();
			await page
				.getByText(/envoyé par email|Impossible/i)
				.first()
				.waitFor({ timeout: 15000 })
				.catch(() => {});
			await page.waitForTimeout(400);
			await capture(page, "18b-contrat-fiche-email");
		}

		// 18c — encaisser une échéance (dialogue)
		const btnEnc = page
			.getByRole("button", { name: /Enregistrer un paiement/i })
			.first();
		if (await btnEnc.isVisible().catch(() => false)) {
			await btnEnc.click();
			await page.waitForTimeout(800);
			await capture(page, "18c-contrat-fiche-encaisser-echeance");
			// valider pour avoir une échéance payée
			await dialog(page)
				.getByRole("button", { name: /Encaisser|Confirmer|Enregistrer/i })
				.last()
				.click();
			await waitLoad(page, 1500);
		}
		// 18d — encaisser en lot (dialogue, capture puis fermeture)
		const btnLot = page
			.getByRole("button", { name: /Encaissement en lot/i })
			.first();
		if (await btnLot.isVisible().catch(() => false)) {
			await btnLot.click();
			await page.waitForTimeout(800);
			await capture(page, "18d-contrat-fiche-encaisser-lot");
			await dialog(page)
				.getByRole("button", { name: /Annuler|Fermer/i })
				.first()
				.click()
				.catch(async () => {
					await page.keyboard.press("Escape");
				});
			await page.waitForTimeout(500);
		}

		// ---- Caution ----
		await page.getByRole("tab", { name: "Caution" }).click();
		await page.waitForTimeout(800);
		await capture(page, "18e-contrat-fiche-caution");
		const btnCaution = page.getByRole("button", {
			name: /Encaisser la caution/i,
		});
		if (await btnCaution.isVisible().catch(() => false)) {
			await btnCaution.click();
			await page.waitForTimeout(800);
			await capture(page, "18f-contrat-fiche-caution-versement");
			await dialog(page)
				.getByRole("button", { name: /Encaisser|Confirmer|Enregistrer/i })
				.last()
				.click();
			await waitLoad(page, 1800);
			await capture(page, "18f2-caution-encaissee");
			// fermer la modale de confirmation « Caution encaissée »
			await dialog(page)
				.getByRole("button", { name: /Fermer/i })
				.first()
				.click()
				.catch(async () => {
					await page.keyboard.press("Escape");
				});
			await page.waitForTimeout(700);
			await capture(page, "18g-contrat-fiche-caution-payee");
			const btnRemb = page.getByRole("button", {
				name: /Rembourser la caution/i,
			});
			if (await btnRemb.isVisible().catch(() => false)) {
				await btnRemb.click();
				await page.waitForTimeout(800);
				await capture(page, "18h-contrat-fiche-caution-restitution");
				await dialog(page)
					.getByRole("button", { name: /Annuler|Fermer/i })
					.first()
					.click()
					.catch(async () => {
						await page.keyboard.press("Escape");
					});
				await page.waitForTimeout(500);
			}
		}

		// ---- État des lieux ----
		await page.getByRole("tab", { name: /État des lieux/i }).click();
		await page.waitForTimeout(800);
		const btnPhoto = page.getByRole("button", {
			name: /Ajouter une photo/i,
		});
		if (await btnPhoto.isVisible().catch(() => false)) {
			await btnPhoto.click();
			await page.waitForTimeout(800);
			const input = page.locator("#etat-des-lieux-fichier");
			await input.setInputFiles(
				"docs/guides-utilisation/screenshots/residence/01-login.png",
			);
			await capture(page, "18j-contrat-fiche-etat-des-lieux-ajouter");
			// soumettre la 1re (entrée) puis une 2e (sortie)
			const soumettre = dialog(page).getByRole("button", {
				name: /Ajouter|Enregistrer|Envoyer/i,
			});
			if (await soumettre.isVisible().catch(() => false)) {
				await soumettre.click();
				await waitLoad(page, 2000);
			}
			await btnPhoto.click().catch(() => {});
			await page.waitForTimeout(700);
			await input.setInputFiles(
				"docs/guides-utilisation/screenshots/residence/02-dashboard.png",
			);
			// passer le type sur SORTIE si présent
			const typeSel = dialog(page)
				.locator('[aria-label="Type"], #type')
				.first();
			if (await typeSel.isVisible().catch(() => false)) {
				await typeSel.click();
				await page.waitForTimeout(400);
				const sortie = page
					.locator('[role="option"]')
					.getByText(/Sortie/i)
					.first();
				if (await sortie.isVisible().catch(() => false)) await sortie.click();
				else await page.keyboard.press("Escape");
			}
			const soumettre2 = dialog(page).getByRole("button", {
				name: /Ajouter|Enregistrer|Envoyer/i,
			});
			if (await soumettre2.isVisible().catch(() => false)) {
				await soumettre2.click();
				await waitLoad(page, 2000);
			}
			await capture(page, "18i-contrat-fiche-etat-des-lieux");
		}
	} catch (e) {
		errors.push(`[fiche] ${e.message}`);
		console.log("⚠️ fiche contrat:", e.message);
	}

	// ---------- Séjours ----------
	try {
		await page.goto(`${BASE_URL}/residence/sejours-courts`);
		await waitLoad(page);
		await capture(page, "22-sejours-liste");
		await ouvrirSelectEtCapture(page, "Type", "22b-sejours-filtre-type");
		await page
			.locator('[role="option"]')
			.getByText(/Nuitée/i)
			.first()
			.click();
		await waitLoad(page, 800);
		await capture(page, "22c-sejours-filtre-type-nuitee");

		await page.getByRole("button", { name: /Nouveau séjour/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "23-sejour-formulaire-vide");
		const dlg = dialog(page);
		// client (champ recherche) — prendre le premier « Guide »
		const rech = dlg.getByPlaceholder(/Rechercher par nom/i);
		if (await rech.isVisible().catch(() => false)) {
			await rech.fill("Guide");
			await page.waitForTimeout(1000);
			await page
				.getByText(/Guide/i)
				.first()
				.click()
				.catch(() => {});
		}
		await choisirSelect(page, "#logement-batiment", BAT_NOM);
		await waitLoad(page, 1500);
		await capture(page, "23b-sejour-batiment-selectionne");
		await page.locator("#logement-logement").click();
		await page.waitForTimeout(700);
		await capture(page, "23c-sejour-logement-ouvert", { fullPage: false });
		await page.locator('[role="option"]').first().click();
		await page.waitForTimeout(400);
		await capture(page, "23d-sejour-logement-selectionne");
		// champs séjour
		const champs = {
			arrivee: "2026-10-05T14:00",
			depart: "2026-10-06T12:00",
			tarif: "25000",
		};
		for (const [id, v] of Object.entries(champs)) {
			const el = dlg.locator(`#${id}`);
			if (await el.isVisible().catch(() => false)) await el.fill(v);
		}
		await dlg
			.getByRole("button", { name: /Enregistrer|Créer/i })
			.last()
			.click()
			.catch(() => {});
		await waitLoad(page, 1500);

		// 24 — fiche d'un séjour terminé (existant, via API Node)
		const lr2 = await fetch(`${BASE_URL}/api/v1/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login: LOGIN, mot_de_passe: PASSWORD }),
		}).then((r) => r.json());
		const tok2 = lr2.accessToken || lr2.access_token || lr2.token;
		const sj = await fetch(`${BASE_URL}/api/v1/residence/sejours`, {
			headers: { Authorization: `Bearer ${tok2}` },
		}).then((r) => r.json());
		const sejours = Array.isArray(sj) ? sj : sj.items || sj.data || [];
		const termine = sejours.find((s) => s.statut === "TERMINE");
		if (termine) {
			await page.goto(
				`${BASE_URL}/residence/sejours-courts/${termine.id_sejour}`,
			);
			await waitLoad(page, 2000);
			await capture(page, "24-sejour-fiche");
		}
	} catch (e) {
		errors.push(`[sejours] ${e.message}`);
		console.log("⚠️ séjours:", e.message);
	}

	// ---------- Charges ----------
	try {
		await page.goto(`${BASE_URL}/residence/charges`);
		await waitLoad(page);
		await capture(page, "26-charges-liste");
		await ouvrirSelectEtCapture(page, "Statut", "26b-charges-filtre-statut");
		await page
			.locator('[role="option"]')
			.getByText(/Impay/i)
			.first()
			.click();
		await waitLoad(page, 900);
		await capture(page, "26c-charges-filtre-impayees");

		// 26d — fenêtre « Enregistrer le paiement » sur une charge impayée
		const btnPayer = page
			.locator('[title="Enregistrer le paiement"]')
			.first();
		if (await btnPayer.isVisible().catch(() => false)) {
			await btnPayer.click();
			await page.waitForTimeout(800);
			await capture(page, "26d-charges-payer");
			await dialog(page)
				.getByRole("button", { name: /Annuler|Fermer/i })
				.first()
				.click()
				.catch(async () => {
					await page.keyboard.press("Escape");
				});
			await page.waitForTimeout(400);
		} else {
			console.log("   (aucune charge impayée à payer → 26d sauté)");
		}

		await page.getByRole("button", { name: /Nouvelle charge/i }).click();
		await page.waitForTimeout(800);
		await capture(page, "27-charge-formulaire-vide");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);

		// 28 — catégories de charges
		await page.goto(`${BASE_URL}/residence/categories-charges`);
		await waitLoad(page);
		await capture(page, "28-categories-charges");
		const btnCat = page.getByRole("button", {
			name: /Ajouter une catégorie/i,
		});
		if (await btnCat.isVisible().catch(() => false)) {
			await btnCat.click();
			await page.waitForTimeout(700);
			await capture(page, "28b-categorie-charge-form");
			await page.keyboard.press("Escape");
		}
	} catch (e) {
		errors.push(`[charges] ${e.message}`);
		console.log("⚠️ charges:", e.message);
	}

	// ---------- Échéances ----------
	try {
		await page.goto(`${BASE_URL}/residence/echeances`);
		await waitLoad(page);
		await capture(page, "34-echeances-liste");
		await ouvrirSelectEtCapture(page, "Statut", "34b-echeances-filtre-statut");
		await page
			.locator('[role="option"]')
			.getByText(/Impay/i)
			.first()
			.click();
		await waitLoad(page, 900);
		await capture(page, "34c-echeances-filtre-impayes");
	} catch (e) {
		errors.push(`[echeances] ${e.message}`);
		console.log("⚠️ échéances:", e.message);
	}

	await writeFile(
		path.join(OUT_DIR, "capture-errors.txt"),
		errors.join("\n") || "(aucune)",
		"utf8",
	);
	if (errors.length) {
		console.log("\n⚠️ Erreurs :");
		errors.forEach((e) => console.log(" -", e));
	}
	console.log("\n✅ Captures résidence terminées.");
	await browser.close();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
