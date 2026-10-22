/**
 * Employé (module M9, M9.1). Hand-typed revalidé sur le backend réel
 * (GET /rh/employes). Clé primaire wire `id_employe` → `id`.
 */
export type TypeContrat = "CDI" | "CDD" | "APPRENTI" | "AUTRE";
export type EmployeStatut = "ACTIF" | "INACTIF" | "SUSPENDU";

/** Fonctions acceptées par `CreerEmployeDto`/`MajEmployeDto` (enum backend). */
export type FonctionEmploye =
	| "RESPONSABLE"
	| "SERVEUR"
	| "CAISSIER"
	| "CUISINIER"
	| "RESPONSABLE_CUISINE"
	| "RECEPTIONNISTE"
	| "OPERATEUR_LAVAGE"
	| "OPERATEUR_SECHAGE"
	| "OPERATEUR_REPASSAGE"
	| "CONTROLEUR_QUALITE"
	| "AGENT_LIVRAISON"
	| "AGENT_ENTRETIEN"
	| "TECHNICIEN"
	| "VENDEUR"
	| "MAGASINIER"
	| "RESPONSABLE_APPROVISIONNEMENT"
	| "AUTRE";

export const FONCTIONS_EMPLOYE: readonly FonctionEmploye[] = [
	"RESPONSABLE",
	"CAISSIER",
	"RECEPTIONNISTE",
	"VENDEUR",
	"MAGASINIER",
	"RESPONSABLE_APPROVISIONNEMENT",
	"SERVEUR",
	"CUISINIER",
	"RESPONSABLE_CUISINE",
	"OPERATEUR_LAVAGE",
	"OPERATEUR_SECHAGE",
	"OPERATEUR_REPASSAGE",
	"CONTROLEUR_QUALITE",
	"AGENT_LIVRAISON",
	"AGENT_ENTRETIEN",
	"TECHNICIEN",
	"AUTRE",
];

/** Libellés français des fonctions (codes enum backend). */
export const FONCTION_LABELS: Record<FonctionEmploye, string> = {
	RESPONSABLE: "Responsable",
	SERVEUR: "Serveur / Serveuse",
	CAISSIER: "Caissier / Caissière",
	CUISINIER: "Cuisinier / Cuisinière",
	RESPONSABLE_CUISINE: "Responsable cuisine",
	RECEPTIONNISTE: "Réceptionniste",
	OPERATEUR_LAVAGE: "Opérateur lavage",
	OPERATEUR_SECHAGE: "Opérateur séchage",
	OPERATEUR_REPASSAGE: "Opérateur repassage",
	CONTROLEUR_QUALITE: "Contrôleur qualité",
	AGENT_LIVRAISON: "Agent livraison",
	AGENT_ENTRETIEN: "Agent entretien",
	TECHNICIEN: "Technicien",
	VENDEUR: "Vendeur / Vendeuse",
	MAGASINIER: "Magasinier",
	RESPONSABLE_APPROVISIONNEMENT: "Responsable approvisionnement",
	AUTRE: "Autre",
};

/** Libellé FR d'une fonction wire — valeur brute si code inconnu. */
export function libelleFonction(fonction: string): string {
	return FONCTION_LABELS[fonction as FonctionEmploye] ?? fonction;
}

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

/** Variante `<Badge>` par statut d'employé. */
export const EMPLOYE_STATUT_VARIANT = {
	ACTIF: "success",
	INACTIF: "neutral",
	SUSPENDU: "danger",
} as const satisfies Record<EmployeStatut, "success" | "neutral" | "danger">;

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
