import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerEmploye,
	type EmployeBody,
	getEmploye,
	type ListEmployesParams,
	listEmployes,
	modifierEmploye,
} from "../api/employes";
import type { EmployeStatut } from "../models/employes";
import { employesKeys } from "../permissions";

/** Liste des employés avec recherche et filtres. */
export function useEmployes(params?: ListEmployesParams) {
	return useQuery({
		queryKey: employesKeys.list(Boolean(params?.sansCompte), params?.search),
		queryFn: () => listEmployes(params),
	});
}

/** Détail d'un employé (fiche). `retry: false` : 404 = introuvable. */
export function useEmploye(id: string) {
	return useQuery({
		queryKey: employesKeys.detail(id),
		queryFn: () => getEmploye(id),
		retry: false,
	});
}

/** Invalide la liste des employés après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: employesKeys.all });
	};
}

export function useCreerEmploye() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerEmploye, onSuccess: invalider });
}

export function useModifierEmploye() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: Partial<EmployeBody> & { statut?: EmployeStatut } & { id: string }) =>
			modifierEmploye(id, body),
		onSuccess: invalider,
	});
}
