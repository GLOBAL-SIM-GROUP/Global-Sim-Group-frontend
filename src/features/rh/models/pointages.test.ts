import { describe, expect, it } from "vitest";

import type { Pointage } from "./pointages";
import { filtrerPointages, nomCompletPointage } from "./pointages";

function pointage(id: string, employe: string, date: string): Pointage {
	return {
		id,
		id_employe: employe,
		date,
		heure_arrivee: null,
		heure_depart: null,
		duree_travaillee: null,
		statut: "PRESENT",
		heures_sup: null,
		note: null,
		employe_nom: `NOM${employe}`,
		employe_prenom: "Awa",
	};
}

describe("nomCompletPointage", () => {
	it("renvoie « PRENOM Nom » ou « — » si absent", () => {
		expect(nomCompletPointage(pointage("1", "2", "2026-08-18"))).toBe(
			"Awa NOM2",
		);
		expect(
			nomCompletPointage({
				...pointage("2", "1", "2026-08-18"),
				employe_nom: null,
				employe_prenom: null,
			}),
		).toBe("—");
	});
});

describe("filtrerPointages", () => {
	const employeParId = new Map([
		["1", { id_service: "2" }],
		["2", { id_service: "1" }],
	]);

	it("filtre par employé, service et période", () => {
		const pointages = [
			pointage("1", "1", "2026-08-18"),
			pointage("2", "2", "2026-08-19"),
			pointage("3", "1", "2026-08-20"),
		];
		expect(
			filtrerPointages(pointages, employeParId, {
				employe: "tous",
				service: "tous",
				du: "",
				au: "",
			}),
		).toHaveLength(3);
		expect(
			filtrerPointages(pointages, employeParId, {
				employe: "2",
				service: "tous",
				du: "",
				au: "",
			}),
		).toHaveLength(1);
		expect(
			filtrerPointages(pointages, employeParId, {
				employe: "tous",
				service: "1",
				du: "",
				au: "",
			}),
		).toHaveLength(1);
		expect(
			filtrerPointages(pointages, employeParId, {
				employe: "tous",
				service: "tous",
				du: "2026-08-19",
				au: "2026-08-19",
			}),
		).toHaveLength(1);
	});
});
