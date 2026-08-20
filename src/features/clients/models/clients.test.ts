import { describe, expect, it } from "vitest";

import type { Client } from "./clients";
import { filtrerClients, nomComplet, paginerClients } from "./clients";

function client(id: string, type: Client["type_client"]): Client {
	return {
		id,
		nom: `Nom${id}`,
		prenoms: "Awa",
		date_naissance: null,
		lieu_naissance: null,
		sexe: null,
		nationalite: null,
		profession: null,
		photo: null,
		tel_principal: "+225 07 00 00 01",
		tel_secondaire: null,
		email: null,
		adresse: null,
		ville: "Abidjan",
		pays: null,
		date_enregistrement: "2026-08-17 00:00:00",
		type_client: type,
	};
}

describe("nomComplet", () => {
	it("renvoie « PRENOMS Nom »", () => {
		expect(nomComplet(client("1", "LOCATAIRE"))).toBe("Awa Nom1");
	});
});

describe("filtrerClients", () => {
	it("filtre par type et texte libre", () => {
		const clients = [
			client("1", "LOCATAIRE"),
			client("2", "PASSAGE"),
			client("3", "LOCATAIRE"),
		];
		expect(
			filtrerClients(clients, { type: "tous", recherche: "" }),
		).toHaveLength(3);
		expect(
			filtrerClients(clients, { type: "LOCATAIRE", recherche: "" }),
		).toHaveLength(2);
		expect(
			filtrerClients(clients, { type: "tous", recherche: "awa" }),
		).toHaveLength(3);
		expect(
			filtrerClients(clients, { type: "PASSAGE", recherche: "nom2" }),
		).toHaveLength(1);
	});
});

describe("paginerClients", () => {
	it("borne la page dans [1, totalPages]", () => {
		const clients = Array.from({ length: 25 }, (_, index) =>
			client(String(index + 1), "LOCATAIRE"),
		);
		const page3 = paginerClients(clients, 3, 12);
		expect(page3.items).toHaveLength(1);
		expect(page3.totalPages).toBe(3);
		expect(paginerClients(clients, 99, 12).page).toBe(3);
	});
});
