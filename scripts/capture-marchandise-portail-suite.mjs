/**
 * Suite capture Marchandise portail : la validation a une modale de
 * confirmation (« Valider la demande n° X ? Le stock sera décrémenté… ») —
 * on la capture puis on confirme, puis Encaisser → PAYEE.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/marchandise/screenshots/marchandise";

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
	await page.goto(`${BASE_URL}/marchandise/ventes`, {
		waitUntil: "domcontentloaded",
	});
	await page
		.waitForSelector("table tbody tr", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1500);

	// Valider → modale de confirmation → confirmer.
	const validerBtn = page
		.getByRole("button", { name: /Valider la demande/ })
		.first();
	if (await validerBtn.isVisible().catch(() => false)) {
		await validerBtn.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(800);
		await capture(page, "25-valider-confirmation");
		await dlg
			.getByRole("button", { name: "Valider la demande" })
			.click();
		await page.waitForTimeout(3000);
		await capture(page, "26-vente-validee");
	} else {
		console.log("⚠ Pas de demande EN_ATTENTE");
	}

	// Encaisser → PAYEE.
	const encaisserBtn = page
		.getByRole("button", { name: /Encaisser la vente/ })
		.first();
	if (await encaisserBtn.isVisible().catch(() => false)) {
		await encaisserBtn.click();
		const dlg = page.getByRole("dialog");
		await dlg.waitFor({ timeout: 10000 });
		await page.waitForTimeout(800);
		await dlg.locator('button[role="combobox"], [id*="moyen"]').first().click();
		await page.waitForTimeout(800);
		await page.getByRole("option").first().click();
		await page.waitForTimeout(500);
		await capture(page, "27-encaisser-dialog");
		await dlg
			.getByRole("button", { name: /Encaisser|Valider|Confirmer/ })
			.last()
			.click();
		await page.waitForTimeout(3000);
		await capture(page, "28-vente-payee");
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
	console.log("✅ Terminé.");
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
