/**
 * Sonde live — transitions de compte sur le cycle locataire (dev backend).
 *
 * A) client SANS compte → contrat EN_ATTENTE → ACTIF : où naît le compte ?
 * B) client AVEC compte CLIENT → contrat EN_ATTENTE → ACTIF : upgrade rôle ?
 * C) locataire → contrat RESILIE : que reste-t-il au compte ?
 */
const BASE = "https://dev.sim.strife-cyber.org/api/v1";
const MDP = "motdepasse";
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));
const suffix = String(Date.now()).slice(-8);

async function login(login) {
	for (let i = 0; i < 8; i++) {
		const res = await fetch(`${BASE}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login, mot_de_passe: MDP }),
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
		const { accessToken } = await res.json();
		// Token parfois rejeté juste après émission — vérifie avec /auth/me
		const me = await fetch(`${BASE}/auth/me`, {
			headers: { Authorization: `Bearer ${accessToken}` },
		});
		if (me.ok) return accessToken;
		console.log(`  token transitoire (${me.status}) — retry`);
		await sleep(8000);
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

async function etatCompte(loginName, tag) {
	const tok = await login(loginName);
	if (!tok) return;
	const me = await req(tok, "/auth/me");
	const p = me.body?.permissions ?? [];
	const resume = await req(tok, "/residence/portail/resume");
	console.log(
		`  ${tag}: role=${me.body?.role} RESIDENT.VOIR=${p.includes("RESIDENT.VOIR")} ` +
			`/resume→${resume.status}` +
			(resume.status === 200
				? ` contrat_en_cours=${resume.body?.contrat_en_cours?.id_contrat ?? "null"}`
				: ""),
	);
	await sleep(3000);
}

const admin = await login("admin");
if (!admin) {
	console.log("login admin impossible");
	process.exit(1);
}

// ---------- Ressources communes ----------
const lg = await req(admin, "/residence/logements?limite=100");
const dispos = (lg.body?.logements ?? lg.body?.items ?? lg.body ?? [])
	.filter((l) => l.statut === "DISPONIBLE")
	.map((l) => l.id_logement);
console.log(`logements dispo: ${dispos.length}`);

async function creerClient(tag) {
	const res = await req(admin, "/client/clients", {
		method: "POST",
		body: {
			nom: `Transition${tag}${suffix}`,
			prenoms: "Test",
			tel_principal: "+2250102030405",
			type_client: "PASSAGE",
		},
	});
	const id = res.body?.id_client ?? res.body?.id;
	console.log(
		`client ${tag} → ${res.status} id=${id} ${res.status >= 300 ? JSON.stringify(res.body).slice(0, 200) : ""}`,
	);
	return id;
}

async function creerContrat(idClient) {
	for (const idLogement of dispos) {
		const res = await req(admin, "/residence/contrats", {
			method: "POST",
			body: {
				id_client: String(idClient),
				id_logement: String(idLogement),
				date_debut: "2026-10-17",
				montant_loyer: "50000",
				type_location: "MENSUEL",
				duree_mois: 6,
				date_fin_prevue: "2027-04-17",
			},
		});
		if (res.status < 300) {
			return {
				id: res.body?.id_contrat,
				statut: res.body?.statut,
				compte: res.body?.compte_resident,
				idLogement,
			};
		}
		if (res.status !== 409) {
			console.log(`  contrat lg${idLogement} → ${res.status} ${JSON.stringify(res.body).slice(0, 160)}`);
		}
	}
	return null;
}

// =====================================================
// A) Client SANS compte → contrat
// =====================================================
console.log("\n=== A) client SANS compte → contrat ===");
const idA = await creerClient("A");
const cA = await creerContrat(idA);
console.log(
	`  contrat → id=${cA?.id} statut=${cA?.statut} compte_resident=${JSON.stringify(cA?.compte)}`,
);
if (cA?.id) {
	const act = await req(admin, `/residence/contrats/${cA.id}/activer`, {
		method: "POST",
	});
	console.log(`  activer → ${act.status} ${JSON.stringify(act.body).slice(0, 160)}`);
	const users = await req(admin, `/admin/utilisateurs?recherche=gsg-cl-`);
	const liA = (users.body ?? []).find(
		(u) => String(u.id_client) === String(idA),
	);
	console.log(
		`  compte lié client ${idA} → ${liA ? `${liA.login} role=${liA.id_role} photo=${liA.photo}` : "aucun"}`,
	);
	if (liA) {
		await etatCompte(liA.login, "après activer");
	}
}

// =====================================================
// B) Client AVEC compte CLIENT → contrat → activer
// =====================================================
console.log("\n=== B) client AVEC compte CLIENT → contrat → activer ===");
const idB = await creerClient("B");
const loginB = `devin.transb${suffix}`;
const roles = await req(admin, "/admin/roles");
const roleClient = (roles.body ?? []).find((r) => r.code === "CLIENT");
const roleResident = (roles.body ?? []).find((r) => r.code === "RESIDENT");
console.log(
	`  rôles: CLIENT=${roleClient?.id_role} RESIDENT=${roleResident?.id_role}`,
);
const mkU = await req(admin, "/admin/utilisateurs", {
	method: "POST",
	body: {
		login: loginB,
		mot_de_passe: MDP,
		id_role: String(roleClient.id_role),
		id_client: String(idB),
	},
});
console.log(
	`  compte ${loginB} → ${mkU.status} ${JSON.stringify(mkU.body).slice(0, 160)}`,
);
await etatCompte(loginB, "avant contrat");
const cB = await creerContrat(idB);
console.log(
	`  contrat → id=${cB?.id} statut=${cB?.statut} compte_resident=${JSON.stringify(cB?.compte)}`,
);
if (cB?.id) {
	const act = await req(admin, `/residence/contrats/${cB.id}/activer`, {
		method: "POST",
	});
	console.log(`  activer → ${act.status} ${JSON.stringify(act.body).slice(0, 160)}`);
	const uB = (await req(admin, `/admin/utilisateurs?recherche=${loginB}`)).body?.find(
		(u) => u.login === loginB,
	);
	console.log(`  compte après activer → role=${uB?.id_role} actif=${uB?.actif}`);
	await etatCompte(loginB, "après activer");

	// =====================================================
	// C) Résiliation — que reste-t-il au compte ?
	// =====================================================
	console.log("\n=== C) résiliation du contrat B ===");
	const resi = await req(admin, `/residence/contrats/${cB.id}/resilier`, {
		method: "POST",
	});
	console.log(`  resilier → ${resi.status} ${JSON.stringify(resi.body).slice(0, 200)}`);
	const uB2 = (
		await req(admin, `/admin/utilisateurs?recherche=${loginB}`)
	).body?.find((u) => u.login === loginB);
	console.log(`  compte après résiliation → role=${uB2?.id_role} actif=${uB2?.actif}`);
	await etatCompte(loginB, "après résiliation");
}

console.log(
	`\nfixtures: clients ${idA}/${idB}, contrats ${cA?.id}/${cB?.id}, compte ${loginB}`,
);
