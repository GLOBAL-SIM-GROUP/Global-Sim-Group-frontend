/**
 * Employé (module M9, M9.1). Hand-typed revalidé sur le backend réel
 * (GET /rh/employes). Clé primaire wire `id_employe` → `id`.
 */
export type TypeContrat = "CDI" | "CDD" | "APPRENTI" | "AUTRE";
export type EmployeStatut = "ACTIF" | "INACTIF" | "SUSPENDU";

export interface Employe {
	id: string;
	nom: string;
	prenom: string;
	telephone: string | null;
	fonction: string;
	id_service: string | null;
	date_embauche: string;
	type_contrat: TypeContrat;
	salaire_base: string;
	statut: EmployeStatut;
	autres_infos: string | null;
	service_libelle: string | null;
}

/** Libellés français du type de contrat. */
export const TYPE_CONTRAT_LABELS: Record<TypeContrat, string> = {
	CDI: "CDI",
	CDD: "CDD",
	APPRENTI: "Apprenti",
	AUTRE: "Autre",
};

/** Libellés français du statut d'employé. */
export const EMPLOYE_STATUT_LABELS: Record<EmployeStatut, string> = {
	ACTIF: "Actif",
	INACTIF: "Inactif",
	SUSPENDU: "Suspendu",
};

/** Classes de badge (fond/texte) par statut d'employé. */
export const EMPLOYE_STATUT_BADGE: Record<EmployeStatut, string> = {
	ACTIF: "bg-[#27AE60] text-white",
	INACTIF: "bg-[#95A5A6] text-white",
	SUSPENDU: "bg-[#E74C3C] text-white",
};

/** Nom complet « PRENOM Nom » d'un employé. */
export function nomCompletEmploye(employe: Employe): string {
	return `${employe.prenom} ${employe.nom}`.trim();
}

/** Filtres de la liste des employés (côté client). */
export interface EmployeFiltres {
	service: string;
	statut: string;
}

/** Filtre la liste : service (id) et statut. Fonction pure. */
export function filtrerEmployes(
	employes: readonly Employe[],
	filtres: EmployeFiltres,
): Employe[] {
	return employes.filter((employe) => {
		if (filtres.service !== "tous" && employe.id_service !== filtres.service) {
			return false;
		}
		if (filtres.statut !== "tous" && employe.statut !== filtres.statut) {
			return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageEmployes {
	items: Employe[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerEmployes(
	employes: readonly Employe[],
	page: number,
	pageSize: number,
): PageEmployes {
	const total = employes.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = employes.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
