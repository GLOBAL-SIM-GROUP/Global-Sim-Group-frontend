/**
 * Règles de forme du mot de passe — alignées sur le backend réel
 * (`mot_de_passe`/`nouveau_mot_de_passe` : min 8, max 72 — limite bcrypt,
 * aucune complexité exigée). Partagé par tous les écrans qui définissent ou
 * réinitialisent un mot de passe pour éviter les validations divergentes
 * (le frontend laissait passer 6 caractères sur admin/RH → 400 au POST).
 */
export const MOT_DE_PASSE_MIN = 8;
export const MOT_DE_PASSE_MAX = 72;

/** Aide affichée sous les champs mot de passe (hors erreur). */
export const MOT_DE_PASSE_AIDE = `Entre ${MOT_DE_PASSE_MIN} et ${MOT_DE_PASSE_MAX} caractères.`;

/** Retourne le message d'erreur, ou `undefined` si la forme est valide. */
export function erreurMotDePasse(valeur: string): string | undefined {
	if (valeur.length < MOT_DE_PASSE_MIN) {
		return `Minimum ${MOT_DE_PASSE_MIN} caractères.`;
	}
	if (valeur.length > MOT_DE_PASSE_MAX) {
		return `Maximum ${MOT_DE_PASSE_MAX} caractères.`;
	}
	return undefined;
}
