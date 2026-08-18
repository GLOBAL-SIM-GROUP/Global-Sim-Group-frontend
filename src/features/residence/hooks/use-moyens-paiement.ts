import { useQuery } from "@tanstack/react-query";
import { useCan } from "#/core/auth";
import { listMoyensPaiement } from "../api/moyens-paiement";
import { moyensPaiementKeys } from "../permissions";

/**
 * Moyens de paiement (module Finances). Désactivé sans `FINANCES.VOIR` : le
 * lister est sous Finances, inutile d'appeler pour recevoir un 403 — les
 * boutons d'encaissement/restitution sont masqués dans ce cas.
 */
export function useMoyensPaiement() {
	const canFinancesVoir = useCan("FINANCES.VOIR");
	return useQuery({
		queryKey: moyensPaiementKeys.list(),
		queryFn: listMoyensPaiement,
		enabled: canFinancesVoir,
	});
}
