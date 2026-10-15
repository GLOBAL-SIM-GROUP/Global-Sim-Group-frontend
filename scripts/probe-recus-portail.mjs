/**
 * Sonde les endpoints de documents (reçu/facture/pdf/ticket) réellement
 * accessibles aux comptes `resident` et `client` sur le backend de dev.
 * Usage : node scripts/probe-recus-portail.mjs
 */
const BASE = "https://dev.sim.strife-cyber.org/api/v1";

async function login(login) {
	const res = await fetch(`${BASE}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ login, mot_de_passe: "motdepasse" }),
	});
	if (!res.ok) throw new Error(`login ${login}: ${res.status}`);
	return (await res.json()).accessToken;
}

async function get(token, path) {
	const res = await fetch(`${BASE}${path}`, {
		headers: { Authorization: `Bearer ${token}` },
	});
	const ct = res.headers.get("content-type") ?? "";
	let body = "";
	if (ct.includes("application/json")) {
		try {
			body = await res.json();
		} catch {
			body = null;
		}
	} else {
		const buf = Buffer.from(await res.arrayBuffer());
		body = `[${ct.split(";")[0] || "binaire"}, ${buf.length} o]`;
	}
	return { status: res.status, ct: ct.split(";")[0], body };
}

/** Extrait un id d'une entité du portail (clés id_* variables). */
function idOf(entity) {
	if (!entity || typeof entity !== "object") return null;
	return (
		Object.entries(entity).find(([k, v]) => k.startsWith("id_") && v) ??
		[]
	)[1];
}

/** Normalise une réponse liste ({ x: [...] } ou [...]). */
function listOf(body) {
	if (Array.isArray(body)) return body;
	if (body && typeof body === "object") {
		for (const v of Object.values(body)) {
			if (Array.isArray(v)) return v;
		}
	}
	return [];
}

const SERVICES = [
	// [clé, endpoint liste, endpoints candidats par id]
	["echeances", "/residence/portail/echeances", ["recu", "recu/pdf"]],
	["paiements", "/residence/portail/paiements", ["recu", "recu/pdf", "ticket"]],
	[
		"pressing",
		"/pressing/portail/commandes",
		["recu", "recu/pdf", "facture", "pdf", "ticket"],
	],
	[
		"restaurant",
		"/restaurant/portail/commandes",
		["recu", "recu/pdf", "facture", "pdf", "ticket"],
	],
	[
		"boutique",
		"/market/portail/ventes",
		["recu", "recu/pdf", "facture", "pdf", "ticket"],
	],
	[
		"salle-fete",
		"/salle-fete/portail/reservations",
		["recu", "recu/pdf", "facture", "pdf", "ticket"],
	],
	[
		"abonnements",
		"/abonnement/portail/souscriptions",
		["recu", "recu/pdf", "facture", "facture/pdf", "pdf", "ticket"],
	],
	[
		"sejours",
		"/residence/portail/sejours",
		["recu", "recu/pdf", "facture", "facture/pdf", "pdf"],
	],
];

for (const compte of ["resident", "client"]) {
	console.log(`\n══════════ ${compte.toUpperCase()} ══════════`);
	const token = await login(compte);

	// /auth/me → id_client réel + permissions
	const me = await get(token, "/auth/me");
	const perms = Array.isArray(me.body?.permissions)
		? me.body.permissions.length
		: "?";
	console.log(
		`me: ${me.status} role=${me.body?.role ?? "?"} perms=${perms}`,
	);

	for (const [nom, liste, candidats] of SERVICES) {
		const res = await get(token, liste);
		if (res.status !== 200) {
			console.log(`\n${nom}: liste ${liste} → ${res.status}`);
			continue;
		}
		const items = listOf(res.body);
		console.log(`\n${nom}: ${items.length} entité(s)`);
		// Sonde la 1re entité + la 1re « payée » si présente
		const payee = items.find((it) =>
			["PAYEE", "REALISEE", "RETIRE", "TERMINE", "PAYE"].includes(it?.statut),
		);
		const cibles = [...new Set([items[0], payee].filter(Boolean))];
		for (const entite of cibles.slice(0, 2)) {
			const id = idOf(entite);
			if (!id) continue;
			const base = `${liste}/${id}`;
			for (const suffix of candidats) {
				const r = await get(token, `${base}/${suffix}`);
				const marqueur =
					r.status === 200 ? (r.ct.includes("pdf") ? "📄 PDF" : "✅") : "  ";
				console.log(
					`  ${marqueur} ${suffix.padEnd(12)} → ${r.status} (${r.ct || "—"})` +
						(entite === payee ? " [payé]" : ""),
				);
			}
		}
	}

	// /facturation/factures/{id}/pdf avec un id_facture connu (souscription)
	const sous = await get(token, "/abonnement/portail/souscriptions");
	const s = listOf(sous.body).find((x) => x?.id_facture);
	if (s) {
		const r = await get(token, `/facturation/factures/${s.id_facture}/pdf`);
		console.log(
			`\nfacturation/factures/${s.id_facture}/pdf (facture souscription ${s.facture_numero ?? "?"}) → ${r.status} ${r.ct}`,
		);
		const r2 = await get(
			token,
			`/facturation/factures/${s.id_facture}/ticket?largeur=80`,
		);
		console.log(`facturation/.../ticket → ${r2.status} ${r2.ct}`);
	}
}
