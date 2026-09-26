import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	ActiviteAbonnement,
	DecisionReliquat,
	EtatSouscription,
	Souscription,
	SouscriptionDetail,
	StatutSouscription,
	UniteAbonnement,
} from "../models/abonnements";

type CreerSouscriptionDto = components["schemas"]["CreerSouscriptionDto"];
type PaiementAbonnementDto = components["schemas"]["PaiementAbonnementDto"];
type AjusterQuotaDto = components["schemas"]["AjusterQuotaDto"];
type ResilierSouscriptionDto = components["schemas"]["ResilierSouscriptionDto"];
type DeciderReliquatDto = components["schemas"]["DeciderReliquatDto"];

/** Filtres réels du lister (spec `/docs-json`) — envoyés tels quels. */
export interface FiltresSouscriptions {
	recherche?: string;
	id_client?: string;
	id_offre?: string;
	activite?: ActiviteAbonnement;
	unite?: UniteAbonnement;
	statut?: StatutSouscription;
	etat?: EtatSouscription;
	reliquat?: DecisionReliquat;
	/** `true` = file « reliquats à décider » (expirées avec quota restant). */
	reliquat_a_decider?: boolean;
	id_prestation?: string;
	id_facture?: string;
	fin_du?: string;
	fin_au?: string;
	debut_du?: string;
	debut_au?: string;
	sort?: string;
	order?: "asc" | "desc";
	limit?: number;
	offset?: number;
}

/**
 * Appels API du module Abonnements — souscriptions (`ABONNEMENT.VOIR` /
 * `.VENDRE` / `.AJUSTER` / `.DECIDER_RELIQUAT`).
 */
export function listSouscriptions(
	filtres?: FiltresSouscriptions,
): Promise<Souscription[]> {
	const params = new URLSearchParams();
	if (filtres?.recherche) params.set("recherche", filtres.recherche);
	if (filtres?.id_client) params.set("id_client", filtres.id_client);
	if (filtres?.id_offre) params.set("id_offre", filtres.id_offre);
	if (filtres?.activite) params.set("activite", filtres.activite);
	if (filtres?.unite) params.set("unite", filtres.unite);
	if (filtres?.statut) params.set("statut", filtres.statut);
	if (filtres?.etat) params.set("etat", filtres.etat);
	if (filtres?.reliquat) params.set("reliquat", filtres.reliquat);
	if (filtres?.reliquat_a_decider !== undefined) {
		params.set("reliquat_a_decider", String(filtres.reliquat_a_decider));
	}
	if (filtres?.id_prestation) {
		params.set("id_prestation", filtres.id_prestation);
	}
	if (filtres?.id_facture) params.set("id_facture", filtres.id_facture);
	if (filtres?.fin_du) params.set("fin_du", filtres.fin_du);
	if (filtres?.fin_au) params.set("fin_au", filtres.fin_au);
	if (filtres?.debut_du) params.set("debut_du", filtres.debut_du);
	if (filtres?.debut_au) params.set("debut_au", filtres.debut_au);
	if (filtres?.sort) params.set("sort", filtres.sort);
	if (filtres?.order) params.set("order", filtres.order);
	if (filtres?.limit !== undefined) params.set("limit", String(filtres.limit));
	if (filtres?.offset !== undefined) {
		params.set("offset", String(filtres.offset));
	}
	const qs = params.toString();
	return getApiClient().apiFetch<Souscription[]>(
		`/api/v1/abonnement/souscriptions${qs ? `?${qs}` : ""}`,
	);
}

/** Détail + mouvements (GET `/abonnement/souscriptions/{id}`). */
export function getSouscription(id: string): Promise<SouscriptionDetail> {
	return getApiClient().apiFetch<SouscriptionDetail>(
		`/api/v1/abonnement/souscriptions/${id}`,
	);
}

/**
 * Corps de la vente d'une souscription. `paiement` est **optionnel** et peut
 * être partiel — le backend n'exige jamais un règlement intégral à la vente
 * (le `reste_a_payer` de la réponse est encaissable plus tard via
 * `/paiements`). `prix` omis = prix de l'offre (négociable à la vente).
 */
