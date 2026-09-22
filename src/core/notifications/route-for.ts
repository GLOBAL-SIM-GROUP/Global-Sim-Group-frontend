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
	// authentifié (shell staff) vit dans `/residence/portail`. Les événements
	// « portail » pointent vers la vue du compte concerné — jamais vers les
	// pages staff, qui renverraient un 403 ou une redirection.
	// `portailServices` (PORTAIL.VOIR — migration backend 084) couvre les
	// pages des portails de service (restaurant/pressing/salle-fête/boutique) ;
	// `portailResident` (RESIDENT.VOIR) les pages du portail résidence
	// (échéances, caution…). Un compte RESIDENT réel détient les deux.
	const espaceClient = role === "CLIENT";
	const portailResident =
		!espaceClient && hasPermission(permissions, "RESIDENT.VOIR");
	const portailServices =
		!espaceClient &&
		(hasPermission(permissions, "PORTAIL.VOIR") || portailResident);

	switch (event) {
		case "signalement.cree":
		case "signalement.pris_en_charge":
		case "signalement.resolu":
		case "signalement.rejete": {
			const id = asId(data.id_signalement);
			return id ? { to: `/signalements/${id}` } : null;
		}

		case "restaurant.commande_creee":
			// Nouvelle commande (comptoir ou portail) — alerte staff : file des
			// demandes en attente de validation.
			return { to: "/restaurant/commandes", search: { statut: "EN_ATTENTE" } };

		case "pressing.retrait_depasse": {
			// Rappel quotidien : commande prête non retirée. `data` peut être un
			// récap `{count}` — sans id on renvoie vers la file des prêts.
			const id = asId(data.id_commande);
			if (id) return { to: `/pressing/commandes/${id}` };
			return { to: "/pressing/commandes", search: { statut: "PRET" } };
		}

		case "pressing.commande_prete": {
			const id = asId(data.id_commande);
			if (!id) return null;
			if (espaceClient) return { to: `/espace-client/pressing/${id}` };
			if (portailServices) return { to: `/residence/portail/pressing/${id}` };
			return { to: `/pressing/commandes/${id}` };
		}

		case "pressing.commande.statut": {
			// Statut d'une demande de dépôt — résident (portail) ou staff.
			const id = asId(data.id_commande);
			if (!id) return null;
			if (espaceClient) return { to: `/espace-client/pressing/${id}` };
			if (portailServices) return { to: `/residence/portail/pressing/${id}` };
			return { to: `/pressing/commandes/${id}` };
		}

		case "restaurant.commande.statut": {
			const id = asId(data.id_commande);
			if (espaceClient)
				return id ? { to: `/espace-client/restaurant/${id}` } : null;
			if (portailServices)
				return id ? { to: `/residence/portail/restaurant/${id}` } : null;
			// Staff : pas de fiche commande dédiée — la liste suffit.
			return { to: "/restaurant/commandes" };
		}

		case "salle_fete.reservation.statut": {
			const id = asId(data.id_reservation);
			if (!id) return null;
			if (espaceClient) return { to: `/espace-client/salle-fete/${id}` };
			if (portailServices) return { to: `/residence/portail/salle-fete/${id}` };
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
			if (portailServices)
				return id ? { to: `/residence/portail/boutique/${id}` } : null;
			// Staff : pas de fiche vente dédiée — la liste suffit.
			return { to: "/marchandise/ventes" };
		}

		case "market.demande_creee":
			// Nouvelle demande boutique — alerte staff uniquement.
			return { to: "/marchandise/ventes" };

		case "market.stock_bas":
		case "market.rupture_stock":
			// Pas de fiche produit dédiée côté frontend (seulement le catalogue) —
			// on renvoie vers la liste déjà filtrée sur les alertes de stock.
			return { to: "/marchandise/produits", search: { alerte: "alerte" } };

		case "salle_fete.evenement_proche_solde": {
			// Événement confirmé proche avec solde impayé — alerte staff ; `data`
			// peut être un récap `{count}` → file des réservations.
			const id = asId(data.id_reservation);
			return id
				? { to: `/salle-fete/reservations/${id}` }
				: { to: "/salle-fete/reservations" };
		}

		case "tirage.ecart":
		case "finances.tirage.ecart": {
			const id = asId(data.id_caisse);
			return id
				? { to: `/finances/caisses/${id}/dashboard` }
				: { to: "/finances/caisses" };
		}

		case "finances.caisse_non_fermee": {
			const id = asId(data.id_caisse);
			return id
				? { to: `/finances/caisses/${id}/dashboard` }
				: { to: "/finances/caisses" };
		}

		case "finances.impaye_nouveau":
			return { to: "/finances/impayes" };

		case "finances.depense_importante":
			// Pas de fiche dépense dédiée côté frontend — la liste suffit.
			return { to: "/finances/depenses" };

		case "paiement.important":
			// Pas de fiche paiement dédiée côté frontend — liste des encaissements.
			return { to: "/finances/encaissements" };

		case "residence.echeance_en_retard":
			// Échéance de loyer en retard — audience staff + résident concerné.
			if (espaceClient) return { to: "/espace-client/residence" };
			if (portailResident) return { to: "/residence/portail/echeances" };
			return { to: "/residence/echeances" };

		case "residence.contrat_expire_bientot": {
			const id = asId(data.id_contrat);
			if (espaceClient) return { to: "/espace-client/residence" };
			if (portailResident) return { to: "/residence/portail" };
			return id
				? { to: `/residence/contrats/${id}` }
				: { to: "/residence/contrats" };
		}

		case "residence.contrat_expire": {
			if (espaceClient) return { to: "/espace-client/residence" };
			if (portailResident) return { to: "/residence/portail" };
			const id = asId(data.id_client);
			return id
				? { to: `/client/clients/${id}` }
				: { to: "/residence/contrats" };
		}

		case "residence.sejour_demande_creee":
			// Nouvelle demande de séjour portail — alerte staff : file des
			// demandes en attente de validation (residence 087+088).
			return {
				to: "/residence/sejours-courts",
				search: { statut: "EN_ATTENTE" },
			};

		case "residence.sejour.statut": {
			// Statut d'une demande de séjour — client (espace client), résident
			// (portail) ou staff (fiche).
			const id = asId(data.id_sejour);
			if (!id) return null;
			if (espaceClient) return { to: `/espace-client/residence/${id}` };
			if (portailServices) return { to: `/residence/portail/sejours/${id}` };
			return { to: `/residence/sejours-courts/${id}` };
		}

		case "residence.sejour_depart_jour": {
			// Départ de séjour court aujourd'hui — alerte staff uniquement.
			const id = asId(data.id_sejour);
			return id
				? { to: `/residence/sejours-courts/${id}` }
				: { to: "/residence/sejours-courts" };
		}

		case "residence.charge_impayee":
			// Charge impayée — audience staff + résident concerné ; le portail
			// résident liste les échéances/charges sur la même page.
			if (espaceClient) return { to: "/espace-client/residence" };
			if (portailResident) return { to: "/residence/portail/echeances" };
			return { to: "/residence/charges" };

		case "residence.caution_a_restituter": {
			const id = asId(data.id_contrat);
			if (espaceClient) return { to: "/espace-client/residence" };
			if (portailResident) return { to: "/residence/portail/caution" };
			return id
				? { to: `/residence/contrats/${id}` }
				: { to: "/residence/contrats" };
		}

		case "signalement.en_retard": {
			const id = asId(data.id_signalement);
			return id ? { to: `/signalements/${id}` } : { to: "/signalements" };
		}

		case "rh.pointage_anomalie":
			return { to: "/rh/pointage" };

		case "rh.bulletins_prets":
			return { to: "/rh/bulletins" };

		case "admin.securite":
		case "job.echec":
			// Pas d'écran dédié à ces alertes — le journal d'audit centralise.
			return { to: "/admin/journal" };

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
