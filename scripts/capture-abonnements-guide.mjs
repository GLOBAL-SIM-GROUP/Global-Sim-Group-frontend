// Captures guide Abonnements : offres, création d'offre, souscriptions,
// vente (paiement partiel), fiche + actions, aperçu de couverture pressing.
// Crée des données réelles en dev (offre « Guide-Pressing 10 kg » +
// souscription partiellement payée).
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = process.env.OUT_DIR ?? "docs/guides-utilisation/abonnements/screenshots/abonnements";
const OUT_PRESSING = "docs/guides-utilisation/pressing/screenshots/pressing";
const LOGIN = process.env.LOGIN ?? "admin";
const PASSWORD = process.env.PASSWORD ?? "motdepasse";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));
page.on("console", (m) => { if (m.type() === "error") errors.push(`CONSOLE: ${m.text()}`); });

async function ensureAuth() {
  for (let i = 0; i < 3 && page.url().includes("/login"); i++) {
    await page.waitForTimeout(1200); // hydratation SSR avant le clic
    await page.getByRole("textbox", { name: /identifiant|login/i }).fill(LOGIN);
    await page.getByRole("textbox", { name: "Mot de passe" }).fill(PASSWORD);
    await page.getByRole("button", { name: /connecter|connexion/i }).click();
    await page.waitForURL((u) => !u.pathname.includes("login"), { timeout: 15000 }).catch(() => {});
  }
  if (page.url().includes("/login")) throw new Error("Login impossible");
}
const shot = (n, dir = OUT) => page.screenshot({ path: `${dir}/${n}.png` });

await page.goto(`${BASE}/login`);
await ensureAuth();

// 01 — liste des offres
await page.goto(`${BASE}/abonnements/offres`);
await page.waitForTimeout(2000);
await ensureAuth();
await page.waitForTimeout(800);
await shot("01-offres-liste");

// 02 — formulaire nouvelle offre (rempli PRESSING)
await page.getByRole("button", { name: "Nouvelle offre" }).click();
const dlg = page.getByRole("dialog");
await dlg.waitFor({ timeout: 8000 });
await page.waitForTimeout(500);
await shot("02-offre-form-vide");
await dlg.locator("#code").fill("GUIDE-PR10");
await dlg.locator("#libelle").fill("Guide pressing 10 kg");
await dlg.locator("#activite").click();
await page.getByRole("option", { name: "Pressing" }).click();
await page.waitForTimeout(300);
await dlg.locator("#unite").click();
await page.getByRole("option", { name: /kg/i }).click();
await dlg.locator("#idPrestation").click();
await page.waitForTimeout(400);
await page.getByRole("option").first().click();
await dlg.locator("#quota").fill("10");
await dlg.locator("#prix").fill("14000");
await dlg.locator("#dureeJours").fill("30");
await page.waitForTimeout(300);
await shot("03-offre-form-remplie");
await dlg.getByRole("button", { name: /Enregistrer|Créer/i }).click();
await page.waitForTimeout(2000);
await shot("04-offre-creee");

// 05 — liste des souscriptions
await page.goto(`${BASE}/abonnements/souscriptions`);
await page.waitForTimeout(2000);
await shot("05-souscriptions-liste");

// 06 — vendre une souscription (paiement partiel pour illustrer reste à payer)
const vendreBtn = page.getByRole("button", { name: "Vendre une souscription" });
if (await vendreBtn.count()) {
  await vendreBtn.click();
  const vdlg = page.getByRole("dialog");
  await vdlg.waitFor({ timeout: 8000 });
  await vdlg.locator("#client-recherche").fill("Guide");
  await page.waitForTimeout(1500);
  await vdlg.locator("ul button", { hasText: "Guide" }).first().click();
  await page.waitForTimeout(400);
  await vdlg.locator("#vente-offre").click();
  await page.waitForTimeout(400);
  await page.getByRole("option", { name: /Guide pressing 10 kg/i }).click();
  await vdlg.locator("#vente-paiement").fill("5000");
  await page.waitForTimeout(400);
  await vdlg.locator("#vente-moyen").click();
  await page.getByRole("option").first().click();
  await page.waitForTimeout(300);
  await shot("06-vendre-form");
  await vdlg.getByRole("button", { name: "Vendre la souscription" }).click();
  await page.waitForTimeout(2000);
  await shot("07-vendre-confirm");
  const voirBtn = vdlg.getByRole("button", { name: "Voir la souscription" });
  if (await voirBtn.count()) await voirBtn.click();
  await page.waitForTimeout(2000);
  // 08 — fiche souscription (encaisser le reste visible + timeline)
  await shot("08-souscription-fiche");
  // 09 — dialogues d'action (ouvrir/capturer/fermer chacun)
  for (const [name, file] of [
    ["Encaisser", "09-encaisser-dialog"],
    ["Ajuster le quota", "10-ajuster-dialog"],
    ["Résilier", "11-resilier-dialog"],
  ]) {
    const btn = page.getByRole("button", { name: new RegExp(`^${name}`) });
    if (await btn.count()) {
      await btn.first().click();
      await page.waitForTimeout(700);
      await shot(file);
      await page.keyboard.press("Escape");
      await page.waitForTimeout(400);
    }
  }
}

// 12 — aperçu de couverture dans le formulaire pressing (client avec abonnement)
await page.goto(`${BASE}/pressing/commandes`);
await page.waitForTimeout(2000);
await page.getByRole("button", { name: /Nouvelle commande/i }).first().click();
const pdlg = page.getByRole("dialog");
await pdlg.waitFor({ timeout: 8000 });
await pdlg.locator("#client-recherche").fill("Guide");
await page.waitForTimeout(1500);
await pdlg.locator("ul button", { hasText: "Guide" }).first().click();
await page.waitForTimeout(500);
// article couvert par l'offre (même prestation que l'offre)
await pdlg.getByRole("combobox", { name: "Type de vêtement" }).click();
await page.getByRole("option").first().click();
await pdlg.getByRole("combobox", { name: "Prestation" }).click();
await page.getByRole("option").first().click();
await pdlg.getByRole("spinbutton", { name: "Quantité" }).or(pdlg.locator('input[aria-label="Quantité"]')).first().fill("2");
await pdlg.locator('input[aria-label="Tarif"]').fill("1500");
await page.waitForTimeout(2500); // aperçu debounced
await shot("12-apercu-couverture", OUT);
await page.screenshot({ path: `${OUT_PRESSING}/27-apercu-abonnement.png` });
await page.keyboard.press("Escape");

// 13 — mobile 320px : liste souscriptions
await page.setViewportSize({ width: 320, height: 800 });
await page.goto(`${BASE}/abonnements/souscriptions`);
await page.waitForTimeout(2000);
await shot("13-souscriptions-mobile");
await page.setViewportSize({ width: 1400, height: 950 });

console.log("ERRORS:", JSON.stringify(errors));
console.log("DONE");
