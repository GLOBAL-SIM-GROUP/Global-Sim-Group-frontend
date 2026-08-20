import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerUtilisateur,
	listUtilisateurs,
	modifierUtilisateur,
	reinitialiserMotDePasse,
	type UtilisateurBody,
} from "../api/utilisateurs";
import { utilisateursKeys } from "../permissions";

export function useUtilisateurs() {
	return useQuery({
		queryKey: utilisateursKeys.list(),
		queryFn: listUtilisateurs,
	});
}

/** Invalide les utilisateurs après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: utilisateursKeys.all });
	};
}

export function useCreerUtilisateur() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerUtilisateur, onSuccess: invalider });
}

export function useModifierUtilisateur() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: Partial<Omit<UtilisateurBody, "motDePasse">> & { id: string }) =>
			modifierUtilisateur(id, body),
		onSuccess: invalider,
	});
}

export function useReinitialiserMotDePasse() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, motDePasse }: { id: string; motDePasse: string }) =>
			reinitialiserMotDePasse(id, motDePasse),
		onSuccess: invalider,
	});
}
