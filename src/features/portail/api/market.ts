import { getApiClient } from "#/core/api";

import type { LigneVentePortail, VentePortail } from "../models/market";

type LigneVentePortailWire = Omit<LigneVentePortail, "nom_produit"> & {
	/** Nom du produit embarqué — string livrée (market 085), objet `{nom}` toléré. */
	produit?: string | { nom?: string | null } | null;
};

type VentePortailWire = Omit<VentePortail, "id" | "lignes"> & {
	id_vente: string;
	lignes?: LigneVentePortailWire[];
};

const toLigne = ({
	produit,
	...reste
}: LigneVentePortailWire): LigneVentePortail => ({
	...reste,
	nom_produit: typeof produit === "string" ? produit : (produit?.nom ?? null),
});

const toVente = ({
	id_vente: id,
	lignes,
	...reste
}: VentePortailWire): VentePortail => ({
	id,
	...reste,
	...(lignes ? { lignes: lignes.map(toLigne) } : {}),
});

/**
 * Appels API du portail résident — demandes boutique
 * (`/market/portail/ventes`). Le client est déduit du JWT : ne jamais
 * envoyer `id_client`, de montant ni de paiement (le serveur fige
 * `prix_unitaire` au `prix_vente` catalogue). La vente naît `EN_ATTENTE`
 * avec `origine = "PORTAIL"` — le stock n'est décrémenté qu'à la
 * validation staff.
 */

/** Liste des demandes boutique du résident connecté (RESIDENT.VOIR). */
export async function listMesVentesPortail(): Promise<VentePortail[]> {
	const response = await getApiClient().apiFetch<VentePortailWire[]>(
		"/api/v1/market/portail/ventes",
	);
	return response.map(toVente);
}

/** Détail d'une demande du résident (RESIDENT.VOIR, `lignes` embarquées). */
export async function getVentePortail(id: string): Promise<VentePortail> {
	const response = await getApiClient().apiFetch<VentePortailWire>(
		`/api/v1/market/portail/ventes/${id}`,
	);
	return toVente(response);
}

/** Corps saisi par le panier boutique de l'espace client. */
export interface VentePortailBody {
	lignes: { id_produit: string; quantite: string }[];
	/** Consigne optionnelle (≤500). */
	note?: string;
}

/** Envoie une demande d'achat (POST, MARCHANDISE.COMMANDER → EN_ATTENTE). */
export function creerVentePortail(body: VentePortailBody): Promise<unknown> {
	const corps = {
		lignes: body.lignes,
		...(body.note ? { note: body.note } : {}),
	};
	return getApiClient().apiFetch("/api/v1/market/portail/ventes", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/**
 * Annule une demande encore `EN_ATTENTE` (POST `.../annuler`,
 * MARCHANDISE.COMMANDER — 409 si déjà validée/refusée).
 */
export function annulerVentePortail(
	id: string,
	motif?: string,
): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/market/portail/ventes/${id}/annuler`,
		{
			method: "POST",
			...(motif ? { body: JSON.stringify({ motif }) } : {}),
		},
	);
}
