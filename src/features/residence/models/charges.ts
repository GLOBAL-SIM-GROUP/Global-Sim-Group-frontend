/**
 * Charge d'un logement (module M2.2).
 *
 * Types hand-typed revalidés sur le backend réel (GET /residence/charges). La
 * clé primaire wire `id_charge` est remappée en `id` par la couche API.
 */
export interface Charge {
	id: string;
	id_logement: string;
	id_categorie_charge: string;
	/** Période facturée au format `YYYY-MM`. */
	periode: string;
	compteur_numero: string | null;
	lecture_debut: string | null;
	lecture_fin: string | null;
	consommation: string | null;
	montant: string;
	montant_paye: string;
	reste_a_payer: string;
	/** PAYEE | IMPAYEE | PARTIELLE | … (enum ouvert : repli `?? statut`). */
	statut: string;
	numero_logement: string;
	categorie_libelle: string;
}

/** Catégorie de charge (GET /residence/categories-charges). */
export interface CategorieCharge {
	id: string;
	libelle: string;
	actif: boolean;
}

/** Libellés français connus du statut de charge (enum ouvert → repli brut). */
export const CHARGE_STATUT_LABELS: Record<string, string> = {
	PAYEE: "Payée",
	IMPAYEE: "Impayée",
	PARTIELLE: "Partielle",
};

/** Libellé d'un statut de charge, avec repli sur la valeur brute. */
export function chargeStatutLabel(statut: string): string {
	return CHARGE_STATUT_LABELS[statut] ?? statut;
}
