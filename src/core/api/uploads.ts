/**
 * Uploads vers MinIO via le backend (module Restaurant, M5).
 * L'endpoint `/api/v1/uploads` accepte un FormData multipart et retourne l'URL MinIO.
 */

/**
 * Upload un fichier image vers MinIO.
 *
 * @param file - Fichier à uploader (image JPG/PNG/WebP)
 * @returns URL MinIO du fichier uploadé
 * @throws Error si l'upload échoue ou si le fichier est trop gros
 */
export async function uploadImage(file: File): Promise<string> {
	if (file.size > 5 * 1024 * 1024) {
		throw new Error("L'image ne doit pas dépasser 5 Mo.");
	}

	const formData = new FormData();
	formData.append("file", file);

	const response = await fetch("/api/v1/uploads", {
		method: "POST",
		body: formData,
		// Pas de Content-Type header — laisse le navigateur la définir (multipart/form-data + boundary)
	});

	if (!response.ok) {
		throw new Error(
			`Upload échoué (${response.status}): ${response.statusText}`,
		);
	}

	// Le backend retourne l'URL MinIO ou le chemin d'accès au fichier
	// Format: soit une URL complète, soit un chemin relatif à uploader dans imageUrl
	const data = (await response.json()) as { url?: string; path?: string };
	return data.url || data.path || "";
}
