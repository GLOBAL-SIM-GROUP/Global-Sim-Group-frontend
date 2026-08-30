import { getApiClient } from "#/core/api";

import type {
	EtatDesLieuxPhoto,
	EtatDesLieuxType,
} from "../models/etat-des-lieux";

type EtatDesLieuxPhotoWire = Omit<EtatDesLieuxPhoto, "id"> & {
	id_photo: string;
};

const toPhoto = ({
	id_photo: id,
	...reste
}: EtatDesLieuxPhotoWire): EtatDesLieuxPhoto => ({ id, ...reste });

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/**
 * Appels API du module Résidence — photos d'état des lieux d'un contrat.
 * GET liste (filtre `type` optionnel), POST liaison (l'upload du fichier est
 * une étape séparée via `#/core/api/uploads`), DELETE.
 */
export function listEtatDesLieux(
	idContrat: string,
	type?: EtatDesLieuxType,
): Promise<EtatDesLieuxPhoto[]> {
	const params = new URLSearchParams();
	if (type) params.set("type", type);
	const qs = params.toString();
	return getApiClient()
		.apiFetch<EtatDesLieuxPhotoWire[]>(
			`/api/v1/residence/contrats/${idContrat}/etat-des-lieux${qs ? `?${qs}` : ""}`,
		)
		.then((data) => data.map(toPhoto));
}

/** Corps saisi par le formulaire d'ajout d'une photo. */
export interface EtatDesLieuxBody {
	type: EtatDesLieuxType;
	piece?: string | null;
	cle_objet: string;
	commentaire?: string | null;
}

/** Lie une photo déjà uploadée (clé MinIO) au contrat. */
export function ajouterEtatDesLieux(
	idContrat: string,
	body: EtatDesLieuxBody,
): Promise<unknown> {
	const corps = {
		type: body.type,
		piece: texteOuNull(body.piece),
		cle_objet: body.cle_objet,
		commentaire: texteOuNull(body.commentaire),
	};
	return getApiClient().apiFetch(
		`/api/v1/residence/contrats/${idContrat}/etat-des-lieux`,
		{ method: "POST", body: JSON.stringify(corps) },
	);
}

/** Supprime une photo d'état des lieux. */
export function supprimerEtatDesLieux(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/residence/etat-des-lieux/${id}`, {
		method: "DELETE",
	});
}
