import { useQuery } from "@tanstack/react-query";
import { useCan } from "#/core/auth";
import { listerCaissesAccessibles } from "../api/caisses";

/**
 * Caisses dans lesquelles l'utilisateur connecté peut enregistrer un
 * mouvement (`GET /finances/caisses/accessibles`) — la sienne
 * (`est_propre`), celles de son scope d'activité ou toutes (admin).
 *
 * Distinct de `useMesCaisses` (visibilité reporting) : à utiliser dans les
 * formulaires d'encaissement/décaissement pour alimenter `CaissePicker`.
 * `ouverte` est un état vivant → `staleTime: 0` + refetch à chaque ouverture
 * de formulaire (`refetchOnMount: "always"`).
 */
export function useCaissesAccessibles() {
	const canVoir = useCan("FINANCES.VOIR");
	const canEncaisser = useCan("FINANCES.ENCAISSER");

	return useQuery({
		queryKey: ["finances", "caisses-accessibles"],
		queryFn: listerCaissesAccessibles,
		enabled: canVoir || canEncaisser,
		staleTime: 0,
		refetchOnMount: "always",
	});
}
