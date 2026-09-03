/**
 * Cache des blob URLs en mémoire avec gestion LRU (Least Recently Used).
 * Limite: 100 images maximum pour éviter les fuites mémoire.
 *
 * Les blob URLs sont conservés en mémoire pendant la session utilisateur.
 * Quand la limite est atteinte, l'image la moins récemment utilisée est révoquée.
 */

interface CacheEntry {
	blobUrl: string;
	lastUsed: number;
	refCount: number; // Nombre de composants utilisant cette image
}

class UploadCache {
	private cache = new Map<string, CacheEntry>();
	private maxEntries = 100;

	/** Récupère un blob URL du cache, ou null si absent */
	get(key: string): string | null {
		const entry = this.cache.get(key);
		if (!entry) return null;

		// Mise à jour du timestamp d'utilisation
		entry.lastUsed = Date.now();
		entry.refCount++;

		return entry.blobUrl;
	}

	/** Ajoute un blob URL au cache */
	set(key: string, blobUrl: string): void {
		// Si la clé existe déjà, incrémenter le refCount
		const existing = this.cache.get(key);
		if (existing) {
			existing.refCount++;
			existing.lastUsed = Date.now();
			return;
		}

		// Si le cache est plein, supprimer l'entrée la moins récemment utilisée
		if (this.cache.size >= this.maxEntries) {
			this.evictLRU();
		}

		this.cache.set(key, {
			blobUrl,
			lastUsed: Date.now(),
			refCount: 1,
		});
	}

	/** Décrémente le refCount et révoque si refCount = 0 et pas utilisé depuis 5min */
	release(key: string): void {
		const entry = this.cache.get(key);
		if (!entry) return;

		entry.refCount--;

		// Garder les entrées actives en mémoire
		if (entry.refCount < 0) {
			entry.refCount = 0;
		}
	}

	/** Nettoie les entrées expirées (pas utilisées depuis 5 minutes et refCount = 0) */
	cleanExpired(): void {
		const now = Date.now();
		const ttl = 5 * 60 * 1000; // 5 minutes

		for (const [key, entry] of this.cache.entries()) {
			if (entry.refCount === 0 && now - entry.lastUsed > ttl) {
				URL.revokeObjectURL(entry.blobUrl);
				this.cache.delete(key);
			}
		}
	}

	/** Vide complètement le cache */
	clear(): void {
		for (const entry of this.cache.values()) {
			URL.revokeObjectURL(entry.blobUrl);
		}
		this.cache.clear();
	}

	/** Supprime l'entrée la moins récemment utilisée */
	private evictLRU(): void {
		let lruKey: string | null = null;
		let lruEntry: CacheEntry | null = null;
		let lruTime = Infinity;

		for (const [key, entry] of this.cache.entries()) {
			// Préférer supprimer les entrées avec refCount = 0
			if (entry.refCount === 0 && entry.lastUsed < lruTime) {
				lruKey = key;
				lruEntry = entry;
				lruTime = entry.lastUsed;
			}
		}

		// Si toutes les entrées sont actives (refCount > 0), supprimer la plus ancienne quand même
		if (!lruKey) {
			for (const [key, entry] of this.cache.entries()) {
				if (entry.lastUsed < lruTime) {
					lruKey = key;
					lruEntry = entry;
					lruTime = entry.lastUsed;
				}
			}
		}

		if (lruKey && lruEntry) {
			URL.revokeObjectURL(lruEntry.blobUrl);
			this.cache.delete(lruKey);
		}
	}

	/** Retourne l'état du cache (pour debug) */
	getStats() {
		return {
			size: this.cache.size,
			maxEntries: this.maxEntries,
			entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
				key,
				refCount: entry.refCount,
				age: Date.now() - entry.lastUsed,
			})),
		};
	}
}

// Instance globale unique
export const uploadCache = new UploadCache();

// Nettoyage automatique toutes les 5 minutes
setInterval(
	() => {
		uploadCache.cleanExpired();
	},
	5 * 60 * 1000,
);

// Nettoyage au déchargement de la page
if (typeof window !== "undefined") {
	window.addEventListener("beforeunload", () => {
		uploadCache.clear();
	});
}
