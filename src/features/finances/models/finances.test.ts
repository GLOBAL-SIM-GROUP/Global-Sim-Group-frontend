import { describe, expect, it } from "vitest";

import type { Impaye } from "./finances";
import { cibleImpaye } from "./finances";

function impaye(type: Impaye["type"], reference: string): Impaye {
	return {
		type,
		id_client: null,
		client: "CLIENT TEST",
		reference,
		montant_du: "1000.00",
		montant_paye: "0",
		reste: "1000.00",
		date_echeance: "2026-07-01",
	};
}

describe("cibleImpaye", () => {
	const contratParNumero = new Map([["CON-2025-004", "3"]]);
	const factureParNumero = new Map([["SIM-2026-0007", "7"]]);
	const permissionsTout = { residence: true, facturation: true };

	it("résout un loyer vers la fiche contrat", () => {
		expect(
			cibleImpaye(
				impaye("LOYER", "CON-2025-004"),
				contratParNumero,
				factureParNumero,
				permissionsTout,
			),
		).toEqual({ kind: "contrat", id: "3" });
	});

	it("ne lie pas un loyer sans contrat résolu ni permission residence", () => {
		expect(
			cibleImpaye(
				impaye("LOYER", "CON-INCONNU"),
				contratParNumero,
				factureParNumero,
				permissionsTout,
			),
		).toEqual({ kind: "aucune" });
		expect(
			cibleImpaye(
				impaye("LOYER", "CON-2025-004"),
				contratParNumero,
				factureParNumero,
				{ residence: false, facturation: true },
			),
		).toEqual({ kind: "aucune" });
	});

	it("résout une facture vers la fiche facture", () => {
		expect(
			cibleImpaye(
				impaye("FACTURE", "SIM-2026-0007"),
				contratParNumero,
				factureParNumero,
				permissionsTout,
			),
		).toEqual({ kind: "facture", id: "7" });
		expect(
			cibleImpaye(
				impaye("FACTURE", "SIM-INCONNUE"),
				contratParNumero,
				factureParNumero,
				permissionsTout,
			),
		).toEqual({ kind: "aucune" });
		expect(
			cibleImpaye(
				impaye("FACTURE", "SIM-2026-0007"),
				contratParNumero,
				factureParNumero,
				{ residence: true, facturation: false },
			),
		).toEqual({ kind: "aucune" });
	});

	it("renvoie la liste des charges pour une charge", () => {
		expect(
			cibleImpaye(
				impaye("CHARGE", "2026-07"),
				contratParNumero,
				factureParNumero,
				permissionsTout,
			),
		).toEqual({ kind: "charges" });
		expect(
			cibleImpaye(
				impaye("CHARGE", "2026-07"),
				contratParNumero,
				factureParNumero,
				{ residence: false, facturation: true },
			),
		).toEqual({ kind: "aucune" });
	});

	it("renvoie la liste des séjours pour un séjour", () => {
		expect(
			cibleImpaye(
				impaye("SEJOUR", "SJ-2026-001"),
				contratParNumero,
				factureParNumero,
				permissionsTout,
			),
		).toEqual({ kind: "sejours" });
	});

	it("ne lie pas un type inconnu", () => {
		expect(
			cibleImpaye(
				impaye("AUTRE" as Impaye["type"], "X"),
				contratParNumero,
				factureParNumero,
				permissionsTout,
			),
		).toEqual({ kind: "aucune" });
	});
});