export interface VendreSouscriptionBody {
	idClient: string;
	idOffre: string;
	dateDebut?: string;
	prix?: string;
	paiement?: { montant: string; idMoyen: string };
	note?: string;
}

/** Réponse du POST vente : enveloppe `{ souscription, numero, id_paiement }`. */
interface VendreSouscriptionResponse {
	souscription: Souscription;
	/** Numéro de la facture générée (aussi dans `souscription.facture_numero`). */
	numero: string;
	id_paiement: string | null;
}

/** Vend une souscription (POST `/abonnement/souscriptions`, `ABONNEMENT.VENDRE`). */
export async function vendreSouscription(
	body: VendreSouscriptionBody,
): Promise<Souscription> {
	const corps = {
		id_client: body.idClient,
		id_offre: body.idOffre,
		...(body.dateDebut ? { date_debut: body.dateDebut } : {}),
		...(body.prix?.trim() ? { prix: body.prix.trim() } : {}),
		...(body.paiement
			? {
					paiement: {
						montant: body.paiement.montant,
						id_moyen: body.paiement.idMoyen,
					},
				}
			: {}),
		...(body.note?.trim() ? { note: body.note.trim() } : {}),
	} satisfies CreerSouscriptionDto;
	const reponse = await getApiClient().apiFetch<VendreSouscriptionResponse>(
		"/api/v1/abonnement/souscriptions",
		{ method: "POST", body: JSON.stringify(corps) },
	);
	return reponse.souscription;
}

/**
 * Encaisse un paiement complémentaire sur le solde restant (POST
 * `/abonnement/souscriptions/{id}/paiements`, `ABONNEMENT.VENDRE`) — 400 si
 * `montant > reste_a_payer`.
 */
export function encaisserSouscription(
	id: string,
	body: { montant: string; idMoyen: string },
): Promise<unknown> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
	} satisfies PaiementAbonnementDto;
	return getApiClient().apiFetch(
		`/api/v1/abonnement/souscriptions/${id}/paiements`,
		{ method: "POST", body: JSON.stringify(corps) },
	);
}

/**
 * Correction manuelle de quota (POST `/ajustements`, `ABONNEMENT.AJUSTER`) :
 * `quantite` signée (négative = retrait), `motif` obligatoire (trcé dans la
 * timeline). 400 si le solde deviendrait négatif.
 */
export function ajusterQuota(
	id: string,
	body: { quantite: string; motif: string },
): Promise<unknown> {
	const corps = {
		quantite: body.quantite,
		motif: body.motif,
	} satisfies AjusterQuotaDto;
	return getApiClient().apiFetch(
		`/api/v1/abonnement/souscriptions/${id}/ajustements`,
		{ method: "POST", body: JSON.stringify(corps) },
	);
}

/** Résilie une souscription `ACTIVE` (POST `/resilier`, `ABONNEMENT.AJUSTER` ; 409 sinon). */
export function resilierSouscription(
	id: string,
	body: { motif: string },
): Promise<unknown> {
	const corps = { motif: body.motif } satisfies ResilierSouscriptionDto;
	return getApiClient().apiFetch(
		`/api/v1/abonnement/souscriptions/${id}/resilier`,
		{ method: "POST", body: JSON.stringify(corps) },
	);
}

/**
 * Décide du reliquat d'une souscription expirée (POST `/reliquat`,
 * `ABONNEMENT.DECIDER_RELIQUAT`) — actionnable seulement quand
 * `reliquat_a_decider === true`. `REPORTE` exige `idSouscriptionCible` (autre
 * souscription du même client, même activité/unité/couverture, encore
 * utilisable) — 400 sinon.
 */
export function deciderReliquat(
	id: string,
	body: {
		decision: DecisionReliquat;
		idSouscriptionCible?: string;
		motif?: string;
	},
): Promise<unknown> {
	const corps = {
		decision: body.decision,
		...(body.idSouscriptionCible
			? { id_souscription_cible: body.idSouscriptionCible }
			: {}),
		...(body.motif?.trim() ? { motif: body.motif.trim() } : {}),
	} satisfies DeciderReliquatDto;
	return getApiClient().apiFetch(
		`/api/v1/abonnement/souscriptions/${id}/reliquat`,
		{ method: "POST", body: JSON.stringify(corps) },
	);
}
