import { useState } from "react";

import { toApiError } from "#/core/api";

import { CODE_EXCEDENT } from "../models/abonnements";

/**
 * Message serveur si `error` est le 409 `ABONNEMENT_EXCEDENT` (dépassement de
 * quota abonnement — voir `CODE_EXCEDENT`), `null` sinon (erreur générique,
 * à traiter par l'appelant).
 */
export function messageSiExcedent(error: unknown): string | null {
	const apiError = toApiError(error);
	if (apiError.status === 409 && apiError.code === CODE_EXCEDENT) {
		return apiError.message || "Dépassement de quota abonnement.";
	}
	return null;
}

/**
 * État partagé du protocole « dépassement de quota abonnement » : une
 * première soumission peut être refusée en 409 `ABONNEMENT_EXCEDENT`, le
 * staff voit le message serveur et resoumet avec `accepter_excedent: true`.
 * Réutilisé par 3 formulaires (pressing dépôt/validation de demande,
 * restaurant dépôt de commande) qui répétaient exactement cette logique.
 *
 * Le hook ne porte que le drapeau « confirmé » — chaque appelant garde son
 * propre état d'erreur générique (`globalError`) plutôt que de le dupliquer
 * ici, pour ne pas imposer une forme d'affichage.
 */
export function useExcedentConfirmation() {
	const [confirme, setConfirme] = useState(false);

	/**
	 * À appeler dans le `catch` de la soumission : arme `confirme` si c'est le
	 * 409 attendu et renvoie son message ; renvoie `null` sinon — l'appelant
	 * doit alors afficher son propre message d'erreur générique.
	 */
	const detecter = (error: unknown): string | null => {
		const message = messageSiExcedent(error);
		if (message !== null) setConfirme(true);
		return message;
	};

	return {
		confirme,
		detecter,
		/** `accepter_excedent` à envoyer : déjà confirmé par un 409 précédent,
		 *  ou l'aperçu couverture l'annonce déjà (le staff l'a vu avant de
		 *  soumettre). */
		accepterExcedent: (excedentApercu?: boolean) =>
			confirme || excedentApercu === true,
		reinitialiser: () => setConfirme(false),
	};
}
