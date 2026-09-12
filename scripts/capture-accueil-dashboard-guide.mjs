/**
 * Capture Playwright des pages Accueil et Tableau de bord global pour le
 * guide utilisateur `docs/guides-utilisation/accueil-dashboard/`.
 *
 * Utilise le backend réel (localhost:3000 par défaut) avec l'utilisateur
 * `admin`. Les captures sont fullPage, viewport 1440x900, et vont dans
 * `docs/guides-utilisation/accueil-dashboard/screenshots/accueil-dashboard/`.
 *
 * Variables d'environnement :
 *   BASE_URL  (défaut http://localhost:3000)
 *   LOGIN     (défaut admin)
 *   PASSWORD  (défaut motdepasse)
 *   OUT_DIR   (défaut docs/guides-utilisation/accueil-dashboard/screenshots/accueil-dashboard)
 *
 * Usage : node scripts/capture-accueil-dashboard-guide.mjs
 */
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const LOGIN = process.env.LOGIN || "admin";
const PASSWORD = process.env.PASSWORD || "motdepasse";
const OUT_DIR =
	process.env.OUT_DIR ||
	"docs/guides-utilisation/accueil-dashboard/screenshots/accueil-dashboard";

const errors = [];

async function capture(page, name) {
	const filePath = path.join(OUT_DIR, `${name}.png`);
	await page.screenshot({ path: filePath, fullPage: true });
	console.log(`📸 ${name}`);
}

async function waitForLoad(page) {
	await page
		.waitForLoadState("domcontentloaded", { timeout: 15000 })
		.catch(() => {});
	await page.waitForTimeout(1500);
}

/** Ouvre le menu utilisateur (sidebar) pour capturer l'état déployé. */
async function openUserMenu(page) {
	const trigger = page.locator('button[aria-label="Menu utilisateur"]').first();
	await trigger.click();
	await page.waitForTimeout(600);
}

/** Ouvre le panneau de notifications (cloche) pour capturer l'état déployé. */
async function openNotifications(page) {
	const bell = page
		.locator('button[aria-label*="otification"]')
		.first();
	await bell.click();
	await page.waitForTimeout(800);
}

/** Scroll vers un heading h2 puis capture. */
async function captureSection(page, headingText, captureName) {
	const heading = page.locator("h2", { hasText: headingText }).first();
	const count = await heading.count();
	if (count === 0) {
		console.log(`⚠️ Section "${headingText}" introuvable, capture sautée`);
		return;
	}
	await heading.scrollIntoViewIfNeeded();
	await page.waitForTimeout(600);
	await capture(page, captureName);
}

