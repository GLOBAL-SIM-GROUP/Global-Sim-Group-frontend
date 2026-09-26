import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerOffre,
	type FiltresOffres,
	getOffre,
	listOffres,
	type MajOffreBody,
	majOffre,
	supprimerOffre,
} from "../api/offres";
import { offresKeys } from "../permissions";

/** Liste des offres d'abonnement, avec les filtres serveur portés par la clé. */
export function useOffres(filtres?: FiltresOffres) {
	return useQuery({
		queryKey: offresKeys.list(JSON.stringify(filtres ?? {})),
		queryFn: () => listOffres(filtres),
	});
}

/** Détail d'une offre. `retry: false` : 404 = introuvable. */
export function useOffre(id: string | undefined) {
	return useQuery({
		queryKey: offresKeys.detail(id ?? "aucun"),
		queryFn: () => getOffre(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: offresKeys.all });
	};
}

/** Crée une offre (`ABONNEMENT.CREER`). */
export function useCreerOffre() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerOffre, onSuccess: invalider });
}

/** Modifie une offre — champs commerciaux uniquement (`ABONNEMENT.MODIFIER`). */
export function useMajOffre() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, ...body }: MajOffreBody & { id: string }) =>
			majOffre(id, body),
		onSuccess: invalider,
	});
}

/** Supprime une offre jamais vendue (`ABONNEMENT.SUPPRIMER` ; 409 sinon). */
export function useSupprimerOffre() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => supprimerOffre(id),
		onSuccess: invalider,
	});
}
