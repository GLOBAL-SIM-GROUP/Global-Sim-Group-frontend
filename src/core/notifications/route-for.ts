import type { NotificationEnvelope } from "./types";

export interface NotificationRoute {
	to: string;
	search?: Record<string, string>;
}

/** Extrait un id exploitable dans une URL (string ou number côté backend). */
function asId(value: unknown): string | null {
	if (typeof value === "string" && value.length > 0) return value;
	if (typeof value === "number" && Number.isFinite(value)) return String(value);
	return null;
}

/**
 * Déduit la route de destination d'une notification à partir de `event` +
 * `data` — l'enveloppe backend ne porte volontairement aucun champ route
 * (décision produit : inférence côté frontend). Un seul point d'entrée,
 * gardé volontairement isolé : ajouter un nouveau type d'événement est un
 * changement d'une ligne ici, rien à toucher côté UI.
 *
 * Retourne `null` quand :
 * - le type d'événement est inconnu (événement futur, pas une erreur) ;
 * - le champ id attendu est absent/invalide (donnée backend incomplète —
 *   mieux vaut ne pas naviguer que produire une URL avec "undefined") ;
 * - aucune page self-service n'existe encore pour ce destinataire (ex.
 *   `rh.paie.payee` : pas de vue "mon bulletin" pour un employé, toutes les
 *   routes RH exigent RH.VOIR que l'employé n'a pas — ne PAS renvoyer une
 *   page admin sur laquelle il recevrait un 403).
 */
export function routeFor(
	envelope: NotificationEnvelope,
): NotificationRoute | null {
	const { event, data } = envelope;

	switch (event) {
		case "signalement.cree":
		case "signalement.pris_en_charge":
		case "signalement.resolu":
		case "signalement.rejete": {
			const id = asId(data.id_signalement);
			return id ? { to: `/signalements/${id}` } : null;
		}

		case "pressing.commande_prete": {
			const id = asId(data.id_commande);
			return id ? { to: `/pressing/commandes/${id}` } : null;
		}

		case "market.stock_bas":
			// Pas de fiche produit dédiée côté frontend (seulement le catalogue) —
			// on renvoie vers la liste déjà filtrée sur les alertes de stock.
			return { to: "/marchandise/produits", search: { alerte: "alerte" } };

		case "tirage.ecart":
		case "finances.tirage.ecart": {
			const id = asId(data.id_caisse);
			return id ? { to: `/finances/caisses/${id}/dashboard` } : null;
		}

		case "paiement.important":
			// Pas de fiche paiement dédiée côté frontend — liste des encaissements.
			return { to: "/finances/encaissements" };

		case "residence.contrat_expire": {
			const id = asId(data.id_client);
			return id ? { to: `/client/clients/${id}` } : null;
		}

		case "sauvegarde.echec":
			// Pas de fiche par sauvegarde côté frontend — liste/historique.
			return { to: "/admin/sauvegardes" };

		case "rh.paie.payee":
			// Aucune vue self-service "mon bulletin" pour un employé (toutes les
			// routes RH exigent RH.VOIR) — ne pas rediriger vers une page admin
			// où l'employé recevrait un 403. Pas de destination pour l'instant.
			return null;

		default:
			// Type d'événement inconnu (futur) : pas de navigation, pas une erreur.
			return null;
	}
}
