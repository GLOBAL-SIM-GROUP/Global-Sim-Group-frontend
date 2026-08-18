import { describe, expect, it } from "vitest";

import { formatDateHeureISO, formatDateISO, formatMontantFCFA } from "./format";

describe("formatMontantFCFA", () => {
	it("formate un montant en FCFA (séparateur de milliers français)", () => {
		expect(formatMontantFCFA("35000")).toBe("35 000 FCFA");
		expect(formatMontantFCFA("150000.00")).toBe("150 000 FCFA");
	});

	it("retourne la valeur brute si elle n'est pas un nombre", () => {
		expect(formatMontantFCFA("abc")).toBe("abc");
	});
});

describe("formatDateISO", () => {
	it("formate une date YYYY-MM-DD en français", () => {
		expect(formatDateISO("2026-01-01")).toBe("01/01/2026");
	});

	it("retourne « — » sans date", () => {
		expect(formatDateISO(null)).toBe("—");
		expect(formatDateISO("")).toBe("—");
	});

	it("retourne la valeur brute si la date est invalide", () => {
		expect(formatDateISO("pas-une-date")).toBe("pas-une-date");
	});
});

describe("formatDateHeureISO", () => {
	it("formate une date-heure backend en français", () => {
		expect(formatDateHeureISO("2026-08-20 20:00:00")).toContain("20/08/2026");
	});

	it("retourne « — » sans date", () => {
		expect(formatDateHeureISO(null)).toBe("—");
		expect(formatDateHeureISO(undefined)).toBe("—");
	});
});
