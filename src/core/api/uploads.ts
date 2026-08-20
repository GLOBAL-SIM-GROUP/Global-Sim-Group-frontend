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
 * Construit l'URL d'accès au fichier uploadé (GET /api/v1/uploads?key=...).
 * La clé est retournée par uploadImage() et stockée dans les modèles (e.g. plat.image_url).
 *
 * @param key - Clé MinIO retournée par uploadImage() (e.g. "plat-photo/3-<uuid>.jpg")
 * @returns URL relative pour <img src> ou <a href>
 */
export function getUploadUrl(key: string | null | undefined): string | null {
	if (!key) return null;
	const baseUrl = env.VITE_API_URL.replace(/\/+$/, "");
	const encodedKey = encodeURIComponent(key);
	return `${baseUrl}/uploads?key=${encodedKey}`;
}
