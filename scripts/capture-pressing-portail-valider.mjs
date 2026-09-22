/**
 * Re-capture ciblée : validation réelle de la demande pressing EN_ATTENTE.
 * La modale démarre avec un article vide — on le remplit puis « Valider et
 * chiffrer » → DEPOSE.
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
	await page.goto(`${BASE_URL}/pressing/commandes`, {
		waitUntil: "domcontentloaded",
	});
	await page
		.waitForSelector("table tbody tr", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1500);

	const validerBtn = page
		.getByRole("button", { name: /Valider et chiffrer/ })
		.first();
	if (!(await validerBtn.isVisible().catch(() => false))) {
		console.log("⚠ Aucune demande EN_ATTENTE — rien à faire");
		await browser.close();
		return;
	}
	await validerBtn.click();
	const dialog = page.getByRole("dialog");
	await dialog.waitFor({ timeout: 10000 });
	await page.waitForTimeout(800);

	// Article déclaré : ligne unique pré-remplie vide → tout renseigner.
	await dialog
		.getByPlaceholder(/Type de vêtement/)
		.first()
		.fill("Couette");
	await dialog
		.getByPlaceholder(/Prestation/)
		.first()
		.fill("Lavage + séchage");
	await dialog.getByPlaceholder(/Tarif/).first().fill("3000");

	// Date de retrait prévue (dans la modale uniquement).
	const dateInput = dialog.locator('input[type="date"]');
	if (await dateInput.count()) {
		const d = new Date();
		d.setDate(d.getDate() + 2);
		await dateInput.first().fill(d.toISOString().slice(0, 10));
	}
	await page.waitForTimeout(500);
	await capture(page, "20-valider-demande");

	await dialog.getByRole("button", { name: /Valider et chiffrer/ }).click();
	await page.waitForTimeout(3000);
	await capture(page, "21-demande-validee");

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
