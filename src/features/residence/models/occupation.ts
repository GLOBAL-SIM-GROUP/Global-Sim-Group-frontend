import type { Contrat } from "./contrats";
import type { Sejour } from "./sejours";

/**
 * Occupation d'un logement sur une période — reproduit côté client la règle
 * mesurée du backend (`GET /residence/portail/sejours/logements`, testée en
 * direct 2026-10-08) : un logement n'est proposable que s'il est `DISPONIBLE`
 * (filtre fait par l'appelant), sans séjour `EN_COURS` chevauchant ni contrat
 * `ACTIF` couvrant la période. Une demande `EN_ATTENTE` ne bloque PAS le
 * logement (ni dans le catalogue ni à l'écriture — vérifié : deux demandes
 * chevauchantes sur le même logement sont acceptées en `201`).
 *
 * La comparaison se fait en **datetime**, comme le backend : `YYYY-MM-DD` seul
 * vaut minuit — un séjour qui se termine à midi le jour de l'arrivée bloque
 * encore une arrivée envoyée sans heure. Comparaison lexicographique sûre sur
 * le format `YYYY-MM-DD HH:MM` (datetime-local `T` normalisé en espace).
 */

/** Borne « sans fin » pour les séjours `EN_COURS` sans départ prévu. */
const FIN_OUVERTE = "9999-12-31";

/** `YYYY-MM-DD[ T]HH:MM[:SS]` → `YYYY-MM-DD HH:MM` (comparable). */
function normDateHeure(dateHeure: string): string {
	return dateHeure.replace("T", " ").slice(0, 16);
}

type SejourPeriode = Pick<
	Sejour,
	"id_logement" | "date_heure_arrivee" | "date_heure_depart_prevue"
>;

type ContratPeriode = Pick<
	Contrat,
	"id_logement" | "date_debut" | "date_fin_prevue"
>;

/** Le séjour occupe-t-il le logement sur `[debut, fin[` ? */
function sejourChevauche(sejour: SejourPeriode, debut: string, fin: string) {
	const arrivee = normDateHeure(sejour.date_heure_arrivee);
	// Pas de départ prévu sur un séjour EN_COURS = occupation ouverte.
	const depart = sejour.date_heure_depart_prevue
		? normDateHeure(sejour.date_heure_depart_prevue)
		: FIN_OUVERTE;
	return arrivee < fin && depart > debut;
}

/**
 * Le contrat couvre-t-il la période ? Les dates de contrat sont calendaires
 * (`YYYY-MM-DD`) : on compare sur les jours de `debut`/`fin`.
 */
function contratCouvre(contrat: ContratPeriode, debut: string, fin: string) {
	const debutJour = debut.slice(0, 10);
	const finJour = fin.slice(0, 10);
	return (
		contrat.date_debut.slice(0, 10) <= finJour &&
		(contrat.date_fin_prevue?.slice(0, 10) ?? FIN_OUVERTE) >= debutJour
	);
}

/**
 * Ids des logements non réservables sur `[debut, fin[` : séjours `EN_COURS`
 * chevauchants + contrats `ACTIF` couvrants (les mêmes critères que le
 * catalogue portail — l'appelant filtre déjà `statut = DISPONIBLE`).
 */
export function idsLogementsOccupesSurPeriode(
	sejoursEnCours: readonly SejourPeriode[],
	contratsActifs: readonly ContratPeriode[],
	debut: string,
	fin: string,
): Set<string> {
	const d = normDateHeure(debut);
	const f = normDateHeure(fin);
	const occupes = new Set<string>();
	for (const sejour of sejoursEnCours) {
		if (sejourChevauche(sejour, d, f)) occupes.add(sejour.id_logement);
	}
	for (const contrat of contratsActifs) {
		if (contratCouvre(contrat, debut, fin)) occupes.add(contrat.id_logement);
	}
	return occupes;
}

/**
 * Ids des logements ayant une demande `EN_ATTENTE` chevauchant `[debut, fin[`
 * — informatif uniquement : le backend n'exclut pas ces logements, le staff
 * tranche entre demandes concurrentes à la validation.
 */
export function idsLogementsDemandesSurPeriode(
	sejoursEnAttente: readonly SejourPeriode[],
	debut: string,
	fin: string,
): Set<string> {
	const d = normDateHeure(debut);
	const f = normDateHeure(fin);
	const demandes = new Set<string>();
	for (const sejour of sejoursEnAttente) {
		if (sejourChevauche(sejour, d, f)) demandes.add(sejour.id_logement);
	}
	return demandes;
}
