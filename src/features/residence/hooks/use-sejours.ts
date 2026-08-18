import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type CreerSejourBody,
	creerSejour,
	getSejour,
	listSejours,
	type ModifierSejourBody,
	modifierSejour,
	payerSejour,
} from "../api/sejours";
import { sejoursKeys } from "../permissions";

/** Liste de tous les séjours (filtres appliqués côté client). */
export function useSejours() {
	return useQuery({ queryKey: sejoursKeys.list(), queryFn: listSejours });
}

/**
 * Détail d'un séjour (fiche). `retry: false` : un 404 est un séjour
 * introuvable, pas une erreur à re-tenter.
 */
export function useSejour(id: string | undefined) {
	return useQuery({
		queryKey: sejoursKeys.detail(id ?? "aucun"),
		queryFn: () => getSejour(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Enregistre un séjour (POST). Invalide la liste au succès. */
export function useCreerSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreerSejourBody) => creerSejour(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
		},
	});
}

/** Modifie un séjour (PATCH par id). Invalide la liste au succès. */
export function useModifierSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: ModifierSejourBody & { id: string }) =>
			modifierSejour(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
		},
	});
}

/** Enregistre un paiement de séjour (POST payer). Invalide la liste. */
export function usePayerSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen: string;
		}) => payerSejour(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
		},
	});
}
