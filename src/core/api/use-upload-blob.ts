import { useEffect, useState } from "react";
import { getUploadBlobUrl } from "./uploads";

/**
 * Hook pour charger un fichier uploadé et retourner un blob URL.
 * Gère automatiquement le nettoyage du blob URL.
 *
 * @param key - Clé MinIO du fichier uploadé (e.g. "plat-photo/3-<uuid>.jpg")
 * @returns Objet avec: blobUrl (string | null), isLoading (boolean), error (Error | null)
 */
export function useUploadBlobUrl(key: string | null | undefined) {
	const [blobUrl, setBlobUrl] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		if (!key) {
			setBlobUrl(null);
			return;
		}

		let mounted = true;
		setIsLoading(true);
		setError(null);

		(async () => {
			try {
				const url = await getUploadBlobUrl(key);
				if (mounted) {
					setBlobUrl(url);
				}
			} catch (err) {
				if (mounted) {
					setError(err instanceof Error ? err : new Error(String(err)));
					setBlobUrl(null);
				}
			} finally {
				if (mounted) {
					setIsLoading(false);
				}
			}
		})();

		return () => {
			mounted = false;
			// Nettoyer le blob URL quand le composant se démonte
			if (blobUrl) {
				URL.revokeObjectURL(blobUrl);
			}
		};
	}, [key, blobUrl]);

	return { blobUrl, isLoading, error };
}
