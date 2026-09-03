/**
 * Commandes de pressing (module Portail Résident, M5.x).
 * Client peut suivre l'état d'avancement de ses habits.
 */

export type PressingStatut =
	| "DEPOSE"
	| "EN_TRAITEMENT"
	| "PRET"
	| "RETIRE"
	| "ANNULEE";

export interface PressingCommande {
	id: string;
	id_client: string;
	numero_commande: string;
	date_depot: string;
	date_estimation?: string;
	date_retrait?: string;
	montant_total: string;
	montant_paye: string;
	statut: PressingStatut;
	description?: string;
	nombre_articles?: number;
}

export interface PressingCommandeDetail extends PressingCommande {
	articles?: PressingArticle[];
	notes?: string;
}

export interface PressingArticle {
	id: string;
	libelle: string;
	quantite: number;
	prix_unitaire: string;
	statut: PressingStatut;
}

/** Libellés français des statuts. */
export const PRESSING_STATUT_LABELS: Record<PressingStatut, string> = {
	DEPOSE: "Déposé",
	EN_TRAITEMENT: "En traitement",
	PRET: "Prêt",
	RETIRE: "Retiré",
	ANNULEE: "Annulée",
};

/** Couleurs pour les statuts. */
export const PRESSING_STATUT_COLORS: Record<PressingStatut, string> = {
	DEPOSE: "bg-gray-100 text-gray-800",
	EN_TRAITEMENT: "bg-blue-100 text-blue-800",
	PRET: "bg-green-100 text-green-800",
	RETIRE: "bg-gray-500 text-white",
	ANNULEE: "bg-red-100 text-red-800",
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
