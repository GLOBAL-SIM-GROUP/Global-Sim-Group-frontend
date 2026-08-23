import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Client } from "../models/clients";

type CreerClientDto = components["schemas"]["CreerClientDto"];

type ClientWire = Omit<Client, "id"> & { id_client: string };

const toClient = ({ id_client: id, ...reste }: ClientWire): Client => ({
	id,
	...reste,
});

/**
 * Appels API du module Clients (base unique). Le lister exige `recherche`
 * (full-text serveur) : toujours envoyer le terme. `getClient(id)` sert à
 * résoudre les noms des locataires (le lister contrats ne les embarque pas).
 */
export function rechercherClients(terme: string): Promise<Client[]> {
	return getApiClient()
		.apiFetch<ClientWire[]>(
			`/client/clients?recherche=${encodeURIComponent(terme)}`,
		)
		.then((data) => data.map(toClient));
}

/** Détail d'un client (GET /client/clients/{id}). */
export function getClient(id: string): Promise<Client> {
	return getApiClient()
		.apiFetch<ClientWire>(`/api/v1/client/clients/${id}`)
		.then(toClient);
}

/** Corps saisi pour créer un client (formulaire inline du contrat). */
export interface CreerClientBody {
	nom: string;
	prenoms: string;
	telPrincipal: string;
	typeClient: "LOCATAIRE" | "PASSAGE" | "AUTRE";
}

/** Crée un client (POST `CreerClientDto` — uniquement les champs saisis). */
export function creerClient(body: CreerClientBody): Promise<unknown> {
	const corps = {
		nom: body.nom,
		prenoms: body.prenoms,
		tel_principal: body.telPrincipal,
		type_client: body.typeClient,
	} satisfies CreerClientDto;
	return getApiClient().apiFetch("/api/v1/client/clients", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
