import { useQuery } from "@tanstack/react-query";
import { useCan } from "#/core/auth";
import { listerActivites, listerCaissesAccessibles } from "../api/caisses";

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

/**
 * Référentiel des secteurs d'activité (`GET /finances/activites`) — change
 * rarement, `staleTime` long. Alimente la présélection par secteur de
 * `CaissePicker` (résolution `code` → `id_activite`).
 */
export function useActivites() {
	const canVoir = useCan("FINANCES.VOIR");
	const canEncaisser = useCan("FINANCES.ENCAISSER");
	const canModifier = useCan("FINANCES.MODIFIER");

	return useQuery({
		queryKey: ["finances", "activites"],
		queryFn: listerActivites,
		enabled: canVoir || canEncaisser || canModifier,
		staleTime: 5 * 60 * 1000,
	});
}

/**
 * État ouverte/fermée réel d'une caisse, dérivé du flag `ouverte` de
 * `GET /finances/caisses/accessibles` — le seul endpoint qui l'expose à
 * froid. `undefined` tant que la liste n'est pas chargée ou quand la caisse
 * sort du périmètre accessible (ex. responsable consultant une caisse hors
 * de son activité) — l'appelant garde alors son état de repli.
 */
export function useCaisseOuverte(idCaisse: string | null | undefined) {
	const { data } = useCaissesAccessibles();
	const caisse = data?.find((c) => c.id_caisse === idCaisse);
	return caisse ? caisse.ouverte : undefined;
}
