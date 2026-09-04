/**
 * Portail résident (module M2.5). Types hand-typed revalidés sur le backend
 * réel (GET /residence/portail/*). Clés primaires wire → `id`.
 */
export interface PortailClient {
	id: string;
	nom: string;
	prenoms: string;
}

export interface PortailLogement {
	numero: string;
	nom: string;
	batiment: string;
}

export interface PortailContrat {
	id: string;
	numero_contrat: string;
	date_debut: string;
	date_fin_prevue: string | null;
	montant_loyer: string;
	/** `null` pour les contrats créés sans périodicité (champ retiré du formulaire). */
	periodicite: string | null;
	logement: PortailLogement;
}

/** Statut d'une échéance du portail. */
export type PortailEcheanceStatut = "PAYE" | "IMPAYE" | "PARTIEL" | "A_VENIR";

/** Libellés français du statut d'échéance (ouvert : repli sur la valeur). */
export const ECHEANCE_STATUT_LABELS: Record<string, string> = {
	PAYE: "Payée",
	IMPAYE: "Impayée",
	PARTIEL: "Partielle",
	A_VENIR: "À venir",
};

/** Classes de badge (fond/texte) par statut — vert payé, rouge impayé, orange. */
export const ECHEANCE_STATUT_BADGE: Record<string, string> = {
	PAYE: "bg-[#27AE60] text-white",
	IMPAYE: "bg-[#E74C3C] text-white",
	PARTIEL: "bg-[#E67E22] text-white",
	A_VENIR: "bg-[#E67E22] text-white",
};

export interface ProchaineEcheance {
	mois: number;
	annee: number;
	montant: string;
	statut: PortailEcheanceStatut | (string & {});
}

export interface PortailResume {
	client: PortailClient;
	contrat_en_cours: PortailContrat | null;
	prochaine_echeance: ProchaineEcheance | null;
	total_impayes: string;
}

export interface PortailEcheance {
	id: string;
	mois: number;
	annee: number;
	montant: string;
	statut: PortailEcheanceStatut | (string & {});
	date_echeance: string;
	date_paiement: string | null;
	montant_paye: string | null;
	numero_contrat: string;
}

export interface PortailEcheances {
	echeances: PortailEcheance[];
	prochaine_echeance: ProchaineEcheance | null;
	total_impayes: string;
}

/** Type d'un paiement du portail. */
export type PortailPaiementType = "LOYER" | "CHARGE" | "AUTRE";

export const PAIEMENT_TYPE_LABELS: Record<string, string> = {
	LOYER: "Loyer",
	CHARGE: "Charge",
	AUTRE: "Autre",
};

export interface PortailPaiement {
	id: string;
	date: string;
	montant: string;
	type: PortailPaiementType | (string & {});
	mode_paiement: string;
	reference: string | null;
}

export interface PortailPaiements {
	paiements: PortailPaiement[];
}

/** Statut d'une caution du portail. */
export type PortailCautionStatut = "EN_COURS" | "RESTITUEE" | "RETENUE";

export const CAUTION_STATUT_LABELS: Record<string, string> = {
	EN_COURS: "En cours",
	RESTITUEE: "Restituée",
	RETENUE: "Retenue",
};

export const CAUTION_STATUT_BADGE: Record<string, string> = {
	EN_COURS: "bg-[#2980B9] text-white",
	RESTITUEE: "bg-[#27AE60] text-white",
	RETENUE: "bg-[#E74C3C] text-white",
};

export interface PortailCaution {
	id: string;
	montant: string;
	date_versement: string;
	statut: PortailCautionStatut | (string & {});
	montant_restitue: string | null;
	retenue: string | null;
	motif_retenue: string | null;
}

export interface PortailHistoriqueCaution {
	evenement: string;
	date: string;
	montant: string | null;
	motif: string | null;
}

export interface PortailCautionResponse {
	caution: PortailCaution | null;
	historique: PortailHistoriqueCaution[];
}

