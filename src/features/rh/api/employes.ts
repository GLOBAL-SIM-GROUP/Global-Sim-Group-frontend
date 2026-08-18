import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Employe, EmployeStatut, TypeContrat } from "../models/employes";

type CreerEmployeDto = components["schemas"]["CreerEmployeDto"];
type MajEmployeDto = components["schemas"]["MajEmployeDto"];

type EmployeWire = Omit<Employe, "id"> & { id_employe: string };

/** Appels API du module RH — employés. */
export function listEmployes(sansCompte?: boolean): Promise<Employe[]> {
	const qs = sansCompte ? "?sans_compte=true" : "";
	return getApiClient()
		.apiFetch<EmployeWire[]>(`/rh/employes${qs}`)
		.then((data) =>
			data.map(({ id_employe: id, ...reste }) => ({ id, ...reste })),
		);
}

/** Détail d'un employé. */
export function getEmploye(id: string): Promise<Employe> {
	return getApiClient()
		.apiFetch<EmployeWire>(`/rh/employes/${id}`)
		.then(({ id_employe: idEmploye, ...reste }) => ({
			id: idEmploye,
			...reste,
		}));
}

/** Corps saisi par le formulaire employé. */
export interface EmployeBody {
	nom: string;
	prenom: string;
	telephone?: string | null;
	fonction: string;
	idService?: string | null;
	dateEmbauche: string;
	typeContrat: TypeContrat;
	salaireBase: string;
	autresInfos?: string | null;
}

/** Crée un employé (POST `CreerEmployeDto`). */
export function creerEmploye(body: EmployeBody): Promise<unknown> {
	const corps = {
		nom: body.nom,
		prenom: body.prenom,
		fonction: body.fonction,
		date_embauche: body.dateEmbauche,
		type_contrat: body.typeContrat,
		salaire_base: body.salaireBase,
		...(body.telephone?.trim() ? { telephone: body.telephone } : {}),
		...(body.idService ? { id_service: body.idService } : {}),
		...(body.autresInfos?.trim() ? { autres_infos: body.autresInfos } : {}),
	} satisfies CreerEmployeDto;
	return getApiClient().apiFetch("/rh/employes", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie un employé (PATCH `MajEmployeDto`, champs définis seulement). */
export function modifierEmploye(
	id: string,
	corps: Partial<EmployeBody> & { statut?: EmployeStatut },
): Promise<unknown> {
	const payload: Partial<MajEmployeDto> = {};
	if (corps.nom !== undefined) payload.nom = corps.nom;
	if (corps.prenom !== undefined) payload.prenom = corps.prenom;
	if (corps.fonction !== undefined) payload.fonction = corps.fonction;
	if (corps.dateEmbauche !== undefined)
		payload.date_embauche = corps.dateEmbauche;
	if (corps.typeContrat !== undefined) payload.type_contrat = corps.typeContrat;
	if (corps.salaireBase !== undefined) payload.salaire_base = corps.salaireBase;
	if (corps.statut !== undefined) payload.statut = corps.statut;
	if (corps.telephone !== undefined)
		payload.telephone = corps.telephone?.trim() || undefined;
	if (corps.idService !== undefined)
		payload.id_service = corps.idService || undefined;
	if (corps.autresInfos !== undefined)
		payload.autres_infos = corps.autresInfos?.trim() || undefined;
	return getApiClient().apiFetch(`/rh/employes/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}
