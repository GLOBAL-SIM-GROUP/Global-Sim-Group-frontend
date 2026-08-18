import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { creerUtilisateur, listActivites, listRoles } from "../api/comptes";
import { activitesKeys, employesKeys, rolesKeys } from "../permissions";

/** Rôles disponibles (gated ADMIN : `enabled` porté par l'appelant). */
export function useRoles(enabled = true) {
	return useQuery({
		queryKey: rolesKeys.list(),
		queryFn: listRoles,
		enabled,
	});
}

/** Activités (scope d'un caissier, gated ADMIN). */
export function useActivites(enabled = true) {
	return useQuery({
		queryKey: activitesKeys.list(),
		queryFn: listActivites,
		enabled,
	});
}

/** Crée un compte utilisateur ; invalide les employés « sans compte ». */
export function useCreerUtilisateur() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: creerUtilisateur,
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: employesKeys.all });
		},
	});
}
