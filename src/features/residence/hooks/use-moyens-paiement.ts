import { useQuery } from "@tanstack/react-query";
import { useCan } from "#/core/auth";
import { listMoyensPaiement } from "../api/moyens-paiement";
import { moyensActifs } from "../models/moyens-paiement";
import { moyensPaiementKeys } from "../permissions";

/**
 * Moyens de paiement actifs (module Finances), pour les formulaires où l'on
 * en CHOISIT un (encaissement, paiement d'une charge/commande…) : un moyen
 * désactivé ne doit plus être proposé pour une nouvelle opération. La page
 * d'administration des moyens de paiement (qui doit voir/réactiver les
 * inactifs) utilise `useMoyensPaiement` de `features/finances/hooks/use-finances`
 * — non filtré — pas celui-ci.
 *
 * Désactivé sans `FINANCES.VOIR` : le lister est sous Finances, inutile
 * d'appeler pour recevoir un 403 — les boutons d'encaissement/restitution
 * sont masqués dans ce cas.
 */
export function useMoyensPaiement() {
	const canFinancesVoir = useCan("FINANCES.VOIR");
	return useQuery({
		queryKey: moyensPaiementKeys.list(),
		queryFn: listMoyensPaiement,
		enabled: canFinancesVoir,
		select: moyensActifs,
	});
}
