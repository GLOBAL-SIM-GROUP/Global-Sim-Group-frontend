import { describe, expect, it } from "vitest";

import type { ReservationFete } from "./reservations";
import {
	construireGrilleMois,
	dernierJourMois,
	reservationsPourJour,
} from "./reservations";

describe("construireGrilleMois", () => {
	it("construit toujours 42 cellules, la première étant un lundi", () => {
		const grille = construireGrilleMois(2026, 8);
		expect(grille).toHaveLength(42);
		expect(new Date(grille[0].date).getDay()).toBe(1); // lundi
		const dates = new Set(grille.map((jour) => jour.date));
		expect(dates.size).toBe(42); // dates contiguës, toutes uniques
	});

	it("marque les jours de débordement des mois voisins (août 2026)", () => {
		const grille = construireGrilleMois(2026, 8);
		// Août 2026 commence un samedi : grille du 27/07 au 06/09.
		expect(grille[0].date).toBe("2026-07-27");
		expect(grille.at(-1)?.date).toBe("2026-09-06");
		expect(grille.filter((jour) => jour.horsMois)).toHaveLength(11);
		expect(grille.find((jour) => jour.date === "2026-08-01")?.horsMois).toBe(
			false,
		);
		expect(grille.find((jour) => jour.date === "2026-07-31")?.horsMois).toBe(
			true,
		);
	});

	it("couvre un mois de 29 jours (février 2024, bissextile)", () => {
		const grille = construireGrilleMois(2024, 2);
		expect(grille[0].date).toBe("2024-01-29");
		expect(grille.some((jour) => jour.date === "2024-02-29")).toBe(true);
		expect(grille.filter((jour) => jour.horsMois)).toHaveLength(13);
	});
});

describe("reservationsPourJour", () => {
	it("retourne uniquement les réservations du jour demandé", () => {
		const reservations: ReservationFete[] = [
			{
				id: "1",
				id_client: "7",
				date_evenement: "2026-08-22",
				heure_debut: "15:00:00",
				duree: 4,
				type_manifestation: "Baptême",
				tarif: "200000.00",
				acompte: "100000.00",
				solde: "100000.00",
				statut: "CONFIRMEE",
				observations: null,
			},
			{
				id: "2",
				id_client: null,
				date_evenement: "2026-08-23",
				heure_debut: "10:00:00",
				duree: 2,
				type_manifestation: "Anniversaire",
				tarif: "80000.00",
				acompte: "0.00",
				solde: "80000.00",
				statut: "RESERVEE",
				observations: null,
			},
		];
		expect(reservationsPourJour(reservations, "2026-08-22")).toHaveLength(1);
		expect(reservationsPourJour(reservations, "2026-08-22")[0].id).toBe("1");
		expect(reservationsPourJour(reservations, "2026-08-24")).toHaveLength(0);
	});
});

describe("dernierJourMois", () => {
	it("retourne 31 pour août 2026 et 29 pour février 2024 (bissextile)", () => {
		expect(dernierJourMois(2026, 8)).toBe(31);
		expect(dernierJourMois(2024, 2)).toBe(29);
		expect(dernierJourMois(2026, 2)).toBe(28);
	});
});
