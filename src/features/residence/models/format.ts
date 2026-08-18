/**
 * Formate un montant FCFA (string backend) en « 35 000 FCFA ». Le séparateur de
 * milliers de `toLocaleString("fr-FR")` (espace fine insécable U+202F / U+00A0)
 * est normalisé en espace simple pour un affichage stable.
 */
export function formatMontantFCFA(montant: string): string {
	const valeur = Number(montant);
	if (!Number.isFinite(valeur)) return montant;
	return `${valeur.toLocaleString("fr-FR").replace(/\s/g, " ")} FCFA`;
}

/** Formate une date `YYYY-MM-DD` en français ; `null`/vide → « — ». */
export function formatDateISO(date: string | null | undefined): string {
	if (!date) return "—";
	const valeur = new Date(`${date}T00:00:00`);
	if (Number.isNaN(valeur.getTime())) return date;
	return valeur.toLocaleDateString("fr-FR");
}

/** Formate une date-heure `YYYY-MM-DD HH:MM:SS` (backend) en français. */
export function formatDateHeureISO(date: string | null | undefined): string {
	if (!date) return "—";
	const valeur = new Date(date.replace(" ", "T"));
	if (Number.isNaN(valeur.getTime())) return date;
	return valeur.toLocaleString("fr-FR");
}
