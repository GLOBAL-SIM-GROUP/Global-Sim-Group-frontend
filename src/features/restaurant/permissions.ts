import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Restaurant — plats. */
export const platsKeys = createQueryKeys("restaurant.plats");

/** Clés de requêtes du module Restaurant — catégories de plats. */
export const categoriesPlatsKeys = createQueryKeys(
	"restaurant.categories-plats",
);

/** Clés de requêtes du module Restaurant — commandes. */
export const commandesRestaurantKeys = createQueryKeys("restaurant.commandes");

/** Clés de requêtes du module Restaurant — rapports de ventes. */
export const rapportRestaurantKeys = createQueryKeys(
	"restaurant.rapports-ventes",
);

/** Taille de page de la pagination client de la carte des plats. */
export const PLATS_PAGE_SIZE = 10;

/** Taille de page de la pagination client des commandes restaurant. */
export const COMMANDES_RESTAURANT_PAGE_SIZE = 10;
