/**
 * Rapports de ventes restaurant (module M5). Types hand-typed revalidés sur le
 * backend réel (GET /restaurant/rapports/ventes) — liste des plats vendus avec
 * quantité et chiffre d'affaires.
 */
export interface RapportRestaurant {
	plat: string;
	quantite_vendue: string;
	chiffre_affaire: string;
}
