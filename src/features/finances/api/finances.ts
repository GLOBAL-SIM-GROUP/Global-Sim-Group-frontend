import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";

import type {
	CategorieDepense,
	Depense,
	Impaye,
	LigneTableauBord,
	MoyenPaiement,
	Paiement,
} from "../models/finances";

type CreerDepenseDto = components["schemas"]["CreerDepenseDto"];
type MajDepenseDto = components["schemas"]["MajDepenseDto"];
type CreerCategorieDepenseDto =
	components["schemas"]["CreerCategorieDepenseDto"];
type CreerMoyenPaiementDto = components["schemas"]["CreerMoyenPaiementDto"];
type MajMoyenPaiementDto = components["schemas"]["MajMoyenPaiementDto"];

type PaiementWire = Omit<Paiement, "id"> & { id_paiement: string };
type DepenseWire = Omit<Depense, "id"> & { id_depense: string };
type CategorieDepenseWire = Omit<CategorieDepense, "id"> & {
	id_categorie_depense: string;
};
type MoyenPaiementWire = Omit<MoyenPaiement, "id"> & { id_moyen: string };

const texteOuNull = (valeur: string | null | undefined): string | null =>
	valeur?.trim() ? valeur : null;

/** Appels API du module Finances. */
export function listTableauBord(filtres?: {
	periodo?: string;
}): Promise<LigneTableauBord[]> {
	const params = new URLSearchParams();
	if (filtres?.periodo) params.set("periodo", filtres.periodo);
	const qs = params.toString();
	return getApiClient().apiFetch<LigneTableauBord[]>(
		`/api/v1/finances/tableau-de-bord${qs ? `?${qs}` : ""}`,
	);
}

/** Récupère le chemin d'export PDF du tableau de bord financier */
export function getTableauBordPdfPath(periodo?: string): string {
	const params = new URLSearchParams();
	params.set("format", "pdf");
	if (periodo) params.set("periodo", periodo);
	return `/api/v1/finances/tableau-de-bord?${params.toString()}`;
}

/** Récupère le chemin d'export Excel du tableau de bord financier */
export function getTableauBordExcelPath(periodo?: string): string {
	const params = new URLSearchParams();
	params.set("format", "xlsx");
	if (periodo) params.set("periodo", periodo);
	return `/api/v1/finances/tableau-de-bord?${params.toString()}`;
}

export function listPaiements(filtres?: {
	du?: string;
	au?: string;
	type?: string;
	id_caisse?: string;
}): Promise<Paiement[]> {
	const params = new URLSearchParams();
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	if (filtres?.type) params.set("type", filtres.type);
	if (filtres?.id_caisse) params.set("id_caisse", filtres.id_caisse);
	const qs = params.toString();
	return getApiClient()
		.apiFetch<PaiementWire[]>(`/api/v1/finances/paiements${qs ? `?${qs}` : ""}`)
		.then((data) =>
			data.map(({ id_paiement: id, ...reste }) => ({ id, ...reste })),
		);
}

export function listDepenses(filtres?: {
	du?: string;
	au?: string;
	id_caisse?: string;
}): Promise<Depense[]> {
	const params = new URLSearchParams();
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	if (filtres?.id_caisse) params.set("id_caisse", filtres.id_caisse);
	const qs = params.toString();
	return getApiClient()
		.apiFetch<DepenseWire[]>(`/api/v1/finances/depenses${qs ? `?${qs}` : ""}`)
		.then((data) =>
			data.map(({ id_depense: id, ...reste }) => ({ id, ...reste })),
		);
}

export function listImpayes(filtres?: {
	type?: string;
	client?: string;
	periode?: string;
}): Promise<Impaye[]> {
	const params = new URLSearchParams();
	if (filtres?.type && filtres.type !== "tous")
		params.set("type", filtres.type);
	if (filtres?.client) params.set("client", filtres.client);
	if (filtres?.periode) params.set("periode", filtres.periode);
	const qs = params.toString();
	return getApiClient().apiFetch<Impaye[]>(
		`/api/v1/finances/impayes${qs ? `?${qs}` : ""}`,
	);
}

