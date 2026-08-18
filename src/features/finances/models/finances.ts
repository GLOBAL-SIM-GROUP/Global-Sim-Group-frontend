/**
 * Modèles du module Finances (M8). Types hand-typed revalidés sur le backend
 * réel (GET /finances/*). Clés primaires wire → `id`.
 */
export interface LigneTableauBord {
	periode: string;
	encaissements: string;
	decaissements: string;
	marge_nette: string;
	factures_emises: string;
	montant_factures: string;
}

export interface Paiement {
	id: string;
	date: string;
	montant: string;
	id_moyen: string | null;
	id_activite: string | null;
	type: string;
	motif: string | null;
	id_utilisateur: string | null;
	reference: string | null;
}

export interface Depense {
	id: string;
	date: string;
	montant: string;
	id_categorie_depense: string;
	id_activite: string | null;
	libelle: string;
	justificatif: string | null;
	id_utilisateur: string | null;
}

export interface CategorieDepense {
	id: string;
	libelle: string;
}

export interface MoyenPaiement {
	id: string;
	libelle: string;
	actif: boolean;
}

export interface Impaye {
	type: string;
	id_client: string | null;
	client: string;
	reference: string;
	montant_du: string;
	montant_paye: string;
	reste: string;
	date_echeance: string | null;
}

/** Filtres client des paiements (URL + côté client). */
export interface PaiementFiltres {
	du: string;
	au: string;
}

export function filtrerPaiements(
	paiements: readonly Paiement[],
	filtres: PaiementFiltres,
): Paiement[] {
	return paiements.filter((paiement) => {
		const jour = paiement.date.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		return true;
	});
}

/** Filtres client des dépenses. */
export interface DepenseFiltres {
	du: string;
	au: string;
}

export function filtrerDepenses(
	depenses: readonly Depense[],
	filtres: DepenseFiltres,
): Depense[] {
	return depenses.filter((depense) => {
		const jour = depense.date.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		return true;
	});
}

/** Page cible d'un impayé (fiche contrat, fiche facture, listes, ou aucun lien). */
export type CibleImpaye =
	| { kind: "contrat"; id: string }
	| { kind: "facture"; id: string }
	| { kind: "charges" }
	| { kind: "sejours" }
	| { kind: "aucune" };

/**
 * Résout la page correspondante d'un impayé : la référence `LOYER` est un
 * numéro de contrat, `FACTURE` un numéro de facture ; `CHARGE`/`SEJOUR`
 * renvoient vers leur liste. Les cartes sont numéro → id. Fonction pure.
 */
export function cibleImpaye(
	impaye: Impaye,
	contratParNumero: ReadonlyMap<string, string>,
	factureParNumero: ReadonlyMap<string, string>,
	permissions: { residence: boolean; facturation: boolean },
): CibleImpaye {
	if (impaye.type === "LOYER") {
		const id = contratParNumero.get(impaye.reference);
		return permissions.residence && id
			? { kind: "contrat", id }
			: { kind: "aucune" };
	}
	if (impaye.type === "FACTURE") {
		const id = factureParNumero.get(impaye.reference);
		return permissions.facturation && id
			? { kind: "facture", id }
			: { kind: "aucune" };
	}
	if (impaye.type === "CHARGE") {
		return permissions.residence ? { kind: "charges" } : { kind: "aucune" };
	}
	if (impaye.type === "SEJOUR") {
		return permissions.residence ? { kind: "sejours" } : { kind: "aucune" };
	}
	return { kind: "aucune" };
}

/** Filtres client des impayés. */
export interface ImpayeFiltres {
	type: string;
}

export function filtrerImpayes(
	impayes: readonly Impaye[],
	filtres: ImpayeFiltres,
): Impaye[] {
	return impayes.filter((impaye) => {
		if (filtres.type !== "tous" && impaye.type !== filtres.type) return false;
		return true;
	});
}

export interface PageItems<T> {
	items: T[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client générique ; page bornée à [1, totalPages]. */
export function paginer<T>(
	items: readonly T[],
	page: number,
	pageSize: number,
): PageItems<T> {
	const total = items.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const slice = items.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items: slice, total, page: pageCourante, totalPages, start, end };
}
