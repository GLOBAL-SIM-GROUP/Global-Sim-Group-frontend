import { describe, expect, it } from "vitest";

import type { PortailPaiement } from "./portail";
import { construireCsv, filtrerPaiements, libelleMoisAnnee } from "./portail";

function paiement(id: string, date: string, type: string): PortailPaiement {
	return {
		id,
		date,
		montant: "35000.00",
		type,
		mode_paiement: "Espèces",
		reference: `REF-${id}`,
	};
}

describe("libelleMoisAnnee", () => {
	it("formate le mois et l'année en français", () => {
		expect(libelleMoisAnnee(3, 2026)).toMatch(/mars/i);
		expect(libelleMoisAnnee(3, 2026)).toContain("2026");
		expect(libelleMoisAnnee(1, 2026)).toMatch(/janvier/i);
	});
});

describe("filtrerPaiements", () => {
	it("filtre par période et type", () => {
		const paiements = [
			paiement("1", "2026-03-05 00:00:00", "LOYER"),
			paiement("2", "2026-04-05 00:00:00", "CHARGE"),
			paiement("3", "2026-05-05 00:00:00", "LOYER"),
		];
		expect(
			filtrerPaiements(paiements, { du: "", au: "", type: "tous" }),
		).toHaveLength(3);
		expect(
			filtrerPaiements(paiements, { du: "", au: "", type: "CHARGE" }),
		).toHaveLength(1);
		expect(
			filtrerPaiements(paiements, {
				du: "2026-04-01",
				au: "2026-04-30",
				type: "tous",
			}),
		).toHaveLength(1);
	});
});

describe("construireCsv", () => {
	it("joint les lignes au séparateur `;` et quote si besoin", () => {
		expect(construireCsv([["a", "b"], ["c"]] as const)).toBe("a;b\nc");
		expect(construireCsv([["x;y", "z"]] as const)).toBe('"x;y";z');
	});
});
