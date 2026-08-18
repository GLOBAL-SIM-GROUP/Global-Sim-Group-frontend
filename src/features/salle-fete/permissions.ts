import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du module Salle de fête — réservations. */
export const reservationsKeys = createQueryKeys("salle-fete.reservations");

/** Clés des paiements d'une réservation (historique sur la fiche). */
export const reservationPaiementsKeys = createQueryKeys(
	"salle-fete.reservation-paiements",
);

/** Taille de page de la pagination client des réservations. */
export const RESERVATIONS_PAGE_SIZE = 10;
