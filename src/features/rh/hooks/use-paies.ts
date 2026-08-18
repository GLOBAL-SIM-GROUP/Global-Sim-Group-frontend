import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { paiementsKeys } from "#/features/finances/permissions";

import {
	ajouterElementPaie,
	annulerPaie,
	creerPaie,
	getPaie,
	listPaies,
	payerPaie,
	recalculerPaie,
	validerPaie,
} from "../api/paies";
import { paiesKeys } from "../permissions";

/** Liste des bulletins de salaire. */
export function usePaies() {
	return useQuery({ queryKey: paiesKeys.list(), queryFn: listPaies });
}

/** Détail d'un bulletin (paie + éléments). `retry: false` : 404 = introuvable. */
export function usePaie(id: string) {
	return useQuery({
		queryKey: paiesKeys.detail(id),
		queryFn: () => getPaie(id),
		retry: false,
	});
}

/** Invalide les bulletins (et les paiements lorsqu'un encaissement est créé). */
function useInvalidation(inclurePaiements = false) {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: paiesKeys.all });
		if (inclurePaiements) {
			void queryClient.invalidateQueries({ queryKey: paiementsKeys.all });
		}
	};
}

export function useCreerPaie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			idEmploye,
			periode,
			salaireBase,
		}: {
			idEmploye: string;
			periode: string;
			salaireBase: string;
		}) => creerPaie({ idEmploye, periode, salaireBase }),
		onSuccess: invalider,
	});
}

export function useAjouterElementPaie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			type: string;
			libelle: string;
			montant: string;
		}) => ajouterElementPaie(id, body),
		onSuccess: invalider,
	});
}

export function useRecalculerPaie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => recalculerPaie(id),
		onSuccess: invalider,
	});
}

export function useValiderPaie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => validerPaie(id),
		onSuccess: invalider,
	});
}

export function useAnnulerPaie() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => annulerPaie(id),
		onSuccess: invalider,
	});
}

export function usePayerPaie() {
	const invalider = useInvalidation(true);
	return useMutation({
		mutationFn: ({ id, idMoyen }: { id: string; idMoyen: string }) =>
			payerPaie(id, idMoyen),
		onSuccess: invalider,
	});
}
