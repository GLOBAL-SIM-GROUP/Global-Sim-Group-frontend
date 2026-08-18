/**
 * Moyen de paiement (module Finances, partagé par les encaissements Résidence).
 * Clé primaire wire `id_moyen_paiement` → `id`.
 */
export interface MoyenPaiement {
	id: string;
	libelle: string;
	actif: boolean;
}
