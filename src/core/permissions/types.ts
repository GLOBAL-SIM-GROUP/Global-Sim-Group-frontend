/**
 * Codes de permission réels du backend déployé, revalidés au smoke test
 * (2026-08-17 : `GET /auth/me` sur `https://dev.sim.strife-cyber.org` avec le
 * compte `admin` → 48 codes ; 2026-08-20 : le compte `resident` renvoie
 * `RESIDENT.VOIR` → 13 modules). La spec OpenAPI ne les contient pas ; cette
 * union est écrite à la main.
 *
 * ⚠️ Écart avec `prompt-adapted.md` §9 : le spec décrit 13 modules et 3 verbes
 * « sans DELETE », mais le backend réel renvoie **pas de `MARKET`** et
 * **4 verbes** dont `SUPPRIMER`. La réponse réelle de `/api/v1/me` fait foi : si le
 * seeding du backend évolue, mettre à jour cette union **et**
 * `permissions.test.ts`.
 *
 * `DEPENSE` (2026-09-07) : les mutations dépenses/catégories-dépenses ont été
 * détachées du verbe `FINANCES.*` partagé avec les paiements — un caissier
 * garde `FINANCES.CREER` (paiements) mais perd `DEPENSE.CREER`. Seuls
 * ADMINISTRATEUR/DIRIGEANT ont les nouveaux codes. La lecture reste sur
 * `FINANCES.VOIR` (`DEPENSE.VOIR` est accordé en parallèle à qui avait déjà
 * `FINANCES.VOIR`, donc pas de régression de lecture à gérer côté front).
 *
 * `ENCAISSER` (2026-09-13) : 5e verbe, vérifié en direct sur `FINANCES.*`
 * (caissiers) et `RESIDENCE.*` (séjours courts — le caissier résidence a
 * `RESIDENCE.ENCAISSER` sans `RESIDENCE.CREER` : il encaisse mais ne crée pas
 * de séjour, contrairement au réceptionniste qui a `CREER` sans `ENCAISSER`).
 * D'autres verbes propres à RESIDENCE existent côté backend
 * (`SUPERVISER`/`VALIDER`, vus sur Responsable résidence) mais ne sont pas
 * modélisés ici faute d'usage frontend actuel — ajouter au besoin.
 *
 * `GERER_TARIFS` (2026-09-16) : 6e verbe, propre à PRESSING (tarif au kilo).
 * Vérifié en direct : PRESSING a en réalité 9 verbes réels côté backend
 * (VOIR/CREER/MODIFIER/SUPPRIMER/ANNULER/TRAITER/MARQUER_PRET/RETIRER/
 * SUPERVISER/GERER_TARIFS — Responsable pressing les a tous ; Agent
 * d'accueil pressing n'a que CREER+VOIR ; Opérateur lavage TRAITER+VOIR ;
 * Caissier pressing RETIRER+VOIR ; Contrôleur qualité VALIDER+VOIR). Seul
 * `GERER_TARIFS` est modélisé ici (requis pour cette feature) — le frontend
 * actuel continue de gater les actions de statut/retrait avec les verbes
 * génériques `MODIFIER`/`CREER` plutôt que `TRAITER`/`MARQUER_PRET`/
 * `RETIRER` réels, un écart pré-existant non corrigé ici (hors périmètre de
 * cette tâche) — voir `features/pressing/permissions.ts`.
 */
export const MODULES = [
	"RESIDENCE",
	"PRESSING",
	"RESTAURANT",
	"SALLE_FETE",
	"FACTURATION",
	"FINANCES",
	"RH",
	"RESIDENT",
	"CLIENT",
	"MARCHANDISE",
	"ADMIN",
	"AUDIT",
	"CORE",
	"SIGNALEMENT",
	"DEPENSE",
] as const;

export type ModuleCode = (typeof MODULES)[number];

export const PERMISSION_VERBS = [
	"VOIR",
	"CREER",
	"MODIFIER",
	"SUPPRIMER",
	"ENCAISSER",
	"GERER_TARIFS",
] as const;

export type PermissionVerb = (typeof PERMISSION_VERBS)[number];

/** Ex. `"RESIDENCE.VOIR"`, `"FINANCES.MODIFIER"`, `"CLIENT.SUPPRIMER"`. */
export type PermissionCode = `${ModuleCode}.${PermissionVerb}`;
