import { beforeEach, describe, expect, it, vi } from "vitest";

import { creerLogementsLot } from "./logements";

const apiFetch = vi.fn();

vi.mock("#/core/api", () => ({
	getApiClient: () => ({ apiFetch }),
}));

describe("creerLogementsLot", () => {
	beforeEach(() => {
		apiFetch.mockReset();
	});

	it("envoie le payload attendu et remappe les logements créés", async () => {
		apiFetch.mockResolvedValue([
			{
				id_logement: "10",
				numero: "GSG-CH01-B",
				nom: "Chambre",
				type: "CHAMBRE",
				tarif: "35000",
				equipements: "ventilateur, TV",
				statut: "DISPONIBLE",
				etat: "Bon état",
				id_batiment: "1",
			},
		]);

		const resultat = await creerLogementsLot({
			idBatiment: "1",
			type: "CHAMBRE",
			tarif: "35000",
			statut: "DISPONIBLE",
			quantite: 1,
			nom: "Chambre",
			equipements: "ventilateur, TV",
			etat: "Bon état",
		});

		expect(apiFetch).toHaveBeenCalledWith("/api/v1/residence/logements/lot", {
			method: "POST",
			body: JSON.stringify({
				id_batiment: "1",
				type: "CHAMBRE",
				tarif: "35000",
				statut: "DISPONIBLE",
				quantite: 1,
				nom: "Chambre",
				equipements: "ventilateur, TV",
				etat: "Bon état",
			}),
		});
		expect(resultat[0]).toMatchObject({
			id: "10",
			numero: "GSG-CH01-B",
		});
	});

	it("omet le nom absent et normalise les autres champs vides", async () => {
		apiFetch.mockResolvedValue([]);

		await creerLogementsLot({
			idBatiment: "1",
			type: "STUDIO",
			tarif: "50000.00",
			statut: "DISPONIBLE",
			quantite: 2,
			nom: "",
			equipements: " ",
			etat: null,
		});

		const body = JSON.parse(apiFetch.mock.calls[0][1].body);
		expect(body).toMatchObject({ equipements: null, etat: null });
		expect(body).not.toHaveProperty("nom");
	});
});
