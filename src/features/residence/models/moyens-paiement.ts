/**
 * Moyen de paiement (module Finances, partagé par les encaissements Résidence).
 * Clé primaire wire `id_moyen_paiement` → `id`.
 */
export interface MoyenPaiement {
	id: string;
	libelle: string;
	actif: boolean;
}

/** Moyens de paiement proposables pour une nouvelle opération (inactifs exclus). */
export function moyensActifs(
	moyens: readonly MoyenPaiement[],
): MoyenPaiement[] {
	return moyens.filter((moyen) => moyen.actif);
}
