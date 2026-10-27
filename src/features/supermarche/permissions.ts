import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Marchandise — produits. */
export const produitsKeys = createQueryKeys("supermarche.produits");

/** Clés de requêtes du module Marchandise — catégories de produits. */
export const categoriesProduitsKeys = createQueryKeys(
	"supermarche.categories-produits",
);

/** Clés de requêtes du module Marchandise — fournisseurs. */
export const fournisseursKeys = createQueryKeys("supermarche.fournisseurs");

/** Clés de requêtes du module Marchandise — ventes. */
export const ventesKeys = createQueryKeys("supermarche.ventes");

/** Clés de requêtes du module Marchandise — mouvements de stock. */
export const mouvementsKeys = createQueryKeys("supermarche.mouvements");

/** Clés de requêtes du module Marchandise — alerte stock. */
export const stockKeys = createQueryKeys("supermarche.stock");

/** Clés de requêtes du module Marchandise — rapports de ventes. */
export const rapportVentesKeys = createQueryKeys("supermarche.rapports-ventes");

/** Taille de page de la pagination client du catalogue produits. */
export const PRODUITS_PAGE_SIZE = 10;

/** Taille de page de la pagination client des ventes. */
export const VENTES_PAGE_SIZE = 10;

/** Taille de page de la pagination client des mouvements de stock. */
export const MOUVEMENTS_PAGE_SIZE = 10;
