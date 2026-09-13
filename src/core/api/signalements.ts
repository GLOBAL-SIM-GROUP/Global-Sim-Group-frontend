import { getApiClient } from "./client";

/**
 * Appels API du module Signalements. Clé primaire wire `id_signalement` → `id`
 * (même remapping que les autres modules, ex. `id_facture` → `id` en
 * facturation) ; noms de fonctions en camelCase (même convention que le
 * reste de `core/api/`).
 *
 * Schéma revalidé en direct sur le backend de dev le 2026-09-12 (la base a été
 * remise à zéro entre-temps) : un signalement cible désormais explicitement
 * soit une activité (`cible_type: "ACTIVITE"` + `id_activite`), soit un module
 * (`cible_type: "MODULE"` + `module_cible`) — plus de type "général" implicite
 * comme avant. `module_cible` liste 10 valeurs (ni `CORE` ni `CLIENT`, absents
 * du nouveau contrat).
 */
export type CibleType = "ACTIVITE" | "MODULE";

export type ModuleCible =
	| "RESIDENCE"
	| "MARCHANDISE"
	| "PRESSING"
	| "RESTAURANT"
	| "SALLE_FETE"
	| "FACTURATION"
	| "FINANCES"
	| "RH"
	| "ADMIN"
	| "AUDIT";

export interface Signalement {
	id: string;
	titre: string;
	description: string;
	cible_type: CibleType;
	/** Non-null ssi `cible_type === "ACTIVITE"`. */
	id_activite: string | null;
	/** Non-null ssi `cible_type === "MODULE"`. */
	module_cible: ModuleCible | null;
	statut: "OUVERT" | "EN_COURS" | "RESOLU" | "REJETE";
	id_utilisateur_declarant: string;
	id_utilisateur_traitant?: string | null;
	note_resolution?: string | null;
	date_signalement: string;
	date_resolution?: string | null;
	// `GET /signalements/:id` (détail) n'inclut PAS ces 5 champs — seule la
	// liste (`GET /signalements`) les renvoie (join backend fait uniquement
	// côté liste, revérifié le 2026-09-12). La fiche détail les complète
	// depuis la liste : voir `completerSignalementDepuisListe` dans
	// `features/signalements/models`.
	activite_code?: string | null;
	activite_libelle?: string | null;
	declarant_nom?: string | null;
	declarant_prenom?: string | null;
	declarant_login?: string;
}

type SignalementWire = Omit<Signalement, "id"> & { id_signalement: string };

const toSignalement = ({
	id_signalement: id,
	...reste
}: SignalementWire): Signalement => ({ id, ...reste });

export interface SignalementListParams {
	cible_type?: CibleType;
	id_activite?: string;
	module_cible?: ModuleCible;
	statut?: "OUVERT" | "EN_COURS" | "RESOLU" | "REJETE";
	id_utilisateur_declarant?: string;
	sort?: "date_signalement" | "titre";
	order?: "asc" | "desc";
	limit?: number;
	offset?: number;
}

/** Exactement une cible : `id_activite` si `cible_type === "ACTIVITE"`,
 *  `module_cible` si `cible_type === "MODULE"` — jamais les deux, jamais
 *  aucune (le backend valide et renvoie 400 sinon). */
export type SignalementCreatePayload = {
	titre: string;
	description: string;
} & (
	| { cible_type: "ACTIVITE"; id_activite: string; module_cible?: never }
	| { cible_type: "MODULE"; module_cible: ModuleCible; id_activite?: never }
);

export interface SignalementResolutionPayload {
	note_resolution: string;
}

export function listSignalements(
	params: SignalementListParams = {},
): Promise<Signalement[]> {
	const queryParams = new URLSearchParams();

	if (params.cible_type) queryParams.append("cible_type", params.cible_type);
	if (params.id_activite) queryParams.append("id_activite", params.id_activite);
	if (params.module_cible) {
		queryParams.append("module_cible", params.module_cible);
	}
	if (params.statut) queryParams.append("statut", params.statut);
	if (params.id_utilisateur_declarant) {
		queryParams.append(
			"id_utilisateur_declarant",
			params.id_utilisateur_declarant,
		);
	}
	if (params.sort) queryParams.append("sort", params.sort);
	if (params.order) queryParams.append("order", params.order);
	if (params.limit) queryParams.append("limit", params.limit.toString());
	if (params.offset) queryParams.append("offset", params.offset.toString());

	return getApiClient()
		.apiFetch<SignalementWire[]>(
			`/api/v1/signalements?${queryParams.toString()}`,
		)
		.then((data) => data.map(toSignalement));
}

