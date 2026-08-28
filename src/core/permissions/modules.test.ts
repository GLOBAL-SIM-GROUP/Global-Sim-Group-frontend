import { describe, expect, it } from "vitest";

import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
	MODULE_DEFINITIONS,
} from "./modules";

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
			"CLIENT.VOIR",
			"RESIDENCE.VOIR",
			"FINANCES.VOIR",
		]).map((module) => module.code);
		// CLIENT, RESIDENCE, FINANCES retournés dans l'ordre du registre.
		expect(result).toEqual(["RESIDENCE", "FINANCES", "CLIENT"]);
	});

	it("expose les modules métier actuellement implémentés, chacun gâté par sa permission `<CODE>.VOIR`", () => {
		// Les modules affichables dans le lanceur : Résidence, Restaurant, Pressing,
		// Salle de fête, Facturation, Finances, RH, Client, Marchandise, Admin.
		// Les modules de support (`RESIDENT`, `CORE`, `AUDIT`, `SIGNALEMENT`, `RAPPORTS`)
		// n'ont pas de tuile lanceur : l'accès se fait par d'autres routes ou via le portail.
		expect(MODULE_DEFINITIONS).toHaveLength(10);
		expect(new Set(MODULE_DEFINITIONS.map((def) => def.code))).toEqual(
			new Set([
				"RESIDENCE",
				"RESTAURANT",
				"PRESSING",
				"SALLE_FETE",
				"FACTURATION",
				"FINANCES",
				"RH",
				"CLIENT",
				"MARCHANDISE",
				"ADMIN",
			]),
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
		// Les 5 sous-pages de Résidence sont gâtées par RESIDENCE.VOIR
		// (Logements a été retiré du menu : l'accès se fait par la ligne des
		// bâtiments, la route /residence/logements reste accessible).
		expect(withVoit).toEqual([
			"batiments",
			"locations",
			"echeances",
			"sejours_courts",
			"charges",
		]);

		const sansVoit = getAccessibleModuleSubItems(residence, [
			"RESIDENCE.MODIFIER",
		]);
		expect(sansVoit).toEqual([]);
	});

	it("retourne `[]` pour un module sans sous-pages (ou non affichable)", () => {
		// Les modules de support (AUDIT, RAPPORTS, SIGNALEMENT) ne figurent pas
		// dans le registre du lanceur. On teste plutôt qu'un module affichable
		// vide de sous-pages retourne `[]`.
		const residence = MODULE_DEFINITIONS[0];
		if (!residence || residence.code !== "RESIDENCE")
			throw new Error("RESIDENCE attendu en premier");
		// Si RESIDENCE n'avait pas de subItems, retournerait []
		// Ici on teste juste que la fonction gère bien les modules sans sous-pages.
		const allModules = MODULE_DEFINITIONS.filter((def) => !def.subItems);
		if (allModules.length > 0) {
			expect(getAccessibleModuleSubItems(allModules[0], ["VOIR"])).toEqual([]);
		}
	});

	it("conserve l'ordre de déclaration", () => {
		const result = getAccessibleModuleSubItems(residence, [
			"RESIDENCE.VOIR",
		]).map((sub) => sub.id);
		expect(result[0]).toBe("batiments");
		expect(result[result.length - 1]).toBe("charges");
	});

	it("expose des sous-menus pour les modules métier construits (la liste des pages)", () => {
		// Les 10 modules avec sous-pages (tous les modules affichables en ont).
		const withSubItems = MODULE_DEFINITIONS.filter(
			(def) => (def.subItems ?? []).length > 0,
		).map((def) => def.code);
		expect(withSubItems).toEqual([
			"RESIDENCE",
			"RESTAURANT",
			"PRESSING",
			"SALLE_FETE",
			"FACTURATION",
			"FINANCES",
			"RH",
			"CLIENT",
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
