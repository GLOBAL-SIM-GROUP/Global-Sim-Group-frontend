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

/** Valeurs connues du statut de charge pour le filtre (enum ouvert). */
export const CHARGE_STATUT_FILTRES = ["tous", "IMPAYEE", "PARTIELLE", "PAYEE"];

/** Filtres de la liste des charges facturées (URL + côté client). */
export interface ChargeFiltres {
	statut: string;
	logement: string;
	periode: string;
	categorie: string;
}

/**
 * Filtre la liste. Statut (exact), textes « logement » (numéro) et
 * « catégorie », période (mois `YYYY-MM` exact). Fonction pure.
 */
export function filtrerCharges(
	charges: readonly Charge[],
	filtres: ChargeFiltres,
): Charge[] {
	return charges.filter((charge) => {
		if (filtres.statut !== "tous" && charge.statut !== filtres.statut) {
			return false;
		}
		if (
			filtres.logement &&
			!charge.numero_logement
				.toLowerCase()
				.includes(filtres.logement.toLowerCase())
		) {
			return false;
		}
		if (filtres.periode && charge.periode !== filtres.periode) return false;
		if (
			filtres.categorie &&
			!charge.categorie_libelle
				.toLowerCase()
				.includes(filtres.categorie.toLowerCase())
		) {
			return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageCharges {
	items: Charge[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/**
 * Pagination client (le lister ne documente aucune pagination serveur).
 * Page bornée à [1, totalPages].
 */
export function paginerCharges(
	charges: readonly Charge[],
	page: number,
	pageSize: number,
): PageCharges {
	const total = charges.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = charges.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
