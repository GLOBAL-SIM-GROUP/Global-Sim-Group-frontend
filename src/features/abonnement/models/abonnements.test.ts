import { describe, expect, it } from "vitest";

import { montantPositif, progressionConsommee } from "./abonnements";

describe("progressionConsommee", () => {
	it("calcule le ratio consommé (quota - solde) / quota", () => {
		expect(progressionConsommee("7.000", "10.000")).toBeCloseTo(0.3);
		expect(progressionConsommee("0", "10")).toBe(1);
		expect(progressionConsommee("10", "10")).toBe(0);
	});

	it("borne le ratio à [0, 1] même si le solde dépasse le quota (report entrant)", () => {
		expect(progressionConsommee("12", "10")).toBe(0);
	});

	it("borne à 1 si le solde est négatif", () => {
		expect(progressionConsommee("-2", "10")).toBe(1);
	});

	it("renvoie null si le quota est absent, nul ou négatif", () => {
		expect(progressionConsommee("5", "")).toBeNull();
		expect(progressionConsommee("5", "0")).toBeNull();
		expect(progressionConsommee("5", "-1")).toBeNull();
	});

	it("renvoie null si quota ou solde n'est pas numérique", () => {
		expect(progressionConsommee("5", "abc")).toBeNull();
		expect(progressionConsommee("abc", "10")).toBeNull();
	});
});

describe("montantPositif", () => {
	it("true seulement pour un montant réseau strictement positif", () => {
		expect(montantPositif("1500.00")).toBe(true);
		expect(montantPositif("0.01")).toBe(true);
	});

	it("false pour zéro, négatif, absent ou nul", () => {
		expect(montantPositif("0.00")).toBe(false);
		expect(montantPositif("-5")).toBe(false);
		expect(montantPositif(null)).toBe(false);
		expect(montantPositif(undefined)).toBe(false);
	});
});
