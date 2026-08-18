import { describe, expect, it } from "vitest";

import {
	type EcheanceSuivi,
	filtrerEcheances,
	paginerEcheances,
} from "./echeances";

/** Fabrique une ligne de suivi minimale pour les tests. */
function echeance(overrides: Partial<EcheanceSuivi> = {}): EcheanceSuivi {
	return {
		numero_contrat: "CON-2026-001",
		client: "KOUASSI Aya",
		logement: "CH-102",
		batiment: "A",
		mois: 1,
		annee: 2026,
		loyer_applique: "40000.00",
		date_echeance: "2026-01-01",
		statut: "PAYE",
		date_paiement: "2026-01-05 00:00:00",
		montant_paye: "40000.00",
		ancien_montant: null,
		nouveau_montant: null,
		date_effet_revision: null,
		...overrides,
	};
}

const echeances = [
	echeance({
		client: "KOUASSI Aya",
		mois: 1,
		date_echeance: "2026-01-01",
		statut: "PAYE",
	}),
	echeance({
		client: "BAMBA Oumar",
		mois: 2,
		date_echeance: "2026-02-01",
		statut: "IMPAYE",
	}),
	echeance({
		client: "KOUASSI Aya",
		mois: 3,
		date_echeance: "2026-03-01",
		statut: "PARTIEL",
	}),
];

describe("filtrerEcheances", () => {
	it("retourne tout sans filtre", () => {
		expect(
			filtrerEcheances(echeances, {
				statut: "tous",
				locataire: "",
				du: "",
				au: "",
			}),
		).toHaveLength(3);
	});

	it("filtre par statut", () => {
		const result = filtrerEcheances(echeances, {
			statut: "IMPAYE",
			locataire: "",
			du: "",
			au: "",
		});
		expect(result.map((item) => item.mois)).toEqual([2]);
	});

	it("filtre par locataire (insensible à la casse)", () => {
		const result = filtrerEcheances(echeances, {
			statut: "tous",
			locataire: "bamba",
			du: "",
			au: "",
		});
		expect(result.map((item) => item.mois)).toEqual([2]);
	});

	it("filtre par période (du/au sur date_echeance)", () => {
		const result = filtrerEcheances(echeances, {
			statut: "tous",
			locataire: "",
			du: "2026-02-01",
			au: "2026-02-28",
		});
		expect(result.map((item) => item.mois)).toEqual([2]);
	});

	it("combine statut et locataire", () => {
		const result = filtrerEcheances(echeances, {
			statut: "PARTIEL",
			locataire: "aya",
			du: "",
			au: "",
		});
		expect(result.map((item) => item.mois)).toEqual([3]);
	});
});

describe("paginerEcheances", () => {
	const pageSize = 2;

	it("pagine sur la première page", () => {
		const result = paginerEcheances(echeances, 1, pageSize);
		expect(result.items.map((item) => item.mois)).toEqual([1, 2]);
		expect(result.total).toBe(3);
		expect(result.totalPages).toBe(2);
		expect(result.start).toBe(1);
		expect(result.end).toBe(2);
	});

	it("borne la page au-delà du nombre total de pages", () => {
		const result = paginerEcheances(echeances, 99, pageSize);
		expect(result.page).toBe(2);
		expect(result.items.map((item) => item.mois)).toEqual([3]);
	});

	it("gère une liste vide (start = 0)", () => {
		const result = paginerEcheances([], 1, pageSize);
		expect(result.items).toEqual([]);
		expect(result.total).toBe(0);
		expect(result.start).toBe(0);
	});
});
