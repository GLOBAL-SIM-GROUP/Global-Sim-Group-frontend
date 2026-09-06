/**
 * Commandes de pressing (module Portail Résident, M5.x).
 * Client peut suivre l'état d'avancement de ses habits.
 *
 * Champs vérifiés en direct sur le backend (GET /pressing/portail/commandes,
 * 2026-09-06) : ni `montant_paye` ni `nombre_articles`/`articles`/`notes`
 * n'existent — la liste et le détail renvoient exactement la même forme. Le
 * suivi de paiement se fait via `acompte` (versé au dépôt) et
 * `reste_a_payer`, pas via un montant payé cumulé.
 */

export type PressingStatut =
	| "DEPOSE"
	| "EN_TRAITEMENT"
	| "PRET"
	| "RETIRE"
	| "ANNULEE";

export interface PressingCommande {
	id: string;
	numero_commande: string;
	date_depot: string;
	date_retrait_prevue: string | null;
	date_retrait_reelle: string | null;
	montant_total: string;
	acompte: string;
	reste_a_payer: string;
	statut: PressingStatut;
}

/** Vrai si la commande est intégralement soldée (`reste_a_payer` ≤ 0). */
export function estSoldee(
	commande: Pick<PressingCommande, "reste_a_payer">,
): boolean {
	return Number(commande.reste_a_payer) <= 0;
}

/** Libellés français des statuts. */
export const PRESSING_STATUT_LABELS: Record<PressingStatut, string> = {
	DEPOSE: "Déposé",
	EN_TRAITEMENT: "En traitement",
	PRET: "Prêt",
	RETIRE: "Retiré",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut — même palette que les autres statuts du portail. */
export const PRESSING_STATUT_BADGE: Record<PressingStatut, string> = {
	DEPOSE: "bg-[#95A5A6] text-white",
	EN_TRAITEMENT: "bg-[#E67E22] text-white",
	PRET: "bg-[#2980B9] text-white",
	RETIRE: "bg-[#27AE60] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

/** Progression des étapes. */
export const PROGRESSION_ETAPES: PressingStatut[] = [
	"DEPOSE",
	"EN_TRAITEMENT",
	"PRET",
	"RETIRE",
];

/** Calcule la progression en pourcentage. */
export function calculerProgression(statut: PressingStatut): number {
	const index = PROGRESSION_ETAPES.indexOf(statut);
	if (statut === "ANNULEE") return 0;
	if (index === -1) return 0;
	return Math.round(((index + 1) / PROGRESSION_ETAPES.length) * 100);
}

/** Retourne l'étape actuelle et suivante. */
export function getEtapeActuelle(statut: PressingStatut): {
	actuelle: number;
	total: number;
} {
	const index = PROGRESSION_ETAPES.indexOf(statut);
	return {
		actuelle: index === -1 ? 0 : index + 1,
		total: PROGRESSION_ETAPES.length,
	};
}
