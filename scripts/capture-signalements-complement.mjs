/**
 * Complément de capture Signalements : les mutations (prise en charge,
 * résolution) fonctionnent mais l'invalidation TanStack Query met
 * quelques secondes — les captures 07/09 du run principal montraient
 * encore « Ouvert ». Ici on attend explicitement le changement de badge.
 *
 * - Crée un 2e signalement « Guide — Fuite d'eau couloir C » → Prendre en
 *   charge → attend le badge « En cours » → capture 07 (reste EN_COURS en
 *   base, c'est voulu : montre l'état intermédiaire).
 * - Recharge la fiche du signalement résolu (« Ascenseur du bloc B ») →
 *   capture 09 : badge Résolu + note de résolution + carte Actions
 *   disparue (signalement clos).
 *
 * Usage : node scripts/capture-signalements-complement.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/signalements/screenshots/signalements";

const errors = [];

async function capture(page, name, { fullPage = true } = {}) {
	await page.screenshot({
		path: path.join(OUT_DIR, `${name}.png`),
		fullPage,
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
	await page.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(page);
}

async function choisirOptionParTexte(page, triggerLocator, texte) {
	await triggerLocator.click({ timeout: 8000 });
	await page.waitForTimeout(900);
	await page
		.locator('[role="option"]', { hasText: texte })
		.first()
		.click({ timeout: 8000 });
	await page.waitForTimeout(500);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });
	const browser = await chromium.launch();
	const context = await browser.newContext({
		viewport: { width: 1440, height: 900 },
		locale: "fr-FR",
	});
	const page = await context.newPage();
	page.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console] ${msg.text()}`);
	});
	page.on("pageerror", (err) => errors.push(`[pageerror] ${err.message}`));

	try {
		await login(page);

		// ── 1. Nouveau signalement pour l'état « En cours » ───────────────
		await page.goto(`${BASE_URL}/signalements`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("button", { name: "Nouveau signalement" })
			.click();
		await page.locator("#titre").waitFor({ timeout: 8000 });
		await page
			.locator("#titre")
			.fill("Guide — Fuite d'eau au couloir du bloc C");
		await page
			.locator("#description")
			.fill(
				"Une flaque s'étend au couloir du 2e étage du bloc C, " +
					"probablement un joint du lave-linge commun.",
			);
		await choisirOptionParTexte(
			page,
			page.locator('button[id="moduleCible"]'),
			"Résidence",
		);
		await page
			.getByRole("button", { name: "Créer le signalement" })
			.click();
		await page.waitForURL(/\/signalements\/[^/]+$/, { timeout: 20000 });
		await waitForLoad(page);

		// ── 2. Prendre en charge + attente explicite du badge ─────────────
		await page
			.getByRole("button", { name: "Prendre en charge" })
			.click();
		await page
			.getByText("En cours", { exact: true })
			.first()
			.waitFor({ timeout: 15000 })
			.catch(() => console.log("⚠️  badge « En cours » non apparu"));
		await page.waitForTimeout(800);
		await capture(page, "07-en-cours");

		// ── 3. Fiche du signalement résolu ────────────────────────────────
		await page.goto(`${BASE_URL}/signalements`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		const lienAscenseur = page.getByRole("link", {
			name: /Ascenseur du bloc B/,
		});
		await lienAscenseur.first().click();
		await waitForLoad(page);
		await page
			.getByText("Résolu", { exact: true })
			.first()
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);
		await capture(page, "09-resolu");
	} finally {
		await context.close();
		await browser.close();
	}

	const errPath = path.join(OUT_DIR, "..", "capture-complement-errors.txt");
	await writeFile(errPath, errors.join("\n"), "utf8");
	console.log(
		errors.length > 0
			? `⚠️  ${errors.length} erreur(s) → ${errPath}`
			: "✅ Aucune erreur console/page",
	);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
