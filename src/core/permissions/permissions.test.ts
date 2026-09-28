import { describe, expect, it } from "vitest";

import { hasAllPermissions, hasAnyPermission, hasPermission } from "./index";
import { MODULES, PERMISSION_VERBS } from "./types";

describe("hasPermission", () => {
	it("accorde une permission présente", () => {
		expect(hasPermission(["FINANCES.VOIR"], "FINANCES.VOIR")).toBe(true);
	});

	it("refuse une permission absente", () => {
		expect(hasPermission(["FINANCES.VOIR"], "FINANCES.MODIFIER")).toBe(false);
	});

	it("refuse dans une liste vide", () => {
		expect(hasPermission([], "RESIDENCE.VOIR")).toBe(false);
	});
});

describe("hasAnyPermission", () => {
	it("est vrai dès qu’une permission est présente", () => {
		expect(
			hasAnyPermission(["CLIENT.CREER"], ["RH.VOIR", "CLIENT.CREER"]),
		).toBe(true);
	});

	it("est faux si aucune permission n’est présente", () => {
		expect(
			hasAnyPermission(["RH.VOIR"], ["CLIENT.CREER", "FINANCES.VOIR"]),
		).toBe(false);
	});

	it("est faux sur une liste de codes vide", () => {
		expect(hasAnyPermission(["RH.VOIR"], [])).toBe(false);
	});
});

describe("hasAllPermissions", () => {
	it("est vrai si toutes les permissions sont présentes", () => {
		expect(
			hasAllPermissions(
				["AUDIT.VOIR", "AUDIT.MODIFIER"],
				["AUDIT.VOIR", "AUDIT.MODIFIER"],
			),
		).toBe(true);
	});

	it("est faux si une permission manque", () => {
		expect(
			hasAllPermissions(["AUDIT.VOIR"], ["AUDIT.VOIR", "AUDIT.MODIFIER"]),
		).toBe(false);
	});

	it("est vrai si aucune permission n’est requise", () => {
		expect(hasAllPermissions(["AUDIT.VOIR"], [])).toBe(true);
	});
});

describe("modèle de permissions (réel, pas inventé)", () => {
	it("expose les 18 modules du catalogue réel (GET /admin/permissions, vérifié en direct 2026-09-27 : 94 codes)", () => {
		expect(MODULES).toHaveLength(18);
		expect(MODULES).toEqual(
			expect.arrayContaining([
				"RESIDENCE",
				"PRESSING",
				"RESTAURANT",
				"SALLE_FETE",
				"FACTURATION",
				"FINANCES",
				"RH",
				"RESIDENT",
				"CLIENT",
				"MARCHANDISE",
				"ADMIN",
				"AUDIT",
				"CORE",
				"SIGNALEMENT",
				"DEPENSE",
				"PORTAIL",
				"ABONNEMENT",
				"RAPPORTS",
			]),
		);
		// Le spec (§9) liste `MARKET` ; la réponse réelle de /me ne le contient
		// pas. Le modèle ne doit pas inventer de préfixe absent du backend.
		expect(MODULES).not.toContain("MARKET");
	});

	it("expose les 19 verbes modélisés, dont les 4 verbes réels du cycle de vie pressing (TRAITER/MARQUER_PRET/RETIRER/SUPERVISER, corrigés le 2026-09-27)", () => {
		expect(PERMISSION_VERBS).toEqual([
			"VOIR",
			"CREER",
			"MODIFIER",
			"SUPPRIMER",
			"ENCAISSER",
			"GERER_TARIFS",
			"COMMANDER",
			"DECLARER",
			"DEMANDER",
			"VALIDER",
			"ANNULER",
			"GERER_CATALOGUE",
			"VENDRE",
			"AJUSTER",
			"DECIDER_RELIQUAT",
			"TRAITER",
			"MARQUER_PRET",
			"RETIRER",
			"SUPERVISER",
		]);
	});
});
