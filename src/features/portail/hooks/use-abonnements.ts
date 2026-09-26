import { useQuery } from "@tanstack/react-query";

import { getMesSouscription, listMesSouscriptions } from "../api/abonnements";
import { abonnementsPortailKeys } from "../permissions";

/**
 * Liste des abonnements (quotas prépayés) du client connecté — endpoint
 * portail scopé par le JWT (`PORTAIL.VOIR`).
 */
export function useMesSouscriptions() {
	return useQuery({
		queryKey: abonnementsPortailKeys.list(),
		queryFn: listMesSouscriptions,
	});
}

/**
 * Détail d'une de mes souscriptions + mouvements. `retry: false` — un 404
 * veut dire « souscription d'un autre client », inutile de retenter.
 */
export function useMesSouscription(id: string) {
	return useQuery({
		queryKey: abonnementsPortailKeys.detail(id),
		queryFn: () => getMesSouscription(id),
		enabled: typeof window !== "undefined" && !!id,
		retry: false,
	});
}
