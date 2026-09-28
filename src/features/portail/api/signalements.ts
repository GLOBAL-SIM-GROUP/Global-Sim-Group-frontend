import { getApiClient } from "#/core/api";
import type { components } from "#/core/api/generated/schema";
import type { Signalement, SignalementPhoto } from "#/core/api/signalements";

type CreerSignalementPortailDto =
	components["schemas"]["CreerSignalementPortailDto"];

type SignalementWire = Omit<Signalement, "id"> & { id_signalement: string };

type SignalementPhotoWire = Omit<SignalementPhoto, "id"> & {
	id_photo: string;
};

/** Le détail portail embarque les photos — pas de route liste dédiée. */
export interface SignalementPortailDetail extends Signalement {
	photos: SignalementPhoto[];
}

type SignalementDetailWire = SignalementWire & {
	photos?: SignalementPhotoWire[];
};

const toSignalement = ({
	id_signalement: id,
	...reste
}: SignalementWire): Signalement => ({ id, ...reste });

const toPhoto = ({
	id_photo: id,
	...reste
}: SignalementPhotoWire): SignalementPhoto => ({ id, ...reste });

/**
 * Signalements du portail client/résident (`/signalements/portail`,
 * backend 091 — permission `PORTAIL.VOIR`). Le déclarant est déduit du
 * JWT : la liste ne renvoie que les signalements de l'appelant, pas de
 * filtre utilisateur à envoyer.
 */

/** Mes signalements, du plus récent au plus ancien. */
export async function listMesSignalements(): Promise<Signalement[]> {
	const queryParams = new URLSearchParams({
		sort: "date_signalement",
		order: "desc",
		limit: "200",
	});
	const response = await getApiClient().apiFetch<SignalementWire[]>(
		`/api/v1/signalements/portail?${queryParams.toString()}`,
	);
	return response.map(toSignalement);
}

/**
 * Détail d'un de mes signalements + photos jointes. `404` = inconnu ou
 * déclaré par quelqu'un d'autre — l'UI ne distingue pas les deux cas.
 */
export async function getSignalementPortail(
	id: string,
): Promise<SignalementPortailDetail> {
	const wire = await getApiClient().apiFetch<SignalementDetailWire>(
		`/api/v1/signalements/portail/${id}`,
	);
	const { photos, ...signalementWire } = wire;
	return {
		...toSignalement(signalementWire),
		photos: (photos ?? []).map(toPhoto),
	};
}

/**
 * Déclare un signalement (`POST /signalements/portail`, 201 → `OUVERT`).
 * `module_cible` absent = signalement général (le serveur assigne
 * `cible_type: "GENERAL"`, jamais envoyé par le client).
 */
export function creerSignalementPortail(
	body: CreerSignalementPortailDto,
): Promise<Signalement> {
	return getApiClient()
		.apiFetch<SignalementWire>("/api/v1/signalements/portail", {
			method: "POST",
			body: JSON.stringify(body),
		})
		.then(toSignalement);
}

/**
 * Joint une photo à un de mes signalements (multipart, champ `file` —
 * whitelist JPEG/PNG/WebP/PDF). 409 dès que le signalement est
 * `RESOLU`/`REJETE`, 404 s'il est inconnu ou d'autrui.
 */
export function uploaderPhotoSignalementPortail(
	id: string,
	file: File,
): Promise<SignalementPhoto> {
	const formData = new FormData();
	formData.append("file", file);
	return getApiClient()
		.uploadForm<SignalementPhotoWire>(
			`/api/v1/signalements/portail/${id}/photos/upload`,
			{ method: "POST", body: formData },
		)
		.then(toPhoto);
}
