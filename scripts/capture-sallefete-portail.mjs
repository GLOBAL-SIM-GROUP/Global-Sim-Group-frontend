/**
 * Complément de capture Salle de fête — demandes portail EN_ATTENTE +
 * catalogue « Types de manifestation » (2026-09-21).
 *
 * Une réservation EN_ATTENTE doit exister (créée via le portail). Le script :
 * catalogue → liste → dialogue refus (annulé) → validation réelle avec tarif.
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
	await page.screenshot({
		path: path.join(OUT_DIR, `${name}.png`),
		fullPage: true,
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
	await page.waitForURL("**/home", { timeout: 30000 });
	await waitForLoad(page);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await chromium.launch({ headless: true });
	const page = await (
		await browser.newContext({ viewport: { width: 1440, height: 900 } })
	).newPage();
	page.on("console", (m) => {
		if (m.type() === "error") errors.push(`[console] ${m.text()}`);
	});
	page.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));

	await login(page);

	// --- Catalogue --------------------------------------------------------
	await page.goto(`${BASE_URL}/salle-fete/catalogue`, {
		waitUntil: "domcontentloaded",
	});
	await page
		.waitForSelector("text=/Types de manifestation|Catalogue/", {
			timeout: 20000,
		})
		.catch(() => {});
	await page.waitForTimeout(1200);
	await capture(page, "14-catalogue");

	// --- Liste + filtre statut --------------------------------------------
	await page.goto(`${BASE_URL}/salle-fete/reservations`, {
		waitUntil: "domcontentloaded",
	});
	await page
		.waitForSelector("table tbody tr", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1500);

	const statutTrigger = page.locator('button[aria-label="Statut"]');
	if (await statutTrigger.isVisible().catch(() => false)) {
		await statutTrigger.click();
		await page.waitForTimeout(1200);
		await capture(page, "02-filtre-statut-ouvert");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(600);
	}
	await capture(page, "15-reservation-attente");

	// --- Refus : ouvrir la modale « Refuser la demande » puis Retour -------
	const ligne = page
		.locator("table tbody tr", { hasText: "En attente" })
		.first();
	const annulerBtn = ligne.getByRole("button", { name: /Annuler/ }).first();
	if (await annulerBtn.isVisible().catch(() => false)) {
		await annulerBtn.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(600);
		const motif = dlg.locator('[id*="motif"]');
		if (await motif.count()) {
			await motif.first().fill("Salle déjà réservée à cette date");
			await page.waitForTimeout(400);
		}
		await capture(page, "16-refus-reservation");
		await dlg.getByRole("button", { name: "Fermer" }).click();
		await page.waitForTimeout(800);
	} else {
		console.log("⚠ Pas de bouton Annuler sur une ligne EN_ATTENTE");
	}

	// --- Valider et tarifer → RESERVEE ------------------------------------
	const validerBtn = ligne
		.getByRole("button", { name: /Valider et tarifer/ })
		.first();
	if (await validerBtn.isVisible().catch(() => false)) {
		await validerBtn.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(600);
		await dlg.locator("#validation-tarif").fill("150000");
		const acompte = dlg.locator('[id*="acompte"]');
		if (await acompte.count()) await acompte.first().fill("50000");
		await page.waitForTimeout(500);
		await capture(page, "17-valider-tarifer");
		await dlg
			.getByRole("button", { name: /Valider|Confirmer|Enregistrer/ })
			.last()
			.click();
		await page.waitForTimeout(3000);
		await capture(page, "18-reservation-validee");
	} else {
		console.log("⚠ Pas de bouton Valider sur une ligne EN_ATTENTE");
	}

	await browser.close();
	if (errors.length) {
		await writeFile(
			path.join(OUT_DIR, "capture-portail-errors.txt"),
			errors.join("\n"),
			"utf8",
		);
		for (const e of errors) console.log(e);
	}
	console.log("✅ Captures Salle de fête (portail) terminées.");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
