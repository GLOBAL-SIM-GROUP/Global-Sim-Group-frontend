import fs from "node:fs";
import path from "node:path";

const ROOT = "docs/guides-utilisation";
const texFiles = [
	"residence.tex",
	"abonnements/abonnements.tex",
	"accueil-dashboard/accueil-tableau-de-bord.tex",
	"administration/administration.tex",
	"clients/clients.tex",
	"espace-client/espace-client.tex",
	"facturation/facturation.tex",
	"finances/finances.tex",
	"marchandise/marchandise.tex",
	"portail-resident/portail-resident.tex",
	"pressing/pressing.tex",
	"rapports/rapports.tex",
	"restaurant/restaurant.tex",
	"rh/rh.tex",
	"salle-fete/salle-fete.tex",
	"signalements/signalements.tex",
];

let missing = 0;
let total = 0;
for (const f of texFiles) {
	const full = path.join(ROOT, f);
	const dir = path.dirname(full);
	const content = fs.readFileSync(full, "utf8");
	const refs = new Set();
	for (const m of content.matchAll(/\\screenshot\{([^}]+)\}/g)) {
		if (m[1] !== "#1") refs.add(m[1]);
	}
	for (const m of content.matchAll(/\\includegraphics(?:\[[^\]]*\])?\{([^}]+)\}/g)) {
		if (m[1] !== "#1") refs.add(m[1]);
	}
	for (const ref of refs) {
		total++;
		const p1 = path.resolve(dir, ref);
		const p2 = path.resolve(ROOT, ref);
		const p3 = path.resolve(".", ref);
		if (!fs.existsSync(p1) && !fs.existsSync(p2) && !fs.existsSync(p3)) {
			missing++;
			console.log("MANQUANT", f, "->", ref);
		}
	}
}
console.log(`Total refs: ${total} | manquantes: ${missing}`);