async function main() {
	await mkdir(OUT_DIR, { recursive: true });

	const browser = await chromium.launch({ headless: true });

	// --- Connexion + sauvegarde du storage state ------------------------
	const loginContext = await browser.newContext({
		viewport: { width: 1440, height: 900 },
	});
	const loginPage = await loginContext.newPage();
	await loginPage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitForLoad(loginPage);
	await capture(loginPage, "01-login");

	await loginPage.locator('input[name="login"]').fill(LOGIN);
	await loginPage.locator('input[name="motDePasse"]').fill(PASSWORD);
	await capture(loginPage, "02-login-rempli");

	await loginPage.getByRole("button", { name: "Se connecter" }).click();
	await loginPage.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(loginPage);

	// Sauvegarder l'état de session (cookies + localStorage) pour le
	// réutiliser dans les contextes mobiles sans se reconnecter.
	const storageState = await loginContext.storageState();

	// --- Page d'accueil (desktop) --------------------------------------
	loginPage.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console:home] ${msg.text()}`);
	});
	loginPage.on("pageerror", (err) =>
		errors.push(`[pageerror:home] ${err.message}`),
	);

	await capture(loginPage, "03-accueil");

	// Détail d'une tuile de module : survol pour montrer les sous-liens.
	const firstTile = loginPage.locator(".rounded-xl.border.bg-card").first();
	if (await firstTile.isVisible().catch(() => false)) {
		await firstTile.hover();
		await loginPage.waitForTimeout(500);
		await capture(loginPage, "04-accueil-tuile-survol");
	}

	// Menu utilisateur déployé (sidebar).
	await openUserMenu(loginPage);
	await capture(loginPage, "05-menu-utilisateur");
	await loginPage.keyboard.press("Escape");
	await loginPage.waitForTimeout(400);

	// Panneau de notifications (cloche).
	await openNotifications(loginPage);
	await capture(loginPage, "06-notifications");
	await loginPage.keyboard.press("Escape");
	await loginPage.waitForTimeout(400);

	// --- Tableau de bord global (desktop, même contexte que l'accueil) --
	// On réutilise loginPage (déjà authentifié) pour éviter les problèmes
	// de restauration de session entre contextes.
	const dpage = loginPage;

	await dpage.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
	await dpage.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => {});
	await waitForLoad(dpage);
	// Attendre que le filtre période soit interactif (Radix Select hydraté).
	await dpage
		.locator("#dashboard-global-filtre-periode")
		.waitFor({ state: "visible", timeout: 10000 })
		.catch(() => {});
	await dpage.waitForTimeout(1000);
	await capture(dpage, "09-dashboard-global");

	// Filtre période : ouvrir le sélecteur.
	const periodeTrigger = dpage.locator("#dashboard-global-filtre-periode");
	await periodeTrigger.click({ timeout: 10000 });
	await dpage.waitForTimeout(1500);
	await capture(dpage, "10-dashboard-filtre-periode-ouvert");

	// Choisir « Aujourd'hui » via le clavier (plus fiable que le clic d'item
	// Radix dans un portail).
	await dpage.keyboard.press("ArrowDown");
	await dpage.waitForTimeout(300);
	await dpage.keyboard.press("Enter");
	await waitForLoad(dpage);
	await capture(dpage, "11-dashboard-periode-aujourdhui");

	// Période personnalisée : rouvrir et descendre jusqu'à « Personnalisée ».
	await periodeTrigger.click({ timeout: 10000 });
	await dpage.waitForTimeout(1500);
	// « Personnalisée » est le dernier item (7e) — 6× ArrowDown.
	for (let i = 0; i < 6; i++) {
		await dpage.keyboard.press("ArrowDown");
		await dpage.waitForTimeout(150);
	}
	await dpage.keyboard.press("Enter");
	await dpage.waitForTimeout(800);
	await capture(dpage, "12-dashboard-periode-personnalisee");

	// Remplir les dates.
	const duInput = dpage.locator("#dashboard-global-date-debut");
	const auInput = dpage.locator("#dashboard-global-date-fin");
	if (await duInput.isVisible().catch(() => false)) {
		await duInput.fill("2026-01-01");
		await auInput.fill("2026-12-31");
		await dpage.waitForTimeout(500);
		await capture(dpage, "13-dashboard-periode-personnalisee-remplie");
	}

	// Revenir à « Ce mois » (4e item) pour les captures des sections.
	await periodeTrigger.click({ timeout: 10000 });
	await dpage.waitForTimeout(1500);
	for (let i = 0; i < 3; i++) {
		await dpage.keyboard.press("ArrowDown");
		await dpage.waitForTimeout(150);
	}
	await dpage.keyboard.press("Enter");
	await waitForLoad(dpage);

	// Captures des sections (scroll successif).
	await captureSection(dpage, "Résidence", "14-dashboard-section-residence");
	await captureSection(dpage, "Vue financière", "15-dashboard-vue-financiere");
	await captureSection(
		dpage,
		"Recettes par activité ce mois-ci",
		"16-dashboard-recettes-activite",
	);
	await captureSection(dpage, "Services", "17-dashboard-services");
	await captureSection(dpage, "Market & Inventaire", "18-dashboard-market");
	await captureSection(dpage, "Blanchisserie", "19-dashboard-pressing");
	await captureSection(
		dpage,
		"Ressources humaines",
		"20-dashboard-rh",
	);

	await loginContext.close();

	// --- Vue mobile (320px) — reconnexion dans un contexte mobile -----
	const mobileContext = await browser.newContext({
		viewport: { width: 320, height: 700 },
		deviceScaleFactor: 2,
	});
	const mpage = await mobileContext.newPage();
	mpage.on("console", (msg) => {
		if (msg.type() === "error") errors.push(`[console:mobile] ${msg.text()}`);
	});

	// Connexion mobile.
	await mpage.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await waitForLoad(mpage);
	await mpage.locator('input[name="login"]').fill(LOGIN);
	await mpage.locator('input[name="motDePasse"]').fill(PASSWORD);
	await mpage.getByRole("button", { name: "Se connecter" }).click();
	await mpage.waitForURL("**/home", { timeout: 20000 });
	await waitForLoad(mpage);
	await capture(mpage, "07-accueil-mobile");

	// Burger déployé sur mobile (sidebar via Toggle sidebar).
	const burger = mpage.locator('button[aria-label="Toggle sidebar"]').first();
	if (await burger.isVisible().catch(() => false)) {
		await burger.click();
		await mpage.waitForTimeout(800);
		await capture(mpage, "08-accueil-mobile-burger");
		await mpage.keyboard.press("Escape").catch(() => {});
		await mpage.waitForTimeout(400);
	}

	// Tableau de bord mobile.
	await mpage.goto(`${BASE_URL}/dashboard`, { waitUntil: "domcontentloaded" });
	await mpage.waitForURL("**/dashboard", { timeout: 15000 }).catch(() => {});
	await waitForLoad(mpage);
	await capture(mpage, "21-dashboard-mobile");

	await mobileContext.close();
	await browser.close();

	if (errors.length > 0) {
		console.log("\n--- Erreurs rencontrées ---");
		for (const e of errors) console.log(e);
		const errPath = path.join(OUT_DIR, "capture-errors.txt");
		await writeFile(errPath, errors.join("\n"), "utf8");
		console.log(`Erreurs écrites dans ${errPath}`);
	}
	console.log("✅ Captures Accueil & Tableau de bord terminées.");
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
