/** Caisse (point d'encaissement) — une caisse par activité, scopée à des utilisateurs. */
export interface Caisse {
	id_caisse: string;
	libelle: string;
	id_activite: string;
	actif: boolean;
	activite_code?: string;
	activite_libelle?: string;
}

/** Détail d'un paiement au sein du dashboard. */
export interface PaiementDetail {
	id: string;
	date: string;
	montant: number;
	type: string;
	motif?: string | null;
	reference?: string | null;
	id_utilisateur?: string | null;
	login?: string;
}

/** Caisse avec stats pour le tableau de bord. */
export interface CaisseDashboard extends Caisse {
	revenus_jour: number;
	total_paiements: number;
	total_depenses: number;
	nombre_employes: number;
	paiements_details?: PaiementDetail[];
}

/** Agrégation des revenus par utilisateur au sein d'une caisse. */
export interface RevenusUtilisateur {
	id_utilisateur: string;
	login: string;
	montant_total: number;
	nombre_paiements: number;
}

/** DTO pour créer une caisse. */
export interface CreerCaisseDto {
	libelle: string;
	id_activite: string;
}

/** DTO pour modifier une caisse. */
export interface ModifierCaisseDto {
	libelle?: string;
	actif?: boolean;
}

/** Filtres pour lister les caisses. */
export interface CaisseFiltres {
	id_activite?: string;
	actif?: boolean;
}

/**
 * Période d'ouverture d'une caisse (POST `.../ouvrir`). Pas de GET dédié pour
 * lire l'état courant (ouverte/fermée) d'une caisse à froid — l'état affiché
 * côté UI n'est connu qu'après un appel `ouvrir`/`fermer` dans la session en
 * cours (voir `EtatCaisse` dans `caisse-dashboard-page.tsx`).
 */
export interface PeriodeCaisse {
	id_periode: string;
	id_caisse: string;
	ouverture: string;
	fermeture: string | null;
	id_utilisateur_ouverture: string;
	id_utilisateur_fermeture: string | null;
}

/** Résultat de la fermeture d'une caisse (POST `.../fermer`). */
export interface FermetureCaisse {
	id_caisse: string;
	id_periode: string;
	fermee: true;
}
