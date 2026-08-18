import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	listPointages,
	modifierPointage,
	pointerArrivee,
	pointerDepart,
} from "../api/pointages";
import { pointagesKeys } from "../permissions";

/** Pointages d'une période (le filtrage employé/service est client). */
export function usePointages(du?: string, au?: string) {
	return useQuery({
		queryKey: pointagesKeys.list(du, au),
		queryFn: () => listPointages({ du, au }),
	});
}

/** Invalide les pointages après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: pointagesKeys.all });
	};
}

export function usePointerArrivee() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ idEmploye, date }: { idEmploye: string; date: string }) =>
			pointerArrivee({ idEmploye, date }),
		onSuccess: invalider,
	});
}

export function usePointerDepart() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => pointerDepart(id),
		onSuccess: invalider,
	});
}

export function useModifierPointage() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...corps
		}: {
			id: string;
			heureArrivee?: string;
			heureDepart?: string;
			dureeTravaillee?: string;
			statut?: string;
			heuresSup?: string | null;
			note?: string | null;
		}) => modifierPointage(id, corps),
		onSuccess: invalider,
	});
}
