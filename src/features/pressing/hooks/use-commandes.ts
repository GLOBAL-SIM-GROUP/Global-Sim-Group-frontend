import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerCommande,
	creerCommande,
	getCommande,
	listCommandes,
	type ModifierCommandeBody,
	modifierCommande,
	pretCommande,
	retirerCommande,
	traitementCommande,
} from "../api/commandes";
import { commandesKeys } from "../permissions";

/** Liste des commandes, avec les filtres serveur portés par la clé. */
export function useCommandes(
	statut: string,
	du?: string,
	au?: string,
	recherche?: string,
) {
	return useQuery({
		queryKey: commandesKeys.list(statut, du, au, recherche),
		queryFn: () =>
			listCommandes({ statut, du, au, recherche: recherche || undefined }),
	});
}

/** Détail d'une commande (lignes embarquées). `retry: false` : 404 = introuvable. */
export function useCommande(id: string | undefined) {
	return useQuery({
		queryKey: commandesKeys.detail(id ?? "aucun"),
		queryFn: () => getCommande(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Invalide la liste des commandes après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: commandesKeys.all });
	};
}

/** Enregistre un dépôt (POST). */
export function useCreerCommande() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerCommande, onSuccess: invalider });
}

/** Modifie une commande (PATCH). */
export function useModifierCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, ...body }: ModifierCommandeBody & { id: string }) =>
			modifierCommande(id, body),
		onSuccess: invalider,
	});
}

/** Passe la commande en traitement. */
export function useTraitementCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => traitementCommande(id),
		onSuccess: invalider,
	});
}

/** Passe la commande en « Prêt ». */
export function usePretCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => pretCommande(id),
		onSuccess: invalider,
	});
}

/** Retire la commande + encaisse le solde. */
export function useRetirerCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			solde: string;
			idMoyen: string;
		}) => retirerCommande(id, body),
		onSuccess: invalider,
	});
}

/** Annule une commande. */
export function useAnnulerCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => annulerCommande(id),
		onSuccess: invalider,
	});
}
