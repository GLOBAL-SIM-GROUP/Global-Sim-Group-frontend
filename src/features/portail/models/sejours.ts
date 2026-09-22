/**
 * Demandes de séjour court du portail (endpoints `/residence/portail/sejours`,
 * residence 087+088). Types hand-typés : le schéma OpenAPI généré est en
 * retard sur le backend réel — le catalogue `PortailLogementDto` n'y expose
 * que `numero`/`nom`/`batiment` alors que la réponse livrée porte
 * `id_logement`, `type`, `tarif` et les champs bâtiment à plat (cf. note de
 * livraison backend 087+088).
 *
 * La demande naît `EN_ATTENTE` et n'occupe PAS le logement : c'est la
 * validation staff (`POST /residence/sejours/:id/valider`) qui affecte le
 * logement, fixe le tarif et passe le séjour `EN_COURS`. `tarif` et
 * `montant_total` restent `null` jusqu'au chiffrage — le client ne connaît
 * aucun prix avant validation.
 */

import type {
	SejourStatut,
	SejourType,
} from "#/features/residence/models/sejours";

export type { SejourStatut, SejourType };

/** Origine du séjour (`COMPTOIR` = créé par le staff, `PORTAIL` = demande client). */
export type SejourPortailOrigine = "COMPTOIR" | "PORTAIL";

/** Logement imbriqué dans la réponse séjour (projection réduite). */
export interface SejourPortailLogement {
	id: string;
	numero: string;
	type: string;
}

/** Séjour court du client/résident connecté (liste, détail, création). */
export interface SejourPortail {
	id: string;
	type_prestation: SejourType;
	id_logement: string;
	logement: SejourPortailLogement | null;
	/** Numéro à plat, conservé par le backend pour les écrans staff. */
	numero_logement: string | null;
	date_heure_arrivee: string;
	date_heure_depart_prevue: string | null;
	date_heure_depart_reelle: string | null;
	duree: string | null;
	/** `null` tant que le séjour n'a pas été chiffré à la validation. */
	tarif: string | null;
	montant_total: string | null;
	montant_paye: string | null;
	reste_a_payer: string | null;
	statut: SejourStatut;
	type_logement: string | null;
	nombre_personnes: number | null;
	observations: string | null;
	motif_annulation: string | null;
	origine: SejourPortailOrigine;
}

/**
 * Logement du catalogue portail (`GET /residence/portail/sejours/logements`).
 * Sont exclus : logements `INDISPONIBLE`, occupés par un séjour `EN_COURS`
 * chevauchant la période demandée, et sous contrat `ACTIF` la couvrant.
 *
 * ⚠️ `tarif` est le tarif du logement tel que stocké (assimilable à un
 * loyer), PAS un prix à la nuit — le tarif du séjour est fixé par le staff
 * à la validation. À afficher comme indicatif ou à masquer. `capacite` et
 * `tarif_nuit` n'existent pas en base.
 */
export interface LogementPortail {
	id_logement: string;
	numero: string;
	nom: string | null;
	type: string;
	tarif: string | null;
	id_batiment: string | null;
	batiment_code: string | null;
	batiment_nom: string | null;
}

/** Libellés français du statut de demande de séjour portail. */
export const SEJOUR_PORTAIL_STATUT_LABELS: Record<SejourStatut, string> = {
	EN_ATTENTE: "En attente de validation",
	EN_COURS: "Validé — en cours",
	TERMINE: "Terminé",
	ANNULE: "Annulé",
};

/** Classes de badge (fond/texte) par statut — palette portail. */
export const SEJOUR_PORTAIL_STATUT_BADGE: Record<SejourStatut, string> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	EN_COURS: "bg-[#2980B9] text-white",
	TERMINE: "bg-[#27AE60] text-white",
	ANNULE: "bg-[#95A5A6] text-white",
};

/** Étapes visibles côté client/résident. */
export const SEJOUR_PORTAIL_ETAPES: SejourStatut[] = [
	"EN_ATTENTE",
	"EN_COURS",
	"TERMINE",
];

/** Vrai tant que la demande peut encore être annulée par le client. */
export function estSejourAnnulable(
	sejour: Pick<SejourPortail, "statut">,
): boolean {
	return sejour.statut === "EN_ATTENTE";
}
