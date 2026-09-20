/**
 * Formate un montant FCFA (string backend) en « 35 000 FCFA ». Le séparateur de
 * milliers de `toLocaleString("fr-FR")` (espace fine insécable U+202F / U+00A0)
 * est normalisé en espace simple pour un affichage stable.
 */
export function formatMontantFCFA(montant: string | null | undefined): string {
	if (montant == null) return "—";
	const valeur = Number(montant);
	if (!Number.isFinite(valeur)) return montant;
	return `${valeur.toLocaleString("fr-FR").replace(/\s/g, " ")} FCFA`;
}

/** Formate une date `YYYY-MM-DD` en français ; `null`/api/v1/vide → « — ». */
export function formatDateISO(date: string | null | undefined): string {
	if (!date) return "—";
	const valeur = new Date(`${date}T00:00:00`);
	if (Number.isNaN(valeur.getTime())) return date;
	return valeur.toLocaleDateString("fr-FR");
}

/**
 * Formate une date-heure `YYYY-MM-DD HH:MM:SS` saisie par l'utilisateur
 * (ex. `date_heure_arrivee` d'un séjour) : c'est une heure LOCALE naïve,
 * aller-retour tel quel — on la parse donc en local, sans conversion.
 */
export function formatDateHeureISO(date: string | null | undefined): string {
	if (!date) return "—";
	const valeur = new Date(date.replace(" ", "T"));
	if (Number.isNaN(valeur.getTime())) return date;
	return valeur.toLocaleString("fr-FR");
}

/**
 * Parse une date-heure d'INSTANT horodaté par le serveur. Le backend écrit
 * en UTC mais sérialise sans suffixe de fuseau (« YYYY-MM-DD HH:MM:SS[.ffffff] »)
 * : un `new Date()` direct la lirait en heure locale — une heure de retard à
 * Douala (UTC+1). On normalise donc en ISO UTC ; les chaînes déjà suffixées
 * (« …Z », « …+01:00 ») passent telles quelles, et les fractions de seconde
 * sont ramenées à 3 chiffres (le format ES n'en garantit que 3).
 */
function parseInstantUTC(date: string): Date {
	let valeur = date.trim().replace(" ", "T");
	if (/^\d{4}-\d{2}-\d{2}$/.test(valeur)) valeur = `${valeur}T00:00:00`;
	valeur = valeur.replace(/(\.\d{3})\d+$/, "$1");
	if (!/[zZ]$/.test(valeur) && !/[+-]\d{2}:?\d{2}$/.test(valeur)) {
		valeur = `${valeur}Z`;
	}
	return new Date(valeur);
}

/**
 * Formate en heure locale française un instant horodaté par le serveur
 * (création de commande, dépôt, facture, pointage, audit…) — UTC naïf sur le
 * wire. À NE PAS utiliser pour les dates-heures saisies par l'utilisateur
 * (wall-clock locale) : pour celles-ci, `formatDateHeureISO`.
 */
export function formatDateHeureUTC(date: string | null | undefined): string {
	if (!date) return "—";
	const valeur = parseInstantUTC(date);
	if (Number.isNaN(valeur.getTime())) return date;
	return valeur.toLocaleString("fr-FR");
}
