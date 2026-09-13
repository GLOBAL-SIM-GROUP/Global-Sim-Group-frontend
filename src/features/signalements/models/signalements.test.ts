import { describe, expect, it } from "vitest";

import type { Signalement } from "#/core/api/signalements";

import {
	MODULES_CIBLE,
	completerSignalementDepuisListe,
	filtrerSignalements,
	libelleCible,
	libelleModuleCible,
	modulesCibleAccessibles,
	nomDeclarant,
	paginerSignalements,
	rechercherSignalements,
	validerPhotosSignalement,
} from "./signalements";

function signalement(
	id: string,
	statut: Signalement["statut"],
	overrides: Partial<Signalement> = {},
): Signalement {
	return {
		id,
		titre: `Signalement ${id}`,
		description: "Description du problème",
		cible_type: "MODULE",
		id_activite: null,
		module_cible: "SALLE_FETE",
		statut,
		id_utilisateur_declarant: "1",
		id_utilisateur_traitant: null,
		note_resolution: null,
		date_signalement: "2026-08-29T10:00:00.000Z",
		date_resolution: null,
		activite_code: null,
		activite_libelle: null,
		declarant_nom: "KOUASSI",
		declarant_prenom: "Yao",
		declarant_login: "y.kouassi",
		...overrides,
	};
}

describe("libelleModuleCible", () => {
	it("traduit le module et affiche un tiret en son absence", () => {
		expect(libelleModuleCible("SALLE_FETE")).toBe("Salle de fête");
		expect(libelleModuleCible(null)).toBe("—");
	});
});

describe("libelleCible", () => {
	it("affiche le module quand cible_type === MODULE", () => {
		expect(libelleCible(signalement("1", "OUVERT"))).toBe("Salle de fête");
	});

	it("affiche l'activité (libellé, ou code à défaut) quand cible_type === ACTIVITE", () => {
		expect(
			libelleCible(
				signalement("1", "OUVERT", {
					cible_type: "ACTIVITE",
					id_activite: "4",
					module_cible: null,
					activite_libelle: "Restauration et plats",
					activite_code: "RESTAURATION",
				}),
			),
		).toBe("Restauration et plats");

		expect(
			libelleCible(
				signalement("1", "OUVERT", {
					cible_type: "ACTIVITE",
					id_activite: "4",
					module_cible: null,
					activite_libelle: null,
					activite_code: "RESTAURATION",
				}),
			),
		).toBe("RESTAURATION");
	});
});

describe("nomDeclarant", () => {
	it("combine prénom et nom", () => {
		expect(nomDeclarant(signalement("1", "OUVERT"))).toBe("Yao KOUASSI");
	});

	it("replie sur le login si prénom/nom vides", () => {
		expect(
			nomDeclarant(
				signalement("1", "OUVERT", { declarant_nom: "", declarant_prenom: "" }),
			),
		).toBe("y.kouassi");
	});

	it("replie sur le login si prénom/nom absents (undefined), sans afficher « undefined »", () => {
		expect(
			nomDeclarant(
				signalement("1", "OUVERT", {
					declarant_nom: undefined,
					declarant_prenom: undefined,
				}),
			),
		).toBe("y.kouassi");
	});

	it("affiche le prénom seul si le nom est absent", () => {
		expect(
			nomDeclarant(signalement("1", "OUVERT", { declarant_nom: undefined })),
		).toBe("Yao");
	});

	it("affiche un tiret si prénom/nom/login sont tous absents", () => {
		expect(
			nomDeclarant(
				signalement("1", "OUVERT", {
					declarant_nom: undefined,
					declarant_prenom: undefined,
					declarant_login: undefined,
				}),
			),
		).toBe("—");
	});
});

describe("completerSignalementDepuisListe", () => {
	it("complète déclarant/activité absents du détail depuis la liste", () => {
		const detail = signalement("1", "OUVERT", {
			declarant_nom: undefined,
			declarant_prenom: undefined,
			declarant_login: undefined,
			activite_code: undefined,
			activite_libelle: undefined,
		});
		const liste = [
			signalement("1", "OUVERT", {
				declarant_nom: "KOUASSI",
				declarant_prenom: "Yao",
				declarant_login: "y.kouassi",
				activite_code: "RESIDENCE",
				activite_libelle: "Résidence",
			}),
		];

		const resultat = completerSignalementDepuisListe(detail, liste);

		expect(resultat.declarant_nom).toBe("KOUASSI");
		expect(resultat.declarant_prenom).toBe("Yao");
		expect(resultat.declarant_login).toBe("y.kouassi");
		expect(resultat.activite_libelle).toBe("Résidence");
	});

	it("ne touche pas aux champs déjà présents sur le détail", () => {
		const detail = signalement("1", "OUVERT", { declarant_nom: "DÉTAIL" });
		const liste = [signalement("1", "OUVERT", { declarant_nom: "LISTE" })];

		expect(completerSignalementDepuisListe(detail, liste).declarant_nom).toBe(
			"DÉTAIL",
		);
	});

	it("renvoie le détail tel quel si absent de la liste", () => {
		const detail = signalement("1", "OUVERT", { declarant_nom: undefined });
		expect(completerSignalementDepuisListe(detail, []).declarant_nom).toBe(
			undefined,
		);
	});

	it("renvoie le détail tel quel si la liste n'est pas encore chargée", () => {
		const detail = signalement("1", "OUVERT");
		expect(completerSignalementDepuisListe(detail, undefined)).toBe(detail);
	});
});

