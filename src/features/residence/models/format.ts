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
export function parseInstantUTC(date: string): Date {
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

/**
 * Formate le JOUR d'un instant horodaté par le serveur en heure locale —
 * même lecture que `formatDateHeureUTC` sans l'heure. Un `date.slice(0, 10)`
 * sur la chaîne wire garderait le jour UTC : décalage d'un jour pour tout
 * événement horodaté entre minuit et 01h heure de Douala.
 */
export function formatDateInstantUTC(date: string | null | undefined): string {
	if (!date) return "—";
	const valeur = parseInstantUTC(date);
	if (Number.isNaN(valeur.getTime())) return date;
	return valeur.toLocaleDateString("fr-FR");
}

/**
 * Date civile au format `YYYY-MM-DD` en heure LOCALE. Jamais
 * `toISOString().slice(0, 10)` : l'UTC décale « aujourd'hui » d'un jour entre
 * 23h et minuit à Douala (UTC+1). Accepte un `Date` (défaut : maintenant).
 */
export function dateLocaleISO(date: Date = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Jour civil local `YYYY-MM-DD` d'un instant horodaté par le serveur (UTC
 * naïf) — pour comparer/regrouper par jour avec des filtres `du`/`au` saisis
 * en local. `""` si la valeur est absente ou illisible.
 */
export function jourLocalInstant(date: string | null | undefined): string {
	if (!date) return "";
	const valeur = parseInstantUTC(date);
	if (Number.isNaN(valeur.getTime())) return "";
	return dateLocaleISO(valeur);
}
