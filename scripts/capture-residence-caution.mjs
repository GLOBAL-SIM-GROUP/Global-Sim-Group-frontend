/**
 * Re-capture des captures « caution » du guide Résidence (workflow changé
 * le 2026-09-13 : « Encaisser »/« Rembourser » en une seule opération avec
 * vrai mouvement de caisse, bouton « restitution hors système » retiré) +
 * capture de la fiche séjour (jamais documentée).
 *
 * - Trouve un contrat à caution NON payée → 18e (onglet, 2 boutons) +
 *   18f (modale « Encaisser la caution ») → encaissement RÉEL →
 *   18f2 (écran de confirmation) → 18g (caution Payée + bouton
 *   « Rembourser la caution ») → 18h (modale « Rembourser » — annulée,
 *   pas de décaissement réel).
 * - Ouvre la fiche du premier séjour non terminé → 24-sejour-fiche.
 *
 * Données réelles : un encaissement de caution (ENCAISSEMENT Finances)
 * sur le contrat choisi — documenté dans le guide.
 *
 * Usage : node scripts/capture-residence-caution.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR = "docs/guides-utilisation/screenshots/residence";

const errors = [];

async function capture(page, name, { fullPage = true } = {}) {
	await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage });
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

/** Ouvre l'onglet Caution du contrat courant ; true si « Non payée ». */
async function cautionNonPayee(page) {
	const onglet = page.getByRole("tab", { name: "Caution" });
	if (!(await onglet.isVisible().catch(() => false))) return null;
	await onglet.click();
	await page.waitForTimeout(1500);
	return page.getByText("Non payée").first().isVisible().catch(() => false);
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

		// ── 1. Trouver un contrat à caution non payée ─────────────────────
		await page.goto(`${BASE_URL}/residence/contrats`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);

		const liens = page.locator('td a[href*="/residence/contrats/"]');
		const total = await liens.count();
		let trouve = false;
		for (let i = 0; i < Math.min(total, 10); i++) {
			const href = await liens.nth(i).getAttribute("href");
			if (!href) continue;
			await page.goto(`${BASE_URL}${href}`, {
				waitUntil: "domcontentloaded",
			});
			await waitForLoad(page);
			const nonPayee = await cautionNonPayee(page);
			if (nonPayee === true) {
				trouve = true;
				break;
			}
			if (nonPayee === false && !trouve) {
				// Caution déjà payée : capture quand même l'état payé si besoin
				continue;
			}
		}
		if (!trouve) {
			console.log("⚠️  aucun contrat à caution non payée trouvé");
		} else {
			// ── 2. Onglet caution avec les 2 nouveaux boutons ───────────────
			await capture(page, "18e-contrat-fiche-caution");

			// ── 3. Modale « Encaisser la caution » ──────────────────────────
			await page
				.getByRole("button", { name: "Encaisser la caution" })
				.click();
			await page.waitForTimeout(1000);
			await capture(page, "18f-contrat-fiche-caution-versement", {
				fullPage: false,
			});

			// Encaissement réel : montant pré-rempli + moyen de paiement
			const moyen = page
				.locator('[role="dialog"] button[role="combobox"]')
				.first();
			await moyen.click();
			await page.waitForTimeout(800);
			await page
				.locator('[role="option"]')
				.first()
				.click();
			await page.waitForTimeout(400);
			await page
				.locator('[role="dialog"] button[type="submit"]')
				.click();
			// Écran de confirmation « Caution encaissée »
			await page
				.getByText("Caution encaissée")
				.waitFor({ timeout: 15000 })
				.catch(() => {});
			await page.waitForTimeout(800);
			await capture(page, "18f2-caution-encaissee", { fullPage: false });
			await page
				.getByRole("button", { name: "Fermer" })
				.click()
				.catch(() => {});
			await page.waitForTimeout(1500);

			// ── 4. Caution payée + bouton « Rembourser » ────────────────────
			await page
				.getByText("Payée", { exact: true })
				.first()
				.waitFor({ timeout: 10000 })
				.catch(() => {});
			await page.waitForTimeout(600);
			await capture(page, "18g-contrat-fiche-caution-payee");

			// ── 5. Modale « Rembourser la caution » (annulée) ───────────────
			await page
				.getByRole("button", { name: "Rembourser la caution" })
				.click();
			await page.waitForTimeout(1000);
			await capture(page, "18h-contrat-fiche-caution-restitution", {
				fullPage: false,
			});
			await page
				.getByRole("button", { name: "Annuler" })
				.last()
				.click()
				.catch(() => {});
		}

		// ── 6. Fiche d'un séjour non terminé ──────────────────────────────
		await page.goto(`${BASE_URL}/residence/sejours-courts`, {
			waitUntil: "domcontentloaded",
		});
		await waitForLoad(page);
		await page
			.getByRole("table")
			.waitFor({ timeout: 10000 })
			.catch(() => {});
		await page.waitForTimeout(800);
		const lienSejour = page
			.locator('td a[href*="/residence/sejours-courts/"]')
			.first();
		if (await lienSejour.isVisible().catch(() => false)) {
			await lienSejour.click();
			await waitForLoad(page);
			await page.waitForTimeout(800);
			await capture(page, "24-sejour-fiche");
		} else {
			console.log("⚠️  aucun séjour trouvé — 24 sauté");
		}
	} finally {
		await context.close();
		await browser.close();
	}

	const errPath = path.join(OUT_DIR, "..", "capture-caution-errors.txt");
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
