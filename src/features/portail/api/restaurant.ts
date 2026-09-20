import { getApiClient } from "#/core/api";

import type {
	CommandeRestaurantPortail,
	TypeCommandePortail,
} from "../models/restaurant";

type CommandeWire = Omit<CommandeRestaurantPortail, "id"> & {
	id_commande: string;
};

const toCommande = ({
	id_commande: id,
	...reste
}: CommandeWire): CommandeRestaurantPortail => ({
	id,
	...reste,
});

/**
 * Appels API du portail résident — commandes restaurant
 * (`/restaurant/portail/commandes`). Le client est déduit du JWT : ne jamais
 * envoyer `id_client` ni de montant (le serveur recompute le total depuis
 * les prix des plats). La commande naît `EN_ATTENTE` — rien ne part en
 * cuisine avant validation du personnel.
 */

/** Liste des commandes du résident connecté (RESIDENT.VOIR). */
export async function listMesCommandesRestaurant(): Promise<
	CommandeRestaurantPortail[]
> {
	const response = await getApiClient().apiFetch<CommandeWire[]>(
		"/api/v1/restaurant/portail/commandes",
	);
	return response.map(toCommande);
}

/** Détail d'une commande du résident (RESIDENT.VOIR, `lignes` embarquées). */
export async function getCommandeRestaurantPortail(
	id: string,
): Promise<CommandeRestaurantPortail> {
	const response = await getApiClient().apiFetch<CommandeWire>(
		`/api/v1/restaurant/portail/commandes/${id}`,
	);
	return toCommande(response);
}

/** Corps saisi par le formulaire de commande en ligne. */
export interface CommandeRestaurantPortailBody {
	type: TypeCommandePortail;
	lignes: { id_plat: string; quantite: string }[];
	/** Requis quand `type === "LIVRAISON"` (400 sinon). */
	adresseLivraison?: string;
	notes?: string;
}

/** Envoie une commande (POST, RESTAURANT.COMMANDER). */
export function creerCommandeRestaurantPortail(
	body: CommandeRestaurantPortailBody,
): Promise<unknown> {
	const corps = {
		type: body.type,
		lignes: body.lignes,
		...(body.adresseLivraison
			? { adresse_livraison: body.adresseLivraison }
			: {}),
		...(body.notes ? { notes: body.notes } : {}),
	};
	return getApiClient().apiFetch("/api/v1/restaurant/portail/commandes", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/**
 * Annule une commande encore `EN_ATTENTE` (POST `.../annuler`,
 * RESTAURANT.COMMANDER — 409 si la commande a déjà été prise en charge).
 */
export function annulerCommandeRestaurantPortail(id: string): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/restaurant/portail/commandes/${id}/annuler`,
		{ method: "POST" },
	);
}
