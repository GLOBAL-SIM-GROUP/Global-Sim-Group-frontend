import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerPrestation,
	creerTypeVetement,
	getCatalogue,
	majPrestation,
	majTypeVetement,
} from "../api/catalogue";
import { cataloguePressingKeys } from "../permissions";

/** Catalogue pressing (types + prestations, actifs et inactifs) — `PRESSING.VOIR`. */
export function useCataloguePressing() {
	return useQuery({
		queryKey: cataloguePressingKeys.list(),
		queryFn: getCatalogue,
	});
}

function useInvalidateCatalogue() {
	const queryClient = useQueryClient();
	return () =>
		queryClient.invalidateQueries({ queryKey: cataloguePressingKeys.all });
}

export function useCreerTypeVetement() {
	const invalider = useInvalidateCatalogue();
	return useMutation({
		mutationFn: (libelle: string) => creerTypeVetement({ libelle }),
		onSuccess: invalider,
	});
}

export function useMajTypeVetement() {
	const invalider = useInvalidateCatalogue();
	return useMutation({
		mutationFn: ({
			id,
			libelle,
			actif,
		}: {
			id: string;
			libelle?: string;
			actif?: boolean;
		}) => majTypeVetement(id, { libelle, actif }),
		onSuccess: invalider,
	});
}

export function useCreerPrestation() {
	const invalider = useInvalidateCatalogue();
	return useMutation({
		mutationFn: (libelle: string) => creerPrestation({ libelle }),
		onSuccess: invalider,
	});
}

export function useMajPrestation() {
	const invalider = useInvalidateCatalogue();
	return useMutation({
		mutationFn: ({
			id,
			libelle,
			actif,
		}: {
			id: string;
			libelle?: string;
			actif?: boolean;
		}) => majPrestation(id, { libelle, actif }),
		onSuccess: invalider,
	});
}
