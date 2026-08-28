import { useQuery } from "@tanstack/react-query";

import {
	getPortailCaution,
	getPortailEcheances,
	getPortailPaiements,
	getPortailResume,
	getRecuEcheance,
	getRecuPaiement,
} from "../api/portail";
import {
	cautionKeys,
	echeancesKeys,
	paiementsKeys,
	recuEcheanceKeys,
	recuPaiementKeys,
	resumeKeys,
} from "../permissions";

/**
 * Portail résident (M2.5) — le résident est déduit du token (403 sinon).
 * `enabled` (défaut `true`) : la sidebar le passe à `false` pour les
 * utilisateurs non-résidents, pour qui l'appel échouerait systématiquement.
 */
export function usePortailResume(enabled = true) {
	return useQuery({
		queryKey: resumeKeys.list(),
		queryFn: getPortailResume,
		enabled,
	});
}

export function usePortailEcheances() {
	return useQuery({
		queryKey: echeancesKeys.list(),
		queryFn: getPortailEcheances,
	});
}

export function usePortailPaiements() {
	return useQuery({
		queryKey: paiementsKeys.list(),
		queryFn: getPortailPaiements,
	});
}

export function usePortailCaution() {
	return useQuery({
		queryKey: cautionKeys.list(),
		queryFn: getPortailCaution,
	});
}

/** Reçu d'une échéance (modale). `enabled`: id non vide ; `retry:false`. */
export function useRecuEcheance(id: string | null) {
	return useQuery({
		queryKey: recuEcheanceKeys.detail(id ?? "aucun"),
		queryFn: () => getRecuEcheance(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Reçu d'un paiement (modale). `enabled`: id non vide ; `retry:false`. */
export function useRecuPaiement(id: string | null) {
	return useQuery({
		queryKey: recuPaiementKeys.detail(id ?? "aucun"),
		queryFn: () => getRecuPaiement(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}
