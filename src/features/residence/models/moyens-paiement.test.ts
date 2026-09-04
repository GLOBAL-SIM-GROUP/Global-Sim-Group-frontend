import { describe, expect, it } from "vitest";

import { type MoyenPaiement, moyensActifs } from "./moyens-paiement";

function moyen(id: string, actif: boolean): MoyenPaiement {
	return { id, libelle: `Moyen ${id}`, actif };
}

/**
 * Un moyen de paiement désactivé (page Finances → Moyens de paiement) ne doit
 * plus être proposable pour une nouvelle opération — encaissement, paiement
 * d'une charge/commande/séjour/réservation, etc.
 */
describe("moyensActifs", () => {
	it("écarte les moyens désactivés", () => {
		const moyens = [moyen("1", true), moyen("2", false), moyen("3", true)];

		expect(moyensActifs(moyens).map((m) => m.id)).toEqual(["1", "3"]);
	});

	it("renvoie une liste vide si aucun moyen n'est actif", () => {
		expect(moyensActifs([moyen("1", false)])).toEqual([]);
	});
});
