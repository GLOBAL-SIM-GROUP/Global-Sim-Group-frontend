/**
 * Bulletins de salaire (module M9, M9.3) — wire `paie`. Hand-typed revalidé sur
 * le backend réel (GET /rh/paies et /rh/paies/{id}). Clés primaires wire
 * `id_paie`/api/v1/`id_element` → `id`.
 */
export type PaieStatut = "CALCULEE" | "VALIDEE" | "PAYEE" | "ANNULEE";
export type ElementPaieType =
	| "PRIME"
	| "AVANCE"
	| "RETENUE"
	| "HEURE_SUP"
	| "AUTRE";

export interface Paie {
	id: string;
	id_employe: string;
	periode: string;
	salaire_base: string;
	total_elements: string;
	total_retenues: string;
	montant_a_payer: string;
	statut: PaieStatut;
	id_paiement: string | null;
	employe_nom: string | null;
	employe_prenom: string | null;
}

/** Ligne d'élément de salaire (wire `id_element` → `id`, montant signé). */
export interface ElementPaie {
	id: string;
	id_paie: string;
	type: ElementPaieType | (string & {});
	libelle: string;
	montant: string;
}

/** Détail d'un bulletin : paie + éléments. */
export interface PaieDetail {
	paie: Paie;
	elements: ElementPaie[];
}

/** Libellés français du statut de bulletin. */
export const PAIE_STATUT_LABELS: Record<PaieStatut, string> = {
	CALCULEE: "Calculée",
	VALIDEE: "Validée",
	PAYEE: "Payée",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut de bulletin. */
export const PAIE_STATUT_BADGE: Record<PaieStatut, string> = {
	CALCULEE: "bg-[#2980B9] text-white",
	VALIDEE: "bg-[#E67E22] text-white",
	PAYEE: "bg-[#27AE60] text-white",
	ANNULEE: "bg-[#95A5A6] text-white",
};

/** Libellés français des types d'élément de salaire (ouvert : repli sur valeur). */
export const ELEMENT_PAIE_LABELS: Record<string, string> = {
	PRIME: "Prime",
	AVANCE: "Avance",
	RETENUE: "Retenue",
	HEURE_SUP: "Heures supplémentaires",
	AUTRE: "Autre",
};

/** Nom complet « PRENOM Nom » d'une paie (champs embarqués). */
export function nomCompletPaie(paie: Paie): string {
	return `${paie.employe_prenom ?? ""} ${paie.employe_nom ?? ""}`.trim() || "—";
}

/** Filtres de la liste des bulletins (côté client). */
export interface PaieFiltres {
	employe: string;
	periode: string;
	statut: string;
}

/** Filtre la liste : employé (id), période (texte), statut. Fonction pure. */
export function filtrerPaies(
	paies: readonly Paie[],
	filtres: PaieFiltres,
): Paie[] {
	return paies.filter((paie) => {
		if (filtres.employe !== "tous" && paie.id_employe !== filtres.employe) {
			return false;
		}
		if (filtres.periode && !paie.periode.includes(filtres.periode)) {
			return false;
		}
		if (filtres.statut !== "tous" && paie.statut !== filtres.statut) {
			return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PagePaies {
	items: Paie[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerPaies(
	paies: readonly Paie[],
	page: number,
	pageSize: number,
): PagePaies {
	const total = paies.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = paies.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
