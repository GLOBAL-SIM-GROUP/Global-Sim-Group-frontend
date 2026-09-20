import { hasPermission } from "#/core/permissions";

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
	role?: string,
	permissions: readonly string[] = [],
): NotificationRoute | null {
	const { event, data } = envelope;
	// Un compte CLIENT vit dans `/espace-client` ; un compte résident
	// authentifié (permission RESIDENT.VOIR, shell staff) vit dans
	// `/residence/portail`. Les événements « portail » pointent vers la vue du
	// compte concerné — jamais vers les pages staff, qui renverraient un 403
	// ou une redirection.
	const espaceClient = role === "CLIENT";
	const portailResident =
		!espaceClient && hasPermission(permissions, "RESIDENT.VOIR");

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
			if (!id) return null;
			if (espaceClient) return { to: `/espace-client/pressing/${id}` };
			if (portailResident) return { to: `/residence/portail/pressing/${id}` };
			return { to: `/pressing/commandes/${id}` };
		}

		case "pressing.commande.statut": {
			// Statut d'une demande de dépôt — résident (portail) ou staff.
			const id = asId(data.id_commande);
			if (!id) return null;
			if (espaceClient) return { to: `/espace-client/pressing/${id}` };
			if (portailResident) return { to: `/residence/portail/pressing/${id}` };
			return { to: `/pressing/commandes/${id}` };
		}

		case "restaurant.commande.statut": {
			const id = asId(data.id_commande);
			if (espaceClient)
				return id ? { to: `/espace-client/restaurant/${id}` } : null;
			if (portailResident)
				return id ? { to: `/residence/portail/restaurant/${id}` } : null;
			// Staff : pas de fiche commande dédiée — la liste suffit.
			return { to: "/restaurant/commandes" };
		}

		case "salle_fete.reservation.statut": {
			const id = asId(data.id_reservation);
			if (!id) return null;
			if (espaceClient) return { to: `/espace-client/salle-fete/${id}` };
			if (portailResident) return { to: `/residence/portail/salle-fete/${id}` };
			return { to: `/salle-fete/reservations/${id}` };
		}

		case "salle_fete.reservation_creee": {
			// Réservation directe staff — alerte staff (perm:SALLE_FETE.VOIR).
			const id = asId(data.id_reservation);
			return id ? { to: `/salle-fete/reservations/${id}` } : null;
		}

		case "market.vente.statut": {
			// Statut d'une demande boutique portail — résident ou staff.
			const id = asId(data.id_vente);
			if (espaceClient)
				return id ? { to: `/espace-client/boutique/${id}` } : null;
			if (portailResident)
				return id ? { to: `/residence/portail/boutique/${id}` } : null;
			// Staff : pas de fiche vente dédiée — la liste suffit.
			return { to: "/marchandise/ventes" };
		}

		case "market.demande_creee":
			// Nouvelle demande boutique — alerte staff uniquement.
			return { to: "/marchandise/ventes" };

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
