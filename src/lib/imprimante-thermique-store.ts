/**
 * Nom de l'imprimante thermique QZ Tray choisie sur CE poste — réglage
 * matériel propre à la machine, jamais synchronisé avec le backend. Suit le
 * même pattern que `core/notifications/read-ids-store.ts` (wrapper dédié
 * plutôt qu'un accès `localStorage` dispersé dans les composants).
 */
const STORAGE_KEY = "sim.imprimante_thermique";

export function getImprimanteThermique(): string | null {
	if (typeof localStorage === "undefined") return null;
	try {
		return localStorage.getItem(STORAGE_KEY);
	} catch {
		return null;
	}
}

/** Best-effort : une erreur d'écriture (quota, navigation privée) ne doit jamais casser l'app. */
export function setImprimanteThermique(nom: string | null): void {
	if (typeof localStorage === "undefined") return;
	try {
		if (nom) {
			localStorage.setItem(STORAGE_KEY, nom);
		} else {
			localStorage.removeItem(STORAGE_KEY);
		}
	} catch {
		// best-effort
	}
}
