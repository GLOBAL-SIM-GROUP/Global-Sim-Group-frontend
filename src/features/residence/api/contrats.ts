import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import {
	type Caution,
	type Contrat,
	type ContratDetail,
	calculerDateFinPrevue,
	type Echeance,
	type TypeLocation,
} from "../models/contrats";

type CreerContratDto = components["schemas"]["CreerContratDto"];
type RestituerCautionDto = components["schemas"]["RestituerCautionDto"];

/**
 * Le schéma généré type `duree_mois`/`date_fin_prevue` en objet libre
 * (`Record<string, never> | null`) mais ce sont de vraies valeurs ; on élargit
 * ces champs (même pattern que `equipements`/`etat` côté logements).
 */
type ContratWire = Omit<Contrat, "id"> & { id_contrat: string };
type EcheanceWire = Omit<Echeance, "id"> & { id_echeance: string };
type ContratDetailWire = Omit<ContratDetail, "id" | "echeances"> & {
	id_contrat: string;
	echeances: EcheanceWire[];
};
type CautionWire = Omit<Caution, "id"> & { id_caution: string };

const toContrat = ({ id_contrat: id, ...reste }: ContratWire): Contrat => ({
	id,
	...reste,
});

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/**
 * Appels API du module Résidence — contrats de location. Réponses hand-typed
 * revalidées sur le backend réel (aucun schéma de réponse dans le spec). Aucun
 * endpoint inventé : GET list/détail, POST création, `activer`, caution
 * (GET + création + restitution). Pas de PATCH ni de résiliation dans le spec.
 */
export function listContrats(): Promise<Contrat[]> {
	return getApiClient()
		.apiFetch<ContratWire[]>("/api/v1/residence/contrats")
		.then((data) => data.map(toContrat));
}

/** Détail d'un contrat : embarque les échéances (avec leurs `id_echeance`). */
export function getContrat(id: string): Promise<ContratDetail> {
	return getApiClient()
		.apiFetch<ContratDetailWire>(`/api/v1/residence/contrats/${id}`)
		.then((data) => ({
			...toContrat(data),
			echeances: data.echeances.map(({ id_echeance: eid, ...reste }) => ({
				id: eid,
				...reste,
			})),
		}));
}

/** Corps saisi par le formulaire de création de contrat. */
export interface ContratBody {
	idClient: string;
	idLogement: string;
	dateDebut: string;
	montantLoyer: string;
	typeLocation: TypeLocation;
	dureeMois?: number | null;
	/** Date de signature (optionnelle, `YYYY-MM-DD`). */
	dateSignature?: string | null;
}

/**
 * Contrat créé (POST `/contrats`). Le spec déclare cette réponse vide
 * (`content?: never`) mais le backend réel renvoie l'id du contrat créé, son
 * numéro, et — le contrat provisionne un compte portail pour le client s'il
 * n'en avait pas — le résultat de cette provision (vérifié sur l'instance de
 * dev, 2026-09-04 : absent du spec comme plusieurs autres réponses de ce
 * module). Plus aucun mot de passe temporaire en clair : le backend envoie un
 * email « définissez votre mot de passe » (lien valable 7 jours, même
 * mécanisme que `/auth/reinitialiser-mot-de-passe`) si le client a un email
 * enregistré — `emailEnvoye` indique si cet envoi a eu lieu. `compteResident`
 * est `null` si le client avait déjà un compte portail (rien de nouveau).
 */
export interface ContratCree {
	id: string;
	numeroContrat: string;
	compteResident: { login: string; emailEnvoye: boolean } | null;
}

interface ContratCreeWire {
	id_contrat: string;
	numero_contrat: string;
	compte_resident?: { login: string; email_envoye: boolean } | null;
}

/**
 * Crée un contrat (POST `CreerContratDto`). `date_fin_prevue` est déduite de
 * la durée (`calculerDateFinPrevue`) ; `statut` n'est PAS envoyé (défaut
 * backend EN_ATTENTE). `date_signature` est optionnelle (signature à la
 * création). Les échéances sont générées côté backend.
 * Pas de `periodicite` : redondant avec `type_location` (même valeur côté
 * backend) — non saisi, jamais envoyé.
 */
export function creerContrat(body: ContratBody): Promise<ContratCree> {
	const corps = {
		id_client: body.idClient,
		id_logement: body.idLogement,
		date_debut: body.dateDebut,
		montant_loyer: body.montantLoyer,
		type_location: body.typeLocation,
		duree_mois: body.dureeMois ?? null,
		date_fin_prevue: calculerDateFinPrevue(
			body.dateDebut,
			body.dureeMois ?? null,
		),
		date_signature: body.dateSignature ?? null,
	} satisfies Omit<
		CreerContratDto,
		"duree_mois" | "date_fin_prevue" | "date_signature"
	> & {
		duree_mois?: number | null;
		date_fin_prevue?: string | null;
		date_signature?: string | null;
	};
	return getApiClient()
		.apiFetch<ContratCreeWire>("/api/v1/residence/contrats", {
			method: "POST",
			body: JSON.stringify(corps),
		})
		.then((data) => ({
			id: data.id_contrat,
			numeroContrat: data.numero_contrat,
			compteResident: data.compte_resident
				? {
						login: data.compte_resident.login,
						emailEnvoye: data.compte_resident.email_envoye,
					}
				: null,
		}));
}

