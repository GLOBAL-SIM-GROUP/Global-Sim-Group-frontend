import { describe, expect, it } from "vitest";

import { normaliserMontantPourBackend, validerMontant } from "./montant";

describe("validerMontant", () => {
	it("accepte un entier simple", () => {
		expect(validerMontant("65000")).toBeNull();
	});

	it("accepte une décimale avec un point", () => {
		expect(validerMontant("65000.50")).toBeNull();
		expect(validerMontant("65000.5")).toBeNull();
	});

	it("accepte un séparateur de milliers avec espaces", () => {
		expect(validerMontant("65 000")).toBeNull();
	});

	it("accepte un séparateur de milliers avec point (65.000 → 65000)", () => {
		expect(validerMontant("65.000")).toBeNull();
	});

	it("accepte une valeur vide (le caractère requis est géré ailleurs)", () => {
		expect(validerMontant("")).toBeNull();
		expect(validerMontant("   ")).toBeNull();
	});

	it("rejette une virgule décimale avec un message explicite", () => {
		const erreur = validerMontant("65,000");
		expect(erreur).toContain("virgule");
		expect(erreur).toContain("point");
	});

	it("rejette plus de 2 décimales", () => {
		const erreur = validerMontant("65000.123");
		expect(erreur).toContain("2 décimales");
	});

	it("rejette du texte non numérique", () => {
		const erreur = validerMontant("abc");
		expect(erreur).toContain("doit être un nombre");
	});

	it("utilise le libellé personnalisé dans le message", () => {
		const erreur = validerMontant("abc", "Le tarif");
		expect(erreur).toContain("Le tarif");
	});
});

describe("normaliserMontantPourBackend", () => {
	it("retire les espaces séparateurs de milliers", () => {
		expect(normaliserMontantPourBackend("65 000")).toBe("65000");
	});

	it("retire le point séparateur de milliers (65.000 → 65000)", () => {
		expect(normaliserMontantPourBackend("65.000")).toBe("65000");
	});

	it("préserve la décimale valide (65000.50)", () => {
		expect(normaliserMontantPourBackend("65000.50")).toBe("65000.50");
	});

	it("préserve un entier simple", () => {
		expect(normaliserMontantPourBackend("65000")).toBe("65000");
	});

	it("retire les espaces insécables", () => {
		expect(normaliserMontantPourBackend("65\u00A0000")).toBe("65000");
		expect(normaliserMontantPourBackend("65\u202F000")).toBe("65000");
	});
});
