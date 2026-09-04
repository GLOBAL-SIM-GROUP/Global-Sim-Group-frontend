import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	activerContrat,
	type ContratBody,
	creerCaution,
	creerContrat,
	envoyerContratParEmail,
	getCaution,
	getContrat,
	listContrats,
	resilierContrat,
	restituerCaution,
} from "../api/contrats";
import { contratsKeys, logementsKeys } from "../permissions";

/** Liste de tous les contrats de location. */
export function useContrats() {
	return useQuery({ queryKey: contratsKeys.list(), queryFn: listContrats });
}

/**
 * Détail d'un contrat (échéances embarquées). `retry: false` : un 404 est un
 * contrat introuvable, pas une erreur à re-tenter.
 */
export function useContratDetail(id: string | undefined) {
	return useQuery({
		queryKey: contratsKeys.detail(id ?? "aucun"),
		queryFn: () => getContrat(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Crée un contrat (POST). Invalide la liste au succès. */
export function useCreerContrat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: ContratBody) => creerContrat(body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
		},
	});
}

/** Envoie le contrat (PDF) par email au client. Aucune invalidation (n'affecte aucune donnée listée). */
export function useEnvoyerContratParEmail() {
	return useMutation({
		mutationFn: (id: string) => envoyerContratParEmail(id),
	});
}

/** Active un contrat en attente. Invalide la liste au succès. */
export function useActiverContrat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => activerContrat(id),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
		},
	});
}

/**
 * Résilie un contrat ACTIF avant son terme. Invalide contrats ET logements —
 * le backend libère le logement (DISPONIBLE) dans le même appel.
 */
export function useResilierContrat() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: { id: string } & { dateResiliation?: string; motif?: string | null }) =>
			resilierContrat(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
			void queryClient.invalidateQueries({ queryKey: logementsKeys.all });
		},
	});
}

/**
 * Caution d'un contrat. `retry: false` : le 404 « aucune caution » est un état
 * vide (à afficher comme tel), pas une erreur.
 */
export function useCaution(idContrat: string | undefined) {
	return useQuery({
		queryKey: contratsKeys.list(idContrat ?? "aucun", "caution"),
		queryFn: () => getCaution(idContrat as string),
		enabled: Boolean(idContrat),
		retry: false,
	});
}

/**
 * Crée la caution d'un contrat (à la suite de sa création). Invalide
 * contrat + caution au succès.
 */
export function useCreerCaution() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			idContrat,
			montant,
		}: {
			idContrat: string;
			montant: string;
		}) => creerCaution(idContrat, { montant }),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
		},
	});
}

/** Restitue la caution. Invalide contrat + caution au succès. */
export function useRestituerCaution() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			idContrat,
			...body
		}: { idContrat: string } & {
			retenue?: string | null;
			motif_retenue?: string | null;
		}) => restituerCaution(idContrat, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: contratsKeys.all });
		},
	});
}
