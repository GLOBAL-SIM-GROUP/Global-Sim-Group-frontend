import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ajusterQuota,
	deciderReliquat,
	encaisserSouscription,
	type FiltresSouscriptions,
	getSouscription,
	listSouscriptions,
	resilierSouscription,
	vendreSouscription,
} from "../api/souscriptions";
import type { DecisionReliquat } from "../models/abonnements";
import { souscriptionsKeys } from "../permissions";

/** Liste des souscriptions, avec les filtres serveur portés par la clé. */
export function useSouscriptions(filtres?: FiltresSouscriptions) {
	return useQuery({
		queryKey: souscriptionsKeys.list(JSON.stringify(filtres ?? {})),
		queryFn: () => listSouscriptions(filtres),
	});
}

/**
 * Nombre de souscriptions expirées en attente de décision de reliquat (badge
 * « Reliquats à décider » de la sidebar). `refetchInterval` : filet de
 * sécurité en l'absence d'événement socket dédié.
 */
export function useReliquatsADeciderCount(enabled: boolean) {
	return useQuery({
		queryKey: souscriptionsKeys.list("reliquats_a_decider"),
		queryFn: () => listSouscriptions({ reliquat_a_decider: true }),
		enabled,
		select: (data) => data.length,
		refetchInterval: 60_000,
	});
}

/**
 * Détail d'une souscription (mouvements embarqués). `retry: false` : 404 =
 * introuvable. `refetchOnWindowFocus` reste utile : `solde`/`etat` sont
 * calculés en direct côté backend.
 */
export function useSouscription(id: string | undefined) {
	return useQuery({
		queryKey: souscriptionsKeys.detail(id ?? "aucun"),
		queryFn: () => getSouscription(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: souscriptionsKeys.all });
	};
}

/** Vend une souscription (`ABONNEMENT.VENDRE`). */
export function useVendreSouscription() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: vendreSouscription,
		onSuccess: invalider,
	});
}

/** Encaisse un paiement complémentaire (`ABONNEMENT.VENDRE`). */
export function useEncaisserSouscription() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			montant: string;
			idMoyen: string;
		}) => encaisserSouscription(id, body),
		onSuccess: invalider,
	});
}

/** Ajuste le quota manuellement (`ABONNEMENT.AJUSTER`). */
export function useAjusterQuota() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			quantite: string;
			motif: string;
		}) => ajusterQuota(id, body),
		onSuccess: invalider,
	});
}

/** Résilie une souscription `ACTIVE` (`ABONNEMENT.AJUSTER`). */
export function useResilierSouscription() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, ...body }: { id: string; motif: string }) =>
			resilierSouscription(id, body),
		onSuccess: invalider,
	});
}

/** Décide du reliquat (`ABONNEMENT.DECIDER_RELIQUAT`). */
export function useDeciderReliquat() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			decision: DecisionReliquat;
			idSouscriptionCible?: string;
			motif?: string;
		}) => deciderReliquat(id, body),
		onSuccess: invalider,
	});
}
