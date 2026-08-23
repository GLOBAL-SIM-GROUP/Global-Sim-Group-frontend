import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type { Utilisateur } from "../models/utilisateurs";

type CreerUtilisateurDto = components["schemas"]["CreerUtilisateurDto"];
type MajUtilisateurDto = components["schemas"]["MajUtilisateurDto"];
type ReinitialiserMotDePasseDto =
	components["schemas"]["ReinitialiserMotDePasseDto"];

type UtilisateurWire = Omit<Utilisateur, "id"> & { id_utilisateur: string };

const remapper = ({
	id_utilisateur: id,
	...reste
}: UtilisateurWire): Utilisateur => ({ id, ...reste });

export interface ListUtilisateursParams {
	search?: string;
}

/** Appels API du module Administration — utilisateurs. */
export function listUtilisateurs(params?: ListUtilisateursParams): Promise<Utilisateur[]> {
	const searchParams = new URLSearchParams();
	if (params?.search) searchParams.append("search", params.search);

	const queryString = searchParams.toString();
	const path = `/admin/utilisateurs${queryString ? `?${queryString}` : ""}`;

	return getApiClient()
		.apiFetch<UtilisateurWire[]>(path)
		.then((data) => data.map(remapper));
}

/** Corps saisi par le formulaire utilisateur. */
export interface UtilisateurBody {
	login: string;
	idRole: string;
	motDePasse?: string;
	nom?: string | null;
	prenom?: string | null;
	idEmploye?: string | null;
	idActiviteScope?: string | null;
	actif?: boolean;
}

/** Crée un compte utilisateur (POST `CreerUtilisateurDto`). */
export function creerUtilisateur(body: UtilisateurBody): Promise<unknown> {
	const corps = {
		login: body.login,
		mot_de_passe: body.motDePasse ?? "",
		id_role: body.idRole,
		actif: body.actif ?? true,
		...(body.nom?.trim() ? { nom: body.nom } : {}),
		...(body.prenom?.trim() ? { prenom: body.prenom } : {}),
		...(body.idEmploye ? { id_employe: body.idEmploye } : {}),
		...(body.idActiviteScope
			? { id_activite_scope: body.idActiviteScope }
			: {}),
	} satisfies Omit<
		CreerUtilisateurDto,
		"nom" | "prenom" | "id_employe" | "id_activite_scope"
	> & {
		nom?: string | null;
		prenom?: string | null;
		id_employe?: string | null;
		id_activite_scope?: string | null;
	};
	return getApiClient().apiFetch("/api/v1/admin/utilisateurs", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

/** Modifie un compte utilisateur (PATCH `MajUtilisateurDto`). */
export function modifierUtilisateur(
	id: string,
	body: Partial<Omit<UtilisateurBody, "motDePasse">>,
): Promise<unknown> {
	const payload: Partial<
		Omit<
			MajUtilisateurDto,
			"nom" | "prenom" | "id_employe" | "id_activite_scope"
		>
	> & {
		nom?: string;
		prenom?: string;
		id_employe?: string;
		id_activite_scope?: string;
	} = {};
	if (body.login !== undefined) payload.login = body.login;
	if (body.idRole !== undefined) payload.id_role = body.idRole;
	if (body.actif !== undefined) payload.actif = body.actif;
	if (body.nom !== undefined) payload.nom = body.nom?.trim() || undefined;
	if (body.prenom !== undefined)
		payload.prenom = body.prenom?.trim() || undefined;
	if (body.idEmploye !== undefined)
		payload.id_employe = body.idEmploye || undefined;
	if (body.idActiviteScope !== undefined)
		payload.id_activite_scope = body.idActiviteScope || undefined;
	return getApiClient().apiFetch(`/api/v1/admin/utilisateurs/${id}`, {
		method: "PATCH",
		body: JSON.stringify(payload),
	});
}

/** Réinitialise le mot de passe (POST `ReinitialiserMotDePasseDto`). */
export function reinitialiserMotDePasse(
	id: string,
	nouveauMotDePasse: string,
): Promise<unknown> {
	const corps = {
		nouveau_mot_de_passe: nouveauMotDePasse,
	} satisfies ReinitialiserMotDePasseDto;
	return getApiClient().apiFetch(
		`/admin/utilisateurs/${id}/reinitialiser-mot-de-passe`,
		{
			method: "POST",
			body: JSON.stringify(corps),
		},
	);
}