export function listCategoriesDepenses(): Promise<CategorieDepense[]> {
	return getApiClient()
		.apiFetch<CategorieDepenseWire[]>("/api/v1/finances/categories-depenses")
		.then((data) =>
			data.map(({ id_categorie_depense: id, ...reste }) => ({ id, ...reste })),
		);
}

export function creerCategorieDepense(body: {
	libelle: string;
}): Promise<unknown> {
	const corps = { libelle: body.libelle } satisfies CreerCategorieDepenseDto;
	return getApiClient().apiFetch("/api/v1/finances/categories-depenses", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

export function supprimerCategorieDepense(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/finances/categories-depenses/${id}`, {
		method: "DELETE",
	});
}

export function listMoyensPaiement(): Promise<MoyenPaiement[]> {
	return getApiClient()
		.apiFetch<MoyenPaiementWire[]>("/api/v1/finances/moyens-paiement")
		.then((data) =>
			data.map(({ id_moyen: id, ...reste }) => ({ id, ...reste })),
		);
}

export function creerMoyenPaiement(body: {
	libelle: string;
	actif?: boolean;
}): Promise<unknown> {
	const corps = {
		libelle: body.libelle,
		actif: body.actif ?? true,
	} satisfies CreerMoyenPaiementDto;
	return getApiClient().apiFetch("/api/v1/finances/moyens-paiement", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

export function modifierMoyenPaiement(
	id: string,
	body: { libelle?: string; actif?: boolean },
): Promise<unknown> {
	const corps = {
		...(body.libelle !== undefined ? { libelle: body.libelle } : {}),
		...(body.actif !== undefined ? { actif: body.actif } : {}),
	} satisfies MajMoyenPaiementDto;
	return getApiClient().apiFetch(`/api/v1/finances/moyens-paiement/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

export interface DepenseBody {
	date: string;
	montant: string;
	idCategorieDepense: string;
	libelle: string;
	justificatif?: string | null;
	idCaisse?: string | null;
}

export function creerDepense(body: DepenseBody): Promise<unknown> {
	const corps: Record<string, unknown> = {
		date: body.date,
		montant: body.montant,
		id_categorie_depense: body.idCategorieDepense,
		libelle: body.libelle,
		justificatif: texteOuNull(body.justificatif),
	};
	if (body.idCaisse) corps.id_caisse = body.idCaisse;
	return getApiClient().apiFetch("/api/v1/finances/depenses", {
		method: "POST",
		body: JSON.stringify(corps),
	});
}

export function modifierDepense(
	id: string,
	body: DepenseBody,
): Promise<unknown> {
	const corps: Record<string, unknown> = {
		date: body.date,
		montant: body.montant,
		id_categorie_depense: body.idCategorieDepense,
		libelle: body.libelle,
		justificatif: texteOuNull(body.justificatif),
	};
	if (body.idCaisse) corps.id_caisse = body.idCaisse;
	return getApiClient().apiFetch(`/api/v1/finances/depenses/${id}`, {
		method: "PATCH",
		body: JSON.stringify(corps),
	});
}

export function supprimerDepense(id: string): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/finances/depenses/${id}`, {
		method: "DELETE",
	});
}

/** Télécharge un rapport du tableau de bord en PDF */
export async function downloadTableauBordPdf(
	chemin: string,
	nomFichier: string,
): Promise<void> {
	const blob = await getApiClient().download(chemin);
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}

/** Télécharge un rapport du tableau de bord en Excel */
export async function downloadTableauBordExcel(
	chemin: string,
	nomFichier: string,
): Promise<void> {
	const blob = await getApiClient().download(chemin);
	const url = URL.createObjectURL(blob);
	const lien = document.createElement("a");
	lien.href = url;
	lien.download = nomFichier;
	document.body.appendChild(lien);
	lien.click();
	document.body.removeChild(lien);
	URL.revokeObjectURL(url);
}
