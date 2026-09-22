/**
 * Re-capture ciblée Administration : la matrice des permissions a grossi
 * (nouveaux verbes métier + module PORTAIL). 2026-09-21.
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/administration/screenshots/administration";

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
	await page.goto(`${BASE_URL}/admin/roles`, {
		waitUntil: "domcontentloaded",
	});
	await page.waitForTimeout(2000);
	// Ouvrir la matrice du rôle Administrateur.
	await page
		.getByRole("link", { name: /Modifier les permissions/ })
		.first()
		.click();
	await page.waitForTimeout(2500);
	await page
		.waitForSelector("text=/Permission|CREER|VOIR/", { timeout: 20000 })
		.catch(() => {});
	await page.waitForTimeout(1000);
	await capture(page, "08-permissions");

	await browser.close();
	if (errors.length) {
		await writeFile(
			path.join(OUT_DIR, "capture-perm-errors.txt"),
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
