import { useEffect, useState } from "react";
import { uploadCache } from "./upload-cache";
import { getUploadBlobUrl } from "./uploads";

/**
 * Hook pour charger un fichier uploadé et retourner un blob URL.
 * Utilise un cache en mémoire pour éviter les rechargements inutiles.
 *
 * Cache LRU (Least Recently Used):
 * - Max 100 images en mémoire
 * - Référence comptage (refCount) pour savoir quand libérer la mémoire
 * - Nettoyage automatique des entrées expirées (5min inactif)
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
			setError(null);
			return;
		}

		let mounted = true;
		setIsLoading(true);
		setError(null);

		(async () => {
			try {
				// Vérifier le cache en premier
				const cachedUrl = uploadCache.get(key);
				if (cachedUrl) {
					if (mounted) {
						setBlobUrl(cachedUrl);
						setIsLoading(false);
					}
					return;
				}

				// Si pas en cache, charger depuis le serveur
				const url = await getUploadBlobUrl(key);
				if (mounted && url) {
					// Ajouter au cache pour les futures utilisations
					uploadCache.set(key, url);
					setBlobUrl(url);
				} else if (mounted) {
					setBlobUrl(null);
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
		};
	}, [key]);

	// Cleanup: décrementer le refCount quand la clé change ou démonte
	useEffect(() => {
		return () => {
			if (key) {
				uploadCache.release(key);
			}
		};
	}, [key]);

	return { blobUrl, isLoading, error };
}
