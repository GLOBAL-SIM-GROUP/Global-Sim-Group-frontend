/**
 * Hook pour accéder à la caisse actuelle de l'utilisateur.
 *
 * Toujours `null` pour l'instant : `GET /auth/me` ne renvoie pas `id_caisse`
 * même pour un compte caissier scopé (vérifié en direct sur le backend dev —
 * `admin/utilisateurs` liste bien un `id_caisse` par utilisateur, mais `/me`
 * ne l'expose pas, et le JWT ne porte que `{ sub, login, role, jti }`). Un
 * caissier n'a donc aujourd'hui aucun moyen de découvrir sa propre caisse
 * côté frontend — écart backend à combler avant de pouvoir implémenter le
 * scoping réel (le sélecteur retombe sur le mode admin/dropdown en attendant).
 */
export function useCurrentCaisse() {
	return null;
}

/**
 * Hook pour vérifier si l'utilisateur est scopé à une caisse.
 */
export function useIsCaisseScopé() {
	const caisse = useCurrentCaisse();
	return caisse !== null;
}
