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

/**
 * Déclare le versement de la caution (POST /contrats/{id}/caution/versement,
 * absent du spec généré — endpoint tout juste ajouté côté backend). Tous les
 * champs sont optionnels : `date_versement` défaut à aujourd'hui, `montant`
 * défaut au montant total de la caution (côté backend). Renvoie la caution à
 * jour (`payee: true`, `statut` inchangé — la caution reste `EN_COURS` tant
 * qu'elle n'est pas restituée). 404 si aucune caution n'existe pour ce
 * contrat, 409 si elle est déjà déclarée versée. Ne crée aucun encaissement
 * (`finances.paiement`) : simple déclaration/traçabilité, pas une opération
 * de caisse.
 */
export function versementCaution(
	idContrat: string,
	body: {
		dateVersement?: string | null;
		montant?: string | null;
		motif?: string | null;
	},
): Promise<Caution> {
	const corps = {
		...(body.dateVersement ? { date_versement: body.dateVersement } : {}),
		...(body.montant ? { montant: body.montant } : {}),
		...(body.motif?.trim() ? { motif: body.motif.trim() } : {}),
	};
	return getApiClient()
		.apiFetch<CautionWire>(
			`/api/v1/residence/contrats/${idContrat}/caution/versement`,
			{ method: "POST", body: JSON.stringify(corps) },
		)
		.then(({ id_caution: id, ...reste }) => ({ id, ...reste }));
}

/**
 * Restitue la caution (POST /contrats/{id}/caution/restitution) — déclaration
 * pure, comme `versementCaution` : aucun décaissement créé. Pour un
 * remboursement réel en caisse, voir `rembourserCaution`.
 */
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

/**
 * Encaisse la caution en une seule opération (POST
 * /contrats/{id}/caution/encaisser, absent du spec généré — endpoint ajouté
 * le 2026-09-13). Contrairement à `versementCaution`, crée un vrai paiement
 * `finances.paiement` (ENCAISSEMENT, sans caisse, activité
 * LOCATION_RESIDENTIEL) en plus de marquer la caution payée. `montant`
 * défaut au montant de la caution, `reference` défaut à `CAUTION-<id>`
 * (calculés côté backend). 409 si déjà encaissée, 400 si montant ≤ 0, 404 si
 * aucune caution. La réponse ajoute `id_paiement` (référence du mouvement
 * créé) aux champs habituels de la caution.
 */
export function encaisserCaution(
	idContrat: string,
	body: {
		idMoyen: string;
		montant?: string | null;
		date?: string | null;
		reference?: string | null;
	},
): Promise<Caution> {
	const corps = {
		id_moyen: body.idMoyen,
		...(body.montant ? { montant: body.montant } : {}),
		...(body.date ? { date: body.date } : {}),
		...(body.reference?.trim() ? { reference: body.reference.trim() } : {}),
	};
	return getApiClient()
		.apiFetch<CautionWire>(
			`/api/v1/residence/contrats/${idContrat}/caution/encaisser`,
			{ method: "POST", body: JSON.stringify(corps) },
		)
		.then(({ id_caution: id, ...reste }) => ({ id, ...reste }));
}

/**
 * Rembourse la caution en une seule opération (POST
 * /contrats/{id}/caution/rembourser, absent du spec généré — endpoint ajouté
 * le 2026-09-13). Contrairement à `restituerCaution`, crée un vrai
 * décaissement `finances.paiement` de `montant − retenue` en plus de mettre
 * à jour `montant_restitue`/`statut` (RESTITUEE/RETENUE). Si la retenue est
 * totale, `montant_restitue` vaut 0 et aucun paiement n'est écrit (rien ne
 * sort physiquement), mais la restitution reste tracée. 409 si la caution
 * n'a jamais été encaissée ou déjà restituée, 400 si la retenue est
 * invalide. La réponse ajoute `id_paiement` (absent si retenue totale).
 */
export function rembourserCaution(
	idContrat: string,
	body: {
		idMoyen: string;
		retenue?: string | null;
		motif_retenue?: string | null;
		date?: string | null;
	},
): Promise<Caution> {
	const corps = {
		id_moyen: body.idMoyen,
		retenue: texteOuNull(body.retenue),
		motif_retenue: texteOuNull(body.motif_retenue),
		...(body.date ? { date: body.date } : {}),
	};
	return getApiClient()
		.apiFetch<CautionWire>(
			`/api/v1/residence/contrats/${idContrat}/caution/rembourser`,
			{ method: "POST", body: JSON.stringify(corps) },
		)
		.then(({ id_caution: id, ...reste }) => ({ id, ...reste }));
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

/** Corps saisi par le formulaire d'encaissement en lot. */
export interface EncaisserLoyerLotBody {
	montant: string;
	idMoyen: string;
	date?: string;
}

/** Une échéance touchée par un encaissement en lot. */
export interface EcheanceLotResultat {
	id: string;
	montantApplique: string;
	statut: string;
}

/**
 * Résultat d'un encaissement en lot. `montantNonAffecte`/`avertissement` ne
 * sont présents que si de l'argent n'a pu être affecté à aucune échéance
 * (plus rien d'impayé sur le contrat) — pas une erreur, le paiement a quand
 * même bien été enregistré (`idPaiement` reste renseigné).
 */
export interface EncaisserLoyerLotResultat {
	idPaiement: string | null;
	montantTotal: string;
	montantApplique: number;
	echeances: EcheanceLotResultat[];
	montantNonAffecte?: number;
	avertissement?: string;
}

interface EncaisserLoyerLotWire {
	id_paiement: string | null;
	montant_total: string;
	montant_applique: number;
	echeances: Array<{
		id_echeance: string;
		montant_applique: string;
		statut: string;
	}>;
	montant_non_affecte?: number;
	avertissement?: string;
}

/**
 * Encaisse plusieurs échéances en un seul paiement (POST
 * `/contrats/{id}/encaisser-loyer-lot`, absent du spec généré). Le backend
 * applique le montant aux échéances impayées les plus anciennes d'abord, en
 * remplissant chacune entièrement avant de passer à la suivante — aucune
 * logique de répartition à reproduire ici, on affiche juste le résultat.
 */
export function encaisserLoyerLot(
	idContrat: string,
	body: EncaisserLoyerLotBody,
): Promise<EncaisserLoyerLotResultat> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
		...(body.date ? { date: body.date } : {}),
	};
	return getApiClient()
		.apiFetch<EncaisserLoyerLotWire>(
			`/api/v1/residence/contrats/${idContrat}/encaisser-loyer-lot`,
			{ method: "POST", body: JSON.stringify(corps) },
		)
		.then((data) => ({
			idPaiement: data.id_paiement,
			montantTotal: data.montant_total,
			montantApplique: data.montant_applique,
			echeances: data.echeances.map((e) => ({
				id: e.id_echeance,
				montantApplique: e.montant_applique,
				statut: e.statut,
			})),
			montantNonAffecte: data.montant_non_affecte,
			avertissement: data.avertissement,
		}));
}
