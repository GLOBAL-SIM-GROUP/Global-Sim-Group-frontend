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

export function useSyntheseGlobale(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "synthese-globale", du, au],
		queryFn: () => getSyntheseGlobale(du, au),
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

export function useLogementsDispo(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "logements-dispo", du, au],
		queryFn: () => getLogementsDispo(du, au),
	});
}

export function useProduitsCritiques(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "produits-critiques", du, au],
		queryFn: () => getProduitsCritiques(du, au),
	});
}

export function useCommandesPressing(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "commandes-pressing", du, au],
		queryFn: () => getCommandesPressing(du, au),
	});
}

export function usePointagesAujourdhui(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "pointages-aujourd-hui", du, au],
		queryFn: () => getPointagesAujourdhui(du, au),
	});
}

export function useImpayes(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "impayes", du, au],
		queryFn: () => getImpayes(du, au),
	});
}

export function useReservationsSalleFutures() {
	return useQuery({
		queryKey: ["dashboard", "reservations-salle-futures"],
		queryFn: () => getReservationsSalleFutures(),
	});
}
