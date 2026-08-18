import { describe, expect, it } from "vitest";

import {
	type ContratJoin,
	calculerDateFinPrevue,
	filtrerContrats,
	paginerContrats,
} from "./contrats";

/** Fabrique un contrat joint minimal pour les tests. */
function contrat(overrides: Partial<ContratJoin> = {}): ContratJoin {
	return {
		id: "1",
		numero_contrat: "CON-2026-001",
		id_client: "10",
		id_logement: "8",
		date_debut: "2026-01-01",
		date_fin_prevue: null,
		duree_mois: null,
		type_location: "MENSUEL",
		montant_loyer: "40000",
		periodicite: "Mensuel",
		statut: "ACTIF",
		date_signature: null,
		clientNom: "KOUASSI Aya",
		logementNumero: "CH-102",
		...overrides,
	};
}

const contrats = [
	contrat({
		id: "1",
		numero_contrat: "CON-2026-001",
		clientNom: "KOUASSI Aya",
		logementNumero: "CH-102",
		date_debut: "2026-01-01",
		statut: "ACTIF",
	}),
	contrat({
		id: "2",
		numero_contrat: "CON-2026-002",
		clientNom: "BAMBA Oumar",
		logementNumero: "AP-301",
		date_debut: "2025-11-15",
		statut: "EN_ATTENTE",
	}),
	contrat({
		id: "3",
		numero_contrat: "CON-2025-010",
		clientNom: "KOUASSI Aya",
		logementNumero: "ME-401",
		date_debut: "2024-10-01",
		statut: "TERMINE",
	}),
];

describe("filtrerContrats", () => {
	it("retourne tout sans filtre", () => {
		expect(
			filtrerContrats(contrats, {
				statut: "tous",
				locataire: "",
				logement: "",
				du: "",
				au: "",
			}),
		).toHaveLength(3);
	});

	it("filtre par statut", () => {
		const result = filtrerContrats(contrats, {
			statut: "EN_ATTENTE",
			locataire: "",
			logement: "",
			du: "",
			au: "",
		});
		expect(result.map((item) => item.id)).toEqual(["2"]);
	});

	it("filtre par locataire (insensible à la casse)", () => {
		const result = filtrerContrats(contrats, {
			statut: "tous",
			locataire: "kouassi",
			logement: "",
			du: "",
			au: "",
		});
		expect(result.map((item) => item.id)).toEqual(["1", "3"]);
	});

	it("filtre par logement (numéro)", () => {
		const result = filtrerContrats(contrats, {
			statut: "tous",
			locataire: "",
			logement: "AP-301",
			du: "",
			au: "",
		});
		expect(result.map((item) => item.id)).toEqual(["2"]);
	});

	it("filtre par période (du/au sur date_debut)", () => {
		const result = filtrerContrats(contrats, {
			statut: "tous",
			locataire: "",
			logement: "",
			du: "2026-01-01",
			au: "2026-12-31",
		});
		expect(result.map((item) => item.id)).toEqual(["1"]);
	});

	it("combine statut et locataire", () => {
		const result = filtrerContrats(contrats, {
			statut: "TERMINE",
			locataire: "Aya",
			logement: "",
			du: "",
			au: "",
		});
		expect(result.map((item) => item.id)).toEqual(["3"]);
	});
});

describe("paginerContrats", () => {
	const pageSize = 2;

	it("pagine sur la première page", () => {
		const result = paginerContrats(contrats, 1, pageSize);
		expect(result.items.map((item) => item.id)).toEqual(["1", "2"]);
		expect(result.total).toBe(3);
		expect(result.totalPages).toBe(2);
		expect(result.start).toBe(1);
		expect(result.end).toBe(2);
	});

	it("borne la page au-delà du nombre total de pages", () => {
		const result = paginerContrats(contrats, 99, pageSize);
		expect(result.page).toBe(2);
		expect(result.items.map((item) => item.id)).toEqual(["3"]);
	});

	it("gère une liste vide (start = 0)", () => {
		const result = paginerContrats([], 1, pageSize);
		expect(result.items).toEqual([]);
		expect(result.total).toBe(0);
		expect(result.start).toBe(0);
	});
});

describe("calculerDateFinPrevue", () => {
	it("décale la date de début de la durée en mois, fin de mois d'arrivée", () => {
		expect(calculerDateFinPrevue("2026-01-01", 12)).toBe("2026-12-31");
		expect(calculerDateFinPrevue("2026-01-15", 12)).toBe("2026-12-31");
		expect(calculerDateFinPrevue("2026-02-01", 6)).toBe("2026-07-31");
	});

	it("retourne null sans durée valide", () => {
		expect(calculerDateFinPrevue("2026-01-01", null)).toBeNull();
		expect(calculerDateFinPrevue("2026-01-01", 0)).toBeNull();
	});

	it("retourne null si la date est invalide", () => {
		expect(calculerDateFinPrevue("pas-une-date", 12)).toBeNull();
	});
});
