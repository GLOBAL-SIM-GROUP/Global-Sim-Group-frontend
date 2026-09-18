import { describe, expect, it } from "vitest";

import {
	apercuTotalLignePoids,
	type LigneSaisiePressing,
	validerLignePressing,
} from "./commandes";

function ligne(
	overrides: Partial<LigneSaisiePressing> = {},
): LigneSaisiePressing {
	return {
		typeVetement: "Chemise",
		quantite: "1",
		prestation: "Repassage",
		...overrides,
	};
}

describe("validerLignePressing", () => {
	it("accepte une ligne UNITAIRE valide (tarif, pas de poids)", () => {
		expect(
			validerLignePressing(ligne({ tarif: "1000" }), "UNITAIRE"),
		).toBeNull();
	});

	it("accepte une ligne POIDS valide (poids, pas de tarif)", () => {
		expect(
			validerLignePressing(ligne({ poidsKg: "4.500" }), "POIDS"),
		).toBeNull();
	});

	it("refuse une ligne UNITAIRE sans tarif", () => {
		expect(validerLignePressing(ligne(), "UNITAIRE")).not.toBeNull();
	});

	it("refuse une ligne POIDS sans poids", () => {
		expect(validerLignePressing(ligne(), "POIDS")).not.toBeNull();
	});

	it("refuse un poids sur une ligne UNITAIRE (mutuelle exclusivité)", () => {
		expect(
			validerLignePressing(ligne({ tarif: "1000", poidsKg: "2" }), "UNITAIRE"),
		).not.toBeNull();
	});

	it("refuse un tarif sur une ligne POIDS (mutuelle exclusivité)", () => {
		expect(
			validerLignePressing(ligne({ poidsKg: "2", tarif: "1000" }), "POIDS"),
		).not.toBeNull();
	});

	it("refuse un tarif ou un poids négatif/nul", () => {
		expect(
			validerLignePressing(ligne({ tarif: "0" }), "UNITAIRE"),
		).not.toBeNull();
		expect(
			validerLignePressing(ligne({ poidsKg: "0" }), "POIDS"),
		).not.toBeNull();
	});

	it("refuse une quantité non positive quel que soit le mode", () => {
		expect(
			validerLignePressing(ligne({ quantite: "0", tarif: "1000" }), "UNITAIRE"),
		).not.toBeNull();
	});

	it("refuse un type de vêtement ou une prestation manquants", () => {
		expect(
			validerLignePressing(
				ligne({ typeVetement: "", tarif: "1000" }),
				"UNITAIRE",
			),
		).not.toBeNull();
		expect(
			validerLignePressing(
				ligne({ prestation: "", tarif: "1000" }),
				"UNITAIRE",
			),
		).not.toBeNull();
	});
});

describe("apercuTotalLignePoids", () => {
	it("multiplie le poids par le tarif/kg courant", () => {
		expect(apercuTotalLignePoids("4.5", "1500")).toBe(6750);
	});

	it("renvoie null si le poids est vide, invalide ou nul", () => {
		expect(apercuTotalLignePoids("", "1500")).toBeNull();
		expect(apercuTotalLignePoids("abc", "1500")).toBeNull();
		expect(apercuTotalLignePoids("0", "1500")).toBeNull();
	});

	it("renvoie null si aucun tarif/kg n'est configuré", () => {
		expect(apercuTotalLignePoids("4.5", null)).toBeNull();
		expect(apercuTotalLignePoids("4.5", undefined)).toBeNull();
	});
});
