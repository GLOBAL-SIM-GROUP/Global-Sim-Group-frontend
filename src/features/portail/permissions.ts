import { createQueryKeys } from "#/core/query";

/** Clés de requêtes du portail résident (M2.5). */
export const resumeKeys = createQueryKeys("portail.resume");
export const echeancesKeys = createQueryKeys("portail.echeances");
export const paiementsKeys = createQueryKeys("portail.paiements");
export const cautionKeys = createQueryKeys("portail.caution");
export const recuEcheanceKeys = createQueryKeys("portail.recu-echeance");
export const recuPaiementKeys = createQueryKeys("portail.recu-paiement");
export const etatDesLieuxKeys = createQueryKeys("portail.etat-des-lieux");
export const pressingCommandesKeys = createQueryKeys(
	"portail.pressing-commandes",
);
export const recuPressingKeys = createQueryKeys("portail.recu-pressing");
export const restaurantCommandesKeys = createQueryKeys(
	"portail.restaurant-commandes",
);
export const salleFeteReservationsKeys = createQueryKeys(
	"portail.salle-fete-reservations",
);
export const salleFeteDisponibilitesKeys = createQueryKeys(
	"portail.salle-fete-disponibilites",
);
export const marketVentesKeys = createQueryKeys("portail.market-ventes");
