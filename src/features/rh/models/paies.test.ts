import { describe, expect, it } from "vitest";

import type { Paie } from "./paies";
import { filtrerPaies, nomCompletPaie, paginerPaies } from "./paies";

function paie(
	id: string,
	employe: string,
	periode: string,
	statut: Paie["statut"],
): Paie {
	return {
		id,
		id_employe: employe,
		periode,
		salaire_base: "300000.00",
		total_elements: "30000.00",
		total_retenues: "20000.00",
		montant_a_payer: "310000.00",
		statut,
		id_paiement: null,
		employe_nom: `NOM${employe}`,
		employe_prenom: "Fatou",
	};
}

describe("nomCompletPaie", () => {
	it("renvoie « PRENOM Nom » ou « — » si absent", () => {
		expect(nomCompletPaie(paie("1", "3", "2026-07", "VALIDEE"))).toBe(
			"Fatou NOM3",
		);
		expect(
			nomCompletPaie({
				...paie("2", "1", "2026-07", "PAYEE"),
				employe_nom: null,
				employe_prenom: null,
			}),
		).toBe("—");
	});
});

describe("filtrerPaies", () => {
	it("filtre par employé, période et statut", () => {
		const paies = [
			paie("1", "3", "2026-07", "VALIDEE"),
			paie("2", "2", "2026-07", "PAYEE"),
			paie("3", "3", "2026-08", "CALCULEE"),
		];
		expect(
			filtrerPaies(paies, { employe: "tous", periode: "", statut: "tous" }),
		).toHaveLength(3);
		expect(
			filtrerPaies(paies, { employe: "3", periode: "", statut: "tous" }),
		).toHaveLength(2);
		expect(
			filtrerPaies(paies, {
				employe: "tous",
				periode: "2026-07",
				statut: "tous",
			}),
		).toHaveLength(2);
		expect(
			filtrerPaies(paies, { employe: "3", periode: "", statut: "CALCULEE" }),
		).toHaveLength(1);
	});
});

describe("paginerPaies", () => {
	it("borne la page dans [1, totalPages]", () => {
		const paies = Array.from({ length: 22 }, (_, index) =>
			paie(String(index + 1), "1", "2026-07", "PAYEE"),
		);
		const page3 = paginerPaies(paies, 3, 10);
		expect(page3.items).toHaveLength(2);
		expect(page3.totalPages).toBe(3);
		expect(paginerPaies(paies, 99, 10).page).toBe(3);
	});
});
