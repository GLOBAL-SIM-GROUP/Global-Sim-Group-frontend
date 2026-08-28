import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { creerTirage, listerTirages } from "../api/tirages";
import type { TirageFiltres } from "../models/tirages";

export function useTirages(filtres?: TirageFiltres) {
	return useQuery({
		queryKey: ["tirages", filtres],
		queryFn: () => listerTirages(filtres),
	});
}

export function useCreerTirage() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: creerTirage,
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["tirages"] });
		},
	});
}
