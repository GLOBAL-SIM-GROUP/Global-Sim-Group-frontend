import { useQuery } from "@tanstack/react-query";

import {
	getRapportActivite,
	getRapportFinancier,
	getRapportRh,
	getSyntheseGlobale,
} from "../api/rapports";
import {
	activiteKeys,
	financierKeys,
	rhKeys,
	syntheseGlobaleKeys,
} from "../permissions";

/** Rapports du module M10 — une requête par rapport, clé portée par la période. */
export function useSyntheseGlobale(du: string, au: string) {
	return useQuery({
		queryKey: syntheseGlobaleKeys.list(du, au),
		queryFn: () => getSyntheseGlobale(du, au),
	});
}

export function useRapportFinancier(du: string, au: string) {
	return useQuery({
		queryKey: financierKeys.list(du, au),
		queryFn: () => getRapportFinancier(du, au),
	});
}

export function useRapportActivite(code: string, du: string, au: string) {
	return useQuery({
		queryKey: activiteKeys.list(code, du, au),
		queryFn: () => getRapportActivite(code, du, au),
	});
}

export function useRapportRh(du: string, au: string) {
	return useQuery({
		queryKey: rhKeys.list(du, au),
		queryFn: () => getRapportRh(du, au),
	});
}
