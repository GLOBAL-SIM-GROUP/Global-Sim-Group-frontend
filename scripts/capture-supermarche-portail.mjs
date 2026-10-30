/**
 * Captures Super-Marché — demandes du portail résident (EN_ATTENTE) :
 * création d'une vraie demande via le portail puis captures admin de la
 * validation / refus / encaissement.
 *
 *   node scripts/capture-supermarche-portail.mjs
 *
 * Sortie : ../../Documentation/sim-docs/guides-utilisation/supermarche/screenshots/supermarche/
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || "http://localhost:3400";
const ADMIN_LOGIN = process.env.LOGIN || "admin";
const ADMIN_PASSWORD = process.env.PASSWORD || "motdepasse";
const RESIDENT_LOGIN = process.env.RESIDENT_LOGIN || "resident";
const RESIDENT_PASSWORD = process.env.RESIDENT_PASSWORD || "motdepasse";
const OUT_DIR = path.join(
	__dirname,
	"..",
	"..",
	"Documentation",
	"sim-docs",
	"guides-utilisation",
	"supermarche",
	"screenshots",
	"supermarche",
);

const erreurs = [];
fs.mkdirSync(OUT_DIR, { recursive: true });

async function login(page, loginId, password) {
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await page.locator('input[name="login"]').fill(loginId);
	await page.locator('input[name="motDePasse"]').fill(password);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL((u) => !u.pathname.includes("login"), {
		timeout: 30000,
	});
}

async function shot(page, nom) {
	await page.screenshot({ path: path.join(OUT_DIR, `${nom}.png`) });
	console.log(`📸 ${nom}`);
}

async function masquerDevtools(page) {
	await page
		.addStyleTag({ content: '[id*="tanstack"],[class*="tanstack"]{display:none!important}' })
		.catch(() => {});
}

async function main() {
	const browser = await chromium.launch();
	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const page = await ctx.newPage();
	page.on("console", (m) => {
		if (m.type() === "error") erreurs.push(`[console] ${m.text().slice(0, 300)}`);
	});
	page.on("pageerror", (e) => erreurs.push(`[page] ${e.message.slice(0, 300)}`));

	// ── 1. Demande réelle via le portail résident ──────────────────────
	console.log("→ Connexion résident + commande portail…");
	await login(page, RESIDENT_LOGIN, RESIDENT_PASSWORD);
	await page.goto(`${BASE_URL}/residence/portail/supermarche`, {
		waitUntil: "domcontentloaded",
	});
	await page.waitForTimeout(2000);
	const ajouter = page.locator('button[aria-label*="ajouter"][aria-label*="panier" i], button[aria-label^="Ajouter "][aria-label$="au panier"]').first();
	if (!(await ajouter.count())) {
		throw new Error("Aucun bouton « Ajouter au panier » trouvé dans le catalogue");
	}
	await ajouter.scrollIntoViewIfNeeded();
	await ajouter.click();
	const qdlg = page.getByRole("dialog");
	await qdlg.waitFor({ state: "visible", timeout: 10000 });
	await qdlg.getByRole("button", { name: /Confirmer|Ajouter/ }).click();
	await page.waitForTimeout(800);
	await page.getByRole("link", { name: "Voir le panier" }).click();
	await page.waitForURL(/panier/, { timeout: 15000 });
	await page.waitForTimeout(1200);
	await shot(page, "26-portail-panier");
	await page.getByRole("button", { name: "Envoyer ma demande" }).click();
	const ddlg = page.getByRole("dialog");
	await ddlg.waitFor({ state: "visible", timeout: 10000 });
	await shot(page, "26b-portail-envoyer-demande");
	await ddlg.getByRole("button", { name: "Envoyer la demande" }).click();
	await page.waitForTimeout(2500);
	console.log("✅ Demande portail envoyée");

	// ── 2. Captures admin de la validation ─────────────────────────────
	console.log("→ Connexion admin + captures validation…");
	await login(page, ADMIN_LOGIN, ADMIN_PASSWORD);
	await page.goto(`${BASE_URL}/supermarche/ventes`, {
		waitUntil: "domcontentloaded",
	});
	await masquerDevtools(page);
	await page.waitForTimeout(2500);

	// Ligne « En attente » (la demande portail)
	const ligneAttente = page.locator("tbody tr", { hasText: "En attente" }).first();
	if (!(await ligneAttente.count())) {
		throw new Error("Aucune vente « En attente » visible après la commande portail");
	}

	// Filtre statut ouvert sur « En attente de validation »
	const statutTrigger = page.locator('button[id*="statut"], [aria-label*="Statut" i]').first();
	if (await statutTrigger.count()) {
		await statutTrigger.click();
		await page.waitForTimeout(500);
		const opt = page.getByRole("option", { name: /En attente/ });
		if (await opt.count()) await opt.first().hover();
		await shot(page, "22-ventes-filtre-statut");
		await page.keyboard.press("Escape");
		await page.waitForTimeout(400);
	}

	await ligneAttente.scrollIntoViewIfNeeded();
	await shot(page, "23-vente-attente");

	// Fenêtre de refus (puis Retour — on garde la demande pour la suite)
	const refuserBtn = ligneAttente.locator('button[title="Refuser la demande"]');
	if (await refuserBtn.count()) {
		await refuserBtn.click();
		const rdlg = page.getByRole("dialog");
		await rdlg.waitFor({ state: "visible", timeout: 8000 });
		const motif = rdlg.locator("textarea");
		if (await motif.count()) await motif.fill("Produit en rupture de stock");
		await shot(page, "24-refus-dialog");
		await rdlg.getByRole("button", { name: "Retour" }).click();
		await page.waitForTimeout(600);
	}

	// Fenêtre de validation (puis validation réelle)
	const validerBtn = ligneAttente.locator('button[title="Valider la demande"]');
	if (await validerBtn.count()) {
		await validerBtn.click();
		const vdlg = page.getByRole("dialog");
		await vdlg.waitFor({ state: "visible", timeout: 8000 });
		await shot(page, "25-valider-confirmation");
		await vdlg.getByRole("button", { name: "Valider la demande" }).click();
		await page.waitForTimeout(2500);
		console.log("✅ Demande validée");
	}

	// La demande passe EN_COURS → dialogue d'encaissement
	const ligneCours = page
		.locator("tbody tr", { hasText: "En cours" })
		.filter({ hasText: "Portail" })
		.first();
	const cible = (await ligneCours.count()) ? ligneCours : ligneAttente;
	const encaisserBtn = cible.locator('button[title="Encaisser la vente"]');
	if (await encaisserBtn.count()) {
		await encaisserBtn.click();
		const edlg = page.getByRole("dialog");
		await edlg.waitFor({ state: "visible", timeout: 8000 });
		const moyen = edlg.locator('[id*="moyen"], button[role="combobox"]').first();
		await moyen.click();
		await page.waitForTimeout(500);
		await page.getByRole("option").first().click();
		await page.waitForTimeout(400);
		const caisse = edlg.locator('[id*="caisse"], button[role="combobox"]').last();
		if (await caisse.count()) {
			await caisse.click();
			await page.waitForTimeout(500);
			const opt = page.getByRole("option").first();
			if (await opt.count()) await opt.click();
		}
		await page.waitForTimeout(400);
		await shot(page, "27-encaisser-dialog");
		await edlg.getByRole("button", { name: "Encaisser" }).click();
		await page.waitForTimeout(2500);
		console.log("✅ Vente encaissée");
		await shot(page, "28-vente-payee");
	}

	await browser.close();
	if (erreurs.length) {
		fs.writeFileSync(
			path.join(OUT_DIR, "..", "capture-portail-errors.txt"),
			erreurs.join("\n"),
		);
		console.log(`⚠️  ${erreurs.length} erreur(s) console`);
	}
	console.log("✅ Captures portail terminées →", OUT_DIR);
}

main().catch((e) => {
	console.error(e.message);
	process.exit(1);
});
