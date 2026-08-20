/**
 * Codes de permission réels du backend déployé, revalidés au smoke test
 * (2026-08-17 : `GET /auth/me` sur `https://dev.sim.strife-cyber.org` avec le
 * compte `admin` → 48 codes ; 2026-08-20 : le compte `resident` renvoie
 * `RESIDENT.VOIR` → 13 modules). La spec OpenAPI ne les contient pas ; cette
 * union est écrite à la main.
 *
 * ⚠️ Écart avec `prompt-adapted.md` §9 : le spec décrit 13 modules et 3 verbes
 * « sans DELETE », mais le backend réel renvoie **pas de `MARKET`** et
 * **4 verbes** dont `SUPPRIMER`. La réponse réelle de `/me` fait foi : si le
 * seeding du backend évolue, mettre à jour cette union **et**
 * `permissions.test.ts`.
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
] as const;

export type ModuleCode = (typeof MODULES)[number];

export const PERMISSION_VERBS = [
	"VOIR",
	"CREER",
	"MODIFIER",
	"SUPPRIMER",
] as const;

export type PermissionVerb = (typeof PERMISSION_VERBS)[number];

/** Ex. `"RESIDENCE.VOIR"`, `"FINANCES.MODIFIER"`, `"CLIENT.SUPPRIMER"`. */
export type PermissionCode = `${ModuleCode}.${PermissionVerb}`;
