/**
 * Commandes de pressing (module Portail Résident, M5.x).
 * Client peut déclarer un dépôt et suivre l'état d'avancement de ses habits.
 *
 * Champs vérifiés en direct sur le backend (GET /pressing/portail/commandes,
 * 2026-09-06) : ni `montant_paye` ni `nombre_articles`/`articles`/`notes`
 * n'existent — la liste et le détail renvoient exactement la même forme. Le
 * suivi de paiement se fait via `acompte` (versé au dépôt) et
 * `reste_a_payer`, pas via un montant payé cumulé.
 *
 * Demandes de dépôt (portail) : la commande naît `EN_ATTENTE` — le personnel
 * tarifie au comptoir, donc `montant_total`/`acompte`/`reste_a_payer` sont
 * `null` tant que le dépôt n'est pas validé. `motif_annulation` porte la
 * raison du refus éventuel.
 */

import {
	formatDateISO,
	formatMontantFCFA,
} from "#/features/residence/models/format";

export type PressingStatut =
	| "EN_ATTENTE"
	| "DEPOSE"
	| "EN_TRAITEMENT"
	| "PRET"
	| "RETIRE"
	| "ANNULEE";

export interface PressingCommande {
	id: string;
	numero_commande: string;
	/** `null` tant que la demande est `EN_ATTENTE` (pas encore déposée). */
	date_depot: string | null;
	date_depot_souhaitee?: string | null;
	date_retrait_prevue: string | null;
	date_retrait_reelle: string | null;
	/** `null` tant que le dépôt n'est pas validé/tarifé par le personnel. */
	montant_total: string | null;
	acompte: string | null;
	reste_a_payer: string | null;
	statut: PressingStatut;
	notes?: string | null;
	motif_annulation?: string | null;
}

/**
 * Reçu d'une commande de pressing (GET `.../portail/commandes/{id}/recu`,
 * JSON rendu par le frontend — pas un PDF). Les montants et tarifs sont
 * `null` tant que le dépôt n'a pas été tarifé par le personnel.
 */
export interface RecuPressing {
	numero_commande: string;
	/** `null` sur un reçu `EN_ATTENTE` (lignes déclaratives, pas encore déposé). */
	date_depot: string | null;
	statut: string;
	lignes: {
		type_vetement: string;
		quantite: string;
		prestation: string;
		tarif?: string | null;
		total?: string | null;
	}[];
	montant_total: string | null;
	acompte: string | null;
	reste_a_payer: string | null;
}

/** Vrai si la commande est intégralement soldée (`reste_a_payer` ≤ 0). */
export function estSoldee(
	commande: Pick<PressingCommande, "reste_a_payer">,
): boolean {
	// `null` (dépôt pas encore tarifé) n'est pas « soldée ».
	return commande.reste_a_payer != null && Number(commande.reste_a_payer) <= 0;
}

/** Vrai tant que la demande peut encore être annulée par le résident. */
export function estAnnulable(
	commande: Pick<PressingCommande, "statut">,
): boolean {
	return commande.statut === "EN_ATTENTE";
}

/** Libellés français des statuts. */
export const PRESSING_STATUT_LABELS: Record<PressingStatut, string> = {
	EN_ATTENTE: "En attente de validation",
	DEPOSE: "Déposé",
	EN_TRAITEMENT: "En traitement",
	PRET: "Prêt",
	RETIRE: "Retiré",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut — même palette que les autres statuts du portail. */
export const PRESSING_STATUT_BADGE: Record<PressingStatut, string> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	DEPOSE: "bg-[#95A5A6] text-white",
	EN_TRAITEMENT: "bg-[#E67E22] text-white",
	PRET: "bg-[#2980B9] text-white",
	RETIRE: "bg-[#27AE60] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

/** Progression des étapes. */
export const PROGRESSION_ETAPES: PressingStatut[] = [
	"EN_ATTENTE",
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

/**
 * Libellé de la date de dépôt : `date_depot` est `null` tant que la demande
 * est `EN_ATTENTE` — on affiche alors la date souhaitée, sinon « pas encore
 * déposée » (jamais « Déposé le — »).
 */
export function libelleDateDepot(commande: {
	date_depot: string | null;
	date_depot_souhaitee?: string | null;
}): string {
	if (commande.date_depot)
		return `Déposé le ${formatDateISO(commande.date_depot.slice(0, 10))}`;
	if (commande.date_depot_souhaitee)
		return `Dépôt souhaité le ${formatDateISO(commande.date_depot_souhaitee.slice(0, 10))}`;
	return "Pas encore déposée";
}

/**
 * Montant d'une commande : « à chiffrer au comptoir » tant que le dépôt
 * `EN_ATTENTE` n'a pas été tarifé par le personnel (jamais « 0 FCFA »).
 */
export function libelleMontantPressing(
	montant: string | null | undefined,
): string {
	return montant != null
		? formatMontantFCFA(montant)
		: "à chiffrer au comptoir";
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
