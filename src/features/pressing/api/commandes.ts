import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";
import { getImprimanteThermique } from "#/lib/imprimante-thermique-store";
import { imprimerHtml } from "#/lib/print-pdf";
import { imprimerTicketQZ } from "#/lib/qz-tray-client";

import type {
	CommandePressing,
	CommandePressingDetail,
	LigneCommandePressing,
	ModeTarificationPressing,
} from "../models/commandes";

type EncaisserSoldePressingDto =
	components["schemas"]["EncaisserSoldePressingDto"];
type ValiderDemandePressingDto =
	components["schemas"]["ValiderDemandePressingDto"];

type CommandeWire = Omit<CommandePressing, "id"> & { id_commande: string };
type LigneWire = Omit<LigneCommandePressing, "id"> & { id_ligne: string };
type DetailWire = Omit<CommandePressingDetail, "id" | "lignes"> & {
	id_commande: string;
	lignes: LigneWire[];
};

/**
 * Appels API du module Pressing — commandes. Le lister documente des params
 * réels (`recherche`/api/v1/`du`/api/v1/`au`/api/v1/`statut`) : envoyés quand définis. Les actions
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
		.apiFetch<CommandeWire[]>(`/api/v1/pressing/commandes${qs ? `?${qs}` : ""}`)
		.then((data) =>
			data.map(({ id_commande: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'une commande : embarque les lignes d'articles. */
export function getCommande(id: string): Promise<CommandePressingDetail> {
	return getApiClient()
		.apiFetch<DetailWire>(`/api/v1/pressing/commandes/${id}`)
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

/**
 * Ligne d'articles saisie (le backend calcule les totaux). `tarif`/`poidsKg`
 * sont mutuellement exclusifs — lequel des deux est requis dépend du
 * `modeTarification` de la commande (`UNITAIRE` → `tarif`, `POIDS` →
 * `poidsKg`) ; envoyer les deux, ou aucun, ou le mauvais pour le mode fait
 * échouer la requête côté backend (500 constaté en direct, pas un 400
 * propre) — d'où la validation stricte côté client avant l'appel, voir
 * `validerLignesPressing` dans `models/commandes.ts`.
 *
 * `hors_catalogue` est requis par `LigneCommandePressingDto` depuis
 * l'introduction du catalogue pressing : `false` quand les libellés sont
 * choisis dans le catalogue (le backend vérifie l'appartenance), `true`
 * pour une saisie libre — sans lui la requête part en 400.
 */
export interface LigneCommandeBody {
	typeVetement: string;
	quantite: string;
	prestation: string;
	/** `false` = libellés du catalogue ; défaut `true` (saisie libre/portail). */
	horsCatalogue?: boolean;
	tarif?: string;
	poidsKg?: string;
}

function ligneVersCorps(ligne: LigneCommandeBody) {
	return {
		type_vetement: ligne.typeVetement,
		quantite: ligne.quantite,
		prestation: ligne.prestation,
		hors_catalogue: ligne.horsCatalogue ?? true,
		...(ligne.tarif !== undefined ? { tarif: ligne.tarif } : {}),
		...(ligne.poidsKg !== undefined ? { poids_kg: ligne.poidsKg } : {}),
	};
}

/** Corps saisi par le formulaire de dépôt d'une commande. */
export interface CommandeBody {
	idClient: string;
	/** Choisi une seule fois à la création, jamais modifiable ensuite. */
	modeTarification: ModeTarificationPressing;
	dateRetraitPrevue: string;
	lignes: LigneCommandeBody[];
}

/** Enregistre un dépôt (POST `/pressing/commandes`). */
export function creerCommande(body: CommandeBody): Promise<unknown> {
	const corps = {
		id_client: body.idClient,
		mode_tarification: body.modeTarification,
		date_retrait_prevue: body.dateRetraitPrevue,
		lignes: body.lignes.map(ligneVersCorps),
	};
	return getApiClient().apiFetch("/api/v1/pressing/commandes", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/**
 * Corps saisi pour modifier une commande (PATCH `/pressing/commandes/:id`).
 * Pas de `modeTarification` : le mode est verrouillé à la création, les
 * lignes soumises doivent déjà correspondre à celui de la commande existante.
 */
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
		lignes: body.lignes.map(ligneVersCorps),
	};
	return getApiClient().apiFetch(`/api/v1/pressing/commandes/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Passe la commande en traitement (POST `/api/v1/commandes/{id}/traitement`). */
export function traitementCommande(id: string): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/pressing/commandes/${id}/traitement`,
		{
			method: "POST",
		},
	);
}

/** Passe la commande en « Prêt » (POST `/api/v1/commandes/{id}/pret`). */
export function pretCommande(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/pressing/commandes/${id}/pret`, {
		method: "POST",
	});
}

/** Enregistre le retrait + encaisse le solde (POST `/api/v1/commandes/{id}/retirer`). */
export function retirerCommande(
	id: string,
	body: { solde: string; idMoyen: string },
): Promise<unknown> {
	const corps = {
		solde: body.solde,
		id_moyen: body.idMoyen,
	} satisfies EncaisserSoldePressingDto;
	return getApiClient().apiFetch(`/api/v1/pressing/commandes/${id}/retirer`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Annule une commande (POST `/api/v1/commandes/{id}/annuler`, PRESSING.ANNULER). */
export function annulerCommande(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/pressing/commandes/${id}/annuler`, {
		method: "POST",
	});
}

