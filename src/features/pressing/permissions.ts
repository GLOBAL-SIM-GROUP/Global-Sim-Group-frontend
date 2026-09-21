import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Pressing — commandes. */
export const commandesKeys = createQueryKeys("pressing.commandes");

/** Taille de page de la pagination client des commandes pressing. */
export const COMMANDES_PAGE_SIZE = 10;

/**
 * Clés de requêtes du module Pressing — tarif au kilo. Enregistrement
 * unique (pas d'id dans l'URL, `GET /pressing/tarif-kg` renvoie toujours « le
 * tarif courant ») : une seule clé `list()`, pas de `detail(id)`.
 */
export const tarifKgKeys = createQueryKeys("pressing.tarif-kg");

/** Clés de requêtes du module Pressing — catalogue (types de vêtement + prestations). */
export const cataloguePressingKeys = createQueryKeys("pressing.catalogue");
