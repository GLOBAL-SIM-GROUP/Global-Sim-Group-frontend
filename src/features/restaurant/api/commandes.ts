import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";
import type { ApercuAbonnementRestaurant } from "#/features/abonnement/models/abonnements";

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
type EncaisserCommandeDto = components["schemas"]["EncaisserCommandeDto"];
type ApercuAbonnementRestaurantDto =
	components["schemas"]["ApercuAbonnementRestaurantDto"];

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
	/** Optionnel : omis quand l'abonnement couvre la totalité (`total_du` 0). */
	paiement?: { montant: string; idMoyen: string };
	/** `true` (défaut) = consommer le quota abonnement du client. */
	utiliserAbonnement?: boolean;
	/** Renvoyer `true` après un 409 `ABONNEMENT_EXCEDENT` confirmé par le staff. */
	accepterExcedent?: boolean;
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
		...(body.paiement
			? {
					paiement: {
						montant: body.paiement.montant,
						id_moyen: body.paiement.idMoyen,
					},
				}
			: {}),
		utiliser_abonnement: body.utiliserAbonnement ?? true,
		accepter_excedent: body.accepterExcedent ?? false,
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
 * règlement du montant **ajusté par l'aperçu abonnement** — `idMoyen` est
 * omis quand la couverture solde tout (`montant` 0) ; `accepterExcedent:
 * true` est renvoyé après le 409 `ABONNEMENT_EXCEDENT` confirmé par le staff.
 */
export function encaisserCommande(
	id: string,
	body: {
		montant: string;
		idMoyen?: string;
		date?: string;
		utiliserAbonnement?: boolean;
		accepterExcedent?: boolean;
	},
): Promise<unknown> {
	const corps = {
		montant: body.montant,
		...(body.idMoyen ? { id_moyen: body.idMoyen } : {}),
		utiliser_abonnement: body.utiliserAbonnement ?? true,
		accepter_excedent: body.accepterExcedent ?? false,
		...(body.date ? { date: body.date } : {}),
	} satisfies EncaisserCommandeDto;
	return getApiClient().apiFetch(
		`/api/v1/restaurant/commandes/${id}/encaisser`,
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
}

/**
 * Aperçu de couverture pour de nouvelles lignes (POST
 * `/restaurant/commandes/apercu-abonnement`, lecture seule) — relancé à
 * chaque changement de lignes, débouncé ~300 ms côté écran.
 */
export function apercuAbonnementLignes(body: {
	idClient: string;
	lignes: { idPlat: string; quantite: string }[];
}): Promise<ApercuAbonnementRestaurant> {
	const corps = {
		id_client: body.idClient,
		lignes: body.lignes.map((ligne) => ({
			id_plat: ligne.idPlat,
			quantite: ligne.quantite,
		})),
	} satisfies ApercuAbonnementRestaurantDto;
	return getApiClient().apiFetch<ApercuAbonnementRestaurant>(
		"/api/v1/restaurant/commandes/apercu-abonnement",
		{ method: "POST", body: JSON.stringify(corps) },
	);
}

/**
 * Aperçu de couverture d'une commande existante (GET
 * `/restaurant/commandes/{id}/apercu-abonnement`) — lancé avant l'encaissement
 * d'une commande du portail pour connaître le montant réellement dû.
 */
export function apercuAbonnementCommande(
	id: string,
): Promise<ApercuAbonnementRestaurant> {
	return getApiClient().apiFetch<ApercuAbonnementRestaurant>(
		`/api/v1/restaurant/commandes/${id}/apercu-abonnement`,
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