/** Reçu d'une échéance (GET /portail/echeances/{id}/recu). */
export interface RecuEcheance {
	type: string;
	reference: string;
	date: string;
	montant: string;
	mode_paiement: string;
	echeance: {
		mois: number;
		annee: number;
		montant: string;
		date_echeance: string;
		statut: string;
		numero_contrat: string;
	};
	client: { nom: string; prenoms: string };
	logement: string;
}

/**
 * Ligne d'une facture (détail du reçu de paiement).
 * `quantite` : vérifié en direct sur le backend dev — renvoyé en `number`
 * malgré l'exemple du spec (`"1"`), contrairement à `prix_unitaire`/`total`
 * qui sont bien des `Money` string-encodées.
 */
export interface RecuFactureLigne {
	libelle: string;
	quantite: string | number;
	prix_unitaire: string;
	total: string;
}

/** Facture rattachée à un paiement (absente pour un paiement sans facture). */
export interface RecuFacture {
	numero: string;
	date: string;
	montant_total: string;
	montant_paye: string;
	lignes: RecuFactureLigne[];
}

/**
 * Reçu d'un paiement (GET /portail/paiements/{id}/recu).
 * `echeance` et `facture` sont mutuellement (quasi) exclusifs et **absents**
 * (pas `null`) selon le type du paiement — vérifié en direct : un paiement
 * `LOYER` renvoie `echeance` sans `facture`, un paiement `AUTRE` renvoie
 * `facture` sans `echeance`.
 */
export interface RecuPaiement {
	type: string;
	reference: string;
	date: string;
	montant: string;
	mode_paiement: string;
	echeance?: {
		mois: number;
		annee: number;
		numero_contrat: string;
	};
	facture?: RecuFacture;
	client: { nom: string; prenoms: string };
}

/** Type d'une photo d'état des lieux du portail. */
export type PortailEtatDesLieuxType = "ENTREE" | "SORTIE";

export const ETAT_DES_LIEUX_TYPE_LABELS: Record<
	PortailEtatDesLieuxType,
	string
> = {
	ENTREE: "Entrée",
	SORTIE: "Sortie",
};

export const ETAT_DES_LIEUX_TYPE_BADGE: Record<
	PortailEtatDesLieuxType,
	string
> = {
	ENTREE: "bg-[#27AE60] text-white",
	SORTIE: "bg-[#E67E22] text-white",
};

/**
 * Photo d'état des lieux du résident (GET /portail/etat-des-lieux). Contrairement
 * au flux staff, `numero_contrat` remplace `id_utilisateur` (pas pertinent
 * côté résident) et l'image est servie par une route dédiée
 * (`/portail/etat-des-lieux/{id}/photo`), pas la route générique `/uploads`.
 */
export interface PortailEtatDesLieuxPhoto {
	id: string;
	id_contrat: string;
	numero_contrat: string;
	type: PortailEtatDesLieuxType | (string & {});
	piece: string | null;
	cle_objet: string;
	commentaire: string | null;
	date_ajout: string;
}

/** Libellé d'une période « mois année » (mois 1-12). */
export function libelleMoisAnnee(mois: number, annee: number): string {
	const date = new Date(annee, mois - 1, 1);
	return date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
}

/** Filtres de l'historique des paiements (côté client). */
export interface PaiementFiltres {
	du: string;
	au: string;
	type: string;
}

/** Filtre les paiements : période (comparaison de dates) et type. Fonction pure. */
export function filtrerPaiements(
	paiements: readonly PortailPaiement[],
	filtres: PaiementFiltres,
): PortailPaiement[] {
	return paiements.filter((paiement) => {
		if (filtres.type !== "tous" && paiement.type !== filtres.type) return false;
		const jour = paiement.date.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		return true;
	});
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
						? `"${valeur.replace(/"/g, '""')}"`
						: valeur;
				})
				.join(";"),
		)
		.join("\n");
}
