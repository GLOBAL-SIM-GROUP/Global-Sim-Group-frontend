import { describe, expect, it } from "vitest";

import {
	formatDateHeureISO,
	formatDateHeureUTC,
	formatDateISO,
	formatMontantFCFA,
} from "./format";

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

describe("formatDateHeureUTC", () => {
	it("lit un instant serveur naïf comme de l'UTC puis affiche en local", () => {
		// Indépendant du fuseau de la machine : on compare à la conversion de
		// référence — une chaîne naïve doit valoir le même instant qu'avec « Z ».
		const attendu = new Date("2026-08-20T20:00:00Z").toLocaleString("fr-FR");
		expect(formatDateHeureUTC("2026-08-20 20:00:00")).toBe(attendu);
	});

	it("accepte les fractions de seconde à plus de 3 chiffres", () => {
		const attendu = new Date("2026-09-13T18:02:17.300Z").toLocaleString(
			"fr-FR",
		);
		expect(formatDateHeureUTC("2026-09-13 18:02:17.300845")).toBe(attendu);
	});

	it("laisse tel quel un instant déjà suffixé (Z ou offset)", () => {
		const attendu = new Date("2026-08-05T10:00:00.000Z").toLocaleString(
			"fr-FR",
		);
		expect(formatDateHeureUTC("2026-08-05T10:00:00.000Z")).toBe(attendu);
	});

	it("retourne « — » sans date et la valeur brute si invalide", () => {
		expect(formatDateHeureUTC(null)).toBe("—");
		expect(formatDateHeureUTC("pas-une-date")).toBe("pas-une-date");
	});
});
