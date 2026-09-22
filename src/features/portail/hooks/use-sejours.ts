import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerSejourPortail,
	type CreerSejourPortailBody,
	creerSejourPortail,
	getSejourPortail,
	getSejourPortailFacture,
	listLogementsPortail,
	listMesSejoursPortail,
} from "../api/sejours";
import { logementsPortailKeys, sejoursPortailKeys } from "../permissions";

/**
 * Catalogue des logements proposables (`GET .../portail/sejours/logements`).
 * `periode` (dates `YYYY-MM-DD`) restreinte aux logements libres sur la
 * période ; sans dates, tout le catalogue actif. La clé porte les dates →
 * refetch automatique au changement.
 */
export function useLogementsPortail(
	periode?: { dateArrivee: string; dateDepart: string },
	enabled = true,
) {
	const periodeCle =
		periode?.dateArrivee && periode?.dateDepart
			? `${periode.dateArrivee}~${periode.dateDepart}`
			: "catalogue";
	return useQuery({
		queryKey: logementsPortailKeys.list(periodeCle),
		queryFn: () => listLogementsPortail(periode),
		enabled,
	});
}

/** Liste des demandes de séjour du compte connecté. */
export function useMesSejoursPortail() {
	return useQuery({
		queryKey: sejoursPortailKeys.list(),
		queryFn: listMesSejoursPortail,
	});
}

/** Détail d'une demande. `retry: false` : 404 = introuvable ou d'autrui. */
export function useSejourPortail(id: string) {
	return useQuery({
		queryKey: sejoursPortailKeys.detail(id),
		queryFn: () => getSejourPortail(id),
		enabled: Boolean(id),
		retry: false,
	});
}

/**
 * Facture d'un séjour portail. `data === null` (pas d'erreur) = pas encore
 * encaissé — la facture n'existe qu'après un premier encaissement (404
 * normal, voir `getSejourPortailFacture`). À afficher en état vide.
 */
export function useSejourPortailFacture(id: string | undefined) {
	return useQuery({
		queryKey: sejoursPortailKeys.detail(`${id ?? "aucun"}:facture`),
		queryFn: () => getSejourPortailFacture(id as string),
		enabled: Boolean(id),
	});
}

/**
 * Soumet une demande de séjour (POST portail → `EN_ATTENTE`). Un `409` est
 * un cas normal : le logement a été pris entre l'affichage du catalogue et
 * l'envoi — l'appelant invalide le catalogue et informe l'utilisateur.
 */
export function useCreerSejourPortail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (body: CreerSejourPortailBody) => creerSejourPortail(body),
		onSuccess: (sejour) => {
			queryClient.setQueryData(sejoursPortailKeys.detail(sejour.id), sejour);
			void queryClient.invalidateQueries({
				queryKey: sejoursPortailKeys.all,
			});
			void queryClient.invalidateQueries({
				queryKey: logementsPortailKeys.all,
			});
		},
	});
}

/** Annule une demande encore `EN_ATTENTE`. */
export function useAnnulerSejourPortail() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ id, motif }: { id: string; motif?: string }) =>
			annulerSejourPortail(id, motif),
		onSuccess: () => {
			void queryClient.invalidateQueries({
				queryKey: sejoursPortailKeys.all,
			});
			void queryClient.invalidateQueries({
				queryKey: logementsPortailKeys.all,
			});
		},
	});
}
