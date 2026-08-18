import { describe, expect, it } from "vitest";

import {
	filtrerLogements,
	formatTarifFCFA,
	type Logement,
	paginerLogements,
} from "./logements";

/** Fabrique un logement minimal pour les tests (id bigint en string). */
function logement(overrides: Partial<Logement> = {}): Logement {
	return {
		id: "1",
		numero: "1",
		nom: null,
		type: "CHAMBRE",
		tarif: "35000",
		equipements: null,
		statut: "DISPONIBLE",
		etat: null,
		id_batiment: "bat-1",
		...overrides,
	};
}

const logements = [
	logement({ id: "1", numero: "1", type: "CHAMBRE", statut: "DISPONIBLE" }),
	logement({ id: "2", numero: "2", type: "STUDIO", statut: "OCCUPE" }),
	logement({
		id: "3",
		numero: "3",
		type: "APPARTEMENT",
		statut: "EN_MAINTENANCE",
	}),
	logement({ id: "4", numero: "4", type: "MEUBLE", statut: "RESERVE" }),
	logement({ id: "5", numero: "5", type: "CHAMBRE", statut: "DISPONIBLE" }),
];

describe("filtrerLogements", () => {
	it("retourne tout sans filtre", () => {
		expect(
			filtrerLogements(logements, {
				type: "tous",
				statut: "tous",
				dispo: "tous",
			}),
		).toHaveLength(5);
	});

	it("filtre par type", () => {
		const result = filtrerLogements(logements, {
			type: "CHAMBRE",
			statut: "tous",
			dispo: "tous",
		});
		expect(result.map((item) => item.id)).toEqual(["1", "5"]);
	});

	it("filtre par statut", () => {
		const result = filtrerLogements(logements, {
			type: "tous",
			statut: "OCCUPE",
			dispo: "tous",
		});
		expect(result.map((item) => item.id)).toEqual(["2"]);
	});

	it("filtre « disponibles uniquement » par statut DISPONIBLE", () => {
		const result = filtrerLogements(logements, {
			type: "tous",
			statut: "tous",
			dispo: "disponibles",
		});
		expect(result.map((item) => item.id)).toEqual(["1", "5"]);
	});

	it("combine type et disponibilité", () => {
		const result = filtrerLogements(logements, {
			type: "CHAMBRE",
			statut: "tous",
			dispo: "disponibles",
		});
		expect(result.map((item) => item.id)).toEqual(["1", "5"]);
	});

	it("ne renvoie rien quand aucun logement ne correspond", () => {
		const result = filtrerLogements(logements, {
			type: "MEUBLE",
			statut: "OCCUPE",
			dispo: "tous",
		});
		expect(result).toEqual([]);
	});
});

describe("paginerLogements", () => {
	const pageSize = 2;

	it("pagine sur la première page", () => {
		const result = paginerLogements(logements, 1, pageSize);
		expect(result.items.map((item) => item.id)).toEqual(["1", "2"]);
		expect(result.total).toBe(5);
		expect(result.totalPages).toBe(3);
		expect(result.start).toBe(1);
		expect(result.end).toBe(2);
	});

	it("pagine sur une page du milieu", () => {
		const result = paginerLogements(logements, 2, pageSize);
		expect(result.items.map((item) => item.id)).toEqual(["3", "4"]);
		expect(result.start).toBe(3);
		expect(result.end).toBe(4);
	});

	it("borne la page au-delà du nombre total de pages", () => {
		const result = paginerLogements(logements, 99, pageSize);
		expect(result.page).toBe(3);
		expect(result.items.map((item) => item.id)).toEqual(["5"]);
	});

	it("ne va jamais sous la page 1", () => {
		const result = paginerLogements(logements, 0, pageSize);
		expect(result.page).toBe(1);
	});

	it("gère une liste vide (start = 0)", () => {
		const result = paginerLogements([], 1, pageSize);
		expect(result.items).toEqual([]);
		expect(result.total).toBe(0);
		expect(result.totalPages).toBe(1);
		expect(result.start).toBe(0);
		expect(result.end).toBe(0);
	});
});

describe("formatTarifFCFA", () => {
	it("formate un tarif en FCFA (séparateur de milliers français)", () => {
		expect(formatTarifFCFA("35000")).toBe("35 000 FCFA");
		expect(formatTarifFCFA("1000000")).toBe("1 000 000 FCFA");
	});

	it("retourne la valeur brute si elle n'est pas un nombre", () => {
		expect(formatTarifFCFA("abc")).toBe("abc");
	});
});
