/**
 * Utilisateur (module M11, 12.1/12.2). Hand-typed revalidé sur le backend réel
 * (GET /admin/utilisateurs). Clé primaire wire `id_utilisateur` → `id`.
 */
export interface Utilisateur {
	id: string;
	nom: string | null;
	prenom: string | null;
	login: string;
	id_role: string | null;
	id_activite_scope: string | null;
	actif: boolean;
	date_creation: string;
	dernier_connexion: string | null;
	id_client: string | null;
}

/** Nom complet « PRENOM Nom » d'un compte (employé associé ou libre). */
export function nomComplet(utilisateur: Utilisateur): string {
	return `${utilisateur.prenom ?? ""} ${utilisateur.nom ?? ""}`.trim() || "—";
}

/** Filtres de la liste des utilisateurs (côté client). */
export interface UtilisateurFiltres {
	role: string;
	statut: string;
}

/** Filtre la liste : rôle (id) et statut (actif/inactif). Fonction pure. */
export function filtrerUtilisateurs(
	utilisateurs: readonly Utilisateur[],
	filtres: UtilisateurFiltres,
): Utilisateur[] {
	return utilisateurs.filter((utilisateur) => {
		if (filtres.role !== "tous" && utilisateur.id_role !== filtres.role) {
			return false;
		}
		if (filtres.statut === "actifs" && !utilisateur.actif) return false;
		if (filtres.statut === "inactifs" && utilisateur.actif) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageUtilisateurs {
	items: Utilisateur[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerUtilisateurs(
	utilisateurs: readonly Utilisateur[],
	page: number,
	pageSize: number,
): PageUtilisateurs {
	const total = utilisateurs.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = utilisateurs.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
