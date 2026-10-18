/**
 * Test client→locataire — réutilise client 81 / devin.transition.96870565.
 * Essaie plusieurs logements DISPONIBLE jusqu'à création OK.
 */
const BASE = "https://dev.sim.strife-cyber.org/api/v1";
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const LOGIN_TEST = "devin.transition.96870565";

async function login(login, mdp = "motdepasse") {
	for (let i = 0; i < 6; i++) {
		const res = await fetch(`${BASE}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login, mot_de_passe: mdp }),
		});
		if (res.status === 429) {
			console.log("  (429 — attente 30s)");
			await sleep(30000);
			continue;
		}
		if (!res.ok) {
			console.log(`  login ${login} → ${res.status}`);
			return null;
		}
		return (await res.json()).accessToken;
	}
	return null;
}

async function req(token, path, opt = {}) {
	const res = await fetch(`${BASE}${path}`, {
		method: opt.method ?? "GET",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		...(opt.body ? { body: JSON.stringify(opt.body) } : {}),
	});
	let body = null;
	try {
		body = await res.json();
	} catch {}
	return { status: res.status, body };
}

const admin = await login("admin");
if (!admin) process.exit(1);

// Logements DISPONIBLE (liste live)
const lg = await req(admin, "/residence/logements?limite=100");
const ll = lg.body?.logements ?? lg.body?.items ?? lg.body ?? [];
const dispos = ll.filter((l) => l.statut === "DISPONIBLE").map((l) => l.id_logement);
console.log(`${dispos.length} logements disponibles: ${dispos.join(",")}`);

// Crée le contrat sur le 1er logement libre
let idContrat = null;
for (const idLogement of dispos) {
	const crea = await req(admin, "/residence/contrats", {
		method: "POST",
		body: {
			id_client: "81",
			id_logement: String(idLogement),
			date_debut: "2026-10-17",
			montant_loyer: "50000",
			type_location: "MENSUEL",
			duree_mois: 6,
			date_fin_prevue: "2027-04-17",
		},
	});
	if (crea.status < 300) {
		idContrat = crea.body?.id_contrat;
		console.log(
			`POST contrat logement ${idLogement} → ${crea.status} ` +
				`id=${idContrat} compte_resident=${JSON.stringify(crea.body?.compte_resident)}`,
		);
		break;
	}
	if (crea.status !== 409) {
		console.log(
			`POST contrat logement ${idLogement} → ${crea.status} ${JSON.stringify(crea.body).slice(0, 200)}`,
		);
	}
}
if (!idContrat) {
	console.log("aucun logement n'a accepté le contrat");
	process.exit(1);
}

// Re-login du compte test → rôle/permissions après création
await sleep(12000);
const tok = await login(LOGIN_TEST);
if (tok) {
	const me = await req(tok, "/auth/me");
	const p = me.body?.permissions ?? [];
	const resume = await req(tok, "/residence/portail/resume");
	console.log(
		`\nAPRÈS: role=${me.body?.role} RESIDENT.VOIR=${p.includes("RESIDENT.VOIR")} ` +
			`PORTAIL.VOIR=${p.includes("PORTAIL.VOIR")} /resume→${resume.status}` +
			(resume.status === 200
				? ` contrat=${resume.body?.contrat_en_cours?.id_contrat ?? "null"}`
				: ""),
	);
}

// Nettoyage : DELETE le contrat EN_ATTENTE
const del = await req(admin, `/residence/contrats/${idContrat}`, {
	method: "DELETE",
});
console.log(`nettoyage DELETE contrat ${idContrat} → ${del.status}`);
