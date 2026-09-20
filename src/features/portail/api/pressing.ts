import { getApiClient } from "#/core/api";
import type { PressingCommande, RecuPressing } from "../models/pressing";

interface ListCommandesParams {
	recherche?: string;
	statut?: string;
	sort?: string;
	order?: "asc" | "desc";
	limit?: number;
	offset?: number;
	du?: string;
	au?: string;
}

type CommandeWire = Omit<PressingCommande, "id"> & { id_commande: string };

const toCommande = ({
	id_commande: id,
	...reste
}: CommandeWire): PressingCommande => ({
	id,
	...reste,
});

/**
 * Récupère la liste des commandes de pressing du résident connecté.
 * Endpoint portail (RESIDENT.VOIR) : GET /api/v1/pressing/portail/commandes
 */
export async function listPressingCommandes(
	params: ListCommandesParams = {},
): Promise<PressingCommande[]> {
	const queryParams = new URLSearchParams();

	if (params.recherche) queryParams.append("recherche", params.recherche);
	if (params.statut) queryParams.append("statut", params.statut);
	if (params.sort) queryParams.append("sort", params.sort);
	if (params.order) queryParams.append("order", params.order);
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.offset) queryParams.append("offset", params.offset.toString());
	if (params.du) queryParams.append("du", params.du);
	if (params.au) queryParams.append("au", params.au);

	const response = await getApiClient().apiFetch<CommandeWire[]>(
		`/api/v1/pressing/portail/commandes?${queryParams.toString()}`,
	);
	return response.map(toCommande);
}

/**
 * Récupère le détail d'une commande de pressing du résident connecté.
 * Endpoint portail (RESIDENT.VOIR) : GET /api/v1/pressing/portail/commandes/{id}
 * Renvoie exactement la même forme que la liste (pas d'articles/notes).
 */
export async function getPressingCommande(
	id: string,
): Promise<PressingCommande> {
	if (!id || id === "undefined") {
		throw new Error("Commande ID must be a valid string");
	}
	const response = await getApiClient().apiFetch<CommandeWire>(
		`/api/v1/pressing/portail/commandes/${id}`,
	);
	return toCommande(response);
}

/**
 * Annule une demande de dépôt encore `EN_ATTENTE` (POST
 * `/pressing/portail/commandes/{id}/annuler`, PRESSING.DECLARER — 409 si le
 * personnel a déjà traité la demande).
 */
export function annulerDepotPressing(id: string): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/pressing/portail/commandes/${id}/annuler`,
		{ method: "POST" },
	);
}

/**
 * Reçu d'une commande de pressing du résident connecté (GET
 * `/pressing/portail/commandes/{id}/recu`, RESIDENT.VOIR). Données JSON
 * rendues par le frontend — pas un PDF ; les montants sont `null` tant que
 * le dépôt n'est pas tarifé.
 */
export function getRecuCommandePressing(id: string): Promise<RecuPressing> {
	return getApiClient().apiFetch<RecuPressing>(
		`/api/v1/pressing/portail/commandes/${id}/recu`,
	);
}
