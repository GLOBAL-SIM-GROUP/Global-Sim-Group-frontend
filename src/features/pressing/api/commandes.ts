import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	CommandePressing,
	CommandePressingDetail,
	LigneCommandePressing,
} from "../models/commandes";

type CreerCommandePressingDto =
	components["schemas"]["CreerCommandePressingDto"];
type MajCommandePressingDto = components["schemas"]["MajCommandePressingDto"];
type EncaisserSoldePressingDto =
	components["schemas"]["EncaisserSoldePressingDto"];

type CommandeWire = Omit<CommandePressing, "id"> & { id_commande: string };
type LigneWire = Omit<LigneCommandePressing, "id"> & { id_ligne: string };
type DetailWire = Omit<CommandePressingDetail, "id" | "lignes"> & {
	id_commande: string;
	lignes: LigneWire[];
};

/**
 * Appels API du module Pressing — commandes. Le lister documente des params
 * réels (`recherche`/`du`/`au`/`statut`) : envoyés quand définis. Les actions
 * de statut sont réelles : `traitement`, `pret`, `retirer`, `annuler`.
 */
export function listCommandes(filtres?: {
	statut?: string;
	du?: string;
	au?: string;
	recherche?: string;
}): Promise<CommandePressing[]> {
	const params = new URLSearchParams();
	if (filtres?.statut && filtres.statut !== "tous") {
		params.set("statut", filtres.statut);
	}
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	if (filtres?.recherche) params.set("recherche", filtres.recherche);
	const qs = params.toString();
	return getApiClient()
		.apiFetch<CommandeWire[]>(`/pressing/commandes${qs ? `?${qs}` : ""}`)
		.then((data) =>
			data.map(({ id_commande: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'une commande : embarque les lignes d'articles. */
export function getCommande(id: string): Promise<CommandePressingDetail> {
	return getApiClient()
		.apiFetch<DetailWire>(`/pressing/commandes/${id}`)
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

/** Ligne d'articles saisie (le backend calcule les totaux). */
export interface LigneCommandeBody {
	typeVetement: string;
	quantite: string;
	prestation: string;
	tarif: string;
}

/** Corps saisi par le formulaire de dépôt d'une commande. */
export interface CommandeBody {
	idClient: string;
	dateRetraitPrevue: string;
	lignes: LigneCommandeBody[];
	paiement?: { montant: string; idMoyen: string } | null;
}

/** Enregistre un dépôt (POST `CreerCommandePressingDto`). */
export function creerCommande(body: CommandeBody): Promise<unknown> {
	const corps = {
		id_client: body.idClient,
		date_retrait_prevue: body.dateRetraitPrevue,
		lignes: body.lignes.map((ligne) => ({
			type_vetement: ligne.typeVetement,
			quantite: ligne.quantite,
			prestation: ligne.prestation,
			tarif: ligne.tarif,
		})),
		...(body.paiement
			? {
					paiement: {
						montant: body.paiement.montant,
						id_moyen: body.paiement.idMoyen,
					},
				}
			: {}),
	} satisfies CreerCommandePressingDto;
	return getApiClient().apiFetch("/api/v1/pressing/commandes", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Corps saisi pour modifier une commande (PATCH `MajCommandePressingDto`). */
export interface ModifierCommandeBody {
	idClient: string;
	dateRetraitPrevue: string;
	lignes: LigneCommandeBody[];
}

/** Modifie une commande (PATCH par id). */
export function modifierCommande(
	id: string,
	body: ModifierCommandeBody,
): Promise<unknown> {
	const corps = {
		id_client: body.idClient,
		date_retrait_prevue: body.dateRetraitPrevue,
		lignes: body.lignes.map((ligne) => ({
			type_vetement: ligne.typeVetement,
			quantite: ligne.quantite,
			prestation: ligne.prestation,
			tarif: ligne.tarif,
		})),
	} satisfies MajCommandePressingDto;
	return getApiClient().apiFetch(`/pressing/commandes/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Passe la commande en traitement (POST `/commandes/{id}/traitement`). */
export function traitementCommande(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/pressing/commandes/${id}/traitement`, {
		method: "POST",
	});
}

/** Passe la commande en « Prêt » (POST `/commandes/{id}/pret`). */
export function pretCommande(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/pressing/commandes/${id}/pret`, {
		method: "POST",
	});
}

/** Enregistre le retrait + encaisse le solde (POST `/commandes/{id}/retirer`). */
export function retirerCommande(
	id: string,
	body: { solde: string; idMoyen: string },
): Promise<unknown> {
	const corps = {
		solde: body.solde,
		id_moyen: body.idMoyen,
	} satisfies EncaisserSoldePressingDto;
	return getApiClient().apiFetch(`/pressing/commandes/${id}/retirer`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Annule une commande (POST `/commandes/{id}/annuler`). */
export function annulerCommande(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/pressing/commandes/${id}/annuler`, {
		method: "POST",
	});
}
