import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerSejour,
	type CreerSejourBody,
	creerSejour,
	getSejour,
	getSejourFacture,
	listSejours,
	type ModifierSejourBody,
	modifierSejour,
	payerSejour,
	type SejourSansJointures,
	validerSejour,
} from "../api/sejours";
import type {
	Sejour,
	SejourOrigineFiltre,
	SejourStatutFiltre,
} from "../models/sejours";
import { sejoursKeys } from "../permissions";

/**
 * Liste des séjours. `statut`/`origine` sont envoyés au serveur (filtres
 * réels `?statut=&origine=` — sans filtre, le backend inclut les
 * `EN_ATTENTE` de la file de validation) ; type/période restent filtrés
 * côté client dans la page.
 */
export function useSejours(filtres?: {
	statut?: SejourStatutFiltre;
	origine?: SejourOrigineFiltre;
}) {
	const statut =
		filtres?.statut && filtres.statut !== "tous" ? filtres.statut : undefined;
	const origine =
		filtres?.origine && filtres.origine !== "tous"
			? filtres.origine
			: undefined;
	return useQuery({
		queryKey: sejoursKeys.list(statut ?? "tous", origine ?? "tous"),
		queryFn: () => listSejours({ statut, origine }),
	});
}

/**
 * Compteur des demandes `EN_ATTENTE` — badge du menu Séjours courts (staff).
 * Le socket `residence.sejour_demande_creee` invalide la clé ; le polling
 * 60 s couvre les pertes d'événement.
 */
export function useSejoursEnAttenteCount(enabled: boolean) {
	return useQuery({
		queryKey: sejoursKeys.list("EN_ATTENTE", "tous"),
		queryFn: () => listSejours({ statut: "EN_ATTENTE" }),
		enabled,
		select: (data) => data.length,
		refetchInterval: 60_000,
	});
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
		onSuccess: ({ sejour }) => {
			fusionnerSejourEnCache(queryClient, sejour);
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
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

/**
 * Valide une demande `EN_ATTENTE` (POST `valider`) : chiffrage + passage
 * `EN_COURS`. Le séjour renvoyé est fusionné en cache ; liste et facture
 * invalidées. Un 409 (logement pris entre-temps / statut déjà traité) est
 * laissé à l'appelant — c'est un cas normal, pas une erreur système.
 */
export function useValiderSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			tarif: string;
			idLogement?: string;
			montantTotal?: string;
		}) => validerSejour(id, body),
		onSuccess: (sejour) => {
			fusionnerSejourEnCache(queryClient, sejour);
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
		},
	});
}

/**
 * Annule un séjour (POST `annuler`) : refus `EN_ATTENTE` ou annulation
 * `EN_COURS`, avec motif optionnel restitué au client.
 */
export function useAnnulerSejour() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, motif }: { id: string; motif?: string }) =>
			annulerSejour(id, { motif }),
		onSuccess: (_data, { id }) => {
			void queryClient.invalidateQueries({ queryKey: sejoursKeys.all });
			void queryClient.invalidateQueries({
				queryKey: sejoursKeys.detail(id),
			});
		},
	});
}
