import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Résidence — bâtiments. */
export const batimentsKeys = createQueryKeys("residence.batiments");

/** Clés de requêtes du module Résidence — logements. */
export const logementsKeys = createQueryKeys("residence.logements");

/** Clés de requêtes du module Résidence — contrats de location. */
export const contratsKeys = createQueryKeys("residence.contrats");

/** Clés de requêtes du module Résidence — suivi des échéances (/suivi). */
export const suiviKeys = createQueryKeys("residence.suivi");

/** Clés de requêtes du module Résidence — charges. */
export const chargesKeys = createQueryKeys("residence.charges");

/** Clés de requêtes du module Résidence — catégories de charges. */
export const categoriesChargesKeys = createQueryKeys(
	"residence.categories-charges",
);

/** Clés de requêtes du module Résidence — séjours courts. */
export const sejoursKeys = createQueryKeys("residence.sejours");

/** Clés de requêtes du module Clients. */
export const clientsKeys = createQueryKeys("clients");

/** Clés de requêtes du module Finances — moyens de paiement. */
export const moyensPaiementKeys = createQueryKeys("finances.moyens-paiement");

/** Clés de requêtes du module Résidence — abonnements. */
export const abonnementsKeys = createQueryKeys("residence.abonnements");

/** Taille de page de la pagination client de la liste des bâtiments. */
export const BATIMENTS_PAGE_SIZE = 10;

/** Taille de page de la pagination client de la liste des logements. */
export const LOGEMENTS_PAGE_SIZE = 10;

/** Taille de page de la pagination client de la liste des contrats. */
export const CONTRATS_PAGE_SIZE = 10;

/** Taille de page de la pagination client du suivi des échéances. */
export const ECHANCES_PAGE_SIZE = 10;

/** Taille de page de la pagination client de la liste des séjours. */
export const SEJOURS_PAGE_SIZE = 10;

/** Taille de page de la pagination client de la liste des charges. */
export const CHARGES_PAGE_SIZE = 10;

/** Taille de page de la pagination client de la liste des abonnements. */
export const ABONNEMENTS_PAGE_SIZE = 10;
