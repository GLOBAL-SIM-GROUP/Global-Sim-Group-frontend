import { useQuery } from "@tanstack/react-query";
import { healthApi } from "#/core/api";
import { createQueryKeys } from "./query-keys";

const healthKeys = createQueryKeys("health");

/**
 * Preuve de câblage Query/API : interroge l'endpoint de santé `ready` du
 * backend (utilisée par l'écran d'accueil protégé).
 */
export function useHealthQuery() {
	return useQuery({
		queryKey: healthKeys.all,
		queryFn: () => healthApi.ready(),
		staleTime: 30_000,
	});
}
