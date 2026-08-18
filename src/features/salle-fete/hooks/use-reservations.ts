import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listPaiements } from "#/features/finances/api/finances";

import {
	annulerReservation,
	confirmerReservation,
	creerReservation,
	getReservation,
	listReservations,
	majStatutReservation,
	modifierReservation,
	type ReservationBody,
	realiserReservation,
} from "../api/reservations";
import type { ReservationStatut } from "../models/reservations";
import { reservationPaiementsKeys, reservationsKeys } from "../permissions";

/** Liste des réservations, avec les filtres serveur portés par la clé. */
export function useReservations(statut: string, du?: string, au?: string) {
	return useQuery({
		queryKey: reservationsKeys.list(statut, du, au),
		queryFn: () => listReservations({ statut, du, au }),
	});
}

/** Détail d'une réservation (fiche). `retry: false` : 404 = introuvable. */
export function useReservation(id: string) {
	return useQuery({
		queryKey: reservationsKeys.detail(id),
		queryFn: () => getReservation(id),
		retry: false,
	});
}

/**
 * Paiements d'une réservation : liste complète des paiements filtrée côté
 * client par `id_activite` (le param serveur est peu fiable). `enabled` gated
 * par `FINANCES.VOIR`.
 */
export function useReservationPaiements(id: string, enabled: boolean) {
	return useQuery({
		queryKey: reservationPaiementsKeys.detail(id),
		queryFn: async () =>
			(await listPaiements()).filter((paiement) => paiement.id_activite === id),
		enabled,
	});
}

/** Invalide la liste des réservations après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: reservationsKeys.all });
	};
}

export function useCreerReservation() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerReservation, onSuccess: invalider });
}

export function useModifierReservation() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, ...body }: ReservationBody & { id: string }) =>
			modifierReservation(id, body),
		onSuccess: invalider,
	});
}

export function useConfirmerReservation() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen: string;
		}) => confirmerReservation(id, body),
		onSuccess: invalider,
	});
}

export function useRealiserReservation() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen: string;
		}) => realiserReservation(id, body),
		onSuccess: invalider,
	});
}

export function useAnnulerReservation() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => annulerReservation(id),
		onSuccess: invalider,
	});
}

export function useMajStatutReservation() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, statut }: { id: string; statut: ReservationStatut }) =>
			majStatutReservation(id, statut),
		onSuccess: invalider,
	});
}
