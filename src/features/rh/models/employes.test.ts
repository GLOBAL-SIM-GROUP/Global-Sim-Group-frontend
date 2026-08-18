import { describe, expect, it } from "vitest";

import type { Employe } from "./employes";
import {
	filtrerEmployes,
	nomCompletEmploye,
	paginerEmployes,
} from "./employes";

function employe(
	id: string,
	service: string | null,
	statut: Employe["statut"],
): Employe {
	return {
		id,
		nom: `NOM${id}`,
		prenom: "Awa",
		telephone: null,
		fonction: "Agent",
		id_service: service,
		date_embauche: "2023-05-15",
		type_contrat: "CDD",
		salaire_base: "160000.00",
		statut,
		autres_infos: null,
		service_libelle: null,
	};
}

describe("nomCompletEmploye", () => {
	it("renvoie « PRENOM Nom »", () => {
		expect(nomCompletEmploye(employe("1", null, "ACTIF"))).toBe("Awa NOM1");
	});
});

describe("filtrerEmployes", () => {
	it("filtre par service et statut", () => {
		const employes = [
			employe("1", "2", "ACTIF"),
			employe("2", "1", "SUSPENDU"),
			employe("3", "1", "ACTIF"),
		];
		expect(
			filtrerEmployes(employes, { service: "tous", statut: "tous" }),
		).toHaveLength(3);
		expect(
			filtrerEmployes(employes, { service: "1", statut: "tous" }),
		).toHaveLength(2);
		expect(
			filtrerEmployes(employes, { service: "1", statut: "ACTIF" }),
		).toHaveLength(1);
		expect(
			filtrerEmployes(employes, { service: "2", statut: "SUSPENDU" }),
		).toHaveLength(0);
	});
});

describe("paginerEmployes", () => {
	it("borne la page dans [1, totalPages]", () => {
		const employes = Array.from({ length: 25 }, (_, index) =>
			employe(String(index + 1), "1", "ACTIF"),
		);
		const page3 = paginerEmployes(employes, 3, 10);
		expect(page3.items).toHaveLength(5);
		expect(page3.totalPages).toBe(3);
		expect(paginerEmployes(employes, 99, 10).page).toBe(3);
		expect(paginerEmployes(employes, 0, 10).page).toBe(1);
	});
});
