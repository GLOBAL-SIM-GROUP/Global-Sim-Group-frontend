/**
 * Rapports (module M10). Types hand-typed revalidés sur le backend réel
 * (GET /rapports/*). `indicateurs` d'un rapport par activité est un objet libre
 * qui varie selon le code d'activité.
 */
export interface PeriodeRapport {
	du: string;
	au: string;
}

/** Période reflétée dans l'URL des pages de rapport (default = mois courant). */
export interface RapportPeriodeSearch {
	du?: string;
	au?: string;
}

/** Période effective d'une page (URL ou mois courant). */
export function periodeParDefaut(search: RapportPeriodeSearch): PeriodeRapport {
	const courante = periodeParType("ce_mois");
	return { du: search.du ?? courante.du, au: search.au ?? courante.au };
}

export interface LigneRecetteActivite {
	code: string;
	libelle: string;
	total_encaisse: string;
}

export interface SyntheseGlobale {
	periode: PeriodeRapport;
	recettes_par_activite: LigneRecetteActivite[];
	total_recettes: string;
	total_depenses: string;
	solde: string;
	impayes: { nombre: number; montant: string };
	masse_salariale: string;
}

export interface EncaissementRapport {
	id: string;
	date: string;
	montant: string;
	reference: string | null;
	motif: string | null;
	activite_libelle: string;
	moyen_libelle: string;
}

export interface DepenseRapport {
	id: string;
	date: string;
	montant: string;
	libelle: string;
	justificatif: string | null;
	categorie_libelle: string;
}

export interface RapportFinancier {
	encaissements: EncaissementRapport[];
	depenses: DepenseRapport[];
	impayes: Array<{
		type: string;
		id_client: string | null;
		client: string;
		reference: string;
		montant_du: string;
		montant_paye: string;
		reste: string;
		date_echeance: string | null;
	}>;
}

export interface ActiviteRapport {
	code: string;
	libelle: string;
	recettes: string;
	nombre_operations: number;
	indicateurs: Record<
		string,
		string | number | Record<string, string | number>
	>;
}

export interface RapportRh {
	pointage: {
		par_statut: Record<string, number>;
		total_pointes: number;
		total_heures_sup: string;
		total_duree: string;
	};
	paie: {
		par_statut: Record<string, string>;
		total_verse: string;
	};
}

/** Activités rapportables : code → libellé (page de génération). */
export const ACTIVITE_RAPPORT_OPTIONS: { code: string; libelle: string }[] = [
	{ code: "LOCATION_RESIDENTIEL", libelle: "Résidence" },
	{ code: "VENTE_MARCHANDISES", libelle: "Market (magasin)" },
	{ code: "PRESSING", libelle: "Pressing" },
	{ code: "RESTAURATION", libelle: "Restaurant" },
	{ code: "SALLE_FETE", libelle: "Salle de fête" },
];

/** Libellés français des indicateurs connus d'un rapport par activité. */
const INDICATEUR_LABELS: Record<string, string> = {
	ca: "Chiffre d'affaires",
	loyers_percus: "Loyers perçus",
	nombre_commandes: "Commandes",
	nombre_ventes: "Ventes",
	realisees: "Réservations réalisées",
	annulees: "Réservations annulées",
};

/** Libellés français des statuts d'un indicateur `par_statut`. */
const STATUT_LABELS: Record<string, string> = {
	ANNULEE: "Annulée",
	DEPOSE: "Déposée",
	EN_TRAITEMENT: "En traitement",
	PRET: "Prête",
	RETIRE: "Retirée",
};

function pad2(nombre: number): string {
	return String(nombre).padStart(2, "0");
}

function iso(d: Date): string {
	return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Types de période de la page de génération. */
export type TypePeriodeRapport =
	| "ce_mois"
	| "mois_precedent"
	| "annee"
	| "personnalisee";

/**
 * Calcule la période d'un type de rapport. `dateDeReference` (fixe en test)
 * détermine « maintenant ». Fonction pure.
 */
export function periodeParType(
	type: TypePeriodeRapport,
	dateDeReference?: Date,
): PeriodeRapport {
	const maintenant = dateDeReference ?? new Date();
	if (type === "mois_precedent") {
		const premier = new Date(
			maintenant.getFullYear(),
			maintenant.getMonth() - 1,
			1,
		);
		const dernier = new Date(
			maintenant.getFullYear(),
			maintenant.getMonth(),
			0,
		);
		return { du: iso(premier), au: iso(dernier) };
	}
	if (type === "annee") {
		return { du: `${maintenant.getFullYear()}-01-01`, au: iso(maintenant) };
	}
	if (type === "personnalisee") {
		return { du: "", au: "" };
	}
	const premier = new Date(maintenant.getFullYear(), maintenant.getMonth(), 1);
	return { du: iso(premier), au: iso(maintenant) };
}

/** Libellé français d'un indicateur (repli sur la clé brute). */
export function libelleIndicateur(cle: string): string {
	return INDICATEUR_LABELS[cle] ?? cle;
}

/** Libellé français d'un statut d'indicateur (repli sur la valeur). */
export function libelleStatutIndicateur(statut: string): string {
	return STATUT_LABELS[statut] ?? statut;
}

/**
 * Construit un CSV (séparateur `;`, guillemets si besoin) à partir de lignes.
 * Fonction pure — testable.
 */
export function construireCsv(
	lignes: readonly (readonly (string | number)[])[],
): string {
	return lignes
		.map((ligne) =>
			ligne
				.map((cellule) => {
					const valeur = String(cellule ?? "");
					return /[";\n]/.test(valeur)
						? `"${valeur.replace(/"/api/v1/g, '""')}"`
						: valeur;
				})
				.join(";"),
		)
		.join("\n");
}
