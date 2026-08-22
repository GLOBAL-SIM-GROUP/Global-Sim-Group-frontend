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
 * Le schéma généré type `duree_mois`/`periodicite`/`date_fin_prevue` en objet
 * libre (`Record<string, never> | null`) mais ce sont de vraies valeurs ; on
 * élargit ces champs (même pattern que `equipements`/`etat` côté logements).
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
 * (GET + restitution). Pas de PATCH ni de résiliation dans le spec.
 */
export function listContrats(): Promise<Contrat[]> {
	return getApiClient()
		.apiFetch<ContratWire[]>("/residence/contrats")
		.then((data) => data.map(toContrat));
}

/** Détail d'un contrat : embarque les échéances (avec leurs `id_echeance`). */
export function getContrat(id: string): Promise<ContratDetail> {
	return getApiClient()
		.apiFetch<ContratDetailWire>(`/residence/contrats/${id}`)
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
	periodicite?: string | null;
}

/**
 * Crée un contrat (POST `CreerContratDto`). `date_fin_prevue` est déduite de
 * la durée (`calculerDateFinPrevue`) ; `statut` et `date_signature` ne sont
 * PAS envoyés (défauts backend). Les échéances sont générées côté backend.
 */
export function creerContrat(body: ContratBody): Promise<unknown> {
	const corps = {
		id_client: body.idClient,
		id_logement: body.idLogement,
		date_debut: body.dateDebut,
		montant_loyer: body.montantLoyer,
		type_location: body.typeLocation,
		duree_mois: body.dureeMois ?? null,
		periodicite: texteOuNull(body.periodicite),
		date_fin_prevue: calculerDateFinPrevue(
			body.dateDebut,
			body.dureeMois ?? null,
		),
	} satisfies Omit<
		CreerContratDto,
		"duree_mois" | "periodicite" | "date_fin_prevue"
	> & {
		duree_mois?: number | null;
		periodicite?: string | null;
		date_fin_prevue?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/residence/contrats", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Active un contrat en attente (POST /contrats/{id}/activer). */
export function activerContrat(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/residence/contrats/${id}/activer`, {
		method: "POST",
	});
}

/** Caution d'un contrat (GET /contrats/{id}/caution). */
export function getCaution(idContrat: string): Promise<Caution> {
	return getApiClient()
		.apiFetch<CautionWire>(`/residence/contrats/${idContrat}/caution`)
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
		`/residence/contrats/${idContrat}/caution/restitution`,
		{ method: "POST", body: JSON.stringify(corps) },
	);
}
