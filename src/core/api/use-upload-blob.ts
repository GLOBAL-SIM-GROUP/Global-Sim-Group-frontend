import { useEffect, useState } from "react";
import { uploadCache } from "./upload-cache";
import { getUploadBlobUrl } from "./uploads";

/**
 * Requêtes de téléchargement en cours, dédupliquées par clé : deux composants
 * (ou le double-invoke de StrictMode en dev) qui demandent la même image en
 * parallèle partagent une seule requête réseau.
 */
const inFlight = new Map<string, Promise<string | null>>();

function fetchBlobUrl(key: string): Promise<string | null> {
	const pending = inFlight.get(key);
	if (pending) return pending;
	const promise = getUploadBlobUrl(key).finally(() => {
		inFlight.delete(key);
	});
	inFlight.set(key, promise);
	return promise;
}

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
				const url = await fetchBlobUrl(key);
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

/**
 * Variante multi-clés de `useUploadBlobUrl` : résout un tableau de clés MinIO
 * en blob URLs (même ordre, `null` pour les clés absentes/en échec). Réutilise
 * le cache LRU et la déduplication in-flight de la version simple.
 * Le tableau `keys` doit être mémoïsé par l'appelant (dépendance d'effet).
 */
export function useUploadBlobUrls(
	keys: readonly (string | null | undefined)[],
) {
	const [urls, setUrls] = useState<(string | null)[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		let mounted = true;

		const resolved = keys.map((k) => (k ? (uploadCache.get(k) ?? null) : null));
		setUrls(resolved);

		const missing = keys
			.map((k, i) => ({ k, i }))
			.filter(({ k, i }) => k != null && resolved[i] == null);

		if (missing.length === 0) {
			setIsLoading(false);
		} else {
			setIsLoading(true);
			void Promise.all(
				missing.map(async ({ k, i }) => {
					try {
						const url = await fetchBlobUrl(k as string);
						if (mounted && url) {
							uploadCache.set(k as string, url);
							setUrls((prev) => {
								const next = [...prev];
								next[i] = url;
								return next;
							});
						}
					} catch {
						// Clé en échec : la case reste `null` (placeholder côté appelant).
					}
				}),
			).finally(() => {
				if (mounted) setIsLoading(false);
			});
		}

		return () => {
			mounted = false;
			for (const k of keys) {
				if (k) uploadCache.release(k);
			}
		};
	}, [keys]);

	return { urls, isLoading };
}
