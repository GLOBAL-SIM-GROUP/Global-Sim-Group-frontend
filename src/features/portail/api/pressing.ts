import { getApiClient } from "#/core/api";
import type {
	PressingCommande,
	PressingCommandeDetail,
} from "../models/pressing";

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
type CommandeDetailWire = Omit<PressingCommandeDetail, "id"> & {
	id_commande: string;
};

const toCommande = ({
	id_commande: id,
	...reste
}: CommandeWire): PressingCommande => ({
	id,
	...reste,
});

/**
 * Récupère la liste des commandes de pressing du résident.
 * Endpoint: GET /api/v1/pressing/commandes (filtré par résident du token)
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
		`/api/v1/pressing/commandes?${queryParams.toString()}`,
	);
	return response.map(toCommande);
}

/**
 * Récupère le détail d'une commande de pressing.
 * Endpoint: GET /api/v1/pressing/commandes/{id}
 */
export async function getPressingCommande(
	id: string,
): Promise<PressingCommandeDetail> {
	if (!id || id === "undefined") {
		throw new Error("Commande ID must be a valid string");
	}
	const response = await getApiClient().apiFetch<CommandeDetailWire>(
		`/api/v1/pressing/commandes/${id}`,
	);
	return {
		...toCommande(response),
		articles: response.articles,
		notes: response.notes,
	};
}
