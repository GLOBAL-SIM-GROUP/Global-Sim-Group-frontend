/**
 * Largeur de ticket préférée (58 ou 80mm) sur CE poste — même principe que
 * `imprimante-thermique-store.ts` : réglage matériel propre à la machine,
 * jamais synchronisé avec le backend. Permet d'imprimer un ticket en un
 * clic sans re-choisir la largeur à chaque fois (poste = une imprimante
 * thermique = une largeur de papier).
 */
const STORAGE_KEY = "sim.ticket_largeur";

export type LargeurTicket = 58 | 80;

const LARGEUR_DEFAUT: LargeurTicket = 58;

export function getLargeurTicket(): LargeurTicket {
	if (typeof localStorage === "undefined") return LARGEUR_DEFAUT;
	try {
		return localStorage.getItem(STORAGE_KEY) === "80" ? 80 : LARGEUR_DEFAUT;
	} catch {
		return LARGEUR_DEFAUT;
	}
}

/** Best-effort : une erreur d'écriture (quota, navigation privée) ne doit jamais casser l'app. */
export function setLargeurTicket(largeur: LargeurTicket): void {
	if (typeof localStorage === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, String(largeur));
	} catch {
		// best-effort
	}
}
