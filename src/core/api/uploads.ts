import { env } from "#/env";
import { getApiClient } from "./client";

export type UploadCategorie = "client-photo" | "piece-identite" | "plat-photo";

/**
 * Upload un fichier image vers MinIO via POST /api/v1/uploads.
 *
 * Authentification JWT + permission requise par le backend :
 * - client-photo, piece-identite → CLIENT.MODIFIER
 * - plat-photo → RESTAURANT.MODIFIER
 *
 * Le backend valide :
 * - MIME whitelist: image/jpeg, image/png, image/webp, application/pdf
 * - Max size: 5 MiB
 * - Catégorie exacte: one of exactly three strings
 *
 * @param file - Fichier à uploader (JPG/PNG/WebP — max 5 Mo)
 * @param categorie - Catégorie de stockage: client-photo | piece-identite | plat-photo
 * @returns Clé MinIO du fichier (e.g. "plat-photo/3-<uuid>.jpg") — à stocker en DB
 * @throws ApiError 403 si permission manque, 400 si fichier invalide, etc.
 */
export async function uploadImage(
	file: File,
	categorie: UploadCategorie,
): Promise<string> {
	// Validation côté client (le backend valide aussi)
	if (file.size > 5 * 1024 * 1024) {
		throw new Error("L'image ne doit pas dépasser 5 Mo.");
	}

	// MIME whitelist frontend (backend valide en plus)
	const allowedMimes = [
		"image/jpeg",
		"image/png",
		"image/webp",
		"application/pdf",
	];
	if (!allowedMimes.includes(file.type)) {
		throw new Error(
			"Format non supporté. Utilisez JPG, PNG, WebP ou PDF.",
		);
	}

	const formData = new FormData();
	formData.append("file", file);
	formData.append("categorie", categorie);

	const client = getApiClient();
	const data = await client.uploadForm<{ key: string }>(
		"/uploads",
		{
			method: "POST",
			body: formData,
		},
	);

	return data.key;
}

/**
 * Récupère un fichier uploadé via GET /api/v1/uploads?key=...
 * Requiert une authentification Bearer (CLIENT.VOIR ou RESTAURANT.VOIR selon la catégorie).
 *
 * La clé est retournée par uploadImage() et stockée dans les modèles (e.g. plat.image_url).
 *
 * @param key - Clé MinIO retournée par uploadImage() (e.g. "plat-photo/3-<uuid>.jpg")
 * @returns Promise<Blob> — utiliser createObjectURL() pour <img src>
 * @throws ApiError si le fichier n'existe pas ou si permission manque (403)
 */
export async function downloadUploadedFile(key: string | null | undefined): Promise<Blob | null> {
	if (!key) return null;

	const client = getApiClient();
	try {
		return await client.download(`/uploads?key=${encodeURIComponent(key)}`);
	} catch {
		// Si le fichier n'existe pas ou permission manque, retourner null
		// (l'image affichera le placeholder)
		return null;
	}
}

/**
 * Construit une URL de blob pour une image uploadée.
 * Charge d'abord le fichier via fetch avec authentification, puis crée un blob URL.
 *
 * ⚠️ Rappel : le blob URL est de courte durée et ne survit pas à un rechargement de page.
 * Pour une utilisation persistante (cache d'images), implémenter un mécanisme de cache.
 *
 * @param key - Clé MinIO retournée par uploadImage()
 * @returns Promise<string | null> — blob URL utilisable dans <img src>, ou null si échec
 */
export async function getUploadBlobUrl(key: string | null | undefined): Promise<string | null> {
	if (!key) return null;

	const blob = await downloadUploadedFile(key);
	if (!blob) return null;

	return URL.createObjectURL(blob);
}