/** Envoie le contrat (PDF) par email au client (POST /contrats/{id}/envoyer-email). */
export function envoyerContratParEmail(
	id: string,
): Promise<{ envoye: boolean }> {
	return getApiClient().apiFetch(
		`/api/v1/residence/contrats/${id}/envoyer-email`,
		{ method: "POST" },
	);
}

/** Active un contrat en attente (POST /contrats/{id}/activer). */
export function activerContrat(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/residence/contrats/${id}/activer`, {
		method: "POST",
	});
}

/**
 * Résultat d'une résiliation anticipée : le backend calcule (mais ne crée
 * aucun décaissement pour) le trop-perçu de loyer — somme des échéances déjà
 * payées pour des mois postérieurs à `dateResiliation`. Ne touche jamais la
 * caution (décision distincte, restituée séparément).
 */
export interface ContratResilie {
	resilie: boolean;
	dateResiliation: string;
	montantARembourser: string;
	nbEcheancesARembourser: number;
}

interface ContratResilieWire {
	resilie: boolean;
	date_resiliation: string;
	montant_a_rembourser: string;
	nb_echeances_a_rembourser: number;
}

/**
 * Résilie un contrat ACTIF avant son terme (POST /contrats/{id}/resilier) :
 * bascule le contrat en RESILIE et libère le logement (DISPONIBLE)
 * immédiatement côté backend — pas de rafraîchissement manuel du statut du
 * logement à faire, juste invalider les caches. 400 si le contrat n'est pas
 * ACTIF (déjà en attente, résilié ou terminé).
 */
export function resilierContrat(
	id: string,
	body: { dateResiliation?: string; motif?: string | null },
): Promise<ContratResilie> {
	const corps = {
		date_resiliation: body.dateResiliation || undefined,
		motif: body.motif ?? undefined,
	};
	return getApiClient()
		.apiFetch<ContratResilieWire>(`/api/v1/residence/contrats/${id}/resilier`, {
			method: "POST",
			body: JSON.stringify(corps),
		})
		.then((data) => ({
			resilie: data.resilie,
			dateResiliation: data.date_resiliation,
			montantARembourser: data.montant_a_rembourser,
			nbEcheancesARembourser: data.nb_echeances_a_rembourser,
		}));
}

/** Caution d'un contrat (GET /contrats/{id}/caution). */
export function getCaution(idContrat: string): Promise<Caution> {
	return getApiClient()
		.apiFetch<CautionWire>(`/api/v1/residence/contrats/${idContrat}/caution`)
		.then(({ id_caution: id, ...reste }) => ({ id, ...reste }));
}

/**
 * Crée la caution d'un contrat (POST /contrats/{id}/caution). Absent du spec
 * (aucun `CreerCautionDto` généré) : corps revalidé sur le backend réel — seul
 * `montant` est requis (chaîne décimale, ex. `"60000"` ou `"60000.00"`).
 */
export function creerCaution(
	idContrat: string,
	body: { montant: string },
): Promise<Caution> {
	return getApiClient()
		.apiFetch<CautionWire>(`/api/v1/residence/contrats/${idContrat}/caution`, {
			method: "POST",
			body: JSON.stringify({ montant: body.montant }),
		})
		.then(({ id_caution: id, ...reste }) => ({ id, ...reste }));
}

/** Restitue la caution (POST /contrats/{id}/caution/restitution). */
export function restituerCaution(
	idContrat: string,
	body: { retenue?: string | null; motif_retenue?: string | null },
): Promise<unknown> {
	const corps = {
		retenue: texteOuNull(body.retenue),
		motif_retenue: texteOuNull(body.motif_retenue),
	} satisfies Omit<RestituerCautionDto, "retenue" | "motif_retenue"> & {
		retenue?: string | null;
		motif_retenue?: string | null;
	};
	return getApiClient().apiFetch(
		`/api/v1/residence/contrats/${idContrat}/caution/restitution`,
		{ method: "POST", body: JSON.stringify(corps) },
	);
}

/** Reçu d'une échéance (données pour génération PDF). */
export interface RecuEcheance {
	type: string;
	reference: string;
	date: string;
	montant: string;
	mode_paiement: string;
	echeance: {
		mois: number;
		annee: number;
		montant: string;
		date_echeance: string;
		statut: string;
		numero_contrat: string;
	};
	client: {
		nom: string;
		prenoms: string;
	};
	logement: string;
}

/** Récupère le reçu d'une échéance (données JSON pour génération PDF client). */
export function getRecuEcheance(idEcheance: string): Promise<RecuEcheance> {
	return getApiClient().apiFetch<RecuEcheance>(
		`/api/v1/residence/echeances/${idEcheance}/recu`,
	);
}
