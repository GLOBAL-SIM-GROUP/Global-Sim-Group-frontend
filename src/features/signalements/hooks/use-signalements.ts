import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	createSignalement,
	getSignalement,
	listSignalements,
	prendre_en_charge_signalement,
	rejeter_signalement,
	resoudre_signalement,
	type SignalementCreatePayload,
} from "#/core/api/signalements";

import { signalementsKeys } from "../permissions";

/**
 * Liste complète des signalements — recherche et statut sont filtrés côté
 * client (même pattern que `useFactures`/`useReservations`) : une seule
 * requête, pas de refetch à chaque frappe.
 */
export function useSignalements() {
	return useQuery({
		queryKey: signalementsKeys.list(),
		queryFn: () => listSignalements({ limit: 200 }),
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
		mutationFn: (id: string) => prendre_en_charge_signalement(id),
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
		}) => resoudre_signalement(id, { note_resolution: noteResolution }),
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
		}) => rejeter_signalement(id, { note_resolution: noteResolution }),
		onSuccess: invalider,
	});
}
