import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { paiementsKeys } from "#/features/finances/permissions";

import {
	creerPaiementFacture,
	type FacturerBody,
	facturerPrestation,
	getFacture,
	listFactures,
} from "../api/factures";
import { facturesKeys } from "../permissions";

/** Liste des factures (filtrage recherche/statut/source côté client). */
export function useFactures() {
	return useQuery({
		queryKey: facturesKeys.list(),
		queryFn: listFactures,
	});
}

/** Détail d'une facture (fiche). `retry: false` : 404 = introuvable. */
export function useFacture(id: string) {
	return useQuery({
		queryKey: facturesKeys.detail(id),
		queryFn: () => getFacture(id),
		retry: false,
	});
}

/** Invalide les factures et les paiements (un encaissement a été créé). */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: facturesKeys.all });
		void queryClient.invalidateQueries({ queryKey: paiementsKeys.all });
	};
}

/** Facture une prestation (crée la facture + le premier paiement). */
export function useFacturerPrestation() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			idPrestation,
			...body
		}: FacturerBody & { idPrestation: string }) =>
			facturerPrestation(idPrestation, body),
		onSuccess: invalider,
	});
}

/** Enregistre un paiement sur une facture (solde d'une facture partielle). */
export function useCreerPaiementFacture() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen: string;
		}) => creerPaiementFacture(id, body),
		onSuccess: invalider,
	});
}
