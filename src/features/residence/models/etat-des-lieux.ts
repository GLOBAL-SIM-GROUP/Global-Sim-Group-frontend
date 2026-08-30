/**
 * Photos d'état des lieux d'un contrat (residence.etat_des_lieux_photo).
 * Types hand-typed revalidés sur le contrat backend fourni (aucun schéma
 * généré). Clé primaire wire `id_photo` remappée en `id` par la couche API.
 */
export type EtatDesLieuxType = "ENTREE" | "SORTIE";

export interface EtatDesLieuxPhoto {
	id: string;
	id_contrat: string;
	type: EtatDesLieuxType;
	piece: string | null;
	cle_objet: string;
	commentaire: string | null;
	id_utilisateur: string | null;
	date_ajout: string;
}

/** Libellés français du type (filtre + badge). */
export const ETAT_DES_LIEUX_TYPE_LABELS: Record<EtatDesLieuxType, string> = {
	ENTREE: "Entrée",
	SORTIE: "Sortie",
};

/** Classes de badge par type — vert entrée, orange sortie. */
export const ETAT_DES_LIEUX_TYPE_BADGE: Record<EtatDesLieuxType, string> = {
	ENTREE: "bg-[#27AE60] text-white",
	SORTIE: "bg-[#E67E22] text-white",
};
