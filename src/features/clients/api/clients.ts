import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	Client,
	ClientDetail,
	ContactUrgence,
	PieceIdentite,
	TypeClient,
} from "../models/clients";

type CreerContactDto = components["schemas"]["CreerContactDto"];
type CreerPieceDto = components["schemas"]["CreerPieceDto"];

type ClientWire = Omit<Client, "id"> & { id_client: string };
type ContactWire = Omit<ContactUrgence, "id"> & { id_contact: string };
type PieceWire = Omit<PieceIdentite, "id"> & { id_piece: string };
type ClientDetailWire = Omit<ClientDetail, "id" | "contacts" | "pieces"> & {
	id_client: string;
	contacts: ContactWire[];
	pieces: PieceWire[];
};

const remapClient = ({ id_client: id, ...reste }: ClientWire): Client => ({
	id,
	...reste,
});

/** Corps saisi par le formulaire client. */
export interface ClientBody {
	nom: string;
	prenoms: string;
	telPrincipal: string;
	typeClient: TypeClient;
	dateNaissance?: string | null;
	lieuNaissance?: string | null;
	sexe?: string | null;
	nationalite?: string | null;
	profession?: string | null;
	photo?: string | null;
	telSecondaire?: string | null;
	email?: string | null;
	adresse?: string | null;
	ville?: string | null;
	pays?: string | null;
}

/** Construit le corps wire d'un client (champs `object` élargis). */
function corpsClient(body: ClientBody, dto: "create" | "update"): object {
	const valeurs: Record<string, string | null> = {
		nom: body.nom,
		prenoms: body.prenoms,
		tel_principal: body.telPrincipal,
		type_client: body.typeClient,
		date_naissance: body.dateNaissance || null,
		lieu_naissance: body.lieuNaissance || null,
		sexe: body.sexe || null,
		nationalite: body.nationalite || null,
		profession: body.profession || null,
		photo: body.photo || null,
		tel_secondaire: body.telSecondaire || null,
		email: body.email || null,
		adresse: body.adresse || null,
		ville: body.ville || null,
		pays: body.pays || null,
	};
	// Retire les valeurs vides pour le PATCH (champs définis seulement).
	if (dto === "update") {
		for (const [cle, valeur] of Object.entries(valeurs)) {
			if (!valeur) delete valeurs[cle];
		}
	}
	return valeurs;
}

export interface ListClientsParams {
	search?: string;
}

/** Appels API du module Clients — fiches locataires et clients. */
export function listClients(params?: ListClientsParams): Promise<Client[]> {
	const qs = params?.search?.trim()
		? `?search=${encodeURIComponent(params.search.trim())}`
		: "";
	return getApiClient()
		.apiFetch<ClientWire[]>(`/client/clients${qs}`)
		.then((data) => data.map(remapClient));
}

/** Détail d'un client (contacts et pièces inclus). */
export function getClient(id: string): Promise<ClientDetail> {
	return getApiClient()
		.apiFetch<ClientDetailWire>(`/client/clients/${id}`)
		.then(({ id_client: idClient, contacts, pieces, ...reste }) => ({
			id: idClient,
			...reste,
			contacts: contacts.map(({ id_contact: idContact, ...resteContact }) => ({
				id: idContact,
				...resteContact,
			})),
			pieces: pieces.map(({ id_piece: idPiece, ...restePiece }) => ({
				id: idPiece,
				...restePiece,
			})),
		}));
}

/** Crée un client (POST `CreerClientDto`). */
export function creerClient(body: ClientBody): Promise<unknown> {
	return getApiClient().apiFetch("/client/clients", {
		method: "POST",
		body: JSON.stringify(corpsClient(body, "create")),
	});
}

/** Modifie un client (PATCH `MajClientDto`, champs définis seulement). */
export function modifierClient(id: string, body: ClientBody): Promise<unknown> {
	return getApiClient().apiFetch(`/client/clients/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corpsClient(body, "update")),
	});
}

/** Ajoute un contact d'urgence (POST `CreerContactDto`). */
export function creerContact(
	idClient: string,
	body: {
		nom: string;
		lien: string;
		telPrincipal: string;
		prenom?: string | null;
		telSecondaire?: string | null;
		adresse?: string | null;
		email?: string | null;
	},
): Promise<unknown> {
	const corps = {
		nom: body.nom,
		lien: body.lien,
		tel_principal: body.telPrincipal,
		...(body.prenom?.trim() ? { prenom: body.prenom } : {}),
		...(body.telSecondaire?.trim()
			? { tel_secondaire: body.telSecondaire }
			: {}),
		...(body.adresse?.trim() ? { adresse: body.adresse } : {}),
		...(body.email?.trim() ? { email: body.email } : {}),
	} satisfies Omit<
		CreerContactDto,
		"prenom" | "tel_secondaire" | "adresse" | "email"
	> & {
		prenom?: string | null;
		tel_secondaire?: string | null;
		adresse?: string | null;
		email?: string | null;
	};
	return getApiClient().apiFetch(
		`/client/clients/${idClient}/contacts-urgence`,
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
}

/** Ajoute une pièce d'identité (POST `CreerPieceDto`). */
export function creerPiece(
	idClient: string,
	body: {
		typePiece: string;
		numero: string;
		dateDelivrance?: string | null;
		dateExpiration?: string | null;
		autoriteDelivrance?: string | null;
		copieNum?: string | null;
	},
): Promise<unknown> {
	const corps = {
		type_piece: body.typePiece as CreerPieceDto["type_piece"],
		numero: body.numero,
		...(body.dateDelivrance ? { date_delivrance: body.dateDelivrance } : {}),
		...(body.dateExpiration ? { date_expiration: body.dateExpiration } : {}),
		...(body.autoriteDelivrance?.trim()
			? { autorite_delivrance: body.autoriteDelivrance }
			: {}),
		...(body.copieNum?.trim() ? { copie_num: body.copieNum } : {}),
	} satisfies Omit<
		CreerPieceDto,
		"date_delivrance" | "date_expiration" | "autorite_delivrance" | "copie_num"
	> & {
		date_delivrance?: string | null;
		date_expiration?: string | null;
		autorite_delivrance?: string | null;
		copie_num?: string | null;
	};
	return getApiClient().apiFetch(
		`/client/clients/${idClient}/pieces-identite`,
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
}
