import { env } from "#/env";
import { getApiClient } from "./client";

export type UploadCategorie = "client-photo" | "piece-identite" | "plat-photo";

/**
 * Upload un fichier image vers MinIO via POST /api/v1/uploads.
 *
 * Contrat d'authentification:
 * - JWT Bearer token requis (Authorization: Bearer <accessToken>)
 * - Permission requise: CLIENT.MODIFIER (pour TOUTES les catégories)
 * - Retourne 403 si l'utilisateur manque la permission
 *
 * Validation backend:
 * - MIME whitelist (multer): image/jpeg, image/png, image/webp, application/pdf
 * - Max size: 5 MiB
 * - Catégorie exacte: client-photo | piece-identite | plat-photo
 *
 * Response: { "key": "categorie/3-<uuid>.<ext>" }
 * La clé est dérivée du MIME, pas du nom de fichier client.
 * À stocker en DB uniquement (jamais les bytes bruts).
 *
 * @param file - Fichier à uploader (JPG/PNG/WebP/PDF — max 5 Mo)
 * @param categorie - Clé exacte: client-photo | piece-identite | plat-photo
 * @returns Promise<string> — clé MinIO (e.g. "plat-photo/3-<uuid>.jpg")
 * @throws ApiError 403 si CLIENT.MODIFIER manque, 400 si fichier invalide
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
 *
 * Contrat d'authentification:
 * - JWT Bearer token requis (Authorization: Bearer <accessToken>)
 * - Permission requise: CLIENT.VOIR (pour TOUTES les catégories)
 * - Retourne 403 si l'utilisateur manque la permission
 *
 * Sécurité:
 * - Query param 'key' validé strictement: ^(?:client-photo|piece-identite|plat-photo)\/[A-Za-z0-9._-]+$
 * - Empêche les attaques path-traversal (pas d'accès arbitraire S3)
 *
 * Response:
 * - Raw bytes (image binary)
 * - Content-Type originel (image/jpeg, etc)
 * - Content-Disposition: inline; filename="<key>"
 *
 * @param key - Clé MinIO retournée par uploadImage() (e.g. "plat-photo/3-<uuid>.jpg")
 * @returns Promise<Blob> — image binary prêt pour createObjectURL() → <img src>
 * @throws ApiError 403 si CLIENT.VOIR manque, 400 si key invalide, 404 si fichier absent
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
 * Crée un blob URL pour une image uploadée.
 * Flow: fetch avec Bearer token → Blob → URL.createObjectURL() → <img src>
 *
 * ⚠️ Important:
 * - Blob URL ne survit pas rechargement (stocké en mémoire)
 * - Utilisé avec useUploadBlobUrl hook pour cache + lifecycle
 * - Cache LRU maintient max 100 images, nettoie après 5min inactivité
 *
 * @param key - Clé MinIO retournée par uploadImage() (e.g. "plat-photo/3-<uuid>.jpg")
 * @returns Promise<string | null> — blob URL prêt pour <img src>, ou null si échec
 */
export async function getUploadBlobUrl(key: string | null | undefined): Promise<string | null> {
	if (!key) return null;

	const blob = await downloadUploadedFile(key);
	if (!blob) return null;

	return URL.createObjectURL(blob);
}
