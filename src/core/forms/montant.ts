/**
 * Validation et normalisation des montants/tarifs saisis en FCFA.
 *
 * Le FCFA n'a pas de centimes (1 FCFA = 1 centime, jamais de décimales en
 * pratique), mais le backend accepte les décimales pour les montants
 * génériques. On accepte donc jusqu'à 2 décimales.
 *
 * Sont acceptés :
 *   - « 65000 »
 *   - « 65000.50 » (décimale avec un point)
 *   - « 65 000 » (espace comme séparateur de milliers)
 *   - « 65.000 » (point comme séparateur de milliers — confusion fréquente
 *     avec la décimale, corrigée ici)
 *
 * Sont refusés :
 *   - « 65,000 » (virgule décimale — non supportée par le backend)
 *   - « 65000.123 » (plus de 2 décimales)
 *   - « abc »
 *   - « 65.000.50 » (ambigu)
 */

/** Normalise la saisie : retire les espaces et les points séparateurs de milliers. */
function normaliserMontant(saisie: string): string {
	let valeur = saisie.trim();
	// Espaces (normaux et insécables) → retirés.
	valeur = valeur.replace(/[\s\u00A0\u202F]/g, "");
	// « 65.000 » → « 65000 » : un point suivi d'exactement 3 chiffres en fin
	// de saisie, où la partie entière fait 1 à 3 chiffres, est interprété
	// comme un séparateur de milliers (pas une décimale). « 65000.50 » et
	// « 65000.123 » sont préservés (partie entière > 3 chiffres ou décimales
	// ≠ 3 chiffres).
	valeur = valeur.replace(/^(\d{1,3})\.(\d{3})$/, "$1$2");
	return valeur;
}

/**
 * Valide un montant/tarif saisi. Renvoie `null` si valide, sinon un message
 * d'erreur clair et spécifique au problème rencontré.
 *
 * @param saisie - La valeur brute du champ (ex : « 65.000 », « 65000.50 »)
 * @param libelle - Nom du champ pour le message (ex : « Le tarif », « Le montant »)
 */
export function validerMontant(
	saisie: string,
	libelle = "Le montant",
): string | null {
	if (!saisie.trim()) return null; // Le caractère requis est géré ailleurs.

	const normalise = normaliserMontant(saisie);

	// Décimales valides : « 65000 » ou « 65000.5 » ou « 65000.50 »
	if (/^\d+(\.\d{1,2})?$/.test(normalise)) return null;

	// Messages spécifiques selon le problème détecté.
	if (/^[\d\s.\u00A0\u202F,]+$/.test(saisie.trim())) {
		// La saisie ne contient que des chiffres, points, espaces et virgules
		// mais n'est pas valide → problème de format.
		if (saisie.includes(",")) {
			return `${libelle} utilise un point (.) comme séparateur décimal, pas une virgule. Ex : 65000 ou 65000.50.`;
		}
		// Après normalisation, si on a un point avec 3+ chiffres après et que
		// la partie entière fait plus de 3 chiffres, c'est une décimale trop
		// longue (pas un séparateur de milliers).
		const match = normalise.match(/^(\d+)\.(\d+)$/);
		if (match && match[2].length > 2) {
			return `${libelle} accepte au maximum 2 décimales. Ex : 65000 ou 65000.50.`;
		}
		return `${libelle} doit être un nombre sans séparateur de milliers. Ex : 65000 (et non 65.000).`;
	}

	return `${libelle} doit être un nombre. Ex : 65000.`;
}

/**
 * Normalise un montant saisi pour l'envoi au backend : retire les espaces et
 * les séparateurs de milliers, garde au plus 2 décimales.
 *
 * @param saisie - La valeur brute du champ
 * @returns La valeur nettoyée prête pour le backend (ex : « 65000 »)
 */
export function normaliserMontantPourBackend(saisie: string): string {
	return normaliserMontant(saisie);
}
