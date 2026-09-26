import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerCommande,
	apercuAbonnementCommande,
	creerCommande,
	encaisserCommande,
	getCommande,
	type ListCommandesParams,
	listCommandes,
	listRapportVentes,
	majStatutCommande,
} from "../api/commandes";
import type { CommandeRestaurantStatut } from "../models/commandes";
import { commandesRestaurantKeys, rapportRestaurantKeys } from "../permissions";

/** Historique des commandes, avec les filtres serveur portés par la clé. */
export function useCommandes(params?: ListCommandesParams) {
	return useQuery({
		queryKey: commandesRestaurantKeys.list(
			params?.statut,
			params?.du,
			params?.au,
			params?.search,
		),
		queryFn: () => listCommandes(params),
	});
}

/**
 * Nombre de commandes `EN_ATTENTE` (badge nav). `refetchInterval` : filet de
 * sécurité — l'invalidation via les notifications `restaurant.commande_*`
 * couvre déjà le rafraîchissement temps réel.
 */
export function useCommandesEnAttenteCount(enabled: boolean) {
	return useQuery({
		queryKey: commandesRestaurantKeys.list("EN_ATTENTE"),
		queryFn: () => listCommandes({ statut: "EN_ATTENTE" }),
		enabled,
		select: (data) => data.length,
		refetchInterval: 60_000,
	});
}

/** Détail d'une commande (lignes embarquées). `retry: false` : 404 = introuvable. */
export function useCommande(id: string | undefined) {
	return useQuery({
		queryKey: commandesRestaurantKeys.detail(id ?? "aucun"),
		queryFn: () => getCommande(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Invalide commandes + plats (le statut/total peuvent changer les stocks ? non — plats inchangés). */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({
			queryKey: commandesRestaurantKeys.all,
		});
		void queryClient.invalidateQueries({ queryKey: rapportRestaurantKeys.all });
	};
}

/** Enregistre une commande (POST). */
export function useCreerCommande() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerCommande, onSuccess: invalider });
}

/** Modifie le statut d'une commande (POST statut, motif optionnel). */
export function useMajStatutCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			statut,
			motif,
		}: {
			id: string;
			statut: CommandeRestaurantStatut;
			motif?: string;
		}) => majStatutCommande(id, statut, motif),
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

/** Encaisse une commande (montant ajusté par l'abonnement → facture + `PAYEE`). */
export function useEncaisserCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen?: string;
			date?: string;
			utiliserAbonnement?: boolean;
			accepterExcedent?: boolean;
		}) => encaisserCommande(id, body),
		onSuccess: invalider,
	});
}

/**
 * Aperçu de couverture abonnement d'une commande existante (GET
 * `/restaurant/commandes/{id}/apercu-abonnement`) — chargé à l'ouverture du
 * dialogue d'encaissement pour connaître le montant réellement dû.
 */
export function useApercuAbonnementCommande(id: string | undefined) {
	return useQuery({
		queryKey: [...commandesRestaurantKeys.detail(id ?? "aucun"), "apercu"],
		queryFn: () => apercuAbonnementCommande(id as string),
		enabled: Boolean(id),
		retry: false,
		staleTime: 30_000,
	});
}

/** Rapports de ventes (période portée par la clé). */
export function useRapportVentes(du?: string, au?: string) {
	return useQuery({
		queryKey: rapportRestaurantKeys.list(du, au),
		queryFn: () => listRapportVentes(du, au),
	});
}
