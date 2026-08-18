import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import {
	type CreerClientBody,
	creerClient,
	getClient,
	rechercherClients,
} from "../api/clients";
import { clientsKeys } from "../permissions";

/**
 * Recherche serveur (le lister exige `recherche`). Activée à partir de
 * 2 caractères, désactivée sinon (le serveur rejette les termes trop courts).
 */
export function useRechercherClients(terme: string) {
	const propre = terme.trim();
	return useQuery({
		queryKey: clientsKeys.list(propre),
		queryFn: () => rechercherClients(propre),
		enabled: propre.length >= 2,
	});
}

/** Crée un client (la prochaine recherche re-synchronise la liste). */
export function useCreerClient() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreerClientBody) => creerClient(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: clientsKeys.all });
		},
	});
}

/**
 * Résout les noms de plusieurs clients par id en UNE seule requête (jamais de
 * hook en boucle) → `Map<id, Client>`. Les ids sont dédupliqués et triés pour
 * une clé de requête déterministe.
 */
export function useClientsDetails(ids: readonly string[]) {
	const unique = useMemo(() => [...new Set(ids.filter(Boolean))].sort(), [ids]);
	return useQuery({
		queryKey: clientsKeys.list("details", ...unique),
		queryFn: async () => {
			const resultats = await Promise.all(unique.map((id) => getClient(id)));
			return new Map(resultats.map((client) => [client.id, client]));
		},
		enabled: unique.length > 0,
	});
}
