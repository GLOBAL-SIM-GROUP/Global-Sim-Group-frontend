import { useQuery } from "@tanstack/react-query";

import {
	getCommandesPressing,
	getImpayes,
	getIndicateurActivite,
	getLogementsDispo,
	getPointagesAujourdhui,
	getProduitsCritiques,
	getReservationsSalle,
	getSyntheseGlobale,
	type CommandePressing,
	type Impaye,
	type IndicateurActivite,
	type Pointage,
	type Produit,
	type Reservation,
	type SyntheseGlobale,
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

export function useReservationsSalle(du?: string, au?: string) {
	return useQuery({
		queryKey: ["dashboard", "reservations-salle", du, au],
		queryFn: () => getReservationsSalle(du, au),
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
