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
	it("expose les 14 modules renvoyés par GET /auth/me (smoke tests 2026-08-17/20)", () => {
		expect(MODULES).toHaveLength(14);
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
			]),
		);
		// Le spec (§9) liste `MARKET` ; la réponse réelle de /me ne le contient
		// pas. Le modèle ne doit pas inventer de préfixe absent du backend.
		expect(MODULES).not.toContain("MARKET");
	});

	it("expose les 4 verbes réels, dont SUPPRIMER (absent du spec §9)", () => {
		expect(PERMISSION_VERBS).toEqual([
			"VOIR",
			"CREER",
			"MODIFIER",
			"SUPPRIMER",
		]);
	});
});
