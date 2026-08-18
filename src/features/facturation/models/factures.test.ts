import { describe, expect, it } from "vitest";

import type { Facture } from "./factures";
import {
	filtrerFactures,
	paginerFactures,
	rechercherFactures,
} from "./factures";

function facture(
	id: string,
	statut: Facture["statut"],
	source: string | null,
): Facture {
	return {
		id,
		numero: `SIM-2026-${id}`,
		date: "2026-08-18 12:00:00",
		id_client: null,
		id_activite: null,
		remise: null,
		montant_total: "1000.00",
		montant_paye: "1000.00",
		reste: "0.00",
		statut,
		source_type: source,
		source_id: null,
	};
}

describe("filtrerFactures", () => {
	it("filtre par statut", () => {
		const factures = [
			facture("1", "PAYEE", "PRESTATION"),
			facture("2", "PARTIELLE", "PRESTATION"),
			facture("3", "IMPAYEE", "VENTE"),
		];
		expect(
			filtrerFactures(factures, { statut: "PARTIELLE", source: "tous" }),
		).toHaveLength(1);
		expect(
			filtrerFactures(factures, { statut: "tous", source: "tous" }),
		).toHaveLength(3);
	});

	it("filtre par source", () => {
		const factures = [
			facture("1", "PAYEE", "PRESTATION"),
			facture("2", "PARTIELLE", "VENTE"),
		];
		expect(
			filtrerFactures(factures, { statut: "tous", source: "VENTE" }),
		).toHaveLength(1);
		expect(
			filtrerFactures(factures, { statut: "tous", source: "VENTE" })[0].id,
		).toBe("2");
	});

	it("combine statut et source", () => {
		const factures = [
			facture("1", "PAYEE", "PRESTATION"),
			facture("2", "IMPAYEE", "PRESTATION"),
		];
		expect(
			filtrerFactures(factures, { statut: "IMPAYEE", source: "PRESTATION" }),
		).toHaveLength(1);
	});
});

describe("rechercherFactures", () => {
	const clients = new Map<string, string>([
		["1", "GNAHORE Béatrice"],
		["8", "KOUADIO Séraphin"],
	]);

	it("retourne tout si le terme est vide", () => {
		const factures = [facture("1", "PAYEE", "PRESTATION")];
		expect(rechercherFactures(factures, clients, "")).toHaveLength(1);
		expect(rechercherFactures(factures, clients, "  ")).toHaveLength(1);
	});

	it("cherche par numéro, insensible à la casse", () => {
		const factures = [facture("12", "PAYEE", "PRESTATION")];
		expect(rechercherFactures(factures, clients, "SIM-2026-12")).toHaveLength(
			1,
		);
		expect(rechercherFactures(factures, clients, "sim-2026-12")).toHaveLength(
			1,
		);
		expect(rechercherFactures(factures, clients, "ZZZ")).toHaveLength(0);
	});

	it("cherche par nom du client résolu", () => {
		const factures = [facture("1", "PAYEE", "PRESTATION")];
		const avecClient = [{ ...factures[0], id_client: "8" }];
		expect(rechercherFactures(avecClient, clients, "séraphin")).toHaveLength(1);
		expect(rechercherFactures(avecClient, clients, "Béatrice")).toHaveLength(0);
	});

	it("cherche par source de facture", () => {
		const factures = [facture("1", "PAYEE", "COMMANDE_RESTAURANT")];
		expect(rechercherFactures(factures, clients, "restaurant")).toHaveLength(1);
		expect(rechercherFactures(factures, clients, "pressing")).toHaveLength(0);
	});
});

describe("paginerFactures", () => {
	it("borne la page dans [1, totalPages]", () => {
		const factures = Array.from({ length: 25 }, (_, index) =>
			facture(String(index + 1), "PAYEE", "VENTE"),
		);
		const page5 = paginerFactures(factures, 5, 10);
		expect(page5.items).toHaveLength(5);
		expect(page5.total).toBe(25);
		expect(page5.totalPages).toBe(3);
		expect(page5.start).toBe(21);
		expect(page5.end).toBe(25);
		// Page au-delà de la dernière → clampée sur la dernière.
		expect(paginerFactures(factures, 99, 10).page).toBe(3);
		// Page en dessous de 1 → clampée sur 1.
		expect(paginerFactures(factures, 0, 10).page).toBe(1);
	});

	it("retourne une page vide pour une liste vide", () => {
		const page = paginerFactures([], 1, 10);
		expect(page.items).toHaveLength(0);
		expect(page.start).toBe(0);
		expect(page.end).toBe(0);
	});
});
