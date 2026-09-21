import { describe, expect, it } from "vitest";

import { routeFor } from "./route-for";
import type { NotificationEnvelope } from "./types";

function envelope(
	event: string,
	data: Record<string, unknown> = {},
): NotificationEnvelope {
	return {
		id: "n1",
		event,
		priority: "MEDIUM",
		timestamp: "2026-08-29T10:00:00.000Z",
		data,
		message: { title: "Titre", body: "Corps" },
		recipients: { rooms: [], userIds: [] },
	};
}

describe("routeFor", () => {
	it.each([
		"signalement.cree",
		"signalement.pris_en_charge",
		"signalement.resolu",
		"signalement.rejete",
	])("%s -> /signalements/{id}", (event) => {
		expect(routeFor(envelope(event, { id_signalement: "42" }))).toEqual({
			to: "/signalements/42",
		});
	});

	it("pressing.commande_prete -> /pressing/commandes/{id}", () => {
		expect(
			routeFor(envelope("pressing.commande_prete", { id_commande: "7" })),
		).toEqual({ to: "/pressing/commandes/7" });
	});

	it("salle_fete.reservation.statut -> détail réservation selon le compte", () => {
		expect(
			routeFor(
				envelope("salle_fete.reservation.statut", { id_reservation: "9" }),
				"CLIENT",
			),
		).toEqual({ to: "/espace-client/salle-fete/9" });
		expect(
			routeFor(
				envelope("salle_fete.reservation.statut", { id_reservation: "9" }),
				undefined,
				["PORTAIL.VOIR"],
			),
		).toEqual({ to: "/residence/portail/salle-fete/9" });
		expect(
			routeFor(
				envelope("salle_fete.reservation.statut", { id_reservation: "9" }),
			),
		).toEqual({ to: "/salle-fete/reservations/9" });
	});

	it("salle_fete.reservation_creee -> fiche réservation staff", () => {
		expect(
			routeFor(
				envelope("salle_fete.reservation_creee", { id_reservation: "9" }),
			),
		).toEqual({ to: "/salle-fete/reservations/9" });
		expect(routeFor(envelope("salle_fete.reservation_creee", {}))).toBeNull();
	});

	it("market.vente.statut -> détail boutique pour un compte CLIENT", () => {
		expect(
			routeFor(envelope("market.vente.statut", { id_vente: "12" }), "CLIENT", [
				"PORTAIL.VOIR",
			]),
		).toEqual({ to: "/espace-client/boutique/12" });
	});

	it("market.vente.statut -> détail boutique portail pour un résident", () => {
		// Contrat market 085 : PORTAIL.VOIR (RESIDENT.VOIR reste toléré — les
		// comptes résidents détiennent les deux).
		expect(
			routeFor(envelope("market.vente.statut", { id_vente: "12" }), undefined, [
				"PORTAIL.VOIR",
			]),
		).toEqual({ to: "/residence/portail/boutique/12" });
		expect(
			routeFor(envelope("market.vente.statut", { id_vente: "12" }), undefined, [
				"RESIDENT.VOIR",
			]),
		).toEqual({ to: "/residence/portail/boutique/12" });
	});

	it("market.vente.statut -> liste des ventes pour le staff", () => {
		expect(
			routeFor(envelope("market.vente.statut", { id_vente: "12" })),
		).toEqual({ to: "/marchandise/ventes" });
	});

	it("market.demande_creee -> liste des ventes (alerte staff)", () => {
		expect(
			routeFor(envelope("market.demande_creee", { id_vente: "12" })),
		).toEqual({ to: "/marchandise/ventes" });
	});

	it("market.stock_bas -> catalogue filtré sur les alertes (pas de fiche produit)", () => {
		expect(routeFor(envelope("market.stock_bas", { id_produit: "9" }))).toEqual(
			{ to: "/marchandise/produits", search: { alerte: "alerte" } },
		);
	});

	it.each([
		"tirage.ecart",
		"finances.tirage.ecart",
	])("%s -> /finances/caisses/{id}/dashboard", (event) => {
		expect(routeFor(envelope(event, { id_caisse: "3" }))).toEqual({
			to: "/finances/caisses/3/dashboard",
		});
	});

	it("paiement.important -> liste des encaissements (pas de fiche paiement)", () => {
		expect(
			routeFor(envelope("paiement.important", { id_paiement: "5" })),
		).toEqual({ to: "/finances/encaissements" });
	});

	it("residence.contrat_expire -> /client/clients/{id} (staff), portail pour un résident", () => {
		expect(
			routeFor(envelope("residence.contrat_expire", { id_client: "11" })),
		).toEqual({ to: "/client/clients/11" });
		expect(
			routeFor(
				envelope("residence.contrat_expire", { id_client: "11" }),
				"CLIENT",
			),
		).toEqual({ to: "/espace-client/residence" });
		expect(
			routeFor(
				envelope("residence.contrat_expire", { id_client: "11" }),
				undefined,
				["RESIDENT.VOIR"],
			),
		).toEqual({ to: "/residence/portail" });
		// Sans id_client (récap {count}) : repli sur la liste des contrats.
		expect(routeFor(envelope("residence.contrat_expire"))).toEqual({
			to: "/residence/contrats",
		});
	});

	it("restaurant.commande_creee -> file EN_ATTENTE staff", () => {
		expect(
			routeFor(envelope("restaurant.commande_creee", { id_commande: "4" })),
		).toEqual({
			to: "/restaurant/commandes",
			search: { statut: "EN_ATTENTE" },
		});
	});

	it("pressing.retrait_depasse -> fiche commande ou file des prêts (récap)", () => {
		expect(
			routeFor(envelope("pressing.retrait_depasse", { id_commande: "7" })),
		).toEqual({ to: "/pressing/commandes/7" });
		expect(
			routeFor(envelope("pressing.retrait_depasse", { count: 3 })),
		).toEqual({ to: "/pressing/commandes", search: { statut: "PRET" } });
	});

	it("salle_fete.evenement_proche_solde -> fiche ou liste réservations", () => {
		expect(
			routeFor(
				envelope("salle_fete.evenement_proche_solde", { id_reservation: "9" }),
			),
		).toEqual({ to: "/salle-fete/reservations/9" });
		expect(
			routeFor(envelope("salle_fete.evenement_proche_solde", { count: 2 })),
		).toEqual({ to: "/salle-fete/reservations" });
	});

	it("market.rupture_stock -> catalogue filtré sur les alertes", () => {
		expect(
			routeFor(envelope("market.rupture_stock", { id_produit: "9" })),
		).toEqual({ to: "/marchandise/produits", search: { alerte: "alerte" } });
	});

	it("residence.echeance_en_retard -> échéances staff, portail pour un résident", () => {
		expect(routeFor(envelope("residence.echeance_en_retard"))).toEqual({
			to: "/residence/echeances",
		});
		expect(
			routeFor(
				envelope("residence.echeance_en_retard", { id_echeance: "3" }),
				undefined,
				["RESIDENT.VOIR"],
			),
		).toEqual({ to: "/residence/portail/echeances" });
	});

	it("residence.contrat_expire_bientot -> fiche contrat ou liste", () => {
		expect(
			routeFor(
				envelope("residence.contrat_expire_bientot", { id_contrat: "6" }),
			),
		).toEqual({ to: "/residence/contrats/6" });
		expect(routeFor(envelope("residence.contrat_expire_bientot"))).toEqual({
			to: "/residence/contrats",
		});
	});

	it("residence.sejour_depart_jour -> fiche séjour ou liste", () => {
		expect(
			routeFor(envelope("residence.sejour_depart_jour", { id_sejour: "2" })),
		).toEqual({ to: "/residence/sejours-courts/2" });
		expect(
			routeFor(envelope("residence.sejour_depart_jour", { count: 4 })),
		).toEqual({ to: "/residence/sejours-courts" });
	});

	it("residence.charge_impayee -> charges staff, échéances portail", () => {
		expect(routeFor(envelope("residence.charge_impayee"))).toEqual({
			to: "/residence/charges",
		});
		expect(
			routeFor(envelope("residence.charge_impayee"), undefined, [
				"RESIDENT.VOIR",
			]),
		).toEqual({ to: "/residence/portail/echeances" });
	});

	it("residence.caution_a_restituter -> contrat staff, caution portail", () => {
		expect(
			routeFor(envelope("residence.caution_a_restituter", { id_contrat: "6" })),
		).toEqual({ to: "/residence/contrats/6" });
		expect(
			routeFor(envelope("residence.caution_a_restituter"), undefined, [
				"RESIDENT.VOIR",
			]),
		).toEqual({ to: "/residence/portail/caution" });
	});

	it.each([
		[
			"finances.caisse_non_fermee",
			{ id_caisse: "3" },
			{ to: "/finances/caisses/3/dashboard" },
		],
		["finances.caisse_non_fermee", { count: 2 }, { to: "/finances/caisses" }],
		[
			"finances.impaye_nouveau",
			{ id_facture: "8" },
			{ to: "/finances/impayes" },
		],
		[
			"finances.depense_importante",
			{ id_depense: "1" },
			{ to: "/finances/depenses" },
		],
		["rh.pointage_anomalie", { id_employe: "4" }, { to: "/rh/pointage" }],
		["rh.bulletins_prets", { periode: "2026-08" }, { to: "/rh/bulletins" }],
		["admin.securite", { ip: "1.2.3.4" }, { to: "/admin/journal" }],
		["job.echec", { job: "sauvegarde" }, { to: "/admin/journal" }],
	] as const)("%s -> %j", (event, data, attendu) => {
		expect(routeFor(envelope(event, data))).toEqual(attendu);
	});

	it("signalement.en_retard -> fiche ou liste", () => {
		expect(
			routeFor(envelope("signalement.en_retard", { id_signalement: "5" })),
		).toEqual({ to: "/signalements/5" });
		expect(routeFor(envelope("signalement.en_retard", { count: 2 }))).toEqual({
			to: "/signalements",
		});
	});

	it("sauvegarde.echec -> historique des sauvegardes (pas de fiche par sauvegarde)", () => {
		expect(
			routeFor(envelope("sauvegarde.echec", { id_sauvegarde: "1" })),
		).toEqual({ to: "/admin/sauvegardes" });
	});

	it("rh.paie.payee -> null (pas de vue self-service employé)", () => {
		expect(
			routeFor(envelope("rh.paie.payee", { id_employe: "2", id_paie: "8" })),
		).toBeNull();
	});

	it("événement inconnu -> null (pas une erreur)", () => {
		expect(routeFor(envelope("evenement.futur.non_gere"))).toBeNull();
	});

	it.each([
		"signalement.resolu",
		"pressing.commande_prete",
	])("%s sans id attendu dans data -> null (pas d'URL avec undefined)", (event) => {
		expect(routeFor(envelope(event, {}))).toBeNull();
	});

	it("accepte un id numérique (coercition en string)", () => {
		expect(
			routeFor(envelope("signalement.resolu", { id_signalement: 42 })),
		).toEqual({ to: "/signalements/42" });
	});
});
