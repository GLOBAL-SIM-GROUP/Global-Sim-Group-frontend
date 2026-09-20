import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerReservationSalleFete,
	creerReservationSalleFete,
	getDisponibilitesSalleFete,
	getReservationSalleFete,
	listMesReservationsSalleFete,
	type ReservationSalleFeteBody,
} from "../api/salle-fete";
import {
	salleFeteDisponibilitesKeys,
	salleFeteReservationsKeys,
} from "../permissions";

/**
 * Créneaux fermes d'un jour (`YYYY-MM-DD`) — ne part qu'avec une date
 * valide (le formulaire l'active dès que le champ date est rempli).
 */
export function useDisponibilitesSalleFete(date: string) {
	return useQuery({
		queryKey: salleFeteDisponibilitesKeys.list(date),
		queryFn: () => getDisponibilitesSalleFete(date),
		enabled: /^\d{4}-\d{2}-\d{2}$/.test(date),
	});
}

/** Liste des réservations du résident connecté. */
export function useMesReservationsSalleFete() {
	return useQuery({
		queryKey: salleFeteReservationsKeys.list(),
		queryFn: listMesReservationsSalleFete,
	});
}

/** Détail d'une réservation. `retry: false` : 404 = introuvable ou pas à lui. */
export function useReservationSalleFete(id: string) {
	return useQuery({
		queryKey: salleFeteReservationsKeys.detail(id),
		queryFn: () => getReservationSalleFete(id),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Demande un créneau (POST portail). */
export function useCreerReservationSalleFete() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: ReservationSalleFeteBody) =>
			creerReservationSalleFete(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: salleFeteReservationsKeys.all,
			});
			void queryClient.invalidateQueries({
				queryKey: salleFeteDisponibilitesKeys.all,
			});
		},
	});
}

/** Annule une demande encore `EN_ATTENTE`. */
export function useAnnulerReservationSalleFete() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => annulerReservationSalleFete(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: salleFeteReservationsKeys.all,
			});
			void queryClient.invalidateQueries({
				queryKey: salleFeteDisponibilitesKeys.all,
			});
		},
	});
}
