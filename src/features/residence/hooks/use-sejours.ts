import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	type CreerSejourBody,
	creerSejour,
	getSejour,
	getSejourFacture,
	listSejours,
	type ModifierSejourBody,
	modifierSejour,
	payerSejour,
	type SejourSansJointures,
} from "../api/sejours";
import type { Sejour } from "../models/sejours";
import { sejoursKeys } from "../permissions";

/** Liste de tous les séjours (filtres appliqués côté client). */
export function useSejours() {
	return useQuery({ queryKey: sejoursKeys.list(), queryFn: listSejours });
}

/**
 * Détail d'un séjour (fiche). `retry: false` : un 404 est un séjour
 * introuvable, pas une erreur à re-tenter.
 */
export function useSejour(id: string | undefined) {
	return useQuery({
		queryKey: sejoursKeys.detail(id ?? "aucun"),
		queryFn: () => getSejour(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/**
 * Facture d'un séjour. `data === null` (pas d'erreur) = pas encore
 * encaissé — l'état normal d'un séjour tout juste créé, voir
 * `getSejourFacture`. À afficher comme un état vide, jamais comme une erreur.
 *
 * `enabled` (défaut `true`) permet un chargement paresseux — ex. dans la
 * liste, où l'on ne veut interroger la facture qu'au clic sur « Imprimer »
 * d'une ligne, pas pour toutes les lignes affichées (évite un N+1).
 */
export function useSejourFacture(id: string | undefined, enabled = true) {
	return useQuery({
		queryKey: sejoursKeys.facture(id ?? "aucun"),
		queryFn: () => getSejourFacture(id as string),
		enabled: Boolean(id) && enabled,
	});
}

/**
 * Fusionne un séjour partiel (renvoyé par une mutation — sans les champs
 * joints numero_logement/client_nom/client_prenoms, voir `SejourSansJointures`)
 * dans le séjour déjà en cache, pour un rendu immédiat sans attendre le
 * refetch d'invalidation.
 */
function fusionnerSejourEnCache(
	queryClient: ReturnType<typeof useQueryClient>,
	sejour: SejourSansJointures,
) {
	queryClient.setQueryData<Sejour>(sejoursKeys.detail(sejour.id), (ancien) =>
		ancien ? { ...ancien, ...sejour } : ancien,
	);
}

/** Enregistre un séjour (POST). Invalide la liste au succès. */
export function useCreerSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreerSejourBody) => creerSejour(body),
		onSuccess: ({ sejour, facture }) => {
			fusionnerSejourEnCache(queryClient, sejour);
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
			// `facture` n'est présent que si un acompte a été versé à la création
			// (voir la règle : pas de facture tant qu'aucun encaissement n'a eu
			// lieu) — sans acompte, la facture reste absente, inutile d'invalider.
			if (facture) {
				void queryClient.invalidateQueries({
					queryKey: sejoursKeys.facture(sejour.id),
				});
			}
		},
	});
}

/** Modifie un séjour (PATCH par id). Invalide la liste au succès. */
export function useModifierSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, ...body }: ModifierSejourBody & { id: string }) =>
			modifierSejour(id, body),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
		},
	});
}

/**
 * Enregistre un paiement de séjour (POST payer). Le séjour renvoyé (déjà à
 * jour, y compris le passage EN_COURS → TERMINE le cas échéant) est fusionné
 * en cache immédiatement ; liste, détail et facture sont aussi invalidés pour
 * rester cohérents avec le reste de l'app.
 */
export function usePayerSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen: string;
		}) => payerSejour(id, body),
		onSuccess: ({ sejour }) => {
			fusionnerSejourEnCache(queryClient, sejour);
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
			void queryClient.invalidateQueries({
				queryKey: sejoursKeys.facture(sejour.id),
			});
		},
	});
}
