import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	CommandeRestaurant,
	CommandeRestaurantDetail,
	CommandeRestaurantStatut,
	LigneCommandeRestaurant,
	TypeCommande,
} from "../models/commandes";
import type { RapportRestaurant } from "../models/statistiques";

type CreerCommandeRestaurantDto =
	components["schemas"]["CreerCommandeRestaurantDto"];
type MajStatutCommandeDto = components["schemas"]["MajStatutCommandeDto"];

type CommandeWire = Omit<CommandeRestaurant, "id"> & { id_commande: string };
type LigneWire = Omit<LigneCommandeRestaurant, "id"> & { id_ligne: string };
type DetailWire = Omit<CommandeRestaurantDetail, "id" | "lignes"> & {
	id_commande: string;
	lignes: LigneWire[];
};

export interface ListCommandesParams {
	search?: string;
	du?: string;
	au?: string;
	statut?: string;
}

/** Appels API du module Restaurant — commandes et rapports. */
export function listCommandes(
	params?: ListCommandesParams,
): Promise<CommandeRestaurant[]> {
	const searchParams = new URLSearchParams();
	if (params?.search) searchParams.set("search", params.search);
	if (params?.du) searchParams.set("du", params.du);
	if (params?.au) searchParams.set("au", params.au);
	if (params?.statut && params.statut !== "tous") {
		searchParams.set("statut", params.statut);
	}
	const qs = searchParams.toString();
	return getApiClient()
		.apiFetch<CommandeWire[]>(
			`/api/v1/restaurant/commandes${qs ? `?${qs}` : ""}`,
		)
		.then((data) =>
			data.map(({ id_commande: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'une commande : embarque les lignes (Voir la facture). */
export function getCommande(id: string): Promise<CommandeRestaurantDetail> {
	return getApiClient()
		.apiFetch<DetailWire>(`/api/v1/restaurant/commandes/${id}`)
		.then((data) => {
			const { id_commande: cid, ...reste } = data;
			return {
				id: cid,
				...reste,
				lignes: data.lignes.map(({ id_ligne: lid, ...lreste }) => ({
					id: lid,
					...lreste,
				})),
			};
		});
}

/** Corps saisi par le formulaire « Nouvelle commande ». */
export interface CommandeBody {
	type: TypeCommande;
	lignes: { idPlat: string; quantite: string }[];
	idClient?: string | null;
	paiement: { montant: string; idMoyen: string };
}

/** Enregistre une commande (POST `CreerCommandeRestaurantDto`). */
export function creerCommande(body: CommandeBody): Promise<unknown> {
	const corps = {
		type: body.type,
		lignes: body.lignes.map((ligne) => ({
			id_plat: ligne.idPlat,
			quantite: ligne.quantite,
		})),
		...(body.idClient ? { id_client: body.idClient } : {}),
		paiement: {
			montant: body.paiement.montant,
			id_moyen: body.paiement.idMoyen,
		},
	} satisfies Omit<CreerCommandeRestaurantDto, "id_client"> & {
		id_client?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/restaurant/commandes", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/**
 * Modifie le statut d'une commande (POST `/api/v1/commandes/{id}/statut`).
 * `motif` (optionnel) porte la raison du refus quand `statut === "ANNULEE"`
 * — restitué au résident dans `motif_annulation`. La transition
 * `EN_ATTENTE → EN_COURS` (validation d'une commande du portail) exige
 * `RESTAURANT.VALIDER`.
 */
export function majStatutCommande(
	id: string,
	statut: CommandeRestaurantStatut,
	motif?: string,
): Promise<unknown> {
	const corps = {
		statut,
		...(motif ? { motif } : {}),
	} satisfies Omit<MajStatutCommandeDto, "motif"> & { motif?: string };
	return getApiClient().apiFetch(`/api/v1/restaurant/commandes/${id}/statut`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/**
 * Encaissement physique d'une commande (POST
 * `/api/v1/restaurant/commandes/{id}/encaisser`, `FINANCES.ENCAISSER`) :
 * règlement intégral uniquement (400 si `montant ≠ total`), crée la facture
 * `COMMANDE_RESTAURANT` soldée et passe la commande à `PAYEE`.
 */
export function encaisserCommande(
	id: string,
	body: { montant: string; idMoyen: string; date?: string },
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/restaurant/commandes/${id}/encaisser`,
		{
			method: "POST",
			body: JSON.stringify({
				montant: body.montant,
				id_moyen: body.idMoyen,
				...(body.date ? { date: body.date } : {}),
			}),
		},
	);
}

/** Annule une commande (POST `/api/v1/commandes/{id}/annuler`). */
export function annulerCommande(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/restaurant/commandes/${id}/annuler`, {
		method: "POST",
	});
}

/** Rapports de ventes (GET /restaurant/rapports/ventes, params période). */
export function listRapportVentes(
	du?: string,
	au?: string,
): Promise<RapportRestaurant[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	return getApiClient().apiFetch<RapportRestaurant[]>(
		`/api/v1/restaurant/rapports/ventes${qs ? `?${qs}` : ""}`,
	);
}
