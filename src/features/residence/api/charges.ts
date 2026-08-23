import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { CategorieCharge, Charge } from "../models/charges";

type CreerChargeDto = components["schemas"]["CreerChargeDto"];
type CreerCategorieChargeDto = components["schemas"]["CreerCategorieChargeDto"];
type MajCategorieChargeDto = components["schemas"]["MajCategorieChargeDto"];
type PayerChargeDto = components["schemas"]["PayerChargeDto"];

/**
 * Le schéma généré type `compteur_numero`/api/v1/`lecture_*`/api/v1/`consommation` en objet
 * libre (`Record<string, never> | null`) mais ce sont de vraies valeurs ; on
 * élargit ces champs (même pattern que `equipements`/api/v1/`etat` côté logements).
 */
type ChargeWire = Omit<Charge, "id"> & { id_charge: string };
type CategorieChargeWire = Omit<CategorieCharge, "id"> & {
	id_categorie_charge: string;
};

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/**
 * Appels API du module Résidence — charges. Réponses hand-typed revalidées sur
 * le backend réel. Le lister documente des params marqués `required` à tort
 * (cf. docs/api.md) ; de plus `?logement=` renvoie un 500 sur le backend réel
 * (param cassé) — on charge donc TOUTES les charges et on filtre côté client
 * par `id_logement` (onglet Charges de la fiche logement).
 */
export function listCharges(): Promise<Charge[]> {
	return getApiClient()
		.apiFetch<ChargeWire[]>("/api/v1/residence/charges")
		.then((data) =>
			data.map(({ id_charge: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Catégories de charges (GET /residence/categories-charges). */
export function listCategoriesCharges(): Promise<CategorieCharge[]> {
	return getApiClient()
		.apiFetch<CategorieChargeWire[]>("/api/v1/residence/categories-charges")
		.then((data) =>
			data.map(({ id_categorie_charge: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Corps saisi par le formulaire « Ajouter une charge ». */
export interface ChargeBody {
	idLogement: string;
	idCategorieCharge: string;
	periode: string;
	montant: string;
	compteurNumero?: string | null;
	lectureDebut?: string | null;
	lectureFin?: string | null;
	consommation?: string | null;
}

/** Crée une charge (POST `CreerChargeDto`). */
export function creerCharge(body: ChargeBody): Promise<unknown> {
	const corps = {
		id_logement: body.idLogement,
		id_categorie_charge: body.idCategorieCharge,
		periode: body.periode,
		montant: body.montant,
		compteur_numero: texteOuNull(body.compteurNumero),
		lecture_debut: texteOuNull(body.lectureDebut),
		lecture_fin: texteOuNull(body.lectureFin),
		consommation: texteOuNull(body.consommation),
	} satisfies Omit<
		CreerChargeDto,
		"compteur_numero" | "lecture_debut" | "lecture_fin" | "consommation"
	> & {
		compteur_numero?: string | null;
		lecture_debut?: string | null;
		lecture_fin?: string | null;
		consommation?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/residence/charges", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Crée une catégorie de charge (POST `CreerCategorieChargeDto`). */
export function creerCategorieCharge(body: {
	libelle: string;
	actif?: boolean;
}): Promise<unknown> {
	const corps = {
		libelle: body.libelle,
		actif: body.actif ?? true,
	} satisfies CreerCategorieChargeDto;
	return getApiClient().apiFetch("/api/v1/residence/categories-charges", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie une catégorie de charge (PATCH `MajCategorieChargeDto`). */
export function modifierCategorieCharge(
	id: string,
	body: { libelle?: string; actif?: boolean },
): Promise<unknown> {
	const corps = {
		...(body.libelle !== undefined ? { libelle: body.libelle } : {}),
		...(body.actif !== undefined ? { actif: body.actif } : {}),
	} satisfies MajCategorieChargeDto;
	return getApiClient().apiFetch(`/api/v1/residence/categories-charges/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

/** Enregistre un paiement de charge (POST `/api/v1/charges/{id}/payer`). */
export function payerCharge(
	id: string,
	body: { montant: string; idMoyen: string },
): Promise<unknown> {
	const corps = {
		montant: body.montant,
		id_moyen: body.idMoyen,
	} satisfies PayerChargeDto;
	return getApiClient().apiFetch(`/api/v1/residence/charges/${id}/payer`, {
		method: "POST",
		body: JSON.stringify(corps),
	});
}
