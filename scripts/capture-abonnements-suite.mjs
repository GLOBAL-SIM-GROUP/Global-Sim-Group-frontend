// Suite des captures Abonnements : confirmation de vente (fix enveloppe),
// fiche + dialogues, résiliation réelle, aperçu couverture en mode kilo.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const OUT = "docs/guides-utilisation/abonnements/screenshots/abonnements";
const OUT_PRESSING = "docs/guides-utilisation/pressing/screenshots/pressing";
const LOGIN = process.env.LOGIN ?? "admin";
const PASSWORD = process.env.PASSWORD ?? "motdepasse";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1400, height: 950 } });
const errors = [];
page.on("pageerror", (e) => errors.push(`PAGEERROR: ${e.message}`));

async function ensureAuth() {
  for (let i = 0; i < 3 && page.url().includes("/login"); i++) {
    await page.waitForTimeout(1200);
    await page.getByRole("textbox", { name: /identifiant|login/i }).fill(LOGIN);
    await page.getByRole("textbox", { name: "Mot de passe" }).fill(PASSWORD);
    await page.getByRole("button", { name: /connecter|connexion/i }).click();
    await page.waitForURL((u) => !u.pathname.includes("login"), { timeout: 15000 }).catch(() => {});
  }
}
const shot = (n, dir = OUT) => page.screenshot({ path: `${dir}/${n}.png` });

await page.goto(`${BASE}/login`);
await ensureAuth();

// --- Vente n°3 (sans paiement → « encaissable plus tard ») ---
await page.goto(`${BASE}/abonnements/souscriptions`);
await page.waitForTimeout(2000);
await page.getByRole("button", { name: "Vendre une souscription" }).click();
const vdlg = page.getByRole("dialog");
await vdlg.waitFor({ timeout: 8000 });
await vdlg.locator("#client-recherche").fill("Guide");
await page.waitForTimeout(1500);
await vdlg.locator("ul button", { hasText: "Guide" }).first().click();
await vdlg.locator("#vente-offre").click();
await page.waitForTimeout(400);
await page.getByRole("option", { name: /Guide pressing 10 kg/i }).click();
await vdlg.locator("#vente-note").fill("Souscription de démonstration du guide.");
await page.waitForTimeout(300);
await shot("06-vendre-form");
await vdlg.getByRole("button", { name: "Vendre la souscription" }).click();
await page.waitForTimeout(2500);
await shot("07-vendre-confirm");
const voirBtn = vdlg.getByRole("button", { name: "Voir la souscription" });
if (await voirBtn.count()) {
  await voirBtn.click();
  await page.waitForURL(/souscriptions\/\d+/, { timeout: 8000 });
  await page.waitForTimeout(1500);
  await shot("08-souscription-fiche");
}

// --- Fiche de la souscription n°1 (reste à payer 9 000) : dialogues ---
await page.goto(`${BASE}/abonnements/souscriptions/1`);
await page.waitForTimeout(2000);
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
  } else console.log("ABSENT:", name);
}

// --- Résiliation réelle de la souscription n°2 (doublon de test) ---
await page.goto(`${BASE}/abonnements/souscriptions/2`);
await page.waitForTimeout(2000);
const resilBtn = page.getByRole("button", { name: /^Résilier/ });
if (await resilBtn.count()) {
  await resilBtn.click();
  const rdlg = page.getByRole("dialog");
  await rdlg.waitFor({ timeout: 8000 });
  await rdlg.locator("#resiliation-motif").fill("Doublon de test — annulé.");
  await page.waitForTimeout(300);
  await shot("11-resilier-dialog"); // remplace : avec motif rempli
  await rdlg.getByRole("button", { name: /Résilier|Confirmer/i }).last().click();
  await page.waitForTimeout(2000);
  await shot("11b-souscription-resiliee");
}

// --- Liste avec états variés + retour ---
await page.goto(`${BASE}/abonnements/souscriptions`);
await page.waitForTimeout(2000);
await shot("05-souscriptions-liste");

// --- Aperçu de couverture en mode kilo (quota KG ↔ prestation couverte) ---
await page.goto(`${BASE}/pressing/commandes`);
await page.waitForTimeout(2000);
await page.getByRole("button", { name: /Nouvelle commande/i }).first().click();
const pdlg = page.getByRole("dialog");
await pdlg.waitFor({ timeout: 8000 });
await pdlg.locator("#client-recherche").fill("Guide");
await page.waitForTimeout(1500);
await pdlg.locator("ul button", { hasText: "Guide" }).first().click();
await page.waitForTimeout(400);
await pdlg.locator('input[name="mode-tarification"]').nth(1).check(); // au kilo
await page.waitForTimeout(600);
await pdlg.getByRole("combobox", { name: "Type de vêtement" }).click();
await page.getByRole("option", { name: /Linge/i }).first().click().catch(async () => {
  await page.getByRole("option").first().click();
});
await pdlg.getByRole("combobox", { name: "Prestation" }).click();
await page.getByRole("option", { name: /Lavage express/i }).click().catch(async () => {
  await page.getByRole("option").first().click();
});
await pdlg.locator('input[aria-label="Poids (kg)"]').fill("3");
await page.waitForTimeout(2800); // aperçu debounced
await shot("12-apercu-couverture");
await page.screenshot({ path: `${OUT_PRESSING}/27-apercu-abonnement.png` });
await page.keyboard.press("Escape");

console.log("ERRORS:", JSON.stringify(errors));
console.log("DONE");
