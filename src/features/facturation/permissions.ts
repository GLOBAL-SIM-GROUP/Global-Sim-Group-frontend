import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Facturation — prestations. */
export const prestationsKeys = createQueryKeys("facturation.prestations");

/** Clés de requêtes du module Facturation — factures. */
export const facturesKeys = createQueryKeys("facturation.factures");

/** Taille de page de la pagination client des prestations. */
export const PRESTATIONS_PAGE_SIZE = 10;

/** Taille de page de la pagination client des factures. */
export const FACTURES_PAGE_SIZE = 10;
