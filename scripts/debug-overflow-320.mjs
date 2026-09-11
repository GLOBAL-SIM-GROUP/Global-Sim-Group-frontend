import { chromium } from "playwright";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const ROUTE = process.env.ROUTE || "/admin/roles";
const WIDTH = Number(process.env.WIDTH || 320);

const PERMISSIONS = [
	"RESIDENCE.VOIR",
	"RESIDENCE.CREER",
	"RESIDENCE.MODIFIER",
	"RESIDENCE.SUPPRIMER",
	"CLIENT.VOIR",
	"CLIENT.CREER",
	"CLIENT.MODIFIER",
	"FINANCES.VOIR",
	"FINANCES.CREER",
	"FINANCES.MODIFIER",
	"ADMIN.VOIR",
	"ADMIN.CREER",
	"ADMIN.MODIFIER",
	"ADMIN.SUPPRIMER",
	"SIGNALEMENT.VOIR",
	"SIGNALEMENT.CREER",
	"RH.VOIR",
	"FACTURATION.VOIR",
	"MARCHANDISE.VOIR",
	"RESTAURANT.VOIR",
	"PRESSING.VOIR",
	"SALLE_FETE.VOIR",
];

function mockAll(page) {
	return page.route("**/api/v1/**", (route) => {
		const url = new URL(route.request().url());
		const path = url.pathname;
		const method = route.request().method();
		const json = (body) =>
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify(body),
			});

		if (path === "/api/v1/auth/login" && method === "POST") {
			return json({
				accessToken: "fake-access",
				accessExpiresIn: 3600,
				refreshToken: "fake-refresh",
				refreshExpiresIn: 86400,
				utilisateur: { id: "1", login: "admin", role: "ADMIN" },
			});
		}
		if (path === "/api/v1/auth/me" && method === "GET") {
			return json({
				id: "1",
				login: "admin",
				role: "ADMIN",
				permissions: PERMISSIONS,
			});
		}
		if (path === "/api/v1/admin/roles" && method === "GET") {
			return json([
				{
					id_role: "1",
					code: "ADMIN",
					libelle: "Administrateur",
					description: "Accès complet à toutes les fonctionnalités",
				},
				{
					id_role: "2",
					code: "GESTIONNAIRE_RESIDENCE",
					libelle: "Gestionnaire résidence",
					description: "Gère les contrats et les logements",
				},
				{
					id_role: "3",
					code: "CAISSIER",
					libelle: "Caissier",
					description: null,
				},
			]);
		}
		if (path === "/api/v1/admin/utilisateurs" && method === "GET") {
			return json([
				{
					id_utilisateur: "1",
					login: "admin",
					role: "ADMIN",
					id_role: "1",
					actif: true,
				},
			]);
		}
		if (path.startsWith("/api/v1/admin/roles/") && path.endsWith("/permissions")) {
			return json([]);
		}
		if (path === "/api/v1/admin/permissions") return json([]);
		if (path === "/api/v1/admin/sauvegardes") return json({ total: 0, items: [] });
		if (path === "/api/v1/admin/sauvegardes/planification") {
			return json({
				frequence: "quotidienne",
				heure: "02:00",
				activee: true,
			});
		}
		if (path === "/api/v1/audit/journal") return json([]);
		// Repli générique : liste vide.
		return json([]);
	});
}

