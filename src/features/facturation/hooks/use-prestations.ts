import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	creerPrestation,
	listPrestations,
	modifierPrestation,
	type PrestationBody,
} from "../api/prestations";
import { prestationsKeys } from "../permissions";

export function usePrestations() {
	return useQuery({
		queryKey: prestationsKeys.list(),
		queryFn: listPrestations,
	});
}

export function useCreerPrestation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: PrestationBody) => creerPrestation(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: prestationsKeys.all });
		},
	});
}

export function useModifierPrestation() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: PrestationBody & { id: string }) =>
			modifierPrestation(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: prestationsKeys.all });
		},
	});
}
