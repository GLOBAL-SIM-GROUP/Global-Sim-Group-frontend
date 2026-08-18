import { describe, expect, it } from "vitest";

import { construireCsv, periodeParDefaut, periodeParType } from "./rapports";

describe("periodeParType", () => {
	const reference = new Date(2026, 7, 18); // 2026-08-18

	it("calcule le mois courant", () => {
		expect(periodeParType("ce_mois", reference)).toEqual({
			du: "2026-08-01",
			au: "2026-08-18",
		});
	});

	it("calcule le mois précédent", () => {
		expect(periodeParType("mois_precedent", reference)).toEqual({
			du: "2026-07-01",
			au: "2026-07-31",
		});
	});

	it("calcule l'année en cours", () => {
		expect(periodeParType("annee", reference)).toEqual({
			du: "2026-01-01",
			au: "2026-08-18",
		});
	});

	it("renvoie une période vide pour une période personnalisée", () => {
		expect(periodeParType("personnalisee", reference)).toEqual({
			du: "",
			au: "",
		});
	});
});

describe("periodeParDefaut", () => {
	it("reprend la période de l'URL si présente", () => {
		expect(periodeParDefaut({ du: "2026-01-01", au: "2026-06-30" })).toEqual({
			du: "2026-01-01",
			au: "2026-06-30",
		});
		expect(periodeParDefaut({ du: "2026-01-01" }).du).toBe("2026-01-01");
	});

	it("retourne un mois courant borné (du ≤ au) sans période", () => {
		const periode = periodeParDefaut({});
		expect(periode.du).toMatch(/^\d{4}-\d{2}-01$/);
		expect(periode.au).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		expect(periode.du <= periode.au).toBe(true);
	});
});

describe("construireCsv", () => {
	it("joint les lignes au séparateur `;`", () => {
		expect(
			construireCsv([
				["a", "b"],
				["c", "d"],
			]),
		).toBe("a;b\nc;d");
	});

	it("quote les cellules contenant un séparateur", () => {
		expect(construireCsv([["x;y", "z"]])).toBe('"x;y";z');
	});

	it("échappe les guillemets", () => {
		expect(construireCsv([['il dit "bonjour"']])).toBe('"il dit ""bonjour"""');
	});
});
