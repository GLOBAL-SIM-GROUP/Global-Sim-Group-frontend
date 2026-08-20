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

export function useSyntheseGlobale() {
	return useQuery({
		queryKey: ["dashboard", "synthese-globale"],
		queryFn: getSyntheseGlobale,
	});
}

export function useIndicateurActivite(code: string) {
	return useQuery({
		queryKey: ["dashboard", "activite", code],
		queryFn: () => getIndicateurActivite(code),
		enabled: !!code,
	});
}

export function useLogementsDispo() {
	return useQuery({
		queryKey: ["dashboard", "logements-dispo"],
		queryFn: getLogementsDispo,
	});
}

export function useProduitsCritiques() {
	return useQuery({
		queryKey: ["dashboard", "produits-critiques"],
		queryFn: getProduitsCritiques,
	});
}

export function useCommandesPressing() {
	return useQuery({
		queryKey: ["dashboard", "commandes-pressing"],
		queryFn: getCommandesPressing,
	});
}

export function useReservationsSalle() {
	return useQuery({
		queryKey: ["dashboard", "reservations-salle"],
		queryFn: getReservationsSalle,
	});
}

export function usePointagesAujourdhui() {
	return useQuery({
		queryKey: ["dashboard", "pointages-aujourd-hui"],
		queryFn: getPointagesAujourdhui,
	});
}

export function useImpayes() {
	return useQuery({
		queryKey: ["dashboard", "impayes"],
		queryFn: getImpayes,
	});
}
