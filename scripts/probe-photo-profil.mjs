/**
 * Photo employé : un admin peut-il lire la photo de profil d'un AUTRE
 * compte ? Test : admin se met une photo via /mon-compte/photo, retrouve la
 * clé `profil-photo/…` dans /admin/utilisateurs, puis tente
 * GET /uploads?key=<clé> (endpoint générique, CLIENT.VOIR).
 */
const BASE = "https://dev.sim.strife-cyber.org/api/v1";
const sleep = (ms) => new Promise((s) => setTimeout(s, ms));

async function login(login) {
	for (let i = 0; i < 6; i++) {
		const res = await fetch(`${BASE}/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ login, mot_de_passe: "motdepasse" }),
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

const PNG = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
	"base64",
);

const admin = await login("admin");
if (!admin) process.exit(1);
const H = { Authorization: `Bearer ${admin}` };

// 1. Photo sur le compte admin
const fd = new FormData();
fd.append("file", new Blob([PNG], { type: "image/png" }), "a.png");
const up = await fetch(`${BASE}/auth/mon-compte/photo`, {
	method: "PUT",
	headers: H,
	body: fd,
});
const profil = await up.json();
console.log(`PUT /photo → ${up.status} clé=${profil.photo}`);
const cle = profil.photo;
if (!cle) process.exit(1);

// 2. La clé est-elle exposée dans /admin/utilisateurs ?
const us = await (
	await fetch(`${BASE}/admin/utilisateurs?limite=200`, { headers: H })
).json();
const moi = (us.utilisateurs ?? us.items ?? us).find((u) => u.login === "admin");
console.log(`admin/utilisateurs → photo="${moi?.photo}"`);

// 3. GET /uploads?key=profil-photo/… — la validation accepte-t-elle cette catégorie ?
const dl = await fetch(
	`${BASE}/uploads?key=${encodeURIComponent(cle)}`,
	{ headers: H },
);
console.log(
	`GET /uploads?key=${cle} → ${dl.status} ${dl.headers.get("content-type")}`,
);

// 4. Nettoyage : retire la photo de test du compte admin
const del = await fetch(`${BASE}/auth/mon-compte/photo`, {
	method: "DELETE",
	headers: H,
});
console.log(`DELETE /photo → ${del.status}`);
