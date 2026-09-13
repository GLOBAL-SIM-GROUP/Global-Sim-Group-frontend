/**
 * Re-capture ciblée de la fiche réservation Salle de fête (complément de
 * `capture-salle-fete-guide.mjs`) : ouvre la réservation « Mariage Guide »
 * via le filtre Manifestation, puis capture le cycle Confirmer / Réaliser.
 *
 * Usage : node scripts/capture-salle-fete-fiche.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/salle-fete/screenshots/salle-fete";

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

	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitForLoad(page);
	await page.locator('input[name="login"]').fill(LOGIN);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(page);

	await page.goto(`${BASE_URL}/salle-fete/reservations`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);

	// Filtrer par manifestation pour retrouver la réservation « Guide ».
	await page
		.locator('input[aria-label="Filtrer par manifestation"]')
		.fill("Mariage Guide");
	await page.waitForTimeout(1500);
	await capture(page, "01b-reservations-filtrees");

	// Ouvre la fiche de la réservation filtrée.
	const lien = page.locator("table tbody tr td a").first();
	await lien.click();
	await page.waitForURL("**/salle-fete/reservations/**", {
		timeout: 15000,
	});
	// Attendre la fin du chargement de la fiche (la requête peut être lente).
	await page
		.getByText("Fiche réservation", { exact: true })
		.waitFor({ state: "visible", timeout: 20000 })
		.catch(() => {});
	await waitForLoad(page);
	await capture(page, "07-fiche-reservation");

	// Fenêtre « Confirmer la réservation » (encaissement de l'acompte/solde).
	const confirmerBouton = page.getByRole("button", {
		name: /Confirmer \(encaisser\)/,
	});
	if (await confirmerBouton.isVisible().catch(() => false)) {
		await confirmerBouton.click();
		await page.waitForTimeout(1000);
		// Le montant proposé = solde (0 FCFA si le backend ne l'a pas posé) ;
		// on saisit un acompte réel pour que l'encaissement soit accepté.
		await page.locator("#paie-montant").fill("50000");
		await capture(page, "08-confirmer-dialog");
		await page
			.getByRole("button", { name: "Confirmer", exact: true })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "09-fiche-confirmee");
	} else {
		console.log("⚠️ Bouton « Confirmer » absent — statut déjà avancé ?");
	}

	// Fenêtre « Réaliser la réservation » (solde restant) — validée pour
	// montrer le cycle complet jusqu'à « Réalisée ».
	const realiserBouton = page.getByRole("button", {
		name: /Réaliser \(encaisser le solde\)/,
	});
	if (await realiserBouton.isVisible().catch(() => false)) {
		await realiserBouton.click();
		await page.waitForTimeout(1000);
		await capture(page, "10-realiser-dialog");
		await page
			.getByRole("button", { name: "Réaliser", exact: true })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "10b-fiche-realisee");
	} else {
		console.log("⚠️ Bouton « Réaliser » absent — pas de solde ?");
	}

	// Re-capture du calendrier avec la réservation confirmée/réalisée.
	await page.goto(`${BASE_URL}/salle-fete/calendrier`, {
		waitUntil: "domcontentloaded",
	});
	await waitForLoad(page);
	await capture(page, "11-calendrier");

	await context.close();
	await browser.close();

	if (errors.length > 0) {
		for (const e of errors) console.log(e);
		await writeFile(
			path.join(OUT_DIR, "capture-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
	}
	console.log("✅ Captures fiche Salle de fête terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
