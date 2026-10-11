import { describe, expect, it } from "vitest";

import {
	idsLogementsDemandesSurPeriode,
	idsLogementsOccupesSurPeriode,
} from "./occupation";

const sejour = (
	id_logement: string,
	arrivee: string,
	depart: string | null,
) => ({
	id_logement,
	date_heure_arrivee: arrivee,
	date_heure_depart_prevue: depart,
});

const contrat = (id_logement: string, debut: string, fin: string | null) => ({
	id_logement,
	date_debut: debut,
	date_fin_prevue: fin,
});

const DEBUT = "2026-10-10 14:00:00";
const FIN = "2026-10-12 11:00:00";

describe("idsLogementsOccupesSurPeriode", () => {
	it("exclut un séjour EN_COURS chevauchant la période", () => {
		const occupes = idsLogementsOccupesSurPeriode(
			[sejour("1", "2026-10-09 14:00:00", "2026-10-11 12:00:00")],
			[],
			DEBUT,
			FIN,
		);
		expect(occupes.has("1")).toBe(true);
	});

	it("inclut un séjour qui se termine le jour de l'arrivée mais avant l'heure demandée", () => {
		// Comparaison datetime (mesurée backend) : départ 10-10 12:00,
		// arrivée demandée 10-10 14:00 → pas de chevauchement.
		const occupes = idsLogementsOccupesSurPeriode(
			[sejour("1", "2026-10-08 14:00:00", "2026-10-10 12:00:00")],
			[],
			DEBUT,
			FIN,
		);
		expect(occupes.has("1")).toBe(false);
	});

	it("exclut un séjour qui se termine le jour de l'arrivée mais APRÈS l'heure demandée", () => {
		// Départ 10-10 18:00 > arrivée demandée 10-10 14:00 → chevauchement.
		const occupes = idsLogementsOccupesSurPeriode(
			[sejour("1", "2026-10-08 14:00:00", "2026-10-10 18:00:00")],
			[],
			DEBUT,
			FIN,
		);
		expect(occupes.has("1")).toBe(true);
	});

	it("exclut un séjour EN_COURS sans départ prévu (occupation ouverte)", () => {
		const occupes = idsLogementsOccupesSurPeriode(
			[sejour("1", "2026-10-01 14:00:00", null)],
			[],
			DEBUT,
			FIN,
		);
		expect(occupes.has("1")).toBe(true);
	});

	it("ignore un séjour entièrement avant la période", () => {
		const occupes = idsLogementsOccupesSurPeriode(
			[sejour("1", "2026-10-01 14:00:00", "2026-10-05 12:00:00")],
			[],
			DEBUT,
			FIN,
		);
		expect(occupes.size).toBe(0);
	});

	it("exclut un logement sous contrat ACTIF sans fin couvrant la période", () => {
		const occupes = idsLogementsOccupesSurPeriode(
			[],
			[contrat("10", "2026-08-24", null)],
			DEBUT,
			FIN,
		);
		expect(occupes.has("10")).toBe(true);
	});

	it("ignore un contrat terminé avant la période", () => {
		const occupes = idsLogementsOccupesSurPeriode(
			[],
			[contrat("10", "2025-01-01", "2026-09-30")],
			DEBUT,
			FIN,
		);
		expect(occupes.size).toBe(0);
	});

	it("ignore un contrat commençant après la période", () => {
		const occupes = idsLogementsOccupesSurPeriode(
			[],
			[contrat("10", "2026-11-01", null)],
			DEBUT,
			FIN,
		);
		expect(occupes.size).toBe(0);
	});

	it("accepte le format datetime-local (T) en entrée", () => {
		const occupes = idsLogementsOccupesSurPeriode(
			[sejour("1", "2026-10-10T15:00", "2026-10-11T11:00")],
			[],
			"2026-10-10T14:00",
			"2026-10-12T11:00",
		);
		expect(occupes.has("1")).toBe(true);
	});
});

describe("idsLogementsDemandesSurPeriode", () => {
	it("signale un logement avec demande EN_ATTENTE chevauchante", () => {
		const demandes = idsLogementsDemandesSurPeriode(
			[sejour("66", "2026-10-11 14:00:00", "2026-10-13 11:00:00")],
			DEBUT,
			FIN,
		);
		expect(demandes.has("66")).toBe(true);
	});

	it("ignore une demande EN_ATTENTE hors période", () => {
		const demandes = idsLogementsDemandesSurPeriode(
			[sejour("66", "2026-10-20 14:00:00", "2026-10-21 11:00:00")],
			DEBUT,
			FIN,
		);
		expect(demandes.size).toBe(0);
	});
});
