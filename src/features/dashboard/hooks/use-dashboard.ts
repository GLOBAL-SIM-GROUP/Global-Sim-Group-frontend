import { useQuery } from "@tanstack/react-query";

import {
	getIndicateurActivite,
	getSyntheseGlobale,
	type IndicateurActivite,
	type SyntheseGlobale,
} from "../api/dashboard";

export function useSyntheseGlobale() {
	return useQuery({
		queryKey: ["dashboard", "synthese-globale"],
		queryFn: getSyntheseGlobale,
	});
}

export function useIndicateurActivite(code: string) {
	return useQuery({
		queryKey: ["dashboard", "activite", code],
		queryFn: () => getIndicateurActivite(code),
		enabled: !!code,
	});
}