export function getSignalement(id: string): Promise<Signalement> {
	if (!id || id === "undefined") {
		throw new Error("Signal ID must be a valid string");
	}
	return getApiClient()
		.apiFetch<SignalementWire>(`/api/v1/signalements/${id}`)
		.then(toSignalement);
}

export function createSignalement(
	payload: SignalementCreatePayload,
): Promise<Signalement> {
	return getApiClient()
		.apiFetch<SignalementWire>("/api/v1/signalements", {
			method: "POST",
			body: JSON.stringify(payload),
		})
		.then(toSignalement);
}

/** Prise en charge — l'API n'accepte aucun payload pour cette action. */
export function prendreEnChargeSignalement(id: string): Promise<unknown> {
	return getApiClient().apiFetch(
		`/api/v1/signalements/${id}/prendre-en-charge`,
		{ method: "POST" },
	);
}

export function resoudreSignalement(
	id: string,
	payload: SignalementResolutionPayload,
): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/signalements/${id}/resoudre`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export function rejeterSignalement(
	id: string,
	payload: SignalementResolutionPayload,
): Promise<unknown> {
	return getApiClient().apiFetch(`/api/v1/signalements/${id}/rejeter`, {
		method: "POST",
		body: JSON.stringify(payload),
	});
}

export interface SignalementPhoto {
	id: string;
	id_signalement: string;
	cle_objet: string;
	id_utilisateur: string;
	date_ajout: string;
}

type SignalementPhotoWire = Omit<SignalementPhoto, "id"> & { id_photo: string };

const toSignalementPhoto = ({
	id_photo: id,
	...reste
}: SignalementPhotoWire): SignalementPhoto => ({ id, ...reste });

export function listSignalementPhotos(id: string): Promise<SignalementPhoto[]> {
	return getApiClient()
		.apiFetch<SignalementPhotoWire[]>(`/api/v1/signalements/${id}/photos`)
		.then((photos) => photos.map(toSignalementPhoto));
}

/**
 * Upload d'une photo de signalement — endpoint dédié en un seul appel
 * (2026-09-13, remplace l'ancien flux à deux temps `POST /uploads` +
 * `POST /:id/photos {cle_objet}` pour l'UI signalements). La visibilité est
 * vérifiée côté backend avant stockage de l'octet : 404 si le signalement
 * est hors du périmètre de l'appelant, rien n'atterrit dans le bucket.
 * Permission : `SIGNALEMENT.CREER` (tous les rôles qui peuvent créer un
 * signalement peuvent y joindre une photo).
 */
export function uploaderSignalementPhoto(
	id: string,
	file: File,
): Promise<SignalementPhoto> {
	const formData = new FormData();
	formData.append("file", file);
	return getApiClient()
		.uploadForm<SignalementPhotoWire>(
			`/api/v1/signalements/${id}/photos/upload`,
			{ method: "POST", body: formData },
		)
		.then(toSignalementPhoto);
}

/**
 * Récupère l'octet d'une photo de signalement via son propre endpoint
 * (`GET /signalements/photos/:id/fichier`, permission `SIGNALEMENT.VOIR`) —
 * plus jamais `GET /uploads?key=...` pour ce module : la lecture hérite du
 * périmètre du signalement parent (un résident ne lit que les photos de ses
 * propres signalements), ce que la clé MinIO seule ne permettait pas de
 * vérifier.
 */
export function telechargerSignalementPhoto(
	idPhoto: string | null | undefined,
): Promise<Blob | null> {
	if (!idPhoto) return Promise.resolve(null);
	return getApiClient()
		.download(`/api/v1/signalements/photos/${idPhoto}/fichier`)
		.catch(() => null);
}

/** Blob URL prêt pour `<img src>`, ou `null` si le fichier est indisponible. */
export async function getSignalementPhotoBlobUrl(
	idPhoto: string | null | undefined,
): Promise<string | null> {
	const blob = await telechargerSignalementPhoto(idPhoto);
	if (!blob) return null;
	return URL.createObjectURL(blob);
}
