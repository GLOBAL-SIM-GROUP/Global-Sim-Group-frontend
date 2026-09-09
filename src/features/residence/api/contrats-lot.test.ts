import { beforeEach, describe, expect, it, vi } from "vitest";

import { encaisserLoyerLot } from "./contrats";

const apiFetch = vi.fn();

vi.mock("#/core/api", () => ({
	getApiClient: () => ({ apiFetch }),
}));

describe("encaisserLoyerLot", () => {
	beforeEach(() => {
		apiFetch.mockReset();
	});

	it("envoie le payload backend et mappe le résultat avec l'avertissement", async () => {
		apiFetch.mockResolvedValue({
			id_paiement: "129",
			montant_total: "350000",
			montant_applique: 250000,
			echeances: [
				{
					id_echeance: "233",
					montant_applique: "100000.00",
					statut: "PAYE",
				},
				{
					id_echeance: "234",
					montant_applique: "50000.00",
					statut: "PARTIEL",
				},
			],
			montant_non_affecte: 100000,
			avertissement: "100000 non affectés",
		});

		const resultat = await encaisserLoyerLot("42", {
			montant: "350000",
			idMoyen: "1",
			date: "2026-09-06 10:00:00",
		});

		expect(apiFetch).toHaveBeenCalledWith(
			"/api/v1/residence/contrats/42/encaisser-loyer-lot",
			{
				method: "POST",
				body: JSON.stringify({
					montant: "350000",
					id_moyen: "1",
					date: "2026-09-06 10:00:00",
				}),
			},
		);
		expect(resultat).toEqual({
			idPaiement: "129",
			montantTotal: "350000",
			montantApplique: 250000,
			echeances: [
				{ id: "233", montantApplique: "100000.00", statut: "PAYE" },
				{ id: "234", montantApplique: "50000.00", statut: "PARTIEL" },
			],
			montantNonAffecte: 100000,
			avertissement: "100000 non affectés",
		});
	});

	it("omet la date lorsqu'elle n'est pas renseignée", async () => {
		apiFetch.mockResolvedValue({
			id_paiement: null,
			montant_total: "1000",
			montant_applique: 0,
			echeances: [],
		});

		await encaisserLoyerLot("42", { montant: "1000", idMoyen: "1" });

		expect(JSON.parse(apiFetch.mock.calls[0][1].body)).toEqual({
			montant: "1000",
			id_moyen: "1",
		});
	});
});
