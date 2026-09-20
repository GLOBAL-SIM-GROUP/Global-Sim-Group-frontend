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
				["RESIDENT.VOIR"],
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
				"RESIDENT.VOIR",
			]),
		).toEqual({ to: "/espace-client/boutique/12" });
	});

	it("market.vente.statut -> détail boutique portail pour un résident", () => {
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

	it("residence.contrat_expire -> /client/clients/{id}", () => {
		expect(
			routeFor(envelope("residence.contrat_expire", { id_client: "11" })),
		).toEqual({ to: "/client/clients/11" });
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
		"tirage.ecart",
		"residence.contrat_expire",
	])("%s sans id attendu dans data -> null (pas d'URL avec undefined)", (event) => {
		expect(routeFor(envelope(event, {}))).toBeNull();
	});

	it("accepte un id numérique (coercition en string)", () => {
		expect(
			routeFor(envelope("signalement.resolu", { id_signalement: 42 })),
		).toEqual({ to: "/signalements/42" });
	});
});
