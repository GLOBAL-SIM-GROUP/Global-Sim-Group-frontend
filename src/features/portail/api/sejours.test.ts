import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "#/core/api/api-error";

import {
	annulerSejourPortail,
	creerSejourPortail,
	getSejourPortail,
	getSejourPortailFacture,
	listLogementsPortail,
	listMesSejoursPortail,
} from "./sejours";

const apiFetch = vi.fn();

vi.mock("#/core/api", async (importOriginal) => {
	const original = await importOriginal<typeof import("#/core/api")>();
	return { ...original, getApiClient: () => ({ apiFetch }) };
});

const SEJOUR_WIRE = {
	id_sejour: "21",
	id_client: "7",
	type_prestation: "NUITEE",
	id_logement: "4",
	logement: { id: "4", numero: "CH-102", type: "CHAMBRE" },
	numero_logement: "CH-102",
	date_heure_arrivee: "2026-10-02 14:00:00",
	date_heure_depart_prevue: "2026-10-05 11:00:00",
	date_heure_depart_reelle: null,
	duree: null,
	tarif: null,
	montant_total: null,
	montant_paye: "0.00",
	reste_a_payer: null,
	statut: "EN_ATTENTE",
	type_logement: "CHAMBRE",
	nombre_personnes: 2,
	observations: "Arrivée tardive",
	motif_annulation: null,
	origine: "PORTAIL",
};

describe("listLogementsPortail", () => {
	beforeEach(() => apiFetch.mockReset());

	it("appelle le catalogue sans filtre quand aucune date n'est donnée", async () => {
		apiFetch.mockResolvedValue([]);
		await listLogementsPortail();
		expect(apiFetch).toHaveBeenCalledWith(
			"/api/v1/residence/portail/sejours/logements",
		);
	});

	it("passe les dates en query params snake_case", async () => {
		apiFetch.mockResolvedValue([]);
		await listLogementsPortail({
			dateArrivee: "2026-10-02",
			dateDepart: "2026-10-05",
		});
		expect(apiFetch).toHaveBeenCalledWith(
			"/api/v1/residence/portail/sejours/logements?date_arrivee=2026-10-02&date_depart=2026-10-05",
		);
	});
});

describe("listMesSejoursPortail / getSejourPortail", () => {
	beforeEach(() => apiFetch.mockReset());

	it("remappe id_sejour → id et conserve le logement imbriqué + champs nullables", async () => {
		apiFetch.mockResolvedValue([SEJOUR_WIRE]);
		const [sejour] = await listMesSejoursPortail();
		expect(apiFetch).toHaveBeenCalledWith("/api/v1/residence/portail/sejours");
		expect(sejour.id).toBe("21");
		expect(sejour.logement).toEqual({
			id: "4",
			numero: "CH-102",
			type: "CHAMBRE",
		});
		expect(sejour.tarif).toBeNull();
		expect(sejour.montant_total).toBeNull();
		expect(sejour.nombre_personnes).toBe(2);
		expect(sejour.statut).toBe("EN_ATTENTE");
	});

	it("détail : remappe id_sejour → id", async () => {
		apiFetch.mockResolvedValue(SEJOUR_WIRE);
		const sejour = await getSejourPortail("21");
		expect(apiFetch).toHaveBeenCalledWith(
			"/api/v1/residence/portail/sejours/21",
		);
		expect(sejour.id).toBe("21");
	});
});

describe("creerSejourPortail", () => {
	beforeEach(() => apiFetch.mockReset());

	it("envoie id_logement (pas de type_logement) et nombre_personnes en string", async () => {
		apiFetch.mockResolvedValue(SEJOUR_WIRE);
		await creerSejourPortail({
			idLogement: "4",
			typePrestation: "NUITEE",
			dateHeureArrivee: "2026-10-02 14:00:00",
			dateHeureDepartPrevue: "2026-10-05 11:00:00",
			nombrePersonnes: 2,
			observations: "  Arrivée tardive  ",
		});
		expect(apiFetch).toHaveBeenCalledWith("/api/v1/residence/portail/sejours", {
			method: "POST",
			body: JSON.stringify({
				id_logement: "4",
				type_prestation: "NUITEE",
				date_heure_arrivee: "2026-10-02 14:00:00",
				date_heure_depart_prevue: "2026-10-05 11:00:00",
				nombre_personnes: "2",
				observations: "Arrivée tardive",
			}),
		});
	});

	it("omet les champs optionnels vides", async () => {
		apiFetch.mockResolvedValue(SEJOUR_WIRE);
		await creerSejourPortail({
			idLogement: "4",
			typePrestation: "SIESTE",
			dateHeureArrivee: "2026-10-02 14:00:00",
			observations: "   ",
		});
		expect(apiFetch).toHaveBeenCalledWith("/api/v1/residence/portail/sejours", {
			method: "POST",
			body: JSON.stringify({
				id_logement: "4",
				type_prestation: "SIESTE",
				date_heure_arrivee: "2026-10-02 14:00:00",
			}),
		});
	});
});

describe("annulerSejourPortail", () => {
	beforeEach(() => apiFetch.mockReset());

	it("envoie le motif quand il est fourni", async () => {
		apiFetch.mockResolvedValue({});
		await annulerSejourPortail("21", "  Empêchement  ");
		expect(apiFetch).toHaveBeenCalledWith(
			"/api/v1/residence/portail/sejours/21/annuler",
			{ method: "POST", body: JSON.stringify({ motif: "Empêchement" }) },
		);
	});

	it("envoie un corps vide sans motif", async () => {
		apiFetch.mockResolvedValue({});
		await annulerSejourPortail("21");
		expect(apiFetch).toHaveBeenCalledWith(
			"/api/v1/residence/portail/sejours/21/annuler",
			{ method: "POST", body: JSON.stringify({}) },
		);
	});
});

describe("getSejourPortailFacture", () => {
	// Pas de `beforeEach` ici : combiné à un `Promise.reject` dans le test,
	// vitest rapporte le rejet comme « unhandled » même s'il est attrapé par
	// la fonction — reset inline à la place.
	it("renvoie null sur 404 (pas encore encaissé — état normal)", async () => {
		apiFetch.mockReset();
		apiFetch.mockImplementation(() =>
			Promise.reject(
				new ApiError({
					status: 404,
					code: "404",
					message: "Aucun paiement encore encaissé",
				}),
			),
		);
		const result = await getSejourPortailFacture("21");
		expect(result).toBeNull();
	});

	it("propage les autres erreurs", async () => {
		apiFetch.mockReset();
		apiFetch.mockImplementation(() =>
			Promise.reject(
				new ApiError({ status: 500, code: "500", message: "Erreur serveur" }),
			),
		);
		const erreur = await getSejourPortailFacture("21").catch((e: unknown) => e);
		expect(erreur).toMatchObject({ status: 500 });
	});

	it("remappe id_facture/id_ligne → id", async () => {
		apiFetch.mockReset();
		apiFetch.mockResolvedValue({
			id_facture: "9",
			numero: "FAC-2026-009",
			montant_total: "35000.00",
			montant_paye: "35000.00",
			reste: "0.00",
			statut: "PAYEE",
			lignes: [
				{
					id_ligne: "1",
					libelle: "Nuitée CH-102",
					quantite: "3",
					prix_unitaire: "35000.00",
					total: "35000.00",
				},
			],
		});
		const facture = await getSejourPortailFacture("21");
		expect(facture?.id).toBe("9");
		expect(facture?.lignes[0]?.id).toBe("1");
	});
});
