import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerCategorieDepense,
	creerDepense,
	creerMoyenPaiement,
	type DepenseBody,
	listCategoriesDepenses,
	listDepenses,
	listImpayes,
	listMoyensPaiement,
	listPaiements,
	listTableauBord,
	modifierDepense,
	modifierMoyenPaiement,
	supprimerCategorieDepense,
	supprimerDepense,
} from "../api/finances";
import {
	categoriesDepensesKeys,
	depensesKeys,
	impayesKeys,
	moyensPaiementKeys,
	paiementsKeys,
	tableauBordKeys,
} from "../permissions";

export function useTableauBord(periodo?: string, activite?: string) {
	return useQuery({
		queryKey: tableauBordKeys.list(periodo, activite),
		queryFn: () => listTableauBord({ periodo, activite }),
	});
}

export function usePaiements(du?: string, au?: string, type?: string) {
	return useQuery({
		queryKey: paiementsKeys.list(du, au, type),
		queryFn: () => listPaiements({ du, au, type }),
	});
}

export function useDepenses(du?: string, au?: string) {
	return useQuery({
		queryKey: depensesKeys.list(du, au),
		queryFn: () => listDepenses({ du, au }),
	});
}

export function useImpayes(type?: string) {
	return useQuery({
		queryKey: impayesKeys.list(type),
		queryFn: () => listImpayes({ type }),
	});
}

export function useCategoriesDepenses() {
	return useQuery({
		queryKey: categoriesDepensesKeys.list(),
		queryFn: listCategoriesDepenses,
	});
}

export function useCreerCategorieDepense() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: creerCategorieDepense,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: categoriesDepensesKeys.all }),
	});
}

export function useSupprimerCategorieDepense() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: supprimerCategorieDepense,
		onSuccess: () =>
			qc.invalidateQueries({ queryKey: categoriesDepensesKeys.all }),
	});
}

export function useMoyensPaiement() {
	return useQuery({
		queryKey: moyensPaiementKeys.list(),
		queryFn: listMoyensPaiement,
	});
}

export function useCreerMoyenPaiement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: creerMoyenPaiement,
		onSuccess: () => qc.invalidateQueries({ queryKey: moyensPaiementKeys.all }),
	});
}

export function useModifierMoyenPaiement() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (body: { id: string; libelle?: string; actif?: boolean }) =>
			modifierMoyenPaiement(body.id, {
				libelle: body.libelle,
				actif: body.actif,
			}),
		onSuccess: () => qc.invalidateQueries({ queryKey: moyensPaiementKeys.all }),
	});
}

export function useCreerDepense() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: creerDepense,
		onSuccess: () => qc.invalidateQueries({ queryKey: depensesKeys.all }),
	});
}

export function useModifierDepense() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: DepenseBody & { id: string }) =>
			modifierDepense(id, body),
		onSuccess: () => qc.invalidateQueries({ queryKey: depensesKeys.all }),
	});
}

export function useSupprimerDepense() {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: supprimerDepense,
		onSuccess: () => qc.invalidateQueries({ queryKey: depensesKeys.all }),
	});
}