describe("filtrerSignalements", () => {
	it("filtre par statut", () => {
		const items = [
			signalement("1", "OUVERT"),
			signalement("2", "EN_COURS"),
			signalement("3", "RESOLU"),
		];
		expect(filtrerSignalements(items, "EN_COURS")).toHaveLength(1);
		expect(filtrerSignalements(items, "tous")).toHaveLength(3);
	});
});

describe("rechercherSignalements", () => {
	const items = [
		signalement("1", "OUVERT", { titre: "Fuite d'eau" }),
		signalement("2", "OUVERT", {
			titre: "Panne électrique",
			declarant_nom: "TOURE",
			declarant_prenom: "Awa",
		}),
	];

	it("cherche dans le titre", () => {
		expect(rechercherSignalements(items, "fuite")).toHaveLength(1);
	});

	it("cherche dans le nom du déclarant", () => {
		expect(rechercherSignalements(items, "toure")).toHaveLength(1);
	});

	it("retourne tout si le terme est vide", () => {
		expect(rechercherSignalements(items, "")).toHaveLength(2);
	});
});

describe("validerPhotosSignalement", () => {
	const photo = (nom: string, type: string, taille = 1000) =>
		new File([new ArrayBuffer(taille)], nom, { type });

	it("accepte les JPG/PNG/WebP de 5 Mo ou moins", () => {
		const fichiers = [
			photo("a.jpg", "image/jpeg"),
			photo("b.png", "image/png"),
			photo("c.webp", "image/webp"),
			photo("pile.jpg", "image/jpeg", 5 * 1024 * 1024),
		];

		const { acceptes, erreurs } = validerPhotosSignalement(fichiers);

		expect(acceptes).toHaveLength(4);
		expect(erreurs).toHaveLength(0);
	});

	it("rejette un fichier de plus de 5 Mo", () => {
		const { acceptes, erreurs } = validerPhotosSignalement([
			photo("grosse.jpg", "image/jpeg", 5 * 1024 * 1024 + 1),
		]);

		expect(acceptes).toHaveLength(0);
		expect(erreurs).toEqual(["« grosse.jpg » dépasse 5 Mo."]);
	});

	it("rejette un type MIME hors whitelist (PDF, exécutable)", () => {
		const { acceptes, erreurs } = validerPhotosSignalement([
			photo("preuve.pdf", "application/pdf"),
			photo("virus.exe", "application/octet-stream"),
		]);

		expect(acceptes).toHaveLength(0);
		expect(erreurs).toHaveLength(2);
		expect(erreurs[0]).toContain("preuve.pdf");
		expect(erreurs[1]).toContain("virus.exe");
	});

	it("sépare acceptés et rejetés dans une sélection mixte", () => {
		const { acceptes, erreurs } = validerPhotosSignalement([
			photo("ok.jpg", "image/jpeg"),
			photo("trop-grosse.png", "image/png", 6 * 1024 * 1024),
			photo("ok.webp", "image/webp"),
		]);

		expect(acceptes.map((f) => f.name)).toEqual(["ok.jpg", "ok.webp"]);
		expect(erreurs).toHaveLength(1);
	});
});

describe("modulesCibleAccessibles", () => {
	it("ne garde que les modules dont l'utilisateur a le VOIR", () => {
		const modules = modulesCibleAccessibles([
			"RESIDENCE.VOIR",
			"RESIDENCE.ENCAISSER",
			"SIGNALEMENT.CREER",
		]);

		expect(modules).toEqual(["RESIDENCE"]);
	});

	it("renvoie tous les modules pour un administrateur", () => {
		const toutVoir = MODULES_CIBLE.map((module) => `${module}.VOIR`);

		expect(modulesCibleAccessibles(toutVoir)).toEqual(MODULES_CIBLE);
	});

	it("renvoie tous les modules avec SIGNALEMENT.DECLARER_TIERS, même sans VOIR", () => {
		expect(
			modulesCibleAccessibles([
				"SIGNALEMENT.DECLARER_TIERS",
				"SIGNALEMENT.CREER",
			]),
		).toEqual(MODULES_CIBLE);
	});

	it("renvoie une liste vide sans aucun VOIR de module", () => {
		expect(
			modulesCibleAccessibles(["SIGNALEMENT.CREER", "RESIDENT.VOIR"]),
		).toEqual([]);
	});

	it("ignore les autres verbes quand VOIR est absent", () => {
		expect(modulesCibleAccessibles(["PRESSING.MODIFIER"])).toEqual([]);
	});
});

describe("paginerSignalements", () => {
	it("découpe et borne la page demandée", () => {
		const items = Array.from({ length: 25 }, (_, i) =>
			signalement(String(i), "OUVERT"),
		);
		const page1 = paginerSignalements(items, 1, 10);
		expect(page1.items).toHaveLength(10);
		expect(page1.total).toBe(25);
		expect(page1.totalPages).toBe(3);
		expect(page1.start).toBe(1);
		expect(page1.end).toBe(10);

		const pageHorsBornes = paginerSignalements(items, 99, 10);
		expect(pageHorsBornes.page).toBe(3);
		expect(pageHorsBornes.items).toHaveLength(5);
	});
});
