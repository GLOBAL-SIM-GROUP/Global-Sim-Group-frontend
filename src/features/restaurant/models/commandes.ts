/**
 * Commande restaurant (module M5). Types hand-typed revalidés sur le backend
 * réel (GET /restaurant/commandes). Clé primaire wire `id_commande` → `id`.
 */
export type CommandeRestaurantStatut =
	| "EN_COURS"
	| "EN_PREPARATION"
	| "SERVIE"
	| "PAYEE"
	| "ANNULEE";

export type TypeCommande = "SUR_PLACE" | "A_EMPORTER" | "LIVRAISON";

export interface CommandeRestaurant {
	id: string;
	id_client: string | null;
	date: string;
	type: TypeCommande;
	total: string;
	statut: CommandeRestaurantStatut;
}

/** Ligne d'une commande (GET /restaurant/commandes/{id} → `lignes[]`). */
export interface LigneCommandeRestaurant {
	id: string;
	id_commande: string;
	id_plat: string;
	quantite: number;
	prix_unitaire: string;
	total: string;
}

/** Détail d'une commande : le GET par id embarque les lignes. */
export interface CommandeRestaurantDetail extends CommandeRestaurant {
	lignes: LigneCommandeRestaurant[];
}

/** Libellés français du statut de commande. */
export const COMMANDE_STATUT_LABELS: Record<CommandeRestaurantStatut, string> =
	{
		EN_COURS: "En cours",
		EN_PREPARATION: "En préparation",
		SERVIE: "Servie",
		PAYEE: "Payée",
		ANNULEE: "Annulée",
	};

/** Libellés français du type de commande. */
export const TYPE_COMMANDE_LABELS: Record<TypeCommande, string> = {
	SUR_PLACE: "Sur place",
	A_EMPORTER: "À emporter",
	LIVRAISON: "Livraison",
};

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type CommandeStatutFiltre = "tous" | CommandeRestaurantStatut;

/** Valeurs du filtre « Type » (URL : `?type=`). */
export type TypeCommandeFiltre = "tous" | TypeCommande;

/** Filtres de l'historique des commandes (URL + côté client). */
export interface CommandeFiltres {
	statut: CommandeStatutFiltre;
	type: TypeCommandeFiltre;
	du: string;
	au: string;
}

/**
 * Filtre l'historique. Le lister accepte `du`/`au`/`statut` côté serveur ; on
 * ré-applique sans effet et on garde le filtre « type ». Fonction pure.
 */
export function filtrerCommandes(
	commandes: readonly CommandeRestaurant[],
	filtres: CommandeFiltres,
): CommandeRestaurant[] {
	return commandes.filter((commande) => {
		if (filtres.statut !== "tous" && commande.statut !== filtres.statut) {
			return false;
		}
		if (filtres.type !== "tous" && commande.type !== filtres.type) {
			return false;
		}
		const jour = commande.date.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageCommandes {
	items: CommandeRestaurant[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerCommandes(
	commandes: readonly CommandeRestaurant[],
	page: number,
	pageSize: number,
): PageCommandes {
	const total = commandes.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = commandes.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