/**
 * Corps de validation/chiffrage d'une demande de dépôt `EN_ATTENTE` du
 * portail résident (`POST /pressing/commandes/{id}/valider` → `DEPOSE`,
 * PRESSING.CREER). Les lignes reprennent la déclaration du résident, chiffrée
 * selon `modeTarification` (`tarif` en UNITAIRE, `poidsKg` en POIDS) —
 * `hors_catalogue: true` (ajouté par `ligneVersCorps`) car le libellé saisi
 * par le résident est libre.
 */
export interface ValiderDemandeBody {
	modeTarification: ModeTarificationPressing;
	dateRetraitPrevue?: string;
	lignes: LigneCommandeBody[];
	/** Acompte éventuel encaissé à la validation. */
	paiement?: { montant: string; idMoyen: string };
}

/** Valide et chiffre une demande `EN_ATTENTE` (→ `DEPOSE`, PRESSING.CREER). */
export function validerDemande(
	id: string,
	body: ValiderDemandeBody,
): Promise<unknown> {
	const corps = {
		lignes: body.lignes.map(ligneVersCorps),
		mode_tarification: body.modeTarification,
		...(body.dateRetraitPrevue
			? { date_retrait_prevue: body.dateRetraitPrevue }
			: {}),
		...(body.paiement
			? {
					paiement: {
						montant: body.paiement.montant,
						id_moyen: body.paiement.idMoyen,
					},
				}
			: {}),
	} satisfies ValiderDemandePressingDto;
	return getApiClient().apiFetch(`/api/v1/pressing/commandes/${id}/valider`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/**
 * Imprime le reçu de dépôt d'une commande (GET `.../recu`, HTML thermique
 * 58/80mm) — construit depuis la commande elle-même, disponible dès le dépôt
 * (avec ou sans acompte), contrairement au reçu de facture qui exige un
 * paiement intégral. Même mécanique que `printFactureTicket` : imprime via
 * QZ Tray si une imprimante est configurée sur ce poste, sinon repli sur la
 * boîte d'impression du navigateur.
 */
export async function printCommandeRecu(
	id: string,
	largeur: 58 | 80 = 58,
): Promise<void> {
	const blob = await getApiClient().download(
		`/api/v1/pressing/commandes/${id}/recu?largeur=${largeur}`,
	);
	const html = await blob.text();

	const imprimanteQZ = getImprimanteThermique();
	if (imprimanteQZ) {
		try {
			await imprimerTicketQZ(html, largeur, imprimanteQZ);
			return;
		} catch (error) {
			console.error(
				"Impression QZ Tray indisponible, repli sur la boîte d'impression du navigateur",
				error,
			);
		}
	}
	imprimerHtml(html, largeur);
}
