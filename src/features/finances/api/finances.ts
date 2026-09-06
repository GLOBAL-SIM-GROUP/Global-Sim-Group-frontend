import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";
import { imprimerPdfBlob } from "#/lib/print-pdf";

import type {
	CategorieDepense,
	Depense,
	Impaye,
	LigneTableauBord,
	MoyenPaiement,
	Paiement,
	PayeurLoyer,
} from "../models/finances";

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

/**
 * Appels API du module Finances. La réponse n'est PAS un tableau brut malgré
 * le nom : le backend renvoie `{ periodes: [...], payeurs_loyer: [...] }`
 * (vérifié en direct, 2026-09-05) — on déballe `periodes` ici pour que
 * l'appelant reçoive bien un `LigneTableauBord[]`.
 *
 * Filtrage par `du`/`au` (pas `periodo`, qui n'existe pas côté backend et
 * était silencieusement ignoré — vérifié en direct : `?periodo=ce_mois`
 * renvoyait exactement les mêmes 36 périodes que sans aucun paramètre,
 * tandis que `?du=...&au=...` restreint bien les périodes retournées).
 */
export function listTableauBord(filtres?: {
	du?: string;
	au?: string;
	id_caisse?: string;
}): Promise<LigneTableauBord[]> {
	const params = new URLSearchParams();
	if (filtres?.du) params.set("du", filtres.du);
	if (filtres?.au) params.set("au", filtres.au);
	if (filtres?.id_caisse) params.set("id_caisse", filtres.id_caisse);
	const qs = params.toString();
	return getApiClient()
		.apiFetch<{ periodes: LigneTableauBord[] }>(
			`/api/v1/finances/tableau-de-bord${qs ? `?${qs}` : ""}`,
		)
		.then((data) => data.periodes ?? []);
}

/**
 * Locataires ayant payé leur loyer sur la période (`payeurs_loyer` de la même
 * réponse que `listTableauBord` — voir sa note ci-dessus). Fonction séparée
 * plutôt qu'un champ de plus sur `listTableauBord` : consommateurs différents
 * (rapport résidence vs tableau de bord financier), pas besoin de forcer
 * l'un à porter les données de l'autre.
 */
export function listPayeursLoyer(
	du?: string,
	au?: string,
): Promise<PayeurLoyer[]> {
	const params = new URLSearchParams();
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	const qs = params.toString();
	return getApiClient()
		.apiFetch<{ payeurs_loyer: PayeurLoyer[] }>(
			`/api/v1/finances/tableau-de-bord${qs ? `?${qs}` : ""}`,
		)
		.then((data) => data.payeurs_loyer ?? []);
}

/** Récupère le chemin d'export PDF du tableau de bord financier */
export function getTableauBordPdfPath(du?: string, au?: string): string {
	const params = new URLSearchParams();
	params.set("format", "pdf");
	if (du) params.set("du", du);
	if (au) params.set("au", au);
	return `/api/v1/finances/tableau-de-bord?${params.toString()}`;
}

/** Récupère le chemin d'export Excel du tableau de bord financier */
export function getTableauBordExcelPath(du?: string, au?: string): string {
	const params = new URLSearchParams();
	params.set("format", "xlsx");
	if (du) params.set("du", du);
	if (au) params.set("au", au);
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

/** Imprime un rapport du tableau de bord en PDF */
export async function printTableauBordPdf(chemin: string): Promise<void> {
	const blob = await getApiClient().download(chemin);
	imprimerPdfBlob(blob);
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
