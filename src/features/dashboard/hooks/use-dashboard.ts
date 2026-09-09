import { useQuery } from "@tanstack/react-query";

import {
	getCommandesPressing,
	getDashboardActivite,
	getImpayes,
	getIndicateurActivite,
	getLogementsDispo,
	getPointagesAujourdhui,
	getProduitsCritiques,
	getReservationsSalleFutures,
	getSyntheseGlobale,
} from "../api/dashboard";

const DASHBOARD_STALE_TIME_MS = 5 * 60 * 1000;

export function useSyntheseGlobale(du?: string, au?: string, enabled = true) {
	return useQuery({
		queryKey: ["dashboard", "synthese-globale", du, au],
		queryFn: () => getSyntheseGlobale(du, au),
		enabled,
		staleTime: DASHBOARD_STALE_TIME_MS,
	});
}

export function useIndicateurActivite(code: string) {
	return useQuery({
		queryKey: ["dashboard", "activite", code],
		queryFn: () => getIndicateurActivite(code),
		enabled: !!code,
	});
}

/**
 * Résumé d'une activité sur une période `du`/`au` (page Tableau de bord
 * financier — filtre « Activité »). `enabled` sur `code` seul : la période
 * a toujours des bornes par défaut côté backend même sans `du`/`au`.
 */
export function useDashboardActivite(code: string, du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "activite-periode", code, du, au],
		queryFn: () => getDashboardActivite(code, du, au),
		enabled: !!code,
	});
}

export function useLogementsDispo(enabled = true) {
	return useQuery({
		queryKey: ["dashboard", "logements-dispo"],
		queryFn: getLogementsDispo,
		enabled,
		staleTime: DASHBOARD_STALE_TIME_MS,
	});
}

export function useProduitsCritiques(enabled = true) {
	return useQuery({
		queryKey: ["dashboard", "produits-critiques"],
		queryFn: getProduitsCritiques,
		enabled,
		staleTime: DASHBOARD_STALE_TIME_MS,
	});
}

export function useCommandesPressing(du?: string, au?: string, enabled = true) {
	return useQuery({
		queryKey: ["dashboard", "commandes-pressing", du, au],
		queryFn: () => getCommandesPressing(du, au),
		enabled,
		staleTime: DASHBOARD_STALE_TIME_MS,
	});
}

export function usePointagesAujourdhui(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "pointages-aujourd-hui", du, au],
		queryFn: () => getPointagesAujourdhui(du, au),
	});
}

export function useImpayes(enabled = true) {
	return useQuery({
		queryKey: ["dashboard", "impayes"],
		queryFn: getImpayes,
		enabled,
		staleTime: DASHBOARD_STALE_TIME_MS,
	});
}

export function useReservationsSalleFutures(enabled = true) {
	return useQuery({
		queryKey: ["dashboard", "reservations-salle-futures"],
		queryFn: getReservationsSalleFutures,
		enabled,
		staleTime: DASHBOARD_STALE_TIME_MS,
	});
}
