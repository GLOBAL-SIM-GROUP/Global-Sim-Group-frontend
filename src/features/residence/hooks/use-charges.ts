import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type ChargeBody,
	creerCategorieCharge,
	creerCharge,
	listCategoriesCharges,
	listCharges,
	modifierCategorieCharge,
	payerCharge,
} from "../api/charges";
import { categoriesChargesKeys, chargesKeys } from "../permissions";

/**
 * Toutes les charges. Le param `logement` du lister renvoie un 500 sur le
 * backend réel : le filtrage par logement se fait côté client.
 */
export function useCharges() {
	return useQuery({ queryKey: chargesKeys.list(), queryFn: listCharges });
}

/** Catégories de charges (select du formulaire). */
export function useCategoriesCharges() {
	return useQuery({
		queryKey: categoriesChargesKeys.list(),
		queryFn: listCategoriesCharges,
	});
}

/** Crée une charge (POST). Invalide la liste au succès. */
export function useCreerCharge() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: ChargeBody) => creerCharge(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: chargesKeys.all });
		},
	});
}

/** Crée une catégorie de charge. Invalide les catégories au succès. */
export function useCreerCategorieCharge() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { libelle: string; actif?: boolean }) =>
			creerCategorieCharge(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: categoriesChargesKeys.all,
			});
		},
	});
}

/** Modifie une catégorie de charge (libellé ou actif). */
export function useModifierCategorieCharge() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: { id: string; libelle?: string; actif?: boolean }) =>
			modifierCategorieCharge(body.id, {
				libelle: body.libelle,
				actif: body.actif,
			}),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: categoriesChargesKeys.all,
			});
		},
	});
}

/** Enregistre un paiement de charge (POST payer). Invalide la liste. */
export function usePayerCharge() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen: string;
		}) => payerCharge(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: chargesKeys.all });
		},
	});
}
