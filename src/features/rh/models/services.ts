/**
 * Service RH (module M9). Hand-typed revalidé sur le backend réel
 * (GET /rh/services). Clé primaire wire `id_service` → `id`.
 */
export interface ServiceRh {
	id: string;
	libelle: string;
}
