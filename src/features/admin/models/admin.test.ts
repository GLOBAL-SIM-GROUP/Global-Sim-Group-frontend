import { describe, expect, it } from "vitest";

import type { TraceAudit } from "./audit";
import { rechercherAudit } from "./audit";
import { permissionsParModule } from "./roles";
import type { Utilisateur } from "./utilisateurs";
import { filtrerUtilisateurs } from "./utilisateurs";

function utilisateur(
	id: string,
	role: string | null,
	actif: boolean,
): Utilisateur {
	return {
		id,
		nom: `Nom${id}`,
		prenom: "Awa",
		login: `login${id}`,
		id_role: role,
		id_activite_scope: null,
		actif,
		date_creation: "2026-08-17 00:00:00",
		dernier_connexion: null,
		id_client: null,
	};
}

describe("filtrerUtilisateurs", () => {
	it("filtre par rôle et statut", () => {
		const utilisateurs = [
			utilisateur("1", "3", true),
			utilisateur("2", "4", true),
			utilisateur("3", "3", false),
		];
		expect(
			filtrerUtilisateurs(utilisateurs, { role: "tous", statut: "tous" }),
		).toHaveLength(3);
		expect(
			filtrerUtilisateurs(utilisateurs, { role: "3", statut: "tous" }),
		).toHaveLength(2);
		expect(
			filtrerUtilisateurs(utilisateurs, { role: "tous", statut: "actifs" }),
		).toHaveLength(2);
		expect(
			filtrerUtilisateurs(utilisateurs, { role: "3", statut: "inactifs" }),
		).toHaveLength(1);
	});
});

describe("permissionsParModule", () => {
	it("groupe les permissions par module et trie", () => {
		const groupes = permissionsParModule([
			{ id: "1", code: "ADMIN.CREER", libelle: "x" },
			{ id: "2", code: "RH.VOIR", libelle: "y" },
			{ id: "3", code: "ADMIN.VOIR", libelle: "z" },
		]);
		expect(Object.keys(groupes)).toEqual(["ADMIN", "RH"]);
		expect(groupes.ADMIN.map((p) => p.code)).toEqual([
			"ADMIN.CREER",
			"ADMIN.VOIR",
		]);
	});
});

describe("rechercherAudit", () => {
	it("cherche dans module, entité, description", () => {
		const traces: TraceAudit[] = [
			{
				id: "1",
				date_heure: "2026-08-20 10:00:00",
				id_utilisateur: "2",
				module: "admin",
				operation: "UPDATE",
				entite: "utilisateur",
				entite_id: "3",
				description: "Modification du compte",
				montant: null,
				avant: null,
			},
			{
				id: "2",
				date_heure: "2026-08-20 11:00:00",
				id_utilisateur: "2",
				module: "finances",
				operation: "CREATE",
				entite: "depense",
				entite_id: "9",
				description: "Nouvelle dépense",
				montant: null,
				avant: null,
			},
		];
		expect(rechercherAudit(traces, "finances")).toHaveLength(1);
		expect(rechercherAudit(traces, "dépense")).toHaveLength(1);
		expect(rechercherAudit(traces, "compte")).toHaveLength(1);
		expect(rechercherAudit(traces, "zzz")).toHaveLength(0);
		expect(rechercherAudit(traces, "")).toHaveLength(2);
	});
});
