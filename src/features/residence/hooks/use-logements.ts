import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import {
	creerLogement,
	getLogement,
	type ListLogementsParams,
	type LogementBody,
	listLogements,
	modifierLogement,
} from "../api/logements";
import type { LogementStatut, LogementType } from "../models/logements";
import { logementsKeys } from "../permissions";

/**
 * Charge les logements d'un bâtiment avec recherche. `type`/`statut`/`search`
 * sont envoyés au lister (params réels) et portés par la clé de requête →
 * refetch au changement. Sans bâtiment, la requête est désactivée.
 */
export function useLogements(
	batiment: string | undefined,
	type: LogementType | "tous",
	statut: LogementStatut | "tous",
	search?: string,
) {
	return useQuery({
		queryKey: logementsKeys.list(batiment, type, statut, search),
		queryFn: async () => {
			if (!batiment) return [];
			return listLogements({ batiment, type, statut, search });
		},
		enabled: Boolean(batiment),
	});
}

/**
 * Détail d'un logement (fiche logement, page dédiée). `retry: false` : un 404
 * est un logement introuvable, pas une erreur à re-tenter.
 */
export function useLogement(id: string | undefined) {
	return useQuery({
		queryKey: logementsKeys.detail(id ?? "aucun"),
		queryFn: () => getLogement(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/**
 * Résout les numéros de plusieurs logements par id en UNE seule requête (jamais
 * de hook en boucle) → `Map<id, Logement>`. Ids dédupliqués et triés pour une
 * clé de requête déterministe.
 */
export function useLogementsParId(ids: readonly string[]) {
	const unique = useMemo(() => [...new Set(ids.filter(Boolean))].sort(), [ids]);
	return useQuery({
		queryKey: logementsKeys.list("details", ...unique),
		queryFn: async () => {
			const resultats = await Promise.all(unique.map((id) => getLogement(id)));
			return new Map(resultats.map((logement) => [logement.id, logement]));
		},
		enabled: unique.length > 0,
	});
}

/** Crée un logement (POST). Invalide la liste au succès. */
export function useCreerLogement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: LogementBody) => creerLogement(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: logementsKeys.all });
		},
	});
}

/** Modifie un logement existant (PATCH par id). Invalide la liste au succès. */
export function useModifierLogement() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: LogementBody & { id: string }) =>
			modifierLogement(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: logementsKeys.all });
		},
	});
}
