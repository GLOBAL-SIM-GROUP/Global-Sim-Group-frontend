import { describe, expect, it } from "vitest";

import {
	filtrerSejours,
	paginerSejours,
	SEJOUR_ORIGINE_LABELS,
	SEJOUR_STATUT_LABELS,
	type Sejour,
} from "./sejours";

function sejour(partial: Partial<Sejour> = {}): Sejour {
	return {
		id: "1",
		type_prestation: "NUITEE",
		id_client: "7",
		id_logement: "4",
		date_heure_arrivee: "2026-10-02 14:00:00",
		date_heure_depart_prevue: null,
		date_heure_depart_reelle: null,
		duree: null,
		tarif: null,
		montant_total: null,
		montant_paye: "0.00",
		reste_a_payer: null,
		id_moyen_paiement: null,
		statut: "EN_ATTENTE",
		numero_logement: "CH-102",
		client_nom: "KOUASSI",
		client_prenoms: "Awa",
		origine: "PORTAIL",
		...partial,
	};
}

const FILTRES_VIDES = {
	type: "tous",
	statut: "tous",
	origine: "tous",
	du: "",
	au: "",
} as const;

describe("SEJOUR_STATUT_LABELS / SEJOUR_ORIGINE_LABELS", () => {
	it("couvre EN_ATTENTE et les deux origines", () => {
		expect(SEJOUR_STATUT_LABELS.EN_ATTENTE).toBe("En attente de validation");
		expect(SEJOUR_ORIGINE_LABELS.PORTAIL).toBe("Portail");
		expect(SEJOUR_ORIGINE_LABELS.COMPTOIR).toBe("Comptoir");
	});
});

describe("filtrerSejours", () => {
	const sejours = [
		sejour({ id: "1", statut: "EN_ATTENTE", origine: "PORTAIL" }),
		sejour({ id: "2", statut: "EN_COURS", origine: "COMPTOIR" }),
		sejour({
			id: "3",
			statut: "TERMINE",
			origine: "PORTAIL",
			date_heure_arrivee: "2026-09-01 10:00:00",
		}),
	];

	it("filtre par statut EN_ATTENTE (file de validation)", () => {
		const resultat = filtrerSejours(sejours, {
			...FILTRES_VIDES,
			statut: "EN_ATTENTE",
		});
		expect(resultat.map((s) => s.id)).toEqual(["1"]);
	});

	it("filtre par origine PORTAIL", () => {
		const resultat = filtrerSejours(sejours, {
			...FILTRES_VIDES,
			origine: "PORTAIL",
		});
		expect(resultat.map((s) => s.id)).toEqual(["1", "3"]);
	});

	it("combine statut + origine", () => {
		const resultat = filtrerSejours(sejours, {
			...FILTRES_VIDES,
			statut: "EN_ATTENTE",
			origine: "PORTAIL",
		});
		expect(resultat.map((s) => s.id)).toEqual(["1"]);
	});

	it("filtre par période sur le jour d'arrivée", () => {
		const resultat = filtrerSejours(sejours, {
			...FILTRES_VIDES,
			du: "2026-10-01",
			au: "2026-10-31",
		});
		expect(resultat.map((s) => s.id)).toEqual(["1", "2"]);
	});
});

describe("paginerSejours", () => {
	it("borne la page à [1, totalPages]", () => {
		const sejours = Array.from({ length: 25 }, (_, i) =>
			sejour({ id: String(i + 1) }),
		);
		const page = paginerSejours(sejours, 99, 10);
		expect(page.page).toBe(3);
		expect(page.items).toHaveLength(5);
		expect(page.total).toBe(25);
	});
});
