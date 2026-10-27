/**
 * Services accessibles au compte, déduits des permissions `/auth/me` —
 * affiché par les pages « Mon compte » (espace client et portail résident).
 *
 * Seule information de profil exposée à ces rôles : `GET /client/clients/{id}`
 * exige `CLIENT.VOIR`, permission staff — vérifié : 403 même sur son propre
 * dossier.
 */
const SERVICES_PAR_PERMISSION: [prefixe: string, label: string][] = [
	["RESTAURANT.", "Restaurant"],
	["MARCHANDISE.", "Super-Marché"],
	["PRESSING.", "Pressing"],
	["SALLE_FETE.", "Salle de fête"],
	["RESIDENCE.", "Séjours courts"],
	["ABONNEMENT.", "Abonnements"],
	["SIGNALEMENT.", "Signalements"],
];

/** Libellés des services que les permissions du compte débloquent. */
export function servicesDuCompte(permissions: readonly string[]): string[] {
	return SERVICES_PAR_PERMISSION.filter(([prefixe]) =>
		permissions.some((code) => code.startsWith(prefixe)),
	).map(([, label]) => label);
}
