/**
 * Échéances de loyer — vue consolidée `GET /residence/suivi`.
 *
 * Les lignes de `/suivi` n'exposent AUCUN id d'échéance : l'encaissement se
 * fait depuis la fiche contrat (dont `echeances[]` porte `id_echeance`). Le
 * suivi sert à la consultation + filtrage.
 */
export interface EcheanceSuivi {
	numero_contrat: string;
	client: string;
	logement: string;
	batiment: string;
	mois: number;
	annee: number;
	loyer_applique: string;
	date_echeance: string;
	/** PAYE | IMPAYE | PARTIEL | … (enum ouvert : repli `?? statut`). */
	statut: string;
	date_paiement: string | null;
	montant_paye: string | null;
	ancien_montant: string | null;
	nouveau_montant: string | null;
	date_effet_revision: string | null;
}

/** Libellés français connus du statut d'échéance (enum ouvert → repli brut). */
export const ECHANCE_STATUT_LABELS: Record<string, string> = {
	PAYE: "Payé",
	IMPAYE: "Impayé",
	PARTIEL: "Partiel",
	A_VENIR: "À venir",
	EN_ATTENTE: "En attente",
};

/** Libellé d'un statut d'échéance, avec repli sur la valeur brute. */
export function echanceStatutLabel(statut: string): string {
	return ECHANCE_STATUT_LABELS[statut] ?? statut;
}

/** Filtres du suivi des échéances (URL + côté client). */
export interface EcheancesFiltres {
	statut: string;
	locataire: string;
	du: string;
	au: string;
}

/**
 * Filtre le suivi. `statut`/`du`/`au` sont aussi envoyés au serveur (params
 * réels du lister `/suivi`) : ré-appliqués ici sans effet — ce filtre garde la
 * recherche texte « locataire ». Fonction pure, sans dépendance React.
 */
export function filtrerEcheances(
	echeances: readonly EcheanceSuivi[],
	filtres: EcheancesFiltres,
): EcheanceSuivi[] {
	return echeances.filter((echeance) => {
		if (filtres.statut !== "tous" && echeance.statut !== filtres.statut) {
			return false;
		}
		if (
			filtres.locataire &&
			!echeance.client.toLowerCase().includes(filtres.locataire.toLowerCase())
		) {
			return false;
		}
		if (filtres.du && echeance.date_echeance < filtres.du) return false;
		if (filtres.au && echeance.date_echeance > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageEcheances {
	items: EcheanceSuivi[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/**
 * Pagination client (le lister `/suivi` ne documente aucune pagination serveur).
 * Page bornée à [1, totalPages].
 */
export function paginerEcheances(
	echeances: readonly EcheanceSuivi[],
	page: number,
	pageSize: number,
): PageEcheances {
	const total = echeances.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = echeances.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
