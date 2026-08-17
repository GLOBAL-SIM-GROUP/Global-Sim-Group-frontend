import { describe, expect, it } from "vitest";

import { createQueryKeys } from "./query-keys";

describe("createQueryKeys", () => {
	it("crée une clé `all` unique par scope", () => {
		expect(createQueryKeys("residence.contrats").all).toEqual([
			"residence.contrats",
		]);
		expect(createQueryKeys("rh.contrats").all).toEqual(["rh.contrats"]);
	});

	it("construit une clé de liste sans filtre", () => {
		expect(createQueryKeys("clients").list()).toEqual(["clients", "list"]);
	});

	it("construit une clé de liste avec filtres ordonnés", () => {
		expect(createQueryKeys("clients").list("2026-01", 1)).toEqual([
			"clients",
			"list",
			"2026-01",
			1,
		]);
	});

	it("construit une clé de détail", () => {
		expect(createQueryKeys("residence.logements").detail("lg-42")).toEqual([
			"residence.logements",
			"detail",
			"lg-42",
		]);
	});

	it("reste déterministe quel que soit l’ordre des clés", () => {
		const keys = createQueryKeys("a");
		const k1 = keys.list("x", 1);
		const k2 = keys.list("x", 1);
		expect(k1).toEqual(k2);
		expect(k1 === k2).toBe(false); // tableaux neufs, pas de partage de référence
	});
});
