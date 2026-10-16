import { useQuery } from "@tanstack/react-query";

import type { Facture } from "#/features/facturation/models/factures";

import { getMesFactures, type MesFacturesFiltres } from "../api/factures";
import { facturesPortailKeys } from "../permissions";

/**
 * Factures du client connecté (tous services). `filtres` est passé au
 * serveur (`statut`, `source_type`, `numero`, `du`, `au`) — la clé de
 * requête le reflète pour ne pas partager le cache entre filtrages.
 */
export function useMesFactures(filtres?: MesFacturesFiltres) {
	return useQuery({
		queryKey: facturesPortailKeys.list(
			filtres?.statut,
			filtres?.source_type,
			filtres?.numero,
			filtres?.du,
			filtres?.au,
		),
		queryFn: () => getMesFactures(filtres),
	});
}

/**
 * Facture rattachée à une entité de service (`source_type` + `source_id`) —
 * ex. la commande restaurant 42 → sa facture. Une seule requête liste
 * filtrée serveur par `source_type`, mise en cache (TanStack la partage
 * entre pages du même service) puis filtrée côté client sur `source_id`.
 * `enabled` : n'interroge que si un document peut exister.
 */
export function useFactureDuService(
	sourceType: string | undefined,
	sourceId: string | undefined,
	enabled = true,
) {
	return useQuery({
		queryKey: facturesPortailKeys.list(undefined, sourceType),
		queryFn: () => getMesFactures({ source_type: sourceType }),
		enabled: enabled && Boolean(sourceType && sourceId),
		select: (factures): Facture | undefined =>
			factures.find((f) => f.source_id === sourceId),
	});
}
