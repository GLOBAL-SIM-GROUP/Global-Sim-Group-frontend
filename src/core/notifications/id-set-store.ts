/**
 * Petit ensemble d'ids de notifications persisté en localStorage — la même
 * mécanique sert deux états 100% frontend (l'enveloppe backend n'a ni champ
 * lu/non-lu ni notion de suppression, cf. `core/notifications/index.ts` :
 * WebSocket-only, pas de table SQL, pas d'endpoint REST) :
 *   - « lu » (`sim.notifications.read_ids`)
 *   - « masqué » après un « Vider la liste » (`sim.notifications.cleared_ids`)
 * Suit le même pattern que `core/auth/token-store.ts` (wrapper dédié plutôt
 * qu'un accès `localStorage` dispersé dans les composants).
 */
export interface IdSetStore {
	has(id: string): boolean;
	add(id: string): void;
	/** Purge les ids qui ne correspondent plus à une notification connue. */
	prune(existingIds: readonly string[]): void;
}

function load(storageKey: string): Set<string> {
	if (typeof localStorage === "undefined") return new Set();
	try {
		const raw = localStorage.getItem(storageKey);
		if (!raw) return new Set();
		const parsed: unknown = JSON.parse(raw);
		return Array.isArray(parsed)
			? new Set(parsed.filter((v): v is string => typeof v === "string"))
			: new Set();
	} catch {
		return new Set();
	}
}

/** Stockage best-effort : une erreur d'écriture (quota, storage indisponible) ne doit jamais casser l'app. */
function persist(storageKey: string, ids: Set<string>): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(storageKey, JSON.stringify([...ids]));
	} catch {
		// best-effort
	}
}

function createIdSetStore(storageKey: string): IdSetStore {
	let ids = load(storageKey);

	return {
		has(id) {
			return ids.has(id);
		},
		add(id) {
			if (ids.has(id)) return;
			ids.add(id);
			persist(storageKey, ids);
		},
		prune(existingIds) {
			const keep = new Set(existingIds);
			const next = new Set([...ids].filter((id) => keep.has(id)));
			if (next.size !== ids.size) {
				ids = next;
				persist(storageKey, ids);
			}
		},
	};
}

export function createReadIdsStore(): IdSetStore {
	return createIdSetStore("sim.notifications.read_ids");
}

/**
 * Ids masqués par « Vider la liste » — distinct de « lu » : un item vidé
 * disparaît de la liste (et du compteur non-lu) même si de nouvelles
 * notifications arrivent ensuite, alors qu'un item lu reste affiché
 * (juste dépondéré visuellement). Persiste entre rechargements/reconnexions :
 * le serveur repousse le même historique (7 jours par room, WebSocket
 * uniquement) à chaque reconnexion, mais l'id masqué ne réapparaît jamais
 * pour cet utilisateur/navigateur.
 */
export function createClearedIdsStore(): IdSetStore {
	return createIdSetStore("sim.notifications.cleared_ids");
}
