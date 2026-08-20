import { getApiClient } from "./client";

/**
 * Upload un fichier image vers MinIO via `/api/v1/uploads`.
 * Authentification automatique (JWT bearer token).
 *
 * @param file - Fichier à uploader (image JPG/PNG/WebP)
 * @returns URL MinIO du fichier uploadé
 * @throws ApiError si l'upload échoue ou si le fichier est trop gros
 */
export async function uploadImage(file: File): Promise<string> {
	if (file.size > 5 * 1024 * 1024) {
		throw new Error("L'image ne doit pas dépasser 5 Mo.");
	}

	const formData = new FormData();
	formData.append("file", file);

	const client = getApiClient();
	const data = await client.uploadForm<{ url?: string; path?: string }>(
		"/uploads",
		{
			method: "POST",
			body: formData,
		},
	);

	return data.url || data.path || "";
}
