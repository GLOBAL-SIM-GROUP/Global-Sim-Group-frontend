// Recaptures 2026-09-27 : badges statut passés en variantes sémantiques
// (pilules pleines → pastels ; EN_ATTENTE violet → orange « warning »),
// filtre « Type de cible » retiré des signalements, matrice de permissions
// enrichie (RAPPORTS, TRAITER/MARQUER_PRET/RETIRER/SUPERVISER).
// Usage : BASE_URL=... node scripts/capture-badges-2026-09.mjs
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const LOGIN = process.env.LOGIN ?? "admin";
const PASSWORD = process.env.PASSWORD ?? "motdepasse";
const ROOT = "docs/guides-utilisation";
const DIR = {
	pressing: `${ROOT}/pressing/screenshots/pressing`,
	restaurant: `${ROOT}/restaurant/screenshots/restaurant`,
	sallefete: `${ROOT}/salle-fete/screenshots/salle-fete`,
	marchandise: `${ROOT}/marchandise/screenshots/marchandise`,
	signalements: `${ROOT}/signalements/screenshots/signalements`,
	finances: `${ROOT}/finances/screenshots/finances`,
	admin: `${ROOT}/administration/screenshots/administration`,
	abonnements: `${ROOT}/abonnements/screenshots/abonnements`,
	clients: `${ROOT}/clients/screenshots/clients`,
	facturation: `${ROOT}/facturation/screenshots/facturation`,
	residence: `${ROOT}/screenshots/residence`,
};
for (const d of Object.values(DIR)) mkdirSync(d, { recursive: true });

const browser = await chromium.launch();
const context = await browser.newContext({
	viewport: { width: 1440, height: 900 },
	deviceScaleFactor: 1.5,
});
const page = await context.newPage();

async function ensureAuth() {
	if (page.url().includes("/login")) {
		await page.locator("#login").fill(LOGIN);
		await page.locator('input[type="password"]').fill(PASSWORD);
		await page.getByRole("button", { name: /connecter|connexion/i }).click();
		await page
			.waitForURL((u) => !u.pathname.includes("login"), { timeout: 15000 })
			.catch(() => {});
	}
}
async function goto(path) {
	await page.goto(`${BASE}${path}`, { waitUntil: "domcontentloaded" });
	await ensureAuth();
	await page.waitForLoadState("networkidle", { timeout: 20000 }).catch(() => {});
	await page.waitForTimeout(1200);
}
const shot = (dir, name) =>
	page.screenshot({ path: `${dir}/${name}.png` }).then(() => console.log(name));

await goto("/login");

// ---------- ADMINISTRATION : matrice (nouveaux verbes + module RAPPORTS) ----------
await goto("/admin/roles/3/permissions");
await page.getByText(/Permissions/).first().waitFor({ timeout: 10000 }).catch(() => {});
await page.waitForTimeout(1500);
await shot(DIR.admin, "08-permissions");

// ---------- SIGNALEMENTS : 3 filtres (type retiré) + badges ----------
await goto("/signalements");
await shot(DIR.signalements, "01-liste");
await page.getByRole("combobox", { name: "Statut" }).click();
await page.waitForTimeout(500);
await shot(DIR.signalements, "02-filtre-statut");
await page.keyboard.press("Escape");
await page.waitForTimeout(300);
await page.getByRole("combobox", { name: "Module concerné" }).click();
await page.waitForTimeout(500);
await shot(DIR.signalements, "03-filtre-module");
await page.keyboard.press("Escape");
await page.waitForTimeout(300);

// ---------- PRESSING : liste badges + demande EN_ATTENTE ----------
await goto("/pressing/commandes");
await shot(DIR.pressing, "01-commandes-liste");
// Filtre statut EN_ATTENTE pour isoler la demande portail (badge orange).
await page.getByRole("combobox", { name: /statut/i }).first().click();
await page.waitForTimeout(500);
await page.getByRole("option", { name: /En attente de validation/i }).click();
await page.waitForTimeout(1200);
await shot(DIR.pressing, "19-demandes-attente");
// Fiche d'une commande existante (badge tarification + boutons de statut)
await goto("/pressing/commandes?statut=tous");
const lignePret = page.getByRole("row", { name: /GSG-CPR-2026-013/ });
if (await lignePret.count()) {
	await lignePret.getByRole("link").first().click();
	await page.waitForLoadState("networkidle").catch(() => {});
	await page.waitForTimeout(1200);
	await shot(DIR.pressing, "26-fiche-sans-acompte");
}
// Fiche EN_TRAITEMENT (bouton Passer en Prêt, gated MARQUER_PRET)
await goto("/pressing/commandes?statut=tous");
const ligneTrait = page.getByRole("row", { name: /GSG-CPR-2026-020/ });
if (await ligneTrait.count()) {
	await ligneTrait.getByRole("link").first().click();
	await page.waitForLoadState("networkidle").catch(() => {});
	await page.waitForTimeout(1200);
	await shot(DIR.pressing, "10-fiche-en-traitement");
}

// ---------- RESTAURANT : demande EN_ATTENTE (badge orange) ----------
await goto("/restaurant/commandes");
await page.getByRole("combobox", { name: /statut/i }).first().click();
await page.waitForTimeout(500);
await page.getByRole("option", { name: /^En attente$/i }).click();
await page.waitForTimeout(1200);
await shot(DIR.restaurant, "20-demande-attente");

// ---------- SALLE DE FÊTE : demande EN_ATTENTE (badge orange) ----------
await goto("/salle-fete/reservations");
await page.getByRole("combobox", { name: /statut/i }).first().click();
await page.waitForTimeout(500);
await page.getByRole("option", { name: /En attente de validation/i }).click();
await page.waitForTimeout(1200);
await shot(DIR.sallefete, "15-reservation-attente");

// ---------- MARCHANDISE : vente EN_ATTENTE (badge orange) ----------
await goto("/marchandise/ventes");
await page.getByRole("combobox", { name: /statut/i }).first().click();
await page.waitForTimeout(500);
await page.getByRole("option", { name: /En attente de validation/i }).click();
await page.waitForTimeout(1200);
await shot(DIR.marchandise, "23-vente-attente");

// ---------- FINANCES : impayés (badge Séjour orange, plus violet) ----------
await goto("/finances/impayes");
await shot(DIR.finances, "12-impayes");

// ---------- ABONNEMENTS : badges pastel (liste + fiche) ----------
await goto("/abonnements/offres");
await shot(DIR.abonnements, "01-offres-liste");
await goto("/abonnements/souscriptions");
await shot(DIR.abonnements, "05-souscriptions-liste");
const premiereSouscription = page.locator("tbody tr a").first();
if (await premiereSouscription.count()) {
	await premiereSouscription.click();
	await page.waitForLoadState("networkidle").catch(() => {});
	await page.waitForTimeout(1200);
	await shot(DIR.abonnements, "08-souscription-fiche");
}

// ---------- CLIENTS : badges type (Locataire/Passage) ----------
await goto("/client/clients");
await shot(DIR.clients, "01-liste-clients");

// ---------- FACTURATION : badges statut ----------
await goto("/facturation/factures");
await shot(DIR.facturation, "01-factures-liste");

// ---------- RÉSIDENCE : badges contrats/séjours/échéances ----------
await goto("/residence/contrats");
await shot(DIR.residence, "12-contrats-liste");
await goto("/residence/sejours");
await shot(DIR.residence, "22-sejours-liste");
await goto("/residence/echeances");
await shot(DIR.residence, "34-echeances-liste");

await browser.close();
console.log("OK");
