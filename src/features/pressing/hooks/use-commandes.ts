import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
	annulerCommande,
	creerCommande,
	getCommande,
	listCommandes,
	type ModifierCommandeBody,
	modifierCommande,
	pretCommande,
	retirerCommande,
	traitementCommande,
	type ValiderDemandeBody,
	validerDemande,
} from "../api/commandes";
import { definirTarifKg, getTarifKg } from "../api/tarif-kg";
import { commandesKeys, tarifKgKeys } from "../permissions";

/** Liste des commandes, avec les filtres serveur portés par la clé. */
export function useCommandes(
	statut: string,
	du?: string,
	au?: string,
	recherche?: string,
) {
	return useQuery({
		queryKey: commandesKeys.list(statut, du, au, recherche),
		queryFn: () =>
			listCommandes({ statut, du, au, recherche: recherche || undefined }),
	});
}

/**
 * Nombre de demandes de dépôt `EN_ATTENTE` (badge nav). `refetchInterval` :
 * filet de sécurité — l'invalidation via `pressing.commande.statut` couvre
 * déjà le rafraîchissement temps réel.
 */
export function useCommandesEnAttenteCount(enabled: boolean) {
	return useQuery({
		queryKey: commandesKeys.list("EN_ATTENTE"),
		queryFn: () => listCommandes({ statut: "EN_ATTENTE" }),
		enabled,
		select: (data) => data.length,
		refetchInterval: 60_000,
	});
}

/** Détail d'une commande (lignes embarquées). `retry: false` : 404 = introuvable. */
export function useCommande(id: string | undefined) {
	return useQuery({
		queryKey: commandesKeys.detail(id ?? "aucun"),
		queryFn: () => getCommande(id as string),
		enabled: Boolean(id),
		retry: false,
	});
}

/** Invalide la liste des commandes après une mutation. */
function useInvalidation() {
	const queryClient = useQueryClient();
	return () => {
		void queryClient.invalidateQueries({ queryKey: commandesKeys.all });
	};
}

/** Enregistre un dépôt (POST). */
export function useCreerCommande() {
	const invalider = useInvalidation();
	return useMutation({ mutationFn: creerCommande, onSuccess: invalider });
}

/** Modifie une commande (PATCH). */
export function useModifierCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, ...body }: ModifierCommandeBody & { id: string }) =>
			modifierCommande(id, body),
		onSuccess: invalider,
	});
}

/** Passe la commande en traitement. */
export function useTraitementCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => traitementCommande(id),
		onSuccess: invalider,
	});
}

/** Passe la commande en « Prêt ». */
export function usePretCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => pretCommande(id),
		onSuccess: invalider,
	});
}

/** Retire la commande + encaisse le solde. */
export function useRetirerCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({
			id,
			...body
		}: {
			id: string;
			solde: string;
			idMoyen?: string;
		}) => retirerCommande(id, body),
		onSuccess: invalider,
	});
}

/** Valide et chiffre une demande `EN_ATTENTE` (→ `DEPOSE`, PRESSING.CREER). */
export function useValiderDemande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: ({ id, ...body }: ValiderDemandeBody & { id: string }) =>
			validerDemande(id, body),
		onSuccess: invalider,
	});
}

/** Annule une commande. */
export function useAnnulerCommande() {
	const invalider = useInvalidation();
	return useMutation({
		mutationFn: (id: string) => annulerCommande(id),
		onSuccess: invalider,
	});
}

/**
 * Tarif au kilo courant. `data === null` (pas d'erreur) = jamais configuré —
 * état normal avant la première utilisation du mode `POIDS`, voir
 * `getTarifKg`. `enabled` (défaut `true`) permet de le charger seulement
 * quand nécessaire (ex. mode `POIDS` sélectionné dans le formulaire de
 * dépôt), sans l'imposer à tous les écrans du module.
 */
export function useTarifKg(enabled = true) {
	return useQuery({
		queryKey: tarifKgKeys.list(),
		queryFn: getTarifKg,
		enabled,
	});
}

/** Ajoute un nouveau tarif au kilo courant (append-only, pas de mise à jour). */
export function useDefinirTarifKg() {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (prixKg: string) => definirTarifKg(prixKg),
		onSuccess: () => {
			void queryClient.invalidateQueries({ queryKey: tarifKgKeys.all });
		},
	});
}
