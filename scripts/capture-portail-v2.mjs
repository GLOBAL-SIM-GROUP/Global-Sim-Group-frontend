import { chromium } from "playwright";
const OUT = "B:/Ecole/UCAC ICAM/PROJETS IMPORTANTS/Résidence SIM/Code/Documentation/sim-docs/guides-utilisation/portail-resident/screenshots/portail";
const BASE = "http://localhost:3400";

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
await p.goto(`${BASE}/login`);
await p.locator('input[name="login"]').fill("resident");
await p.locator('input[name="motDePasse"]').fill("motdepasse");
await p.getByRole("button", { name: "Se connecter" }).click();
await p.waitForURL(u => !u.pathname.includes("/login"), { timeout: 30000 });
await p.waitForTimeout(1800);

// 15 : catalogue restaurant (carte des plats)
await p.goto(`${BASE}/residence/portail/restaurant`);
await p.waitForSelector('button[aria-label^="Ajouter"]', { timeout: 20000 }).catch(()=>{});
await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/15-restaurant.png`, fullPage: true });
console.log("15 catalogue");

// 16 : modale quantité
await p.locator('button[aria-label^="Ajouter"][aria-label$="au panier"]').first().click();
await p.getByRole("dialog").waitFor({ timeout: 8000 }).catch(()=>{});
await p.waitForTimeout(600);
await p.screenshot({ path: `${OUT}/16-restaurant-commander.png`, fullPage: false });
const dlg = p.getByRole("dialog");
await dlg.locator("input").fill("2");
await dlg.getByRole("button", { name: /Ajouter/i }).last().click();
await p.waitForTimeout(800);

// 17 : panier
await p.goto(`${BASE}/residence/portail/panier`);
await p.waitForTimeout(1800);
await p.screenshot({ path: `${OUT}/17-panier.png`, fullPage: true });
console.log("17 panier");

// boutique catalogue
await p.goto(`${BASE}/residence/portail/boutique`);
await p.waitForSelector('button[aria-label^="Ajouter"]', { timeout: 20000 }).catch(()=>{});
await p.waitForTimeout(800);
await p.screenshot({ path: `${OUT}/21-boutique.png`, fullPage: true });
console.log("21 boutique");

// demandes (suivi)
await p.goto(`${BASE}/residence/portail/demandes`);
await p.waitForTimeout(2000);
await p.screenshot({ path: `${OUT}/22-demandes.png`, fullPage: true });
console.log("22 demandes");
await browser.close();
console.log("DONE");
