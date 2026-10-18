import { chromium } from "playwright";
const OUT_EC = "B:/Ecole/UCAC ICAM/PROJETS IMPORTANTS/Résidence SIM/Code/Documentation/sim-docs/guides-utilisation/espace-client/screenshots/espace-client";
const OUT_PR = "B:/Ecole/UCAC ICAM/PROJETS IMPORTANTS/Résidence SIM/Code/Documentation/sim-docs/guides-utilisation/portail-resident/screenshots/portail";
const BASE = "http://localhost:3400";

async function login(p, user) {
	await p.goto(`${BASE}/login`);
	await p.locator('input[name="login"]').fill(user);
	await p.locator('input[name="motDePasse"]').fill("motdepasse");
	await p.getByRole("button", { name: "Se connecter" }).click();
	await p.waitForURL(u => !u.pathname.includes("/login"), { timeout: 30000 });
	await p.waitForTimeout(1800);
}

const browser = await chromium.launch();

// ===== ESPACE CLIENT =====
{
	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const p = await ctx.newPage();
	await login(p, "client");

	// 04 : modale quantité restaurant (le bouton panier ouvre la modale)
	await p.goto(`${BASE}/espace-client/restaurant`);
	await p.waitForSelector('button[aria-label^="Ajouter"]', { timeout: 20000 }).catch(()=>{});
	await p.waitForTimeout(800);
	await p.locator('button[aria-label^="Ajouter"][aria-label$="au panier"]').first().click();
	await p.getByRole("dialog").waitFor({ timeout: 8000 }).catch(()=>{});
	await p.waitForTimeout(600);
	await p.screenshot({ path: `${OUT_EC}/04-restaurant-ajout-panier.png`, fullPage: false });
	console.log("04 quantite-dialog");

	// confirmer une quantité de 2 dans la modale
	const dlg = p.getByRole("dialog");
	await dlg.locator("input").fill("2");
	await dlg.getByRole("button", { name: /Ajouter|Confirmer|Valider/i }).last().click();
	await p.waitForTimeout(900);

	// 06 : modale quantité boutique
	await p.goto(`${BASE}/espace-client/boutique`);
	await p.waitForSelector('button[aria-label^="Ajouter"]', { timeout: 20000 }).catch(()=>{});
	await p.waitForTimeout(800);
	await p.locator('button[aria-label^="Ajouter"][aria-label$="au panier"]').first().click();
	await p.getByRole("dialog").waitFor({ timeout: 8000 }).catch(()=>{});
	await p.waitForTimeout(600);
	await p.screenshot({ path: `${OUT_EC}/06-boutique-ajout-panier.png`, fullPage: false });
	console.log("06 quantite-dialog boutique");
	const dlg2 = p.getByRole("dialog");
	await dlg2.locator("input").fill("1");
	await dlg2.getByRole("button", { name: /Ajouter|Confirmer|Valider/i }).last().click();
	await p.waitForTimeout(900);

	// 07 : panier avec bouton « Vider le panier »
	await p.goto(`${BASE}/espace-client/panier`);
	await p.waitForTimeout(1800);
	await p.screenshot({ path: `${OUT_EC}/07-panier.png`, fullPage: true });
	console.log("07 panier");

	// 26/27 : signalement avec vignette photo ? (on recapture le form — vignettes si photos)
	await p.goto(`${BASE}/espace-client/signalement`);
	await p.waitForSelector("#titre, #sujet", { timeout: 20000 }).catch(()=>{});
	await p.waitForTimeout(800);
	await p.screenshot({ path: `${OUT_EC}/26-signalement.png`, fullPage: true });
	console.log("26 signalement");
	await ctx.close();
}

// ===== PORTAIL RESIDENT =====
{
	const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
	const p = await ctx.newPage();
	await login(p, "resident");
	// 16 : modale commander restaurant → la carte a maintenant la modale quantité ?
	await p.goto(`${BASE}/residence/portail/restaurant`);
	await p.waitForSelector('button[aria-label^="Ajouter"], text=/Passer une commande|Commander/i', { timeout: 20000 }).catch(()=>{});
	await p.waitForTimeout(1200);
	await p.screenshot({ path: `${OUT_PR}/15-restaurant.png`, fullPage: true });
	console.log("15 restaurant portail");
	await ctx.close();
}
await browser.close();
console.log("DONE");
