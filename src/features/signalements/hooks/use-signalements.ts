import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	ajouterSignalementPhoto,
	createSignalement,
	getSignalement,
	listSignalementPhotos,
	listSignalements,
	prendreEnChargeSignalement,
	rejeterSignalement,
	resoudreSignalement,
	type SignalementCreatePayload,
	type SignalementType,
	supprimerSignalementPhoto,
} from "#/core/api/signalements";

import { signalementsKeys } from "../permissions";

/**
 * Liste complète des signalements — recherche et statut sont filtrés côté
 * client (même pattern que `useFactures`/`useReservations`) : une seule
 * requête, pas de refetch à chaque frappe.
 */
export function useSignalements(typeSignalement?: SignalementType) {
	return useQuery({
		queryKey: signalementsKeys.list(typeSignalement ?? "tous"),
		queryFn: () =>
			listSignalements({ limit: 200, type_signalement: typeSignalement }),
	});
}

/** Détail d'un signalement (fiche). `retry: false` : 404 = introuvable. */
export function useSignalement(id: string) {
	return useQuery({
		queryKey: signalementsKeys.detail(id),
		queryFn: () => getSignalement(id),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Invalide la liste et le détail après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: signalementsKeys.all });
	};
}

export function useCreerSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (payload: SignalementCreatePayload) =>
			createSignalement(payload),
		onSuccess: invalider,
	});
}

/** Prise en charge (pas de note — l'API n'accepte aucun payload). */
export function usePrendreEnChargeSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => prendreEnChargeSignalement(id),
		onSuccess: invalider,
	});
}

export function useResoudreSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			noteResolution,
		}: {
			id: string;
			noteResolution: string;
		}) => resoudreSignalement(id, { note_resolution: noteResolution }),
		onSuccess: invalider,
	});
}

export function useRejeterSignalement() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			noteResolution,
		}: {
			id: string;
			noteResolution: string;
		}) => rejeterSignalement(id, { note_resolution: noteResolution }),
		onSuccess: invalider,
	});
}

export function useSignalementPhotos(id: string) {
	return useQuery({
		queryKey: signalementsKeys.photos(id),
		queryFn: () => listSignalementPhotos(id),
		enabled: Boolean(id),
	});
}

export function useAjouterSignalementPhoto() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, cleObjet }: { id: string; cleObjet: string }) =>
			ajouterSignalementPhoto(id, cleObjet),
		onSuccess: (_photo, variables) => {
			void queryClient.invalidateQueries({
				queryKey: signalementsKeys.photos(variables.id),
			});
		},
	});
}

export function useSupprimerSignalementPhoto() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ idPhoto }: { idSignalement: string; idPhoto: string }) =>
			supprimerSignalementPhoto(idPhoto),
		onSuccess: (_resultat, variables) => {
			void queryClient.invalidateQueries({
				queryKey: signalementsKeys.photos(variables.idSignalement),
			});
		},
	});
}
