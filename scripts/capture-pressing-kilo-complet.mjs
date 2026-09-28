/**
 * Recapture ciblée Pressing — captures encore à l'ancien style visuel :
 * 15-tarif-kg, 16-commande-kilo, 17-fiche-poids, 18-catalogue,
 * 20-valider-demande, 21-demande-validee, 23-select-catalogue,
 * 24-ajout-catalogue-inline.
 *
 * Prérequis : une demande EN_ATTENTE doit exister (validation portail).
 *
 * Usage : node scripts/capture-pressing-kilo-complet.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/pressing/screenshots/pressing";

const errors = [];

async function capture(page, name, opts = {}) {
	await page.screenshot({
		path: path.join(OUT_DIR, `${name}.png`),
		fullPage: opts.fullPage ?? true,
	});
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
	await page.waitForURL((u) => !u.pathname.includes("/login"), {
		timeout: 30000,
	});
	await waitForLoad(page);
}

async function gotoAuth(page, url) {
	await page.goto(url, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(1000);
	if (page.url().includes("/login")) {
		await page.locator('input[name="login"]').fill(LOGIN);
		await page.locator('input[name="motDePasse"]').fill(PASSWORD);
		await page.getByRole("button", { name: "Se connecter" }).click();
		await page
			.waitForURL((u) => !u.pathname.includes("/login"), { timeout: 30000 })
			.catch(() => {});
		await page.goto(url, { waitUntil: "domcontentloaded" });
	}
	await waitForLoad(page);
}

function demain() {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
}

async function choisirClient(page) {
	const champ = page.locator("#client-recherche");
	await champ.fill("Guide");
	await page.waitForTimeout(1500);
	const premierResultat = page.locator("ul.divide-y li button").first();
	if (await premierResultat.isVisible().catch(() => false)) {
		await premierResultat.click();
	}
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

	// --- 15 : Tarif au kilo ----------------------------------------------
	await gotoAuth(page, `${BASE_URL}/pressing/tarif-kg`);
	await page
		.waitForSelector(
			"text=/Prix au kilo|Aucun tarif au kilo|Impossible de charger/",
			{ timeout: 15000 },
		)
		.catch(() => {});
	await page.waitForTimeout(800);
	const aucunTarif = await page
		.getByText("Aucun tarif au kilo n'a encore été configuré")
		.isVisible()
		.catch(() => false);
	if (aucunTarif) {
		await page.locator("#tarif-kg-prix").fill("2000");
		await page
			.getByRole("button", { name: "Définir le tarif" })
			.click();
		await page
			.waitForSelector("text=/Nouveau tarif enregistré/", { timeout: 15000 })
			.catch(() => {});
		await page.waitForTimeout(1500);
	} else {
		await page.locator("#tarif-kg-prix").fill("2000");
	}
	await capture(page, "15-tarif-kg");

	// --- 23/24 : selects catalogue + ajout inline (dialog dépôt) ---------
	await gotoAuth(page, `${BASE_URL}/pressing/commandes`);
	await page.getByRole("button", { name: "Nouvelle commande" }).click();
	const dlg = page.getByRole("dialog");
	await dlg.waitFor({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await dlg
		.getByRole("combobox", { name: "Type de vêtement" })
		.first()
		.click();
	await page.waitForTimeout(800);
	await capture(page, "23-select-catalogue", { fullPage: false });
	await page.keyboard.press("Escape");
	await page.waitForTimeout(400);
	const saisir = dlg
		.getByRole("button", { name: "Saisir manuellement" })
		.first();
	if (await saisir.isVisible().catch(() => false)) {
		await saisir.click();
		await page.waitForTimeout(400);
		await dlg
			.getByRole("textbox", { name: "Type de vêtement" })
			.fill("Rideau");
		await page.waitForTimeout(600);
		await capture(page, "24-ajout-catalogue-inline");
	}
	await page.keyboard.press("Escape");
	await page.waitForTimeout(500);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(500);

	// --- 16/17 : commande au kilo ----------------------------------------
	await gotoAuth(page, `${BASE_URL}/pressing/commandes`);
	await page.getByRole("button", { name: "Nouvelle commande" }).click();
	await page.waitForTimeout(1000);
	await choisirClient(page);
	await page.waitForTimeout(600);
	// Radio « Tarification au kilo ».
	await page
		.locator("label", { hasText: "Tarification au kilo" })
		.click();
	await page.waitForTimeout(1000);
	// Ligne article (selects catalogue + poids).
	const dlg2 = page.getByRole("dialog");
	await dlg2
		.getByRole("combobox", { name: "Type de vêtement" })
		.first()
		.click();
	await page.waitForTimeout(700);
	await page.getByRole("option").first().click();
	await page.waitForTimeout(400);
	await dlg2
		.getByRole("combobox", { name: "Prestation" })
		.first()
		.click();
	await page.waitForTimeout(700);
	await page.getByRole("option").first().click();
	await page.waitForTimeout(400);
	await page
		.locator('input[aria-label="Poids (kg)"]')
		.first()
		.fill("4.5");
	await page.locator("#commande-retrait").fill(demain());
	await page.waitForTimeout(600);
	await capture(page, "16-commande-kilo");
	await page.getByRole("button", { name: "Enregistrer" }).click();
	await page.waitForTimeout(2500);
	// Fiche de la commande au kilo : première ligne de la liste.
	await page
		.waitForSelector("table tbody tr", { timeout: 20000 })
		.catch(() => {});
	await page.locator("table tbody tr td a").first().click();
	await page
		.waitForURL("**/pressing/commandes/**", { timeout: 15000 })
		.catch(() => {});
	await waitForLoad(page);
	await capture(page, "17-fiche-poids");

	// --- 18 : catalogue ---------------------------------------------------
	await gotoAuth(page, `${BASE_URL}/pressing/catalogue`);
	await page
		.waitForSelector("text=/Types de vêtement|Prestations/", {
			timeout: 20000,
		})
		.catch(() => {});
	await page.waitForTimeout(1000);
	await capture(page, "18-catalogue");

	// --- 20/21 : valider la demande EN_ATTENTE ---------------------------
	await gotoAuth(page, `${BASE_URL}/pressing/commandes`);
	await page
		.waitForSelector("table tbody tr", { timeout: 20000 })
		.catch(() => {});
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	await statutTrigger.click({ timeout: 10000 });
	await page.waitForTimeout(1200);
	await page
		.getByRole("option", { name: /En attente/ })
		.first()
		.click()
		.catch(async () => {
			await page.keyboard.press("Escape");
		});
	await page.waitForTimeout(1500);
	const validerBtn = page
		.getByRole("button", { name: /Valider et chiffrer/ })
		.first();
	if (await validerBtn.isVisible().catch(() => false)) {
		await validerBtn.click();
		await page.waitForTimeout(1500);
		const tarifs = page.getByPlaceholder("Tarif (FCFA)");
		const n = await tarifs.count();
		for (let i = 0; i < n; i++) {
			await tarifs.nth(i).fill(i === 0 ? "3000" : "800");
		}
		const dateRetrait = page.locator(
			'input[type="date"], #demande-retrait, [id*="retrait"]',
		);
		if (await dateRetrait.first().isVisible().catch(() => false)) {
			const d = new Date();
			d.setDate(d.getDate() + 2);
			await dateRetrait.first().fill(d.toISOString().slice(0, 10));
		}
		await capture(page, "20-valider-demande");
		await page
			.getByRole("button", { name: /Valider|Confirmer|Enregistrer/ })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "21-demande-validee");
	} else {
		console.log("⚠ Aucune demande EN_ATTENTE — 20/21 sautées");
	}

	await browser.close();
	if (errors.length > 0) {
		console.log("\n--- Erreurs ---");
		for (const e of errors) console.log(e);
		await writeFile(
			path.join(OUT_DIR, "capture-kilo-complet-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
	}
	console.log("✅ Captures Pressing (kilo+catalogue+portail) terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
