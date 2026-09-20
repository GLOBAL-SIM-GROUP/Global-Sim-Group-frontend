import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerTypeManifestation,
	listTypesManifestation,
	majTypeManifestation,
} from "../api/catalogue";
import { catalogueKeys } from "../permissions";

/** Types de manifestation (actifs et inactifs) — `SALLE_FETE.VOIR`. */
export function useCatalogueSalleFete() {
	return useQuery({
		queryKey: catalogueKeys.list(),
		queryFn: listTypesManifestation,
	});
}

export function useCreerTypeManifestation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (libelle: string) => creerTypeManifestation({ libelle }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: catalogueKeys.all }),
	});
}

export function useMajTypeManifestation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			libelle,
			actif,
		}: {
			id: string;
			libelle?: string;
			actif?: boolean;
		}) => majTypeManifestation(id, { libelle, actif }),
		onSuccess: () =>
			queryClient.invalidateQueries({ queryKey: catalogueKeys.all }),
	});
}