async function report(page, label) {
	const metrics = await page.evaluate(() => {
		const vw = window.innerWidth;
		const docW = document.documentElement.scrollWidth;
		const rows = [];
		for (const el of document.querySelectorAll("body *")) {
			const rect = el.getBoundingClientRect();
			if (rect.right > vw + 1 || rect.left < -1) {
				const cls =
					typeof el.className === "string" ? el.className.slice(0, 80) : "";
				rows.push({
					right: Math.round(rect.right),
					left: Math.round(rect.left),
					tag: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} [${Math.round(rect.left)},${Math.round(rect.top)} ${Math.round(rect.width)}x${Math.round(rect.height)}] ${cls}`,
				});
			}
		}
		rows.sort((a, b) => b.right - a.right);

		// Chaîne d'ancêtres du premier élément débordant (le plus large à droite).
		const widest = rows[0];
		const chain = [];
		if (widest) {
			let el = null;
			for (const cand of document.querySelectorAll("body *")) {
				const r = cand.getBoundingClientRect();
				if (Math.round(r.right) === widest.right && cand.children.length) {
					// préfère le conteneur
				}
			}
		}
		// Éléments qui dépassent à droite SANS ancêtre clippant (overflow-x
		// hidden/auto/scroll) — ce sont eux qui gonflent le scrollWidth.
		const unclipped = [];
		for (const el of document.querySelectorAll("body *")) {
			const r = el.getBoundingClientRect();
			if (r.right <= vw + 1) continue;
			let clipped = false;
			let node = el.parentElement;
			while (node) {
				const ovx = getComputedStyle(node).overflowX;
				if (ovx === "hidden" || ovx === "auto" || ovx === "scroll" || ovx === "clip") {
					clipped = true;
					break;
				}
				node = node.parentElement;
			}
			if (!clipped) {
				const cls =
					typeof el.className === "string" ? el.className.slice(0, 90) : "";
				unclipped.push(
					`${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] ${cls}`,
				);
			}
		}
		return {
			vw,
			docW,
			offenders: rows.slice(0, 12).map((r) => r.tag),
			unclipped,
		};
	});
	console.log(`\n=== ${label} (${ROUTE} @ ${WIDTH}px) ===`);
	console.log(`viewport=${metrics.vw} document.scrollWidth=${metrics.docW}`);
	if (metrics.docW <= metrics.vw) {
		console.log("Pas de debordement horizontal.");
	}
	for (const o of metrics.offenders) console.log(`  > ${o}`);
	console.log("--- elements non clippes qui debordent ---");
	for (const u of metrics.unclipped ?? []) console.log(`  ! ${u}`);
	await page.screenshot({ path: `debug-${WIDTH}-${label}.png`, fullPage: true });
}

async function main() {
	const browser = await chromium.launch({ headless: true });
	const context = await browser.newContext({
		viewport: { width: WIDTH, height: 700 },
	});
	const page = await context.newPage();
	await mockAll(page);

	await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(2000);
	await page.locator('input[name="login"]').fill("admin");
	await page.locator('input[name="motDePasse"]').fill("motdepasse");
	await page.getByRole("button", { name: "Se connecter" }).click();
	await page.waitForURL("**/home", { timeout: 15000 });
	await page.waitForTimeout(800);

	await page.goto(`${BASE_URL}${ROUTE}`, { waitUntil: "domcontentloaded" });
	await page.waitForTimeout(2500);
	await report(page, "apres-chargement");

	// Élimination : masque un candidat, re-mesure scrollWidth.
	const candidates = [
		["mobile-sidebar-wrapper", "div.fixed.inset-y-0.left-0"],
		["app-background", ".app-bg-wash"] ,
		["table-wrapper", "main div.overflow-x-auto"],
	];
	for (const [name, sel] of candidates) {
		const sw = await page.evaluate((selector) => {
			const el =
				document.querySelector(selector)?.closest("div.fixed") ??
				document.querySelector(selector);
			if (!el) return `absent: ${selector}`;
			const prev = el.style.display;
			el.style.display = "none";
			const w = document.documentElement.scrollWidth;
			el.style.display = prev;
			return w;
		}, sel);
		console.log(`sans ${name} -> scrollWidth=${sw}`);
	}

	// Éléments fixed/sticky : non clippés par les ancêtres DOM (le body a
	// overflow-x:hidden mais ne clippe pas le fixed, ancré au viewport).
	const fixeds = await page.evaluate(() => {
		const vw = window.innerWidth;
		const out = [];
		for (const el of document.querySelectorAll("body *")) {
			const pos = getComputedStyle(el).position;
			if (pos !== "fixed" && pos !== "sticky") continue;
			const r = el.getBoundingClientRect();
			if (r.right > vw + 1 || r.left < -1 || r.width > vw) {
				const cls =
					typeof el.className === "string" ? el.className.slice(0, 90) : "";
				out.push(
					`${pos} ${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] ${cls}`,
				);
			}
		}
		return out;
	});
	console.log("--- elements fixed/sticky debordant ---");
	for (const f of fixeds) console.log(`  # ${f}`);

	// Dans le sous-arbre du wrapper : quel noeud a le plus grand bord droit ?
	const inner = await page.evaluate(() => {
		const wrapper = document.querySelector("main div.overflow-x-auto");
		if (!wrapper) return ["pas de wrapper"];
		const out = [];
		for (const el of wrapper.querySelectorAll("*")) {
			const r = el.getBoundingClientRect();
			out.push({ right: r.right, txt: `${el.tagName.toLowerCase()} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] ${(typeof el.className === "string" ? el.className : "").slice(0, 70)}` });
		}
		out.sort((a, b) => b.right - a.right);
		return out.slice(0, 10).map((o) => o.txt);
	});
	console.log("--- descendants du wrapper (bord droit max) ---");
	for (const i of inner) console.log(`  * ${i}`);

	// Test clé : display:none sur la table seule (le wrapper reste).
	const sansTable = await page.evaluate(() => {
		const t = document.querySelector("main table");
		if (!t) return "absent";
		t.style.display = "none";
		const w = document.documentElement.scrollWidth;
		t.style.display = "";
		return w;
	});
	console.log(`sans table seule -> scrollWidth=${sansTable}`);

	// Et overflow-x:hidden force sur le wrapper ?
	const forceHidden = await page.evaluate(() => {
		const w2 = document.querySelector("main div.overflow-x-auto");
		if (!w2) return "absent";
		w2.style.overflowX = "hidden";
		const w = document.documentElement.scrollWidth;
		w2.style.overflowX = "";
		return w;
	});
	console.log(`wrapper overflow-x:hidden -> scrollWidth=${forceHidden}`);

	// Fuite réelle : éléments dont right>320 SANS ancêtre clippant AVANT main.
	const leaks = await page.evaluate(() => {
		const main = document.querySelector("main");
		const vw = window.innerWidth;
		const out = [];
		for (const el of main.querySelectorAll("*")) {
			const r = el.getBoundingClientRect();
			if (r.right <= vw + 1) continue;
			let clipped = false;
			let node = el.parentElement;
			while (node && node !== main) {
				const cs = getComputedStyle(node);
				if (cs.overflowX !== "visible") {
					clipped = true;
					break;
				}
				node = node.parentElement;
			}
			if (!clipped) {
				const cls =
					typeof el.className === "string" ? el.className.slice(0, 90) : "";
				const pos = getComputedStyle(el).position;
				out.push({
					right: r.right,
					txt: `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} pos=${pos} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] ${cls}`,
				});
			}
		}
		out.sort((a, b) => b.right - a.right);
		return out.slice(0, 15).map((o) => o.txt);
	});
	console.log("--- fuites dans main (non clippées avant main) ---");
	for (const l of leaks) console.log(`  >> ${l}`);

	// Enfants directs de main + tous les éléments positionnés (fixed/absolute/
	// sticky) dans main — un `fixed` n'est clippé par AUCUN ancêtre DOM.
	const positioned = await page.evaluate(() => {
		const main = document.querySelector("main");
		const out = ["-- enfants de main --"];
		for (const child of main.children) {
			const r = child.getBoundingClientRect();
			out.push(
				`child: ${child.tagName.toLowerCase()}${child.id ? `#${child.id}` : ""} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] ${(typeof child.className === "string" ? child.className : "").slice(0, 60)}`,
			);
		}
		out.push("-- positionnés dans main --");
		for (const el of main.querySelectorAll("*")) {
			const pos = getComputedStyle(el).position;
			if (pos === "static") continue;
			const r = el.getBoundingClientRect();
			const cls =
				typeof el.className === "string" ? el.className.slice(0, 70) : "";
			out.push(
				`${pos} ${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ""} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}x${Math.round(r.height)}] ${cls}`,
			);
		}
		return out;
	});
	for (const p of positioned) console.log(`  ${p}`);

	await browser.close();
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
