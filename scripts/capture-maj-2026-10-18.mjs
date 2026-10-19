/**
 * Captures de mise à jour (18/10/2026) :
 *  - pressing : « Contenu du dépôt » (chips + description) dans le formulaire,
 *    fiche commande avec « Description : », dialogue de validation portail
 *  - accueil : menu utilisateur (avatar + « Mon compte »), page /mon-compte staff
 *  - clients : liste avec avatars photo
 *  - finances : « Ma caisse » (état ouverte/fermée réel)
 *  - portail résident + espace client : « Mon compte » avec photo de profil
 *
 * Usage : node scripts/capture-maj-2026-10-18.mjs
 */
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3400";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const DOCS =
	"B:/Ecole/UCAC ICAM/PROJETS IMPORTANTS/Résidence SIM/Code/Documentation/sim-docs/guides-utilisation";
const OUT = {
	pressing: `${DOCS}/pressing/screenshots/pressing`,
	clients: `${DOCS}/clients/screenshots/clients`,
	accueil: `${DOCS}/accueil-dashboard/screenshots/accueil-dashboard`,
	finances: `${DOCS}/finances/screenshots/finances`,
	portail: `${DOCS}/portail-resident/screenshots/portail`,
	espace: `${DOCS}/espace-client/screenshots/espace-client`,
};

