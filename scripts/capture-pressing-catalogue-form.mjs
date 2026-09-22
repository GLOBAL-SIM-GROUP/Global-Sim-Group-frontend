// Captures : champs Type/Prestation adossés au catalogue (select + bascule
// + ajout inline GERER_CATALOGUE) et fiche sans ligne Acompte.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? "docs/guides-utilisation/pressing/screenshots/pressing";
const LOGIN = process.env.LOGIN ?? "admin";
const PASSWORD = process.env.PASSWORD ?? "motdepasse";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
page.on("pageerror", (e) => console.log("PAGEERROR:", e.message));

async function ensureAuth() {
  if (page.url().includes("/login")) {
    await page.getByRole("textbox", { name: /identifiant|login/i }).fill(LOGIN);
    await page.getByRole("textbox", { name: "Mot de passe" }).fill(PASSWORD);
    await page.getByRole("button", { name: /connecter|connexion/i }).click();
    await page.waitForURL((u) => !u.pathname.includes("login"), { timeout: 15000 });
  }
}

await page.goto(`${BASE}/login`);
await ensureAuth();

// --- Ouvrir la fenêtre de dépôt ---
await page.goto(`${BASE}/pressing/commandes`);
await page.waitForTimeout(2000);
await ensureAuth();
await page.getByRole("button", { name: /Nouvelle commande|Déposer/i }).first().click();
const dlg = page.getByRole("dialog");
await dlg.waitFor({ timeout: 8000 });
await page.waitForTimeout(1200);

// 22 — ligne article : selects catalogue + lien « Saisir manuellement »
await page.screenshot({ path: `${OUT}/22-article-catalogue.png` });

// Ouvrir le select « Type de vêtement » pour montrer les entrées du catalogue
await dlg.getByRole("combobox", { name: "Type de vêtement" }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/23-select-catalogue.png` });
await page.keyboard.press("Escape");
await page.waitForTimeout(400);

// 24 — bascule en saisie manuelle + proposition « Ajouter au catalogue »
await dlg.getByRole("button", { name: "Saisir manuellement" }).first().click();
await page.waitForTimeout(400);
await dlg.getByRole("textbox", { name: "Type de vêtement" }).fill("Couvre-lit");
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/24-ajout-catalogue-inline.png` });

// Cliquer « Ajouter « Couvre-lit » au catalogue » (donnée réelle : entrée utile)
const ajoutBtn = dlg.getByRole("button", { name: /Ajouter « .* » au catalogue/ });
if (await ajoutBtn.count()) {
  await ajoutBtn.click();
  await page.waitForTimeout(1500);
  // le champ repasse en select aligné sur le libellé canonique
  await page.screenshot({ path: `${OUT}/25-catalogue-ajoute.png` });
}
await page.keyboard.press("Escape");
await page.waitForTimeout(400);
await page.keyboard.press("Escape");

// 26 — fiche commande : bloc infos sans ligne « Acompte »
await page.goto(`${BASE}/pressing/commandes`);
await page.waitForTimeout(2000);
const ligne = page.getByRole("row", { name: /GSG-CPR/ }).first();
await ligne.click();
await page.waitForTimeout(2000);
await page.screenshot({ path: `${OUT}/26-fiche-sans-acompte.png` });

await browser.close();
console.log("DONE");
