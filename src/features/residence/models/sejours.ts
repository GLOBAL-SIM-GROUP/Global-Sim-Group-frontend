/**
 * Séjour court (nuitée / sieste) — utilisé comme historique d'occupation d'un
 * logement (module M2.2). Types hand-typed revalidés sur le backend réel
 * (GET /residence/sejours). Clé primaire wire `id_sejour` → `id`.
 */
export type SejourType = "NUITEE" | "SIESTE";

export type SejourStatut = "EN_COURS" | "TERMINE" | "ANNULE";

export interface Sejour {
	id: string;
	type_prestation: SejourType;
	id_client: string | null;
	id_logement: string;
	date_heure_arrivee: string;
	date_heure_depart_prevue: string | null;
	date_heure_depart_reelle: string | null;
	duree: string | null;
	tarif: string;
	montant_total: string;
	montant_paye: string;
	reste_a_payer: string;
	id_moyen_paiement: string | null;
	statut: SejourStatut;
	numero_logement: string;
	client_nom: string | null;
	client_prenoms: string | null;
}

/** Libellés français des types de prestation. */
export const SEJOUR_TYPE_LABELS: Record<SejourType, string> = {
	NUITEE: "Nuitée",
	SIESTE: "Sieste",
};

/** Libellés français du statut de séjour. */
export const SEJOUR_STATUT_LABELS: Record<SejourStatut, string> = {
	EN_COURS: "En cours",
	TERMINE: "Terminé",
	ANNULE: "Annulé",
};
