/**
 * Pointage (module M9, M9.2). Hand-typed revalidé sur le backend réel
 * (GET /rh/pointages). Clé primaire wire `id_pointage` → `id`.
 */
export type PointageStatut = "PRESENT" | "ABSENT" | "RETARD" | "CONGE";

export interface Pointage {
	id: string;
	id_employe: string;
	date: string;
	heure_arrivee: string | null;
	heure_depart: string | null;
	duree_travaillee: string | null;
	statut: PointageStatut | (string & {});
	heures_sup: string | null;
	note: string | null;
	employe_nom: string | null;
	employe_prenom: string | null;
}

/** Libellés français du statut de pointage (ouvert : repli sur la valeur). */
export const POINTAGE_STATUT_LABELS: Record<string, string> = {
	PRESENT: "Présent",
	ABSENT: "Absent",
	RETARD: "Retard",
	CONGE: "Congé",
};

/** Classes de badge (fond/texte) par statut de pointage. */
export const POINTAGE_STATUT_BADGE: Record<string, string> = {
	PRESENT: "bg-[#27AE60] text-white",
	ABSENT: "bg-[#E74C3C] text-white",
	RETARD: "bg-[#E67E22] text-white",
	CONGE: "bg-[#2980B9] text-white",
};

/** Nom complet « PRENOM Nom » d'un pointage (champs embarqués). */
export function nomCompletPointage(pointage: Pointage): string {
	return (
		`${pointage.employe_prenom ?? ""} ${pointage.employe_nom ?? ""}`.trim() ||
		"—"
	);
}

/** Filtres de la consultation des pointages (côté client). */
export interface PointageFiltres {
	employe: string;
	service: string;
	du: string;
	au: string;
}

/**
 * Filtre les pointages : employé (id), service (résolu via `employeParId`),
 * période (comparaison de dates `YYYY-MM-DD`). Fonction pure.
 */
export function filtrerPointages(
	pointages: readonly Pointage[],
	employeParId: ReadonlyMap<string, { id_service: string | null }>,
	filtres: PointageFiltres,
): Pointage[] {
	return pointages.filter((pointage) => {
		if (filtres.employe !== "tous" && pointage.id_employe !== filtres.employe) {
			return false;
		}
		if (filtres.service !== "tous") {
			const employe = employeParId.get(pointage.id_employe);
			if (employe?.id_service !== filtres.service) return false;
		}
		if (filtres.du && pointage.date < filtres.du) return false;
		if (filtres.au && pointage.date > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PagePointages {
	items: Pointage[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerPointages(
	pointages: readonly Pointage[],
	page: number,
	pageSize: number,
): PagePointages {
	const total = pointages.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = pointages.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
