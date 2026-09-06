import { describe, expect, it } from "vitest";

import {
	libelleEntite,
	libelleObjet,
	libelleOperation,
	resumerDetailAudit,
	type TraceAudit,
} from "./audit";

function trace(partiel: Partial<TraceAudit>): TraceAudit {
	return {
		id: "1",
		date_heure: "2026-09-06 08:00:00",
		id_utilisateur: "2",
		module: "finances",
		operation: "UPDATE",
		entite: "moyen_paiement",
		entite_id: "5",
		description: "UPDATE finances.moyen_paiement (id 5)",
		montant: null,
		avant: null,
		apres: null,
		...partiel,
	};
}

describe("libelleOperation", () => {
	it("traduit les opérations CRUD connues", () => {
		expect(libelleOperation("INSERT")).toBe("Création");
		expect(libelleOperation("UPDATE")).toBe("Modification");
		expect(libelleOperation("DELETE")).toBe("Suppression");
	});

	it("laisse passer une opération inconnue telle quelle", () => {
		expect(libelleOperation("MERGE")).toBe("MERGE");
	});
});

describe("libelleEntite", () => {
	it("traduit une table connue", () => {
		expect(libelleEntite("contrat_location")).toBe("Contrat de location");
	});

	it("replie une table inconnue en underscore → espace + majuscule", () => {
		expect(libelleEntite("nouvelle_table_xyz")).toBe("Nouvelle table xyz");
	});

	it("renvoie « Élément » si aucune entité", () => {
		expect(libelleEntite(null)).toBe("Élément");
	});
});

describe("libelleObjet", () => {
	it("combine le libellé de l'entité et son id", () => {
		expect(
			libelleObjet(trace({ entite: "moyen_paiement", entite_id: "5" })),
		).toBe("Moyen de paiement n° 5");
	});

	it("renvoie « — » sans entité", () => {
		expect(libelleObjet(trace({ entite: null, entite_id: null }))).toBe("—");
	});
});

describe("resumerDetailAudit", () => {
	it("résume une création via un champ identifiant (libelle/nom/login)", () => {
		const résumé = resumerDetailAudit(
			trace({
				operation: "INSERT",
				entite: "moyen_paiement",
				avant: null,
				apres: JSON.stringify({
					id_moyen: 6,
					libelle: "Orange Money",
					actif: true,
				}),
			}),
		);
		expect(résumé).toBe("Création : Orange Money");
	});

	it("résume une suppression via le snapshot avant", () => {
		const résumé = resumerDetailAudit(
			trace({
				operation: "DELETE",
				entite: "produit",
				avant: JSON.stringify({ id_produit: 8, nom: "Savon" }),
				apres: null,
			}),
		);
		expect(résumé).toBe("Suppression : Savon");
	});

	it("liste les champs modifiés avec valeur avant/après en français", () => {
		const résumé = resumerDetailAudit(
			trace({
				operation: "UPDATE",
				avant: JSON.stringify({ libelle: "Wave", actif: true }),
				apres: JSON.stringify({ libelle: "Wave", actif: false }),
			}),
		);
		expect(résumé).toBe("Actif : Oui → Non");
	});

	it("ignore le mot de passe dans le résumé (jamais informatif, masqué)", () => {
		const résumé = resumerDetailAudit(
			trace({
				operation: "UPDATE",
				entite: "utilisateur",
				avant: JSON.stringify({ mot_de_passe: "***", nom: "Ancien" }),
				apres: JSON.stringify({ mot_de_passe: "***", nom: "Nouveau" }),
			}),
		);
		expect(résumé).toBe("Nom : Ancien → Nouveau");
	});

	it("signale l'absence de changement de valeur", () => {
		const résumé = resumerDetailAudit(
			trace({
				operation: "UPDATE",
				avant: JSON.stringify({ nom: "Identique" }),
				apres: JSON.stringify({ nom: "Identique" }),
			}),
		);
		expect(résumé).toBe("Aucun changement de valeur.");
	});

	it("replie sur la description technique si le JSON est absent", () => {
		const résumé = resumerDetailAudit(
			trace({
				operation: "UPDATE",
				avant: null,
				apres: null,
				description: "UPDATE finances.moyen_paiement (id 5)",
			}),
		);
		expect(résumé).toBe("UPDATE finances.moyen_paiement (id 5)");
	});
});
