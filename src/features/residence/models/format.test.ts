import { describe, expect, it } from "vitest";

import {
	dateLocaleISO,
	formatDateHeureISO,
	formatDateHeureUTC,
	formatDateInstantUTC,
	formatDateISO,
	formatMontantFCFA,
	jourLocalInstant,
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

describe("formatDateInstantUTC", () => {
	it("affiche le jour civil local d'un instant serveur naïf", () => {
		// 23:30 UTC = lendemain à Douala (UTC+1) — le slice UTC afficherait
		// encore la veille ; la conversion locale doit basculer au jour suivant.
		const attendu = new Date("2026-08-20T23:30:00Z").toLocaleDateString(
			"fr-FR",
		);
		expect(formatDateInstantUTC("2026-08-20 23:30:00")).toBe(attendu);
	});

	it("retourne « — » sans date et la valeur brute si invalide", () => {
		expect(formatDateInstantUTC(null)).toBe("—");
		expect(formatDateInstantUTC("pas-une-date")).toBe("pas-une-date");
	});
});

describe("jourLocalInstant", () => {
	it("renvoie le jour YYYY-MM-DD en heure locale (pas le jour UTC)", () => {
		// Référence : composants locaux de l'instant « 2026-08-20T23:30:00Z ».
		const reference = new Date("2026-08-20T23:30:00Z");
		const attendu = `${reference.getFullYear()}-${String(reference.getMonth() + 1).padStart(2, "0")}-${String(reference.getDate()).padStart(2, "0")}`;
		expect(jourLocalInstant("2026-08-20 23:30:00")).toBe(attendu);
		// Le jour UTC brut serait "2026-08-20" — le local peut différer.
	});

	it("renvoie « » pour une valeur absente ou illisible", () => {
		expect(jourLocalInstant(null)).toBe("");
		expect(jourLocalInstant("pas-une-date")).toBe("");
	});
});

describe("dateLocaleISO", () => {
	it("formate un Date en YYYY-MM-DD avec ses composants locaux", () => {
		expect(dateLocaleISO(new Date(2026, 0, 5))).toBe("2026-01-05");
		expect(dateLocaleISO(new Date(2026, 11, 31))).toBe("2026-12-31");
	});
});
