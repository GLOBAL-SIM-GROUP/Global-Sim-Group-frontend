/**
 * Paramètres généraux (module M11, 12.6). Hand-typed revalidés sur le backend
 * réel (GET /core/parametres). Clé primaire wire `id_parametre` → `id`.
 */
export interface Parametre {
	id: string;
	cle: string;
	valeur: string;
	description: string | null;
}