async function waitLoad(page, extra = 1500) {
	await page
		.waitForLoadState("domcontentloaded", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(extra);
	// Toasts temps réel : attendre que le viewport se vide.
	await page
		.waitForSelector(".ToastViewport .ToastRoot", {
			state: "detached",
			timeout: 12000,
		})
		.catch(() => {});
}

async function shot(page, dir, name, fullPage = false) {
	await page.screenshot({
		path: path.join(dir, `${name}.png`),
		fullPage,
	});
	console.log(`📸 ${dir.split("/").slice(-2).join("/")}/${name}`);
}

async function login(page, identifiant) {
	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitLoad(page);
	await page.locator('input[name="login"]').fill(identifiant);
	await page.locator('input[name="motDePasse"]').fill(PASSWORD);
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page
		.waitForURL(/\/(home|residence\/portail|espace-client)/, {
			timeout: 20000,
		})
		.catch(() => {});
	await waitLoad(page);
}

function demain() {
	const d = new Date();
	d.setDate(d.getDate() + 1);
	return d.toISOString().slice(0, 10);
}

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();

// ============ ADMIN : pressing ============
await login(page, "admin");

await page.goto(`${BASE_URL}/pressing/commandes`, {
	waitUntil: "domcontentloaded",
});
await waitLoad(page);

// Formulaire « Nouvelle commande » vide — la zone « Contenu du dépôt » est visible.
await page
	.getByRole("button", { name: /Nouvelle commande/i })
	.first()
	.click();
await page.waitForTimeout(1200);
await shot(page, OUT.pressing, "04-nouvelle-commande-vide");

// Chips : cliquer 2 types pour composer la description automatique.
const zone = page.getByText("Contenu du dépôt").locator("..").locator("..");
const chips = zone.locator("button").filter({ hasNot: page.locator("span") });
const nChips = await chips.count();
const pris = [];
for (let i = 0; i < Math.min(2, nChips); i++) {
	const chip = chips.nth(i);
	const lib = (await chip.textContent())?.trim();
	if (lib) pris.push(lib);
	await chip.click();
	await page.waitForTimeout(300);
}
// +1 sur la première puce active (compteur +)
const plusBtn = zone.locator('button[aria-label^="Ajouter un"]').first();
if (await plusBtn.isVisible().catch(() => false)) {
	await plusBtn.click();
	await page.waitForTimeout(300);
}
await shot(page, OUT.pressing, "28-contenu-depot-chips");
console.log("chips pris:", pris.join(", "));

// Remplir client + article + date puis créer → fiche avec « Description : ».
const champClient = page.locator("#client-recherche");
if (await champClient.isVisible().catch(() => false)) {
	await champClient.fill("Guide");
	await page.waitForTimeout(1500);
	const premier = page.locator("ul.divide-y li button").first();
	if (await premier.isVisible().catch(() => false)) await premier.click();
}
await page.waitForTimeout(500);
// Ligne article (le type est déduit du contenu déclaré — champ masqué).
const selPrestation = page
	.locator('button[aria-label="Prestation"]')
	.first();
if (await selPrestation.isVisible().catch(() => false)) {
	await selPrestation.click();
	await page.waitForTimeout(800);
	await page.getByRole("option").first().click();
	await page.waitForTimeout(400);
	const tarif = page.locator('input[aria-label="Tarif"]').first();
	if (await tarif.isVisible().catch(() => false)) await tarif.fill("1500");
}
const dateRetrait = page.locator("#commande-retrait");
if (await dateRetrait.isVisible().catch(() => false))
	await dateRetrait.fill(demain());
await page.waitForTimeout(400);
await shot(page, OUT.pressing, "06-commande-remplie");

const btnCreer = page
	.getByRole("button", { name: /^(Créer|Enregistrer)/ })
	.last();
if (await btnCreer.isVisible().catch(() => false)) {
	await btnCreer.click();
	await page.waitForTimeout(2500);
	// La fiche de la commande créée s'ouvre — « Description : » visible.
	const desc = page.getByText("Description :").first();
	if (await desc.isVisible().catch(() => false)) {
		await desc.scrollIntoViewIfNeeded();
		await page.waitForTimeout(400);
	}
	await shot(page, OUT.pressing, "08-fiche-commande");
}

// Dialogue de validation d'une demande portail — champ Description.
await page.goto(`${BASE_URL}/pressing/commandes?statut=EN_ATTENTE`, {
	waitUntil: "domcontentloaded",
});
await waitLoad(page);
const ligneAttente = page.locator("tbody tr").first();
if (await ligneAttente.isVisible().catch(() => false)) {
	await ligneAttente.click();
	await page.waitForTimeout(1800);
	const btnValider = page
		.getByRole("button", { name: /Valider|Chiffrer/i })
		.first();
	if (await btnValider.isVisible().catch(() => false)) {
		await btnValider.click();
		await page.waitForTimeout(1200);
		await shot(page, OUT.pressing, "20-valider-demande");
		await page.keyboard.press("Escape");
	}
}

// ============ ADMIN : clients (avatars) ============
await page.goto(`${BASE_URL}/client/clients`, {
	waitUntil: "domcontentloaded",
});
await waitLoad(page, 2500);
await shot(page, OUT.clients, "01-liste-clients");

// ============ ADMIN : menu utilisateur + /mon-compte ============
await page.goto(`${BASE_URL}/home`, { waitUntil: "domcontentloaded" });
await waitLoad(page);
const menuUser = page
	.locator("aside button")
	.filter({ hasText: /admin|ADMIN/i })
	.last();
if (await menuUser.isVisible().catch(() => false)) {
	await menuUser.click();
	await page.waitForTimeout(800);
	await shot(page, OUT.accueil, "05-menu-utilisateur");
	await page.keyboard.press("Escape");
}
await page.goto(`${BASE_URL}/mon-compte`, { waitUntil: "domcontentloaded" });
await waitLoad(page, 2500);
await shot(page, OUT.accueil, "22-mon-compte");

// ============ ADMIN : Ma caisse (état réel ouverte/fermée) ============
await page.goto(`${BASE_URL}/finances/caissier/dashboard`, {
	waitUntil: "domcontentloaded",
});
await waitLoad(page);
await shot(page, OUT.finances, "20-ma-caisse");
const premiereCaisse = page
	.locator("button", { hasText: /Caisse/i })
	.first();
if (await premiereCaisse.isVisible().catch(() => false)) {
	await premiereCaisse.click();
	await page.waitForTimeout(2000);
	await shot(page, OUT.finances, "21-ma-caisse-dashboard");
}

// ============ RÉSIDENT : Mon compte ============
const pageR = await ctx.newPage();
await login(pageR, "resident");
await pageR.goto(`${BASE_URL}/residence/portail/compte`, {
	waitUntil: "domcontentloaded",
});
await waitLoad(pageR, 2500);
await shot(pageR, OUT.portail, "29-mon-compte");
await pageR.close();

// ============ CLIENT : Mon compte ============
const pageC = await ctx.newPage();
await login(pageC, "client");
await pageC.goto(`${BASE_URL}/espace-client/mon-compte`, {
	waitUntil: "domcontentloaded",
});
await waitLoad(pageC, 2500);
await shot(pageC, OUT.espace, "29-mon-compte");
await pageC.close();

await browser.close();
console.log("Terminé.");
