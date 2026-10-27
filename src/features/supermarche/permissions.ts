import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Marchandise — produits. */
export const produitsKeys = createQueryKeys("marchandise.produits");

/** Clés de requêtes du module Marchandise — catégories de produits. */
export const categoriesProduitsKeys = createQueryKeys(
	"marchandise.categories-produits",
);

/** Clés de requêtes du module Marchandise — fournisseurs. */
export const fournisseursKeys = createQueryKeys("marchandise.fournisseurs");

/** Clés de requêtes du module Marchandise — ventes. */
export const ventesKeys = createQueryKeys("marchandise.ventes");

/** Clés de requêtes du module Marchandise — mouvements de stock. */
export const mouvementsKeys = createQueryKeys("marchandise.mouvements");

/** Clés de requêtes du module Marchandise — alerte stock. */
export const stockKeys = createQueryKeys("marchandise.stock");

/** Clés de requêtes du module Marchandise — rapports de ventes. */
export const rapportVentesKeys = createQueryKeys("marchandise.rapports-ventes");

/** Taille de page de la pagination client du catalogue produits. */
export const PRODUITS_PAGE_SIZE = 10;

/** Taille de page de la pagination client des ventes. */
export const VENTES_PAGE_SIZE = 10;

/** Taille de page de la pagination client des mouvements de stock. */
export const MOUVEMENTS_PAGE_SIZE = 10;
