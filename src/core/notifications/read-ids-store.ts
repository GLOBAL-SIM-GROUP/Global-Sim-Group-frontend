/**
 * L'enveloppe backend n'a pas de champ lu/non-lu (cf. `types.ts`) — c'est un
 * état 100% frontend, persisté en localStorage pour survivre au rechargement.
 * Suit le même pattern que `core/auth/token-store.ts` (wrapper dédié plutôt
 * qu'un accès `localStorage` dispersé dans les composants).
 */
const STORAGE_KEY = "sim.notifications.read_ids";

export interface ReadIdsStore {
	has(id: string): boolean;
	add(id: string): void;
	/** Purge les ids qui ne correspondent plus à une notification connue. */
	prune(existingIds: readonly string[]): void;
}

function load(): Set<string> {
	if (typeof localStorage === "undefined") return new Set();
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
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
function persist(ids: Set<string>): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
	} catch {
		// best-effort
	}
}

export function createReadIdsStore(): ReadIdsStore {
	let ids = load();

	return {
		has(id) {
			return ids.has(id);
		},
		add(id) {
			if (ids.has(id)) return;
			ids.add(id);
			persist(ids);
		},
		prune(existingIds) {
			const keep = new Set(existingIds);
			const next = new Set([...ids].filter((id) => keep.has(id)));
			if (next.size !== ids.size) {
				ids = next;
				persist(ids);
			}
		},
	};
}
