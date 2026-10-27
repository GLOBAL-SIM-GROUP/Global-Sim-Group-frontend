import { describe, expect, it } from "vitest";

import { trierAlpha } from "./tri";

describe("trierAlpha", () => {
	it("trie alphabétiquement selon la clé extraite", () => {
		const items = [
			{ libelle: "Zinc" },
			{ libelle: "Avoine" },
			{ libelle: "Miel" },
		];
		expect(trierAlpha(items, (i) => i.libelle).map((i) => i.libelle)).toEqual([
			"Avoine",
			"Miel",
			"Zinc",
		]);
	});

	it("est insensible à la casse et aux accents (collation française)", () => {
		const items = [
			{ nom: "étage" },
			{ nom: "Etamine" },
			{ nom: "eclair" },
			{ nom: "Zebre" },
		];
		expect(trierAlpha(items, (i) => i.nom).map((i) => i.nom)).toEqual([
			"eclair",
			"étage",
			"Etamine",
			"Zebre",
		]);
	});

	it("ne mute pas le tableau d'entrée", () => {
		const items = [{ libelle: "B" }, { libelle: "A" }];
		const trie = trierAlpha(items, (i) => i.libelle);
		expect(items.map((i) => i.libelle)).toEqual(["B", "A"]);
		expect(trie).not.toBe(items);
	});

	it("renvoie une copie vide pour une liste vide", () => {
		expect(trierAlpha([], (i: { l: string }) => i.l)).toEqual([]);
	});
});
