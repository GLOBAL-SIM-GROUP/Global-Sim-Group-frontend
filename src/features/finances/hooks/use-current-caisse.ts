import { useCurrentUser } from "#/core/auth";

/**
 * Hook pour accéder à la caisse actuelle de l'utilisateur.
 * - Si l'utilisateur est scopé à une caisse: retourne son id_caisse
 * - Sinon: retourne null (admin, voit tout)
 */
export function useCurrentCaisse() {
	const user = useCurrentUser();
	return user?.id_caisse ?? null;
}

/**
 * Hook pour vérifier si l'utilisateur est scopé à une caisse.
 */
export function useIsCaisseScopé() {
	const caisse = useCurrentCaisse();
	return caisse !== null;
}
