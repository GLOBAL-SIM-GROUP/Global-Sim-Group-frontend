/**
 * Complément de capture Restaurant — demandes portail EN_ATTENTE + encaissement
 * (2026-09-21).
 *
 * Une commande EN_ATTENTE (portail résident) doit exister. Le script :
 * liste filtrée → dialogue de refus (annulé) → validation réelle → EN_COURS →
 * dialogue « Encaisser » → PAYEE.
 *
 * Usage : node scripts/capture-restaurant-portail.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/restaurant/screenshots/restaurant";

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
	await page.goto(`${BASE_URL}/restaurant/commandes`, {
		waitUntil: "domcontentloaded",
	});
	await page
		.waitForSelector("table tbody tr", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1500);

	// Filtre statut : recapturer le menu (nouvelle option « En attente »).
	const statutTrigger = page.locator('button[aria-label="Statut"]');
	if (await statutTrigger.isVisible().catch(() => false)) {
		await statutTrigger.click();
		await page.waitForTimeout(1200);
		await capture(page, "07-commandes-filtre-statut");
		// Sélection « En attente » pour isoler la demande.
		await page
			.getByRole("option", { name: /En attente/ })
			.first()
			.click()
			.catch(() => page.keyboard.press("Escape"));
		await page.waitForTimeout(1500);
	}
	await capture(page, "20-demande-attente");

	// Refus : ouvrir le dialogue (motif) puis fermer sans confirmer.
	const refuserBtn = page
		.getByRole("button", { name: /Refuser la demande/ })
		.first();
	if (await refuserBtn.isVisible().catch(() => false)) {
		await refuserBtn.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(600);
		await dlg.locator("#motif-refus").fill("Plus de poisson aujourd'hui");
		await page.waitForTimeout(400);
		await capture(page, "21-refus-dialog");
		await dlg.getByRole("button", { name: "Retour" }).click();
		await page.waitForTimeout(800);
	}

	// Valider : prise en charge réelle → EN_COURS.
	const validerBtn = page
		.getByRole("button", { name: /Valider la demande/ })
		.first();
	if (await validerBtn.isVisible().catch(() => false)) {
		await validerBtn.click();
		await page.waitForTimeout(2500);
		await capture(page, "22-demande-validee");
	}

	// Encaisser : sur la commande désormais EN_COURS.
	const encaisserBtn = page
		.getByRole("button", { name: /Encaisser la commande/ })
		.first();
	if (await encaisserBtn.isVisible().catch(() => false)) {
		await encaisserBtn.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(600);
		await dlg.locator("#encaisser-moyen").click();
		await page.waitForTimeout(800);
		await page.getByRole("option").first().click();
		await page.waitForTimeout(500);
		await capture(page, "23-encaisser-dialog");
		await dlg
			.getByRole("button", { name: /Encaisser|Valider|Confirmer/ })
			.last()
			.click();
		await page.waitForTimeout(2500);
		await capture(page, "24-commande-payee");
	} else {
		console.log("⚠ Pas de bouton Encaisser visible");
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
	console.log("✅ Captures Restaurant (portail) terminées.");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
