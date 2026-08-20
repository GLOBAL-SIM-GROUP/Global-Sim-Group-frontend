import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { listParametres, majParametre } from "../api/parametres";
import { parametresKeys } from "../permissions";

export function useParametres() {
	return useQuery({
		queryKey: parametresKeys.list(),
		queryFn: listParametres,
	});
}

export function useMajParametre() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ cle, valeur }: { cle: string; valeur: string }) =>
			majParametre(cle, valeur),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: parametresKeys.all });
		},
	});
}
