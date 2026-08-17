import { describe, expect, it } from "vitest";

import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
	MODULE_DEFINITIONS,
} from "./modules";
import { MODULES } from "./types";

const residence = MODULE_DEFINITIONS.find((def) => def.code === "RESIDENCE");
if (!residence) throw new Error("RESIDENCE attendu dans le registre");

describe("getAccessibleModules", () => {
	it("retourne uniquement les modules dont l'utilisateur a la permission VOIR", () => {
		const result = getAccessibleModules([
			"RESIDENCE.VOIR",
			"FINANCES.MODIFIER",
		]).map((module) => module.code);
		// FINANCES.MODIFIER n'accorde pas la lecture → tuile exclue.
		expect(result).toEqual(["RESIDENCE"]);
	});

	it("exclut un module sans permission VOIR, même avec CREER/MODIFIER", () => {
		const result = getAccessibleModules(["RH.CREER", "ADMIN.SUPPRIMER"]).map(
			(module) => module.code,
		);
		expect(result).toEqual([]);
	});

	it("conserve l'ordre du registre", () => {
		const result = getAccessibleModules([
			"AUDIT.VOIR",
			"RESIDENCE.VOIR",
			"FINANCES.VOIR",
		]).map((module) => module.code);
		expect(result).toEqual(["RESIDENCE", "FINANCES", "AUDIT"]);
	});

	it("expose les 12 modules réels, chacun gâté par sa permission `<CODE>.VOIR`", () => {
		expect(MODULE_DEFINITIONS).toHaveLength(12);
		expect(new Set(MODULE_DEFINITIONS.map((def) => def.code))).toEqual(
			new Set(MODULES),
		);
		for (const def of MODULE_DEFINITIONS) {
			expect(def.permission).toBe(`${def.code}.VOIR`);
		}
	});
});

describe("getAccessibleModuleSubItems", () => {
	it("filtre les sous-pages par permission `<CODE>.VOIR`", () => {
		const withVoit = getAccessibleModuleSubItems(residence, [
			"RESIDENCE.VOIR",
		]).map((sub) => sub.id);
		// Les 6 sous-pages de Résidence sont gâtées par RESIDENCE.VOIR.
		expect(withVoit).toEqual([
			"batiments",
			"logements",
			"locations",
			"sejours_courts",
			"charges",
			"portail",
		]);

		const sansVoit = getAccessibleModuleSubItems(residence, [
			"RESIDENCE.MODIFIER",
		]);
		expect(sansVoit).toEqual([]);
	});

	it("retourne `[]` pour un module sans sous-pages (transverse)", () => {
		const client = MODULE_DEFINITIONS.find((def) => def.code === "CLIENT");
		if (!client) throw new Error("CLIENT attendu dans le registre");
		expect(getAccessibleModuleSubItems(client, ["CLIENT.VOIR"])).toEqual([]);
	});

	it("conserve l'ordre de déclaration", () => {
		const result = getAccessibleModuleSubItems(residence, [
			"RESIDENCE.VOIR",
		]).map((sub) => sub.id);
		expect(result[0]).toBe("batiments");
		expect(result[result.length - 1]).toBe("portail");
	});

	it("expose des sous-menus pour les modules métier construits (la liste des pages)", () => {
		// Les 8 modules avec sous-pages attendus, dans l'ordre du registre.
		const withSubItems = MODULE_DEFINITIONS.filter(
			(def) => (def.subItems ?? []).length > 0,
		).map((def) => def.code);
		expect(withSubItems).toEqual([
			"RESIDENCE",
			"PRESSING",
			"RESTAURANT",
			"SALLE_FETE",
			"FACTURATION",
			"FINANCES",
			"RH",
			"MARCHANDISE",
			"ADMIN",
		]);
	});

	it("chaque sous-page est gâtée par la permission VOIR de son module", () => {
		for (const def of MODULE_DEFINITIONS) {
			for (const sub of def.subItems ?? []) {
				expect(sub.permission).toBe(`${def.code}.VOIR`);
			}
		}
	});
});
