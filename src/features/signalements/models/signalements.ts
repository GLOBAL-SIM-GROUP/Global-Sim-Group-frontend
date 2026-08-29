import type { Signalement } from "#/core/api/signalements";

export type SignalementStatut = Signalement["statut"];

/** Libellés français du statut — seule source de vérité (liste + fiche). */
export const SIGNALEMENT_STATUT_LABELS: Record<SignalementStatut, string> = {
	OUVERT: "Ouvert",
	EN_COURS: "En cours",
	RESOLU: "Résolu",
	REJETE: "Rejeté",
};

/** Classes de badge (fond/texte) par statut — mêmes teintes que les cycles de
 * vie analogues ailleurs dans l'app (ex. commande pressing : déposé/bleu →
 * en traitement/orange → prêt/vert ; annulé/rejeté en rouge). */
export const SIGNALEMENT_STATUT_BADGE: Record<SignalementStatut, string> = {
	OUVERT: "bg-[#2980B9] text-white",
	EN_COURS: "bg-[#E67E22] text-white",
	RESOLU: "bg-[#27AE60] text-white",
	REJETE: "bg-[#E74C3C] text-white",
};

/** Recherche texte libre côté client (titre, description, déclarant). */
export function rechercherSignalements(
	signalements: readonly Signalement[],
	terme: string,
): Signalement[] {
	const termeNormalise = terme.trim().toLowerCase();
	if (!termeNormalise) return [...signalements];
	return signalements.filter((signalement) => {
		if (signalement.titre.toLowerCase().includes(termeNormalise)) return true;
		if (signalement.description.toLowerCase().includes(termeNormalise)) {
			return true;
		}
		return nomDeclarant(signalement).toLowerCase().includes(termeNormalise);
	});
}

/** Filtre par statut côté client (`"tous"` = pas de filtre). */
export function filtrerSignalements(
	signalements: readonly Signalement[],
	statut: string,
): Signalement[] {
	if (statut === "tous" || !statut) return [...signalements];
	return signalements.filter((signalement) => signalement.statut === statut);
}

/** Page d'une liste de signalements paginée côté client. */
export interface PageSignalements {
	items: Signalement[];
	total: number;
	page: number;
	totalPages: number;
	/** Index (1-based) du premier élément affiché. */
	start: number;
	/** Index (1-based) du dernier élément affiché. */
	end: number;
}

/** Pagination côté client — même pattern que `paginerFactures`/`paginerClients`. */
export function paginerSignalements(
	signalements: readonly Signalement[],
	page: number,
	pageSize: number,
): PageSignalements {
	const total = signalements.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = signalements.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}

/** Nom d'affichage du déclarant (prénom + nom, repli sur le login). */
export function nomDeclarant(signalement: Signalement): string {
	const nom =
		`${signalement.declarant_prenom} ${signalement.declarant_nom}`.trim();
	return nom || signalement.declarant_login;
}
