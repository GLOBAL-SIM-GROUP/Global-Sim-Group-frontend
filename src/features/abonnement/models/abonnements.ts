/**
 * Abonnements = quotas prépayés (backend abonnements 089/090), PAS des
 * souscriptions récurrentes : un client achète une `Offre` une fois ; chaque
 * commande couverte (prestation pressing exacte, ou repas restaurant —
 * catégorie et plafond journalier optionnels) est déduite du quota. Dépasser
 * le quota ne bloque pas la vente : l'API refuse une première fois en 409
 * `ABONNEMENT_EXCEDENT` puis accepte avec `accepter_excedent: true`.
 *
 * Types hand-typed — la spec OpenAPI ne déclare aucun schéma de réponse
 * (même convention que les autres modules). Montants/quantités/dates en
 * string réseau (`'5000.00'`, `'9.000'` kg, `'YYYY-MM-DD'`).
 *
 * `etat` (calculé à la volée par le backend) est le champ à badger —
 * `statut` seul ne suffit pas (une souscription `ACTIVE` peut être `EPUISEE`
 * ou `EXPIREE` en pratique).
 */

export type ActiviteAbonnement = "PRESSING" | "RESTAURATION";
export type UniteAbonnement = "KG" | "PIECE" | "REPAS";
export type StatutSouscription = "ACTIVE" | "RESILIEE" | "ANNULEE";
export type EtatSouscription =
	| "ACTIVE"
	| "A_VENIR"
	| "EPUISEE"
	| "EXPIREE"
	| "RESILIEE"
	| "ANNULEE";
export type DecisionReliquat = "REPORTE" | "PERDU";
export type TypeMouvement =
	| "CONSOMMATION"
	| "ANNULATION"
	| "REPORT_SORTANT"
	| "REPORT_ENTRANT"
	| "PERTE"
	| "AJUSTEMENT";

/** Offre du catalogue (GET /abonnement/offres). */
export interface Offre {
	id_offre: string;
	code: string;
	libelle: string;
	description: string | null;
	activite: ActiviteAbonnement;
	unite: UniteAbonnement;
	/** Quota vendu — string à 3 décimales pour KG, entier pour PIECE/REPAS. */
	quota: string;
	prix: string;
	duree_jours: number;
	actif: boolean;
	date_creation: string;
	date_modification: string | null;
	/** Couverture PRESSING (correspondance exacte) — `null` sinon. */
	id_prestation: string | null;
	prestation_libelle: string | null;
	/** Couverture RESTAURATION — `null` = tout plat. */
	id_categorie_plat: string | null;
	categorie_plat_libelle: string | null;
	/** Plafond journalier RESTAURATION — `null` = aucun. */
	max_par_jour: number | null;
}

/**
 * Souscription (achat client d'une offre). `quota`/`prix` sont figés à la
 * vente (l'offre peut avoir évolué depuis). `solde`, `etat`,
 * `consomme_aujourdhui`, `reste_a_payer` et `reliquat_a_decider` sont
 * **calculés en direct** par le backend — ne jamais les mettre en cache
 * durable : relire après chaque mutation ou afficher ce que renvoie la
 * réponse.
 */
export interface Souscription {
	id_souscription: string;
	id_client: string;
	client_nom: string;
	client_prenoms: string;
	id_offre: string;
	offre_code: string;
	offre_libelle: string;
	activite: ActiviteAbonnement;
	id_prestation: string | null;
	prestation_libelle: string | null;
	id_categorie_plat: string | null;
	max_par_jour: number | null;
	quota: string;
	unite: UniteAbonnement;
	prix: string;
	date_debut: string;
	date_fin: string;
	statut: StatutSouscription;
	motif_statut: string | null;
	reliquat: DecisionReliquat | null;
	id_facture: string | null;
	paiement_partiel_autorise_par: string | null;
	note: string | null;
	id_utilisateur: string;
	date_creation: string;
	// Calculés en direct :
	solde: string;
	consomme_aujourdhui: string;
	facture_numero: string | null;
	montant_paye: string;
	reste_a_payer: string;
	etat: EtatSouscription;
	/** Expirée avec du quota restant sans décision — file d'attente staff. */
	reliquat_a_decider: boolean;
}

/** Détail d'une souscription : le GET par id embarque les mouvements. */
export interface SouscriptionDetail extends Souscription {
	mouvements: Mouvement[];
}

/** Mouvement de quota (timeline de la fiche souscription). */
export interface Mouvement {
	id_mouvement: string;
	id_souscription: string;
	type: TypeMouvement;
	/** Signé : `'-6.000'` (consommation) / `'+3.000'` (ajout/report entrant). */
	quantite: string;
	motif: string | null;
	id_mouvement_origine: string | null;
	id_commande_pressing: string | null;
	numero_commande_pressing: string | null;
	id_commande_restaurant: string | null;
	date: string;
	id_utilisateur: string;
}

/* ── Aperçus de couverture (pressing / restaurant) ─────────────────── */

/**
 * Abonnement utilisable du client, renvoyé par les endpoints
 * `apercu-abonnement` pour affichage (les champs calculés du backend sont
 * repris tels quels — certains peuvent être absents selon l'activité).
 */
export interface AbonnementCandidat {
	id_souscription: string;
	offre_libelle: string;
	solde: string;
	quota?: string;
	unite?: UniteAbonnement;
	etat?: EtatSouscription;
	date_fin?: string;
	consomme_aujourdhui?: string;
	max_par_jour?: number | null;
}

/** Ligne de l'aperçu pressing (`POST /pressing/commandes/apercu-abonnement`). */
export interface LigneApercuPressing {
	type_vetement: string;
	prestation: string;
	quantite: number;
	/** Quantité couverte par le quota (≤ quantite). */
	couvert: number;
	/** Quantité au-delà du quota — facturée au prix normal. */
	excedent: number;
	abonnement_applicable: boolean;
	prix_unitaire: string;
	montant_brut: string;
	/** Part réellement due après couverture. */
	montant_du: string;
}

/** Ligne de l'aperçu restaurant (`POST|GET /restaurant/commandes[/:id]/apercu-abonnement`). */
export interface LigneApercuRestaurant {
	plat: string;
	quantite: number;
	couvert: number;
	excedent: number;
	abonnement_applicable: boolean;
	prix_unitaire: string;
	montant_brut: string;
	montant_du: string;
}

/** Réponse des aperçus d'abonnement (les deux activités). */
export interface ApercuAbonnement<
	L extends LigneApercuPressing | LigneApercuRestaurant =
		| LigneApercuPressing
		| LigneApercuRestaurant,
> {
	unite: UniteAbonnement;
	/** Abonnements utilisables du client (vide = pas de couverture). */
	abonnements: AbonnementCandidat[];
	lignes: L[];
	total_brut: string;
	/** Montant réellement dû après couverture — pilote l'UI de paiement. */
	total_du: string;
	/** `true` = une partie dépasse le quota → exigera `accepter_excedent`. */
	excedent: boolean;
}

export type ApercuAbonnementPressing = ApercuAbonnement<LigneApercuPressing>;
export type ApercuAbonnementRestaurant =
	ApercuAbonnement<LigneApercuRestaurant>;

/** `code` de l'enveloppe d'erreur du 409 « dépassement de quota ». */
export const CODE_EXCEDENT = "ABONNEMENT_EXCEDENT";

/* ── Libellés et badges ────────────────────────────────────────────── */

export const ACTIVITE_LABELS: Record<ActiviteAbonnement, string> = {
	PRESSING: "Pressing",
	RESTAURATION: "Restauration",
};

export const UNITE_LABELS: Record<UniteAbonnement, string> = {
	KG: "kg",
	PIECE: "pièce(s)",
	REPAS: "repas",
};

export const ETAT_LABELS: Record<EtatSouscription, string> = {
	ACTIVE: "Active",
	A_VENIR: "À venir",
	EPUISEE: "Épuisée",
	EXPIREE: "Expirée",
	RESILIEE: "Résiliée",
	ANNULEE: "Annulée",
};

/** Classes du badge `etat` (vert/gris/orange/rouge/estompé). */
export const ETAT_BADGE_CLASSES: Record<EtatSouscription, string> = {
	ACTIVE: "bg-[#27AE60]/10 text-[#27AE60] border-[#27AE60]/30",
	A_VENIR: "bg-muted text-muted-foreground border-border",
	EPUISEE: "bg-amber-500/10 text-amber-600 border-amber-500/30",
	EXPIREE: "bg-destructive/10 text-destructive border-destructive/30",
	RESILIEE: "bg-muted text-muted-foreground border-border",
	ANNULEE: "bg-muted text-muted-foreground border-border",
};

export const STATUT_LABELS: Record<StatutSouscription, string> = {
	ACTIVE: "Active",
	RESILIEE: "Résiliée",
	ANNULEE: "Annulée",
};

export const MOUVEMENT_TYPE_LABELS: Record<TypeMouvement, string> = {
	CONSOMMATION: "Consommation",
	ANNULATION: "Annulation",
	REPORT_SORTANT: "Report sortant",
	REPORT_ENTRANT: "Report entrant",
	PERTE: "Reliquat perdu",
	AJUSTEMENT: "Ajustement",
};

/**
 * Ratio consommé d'une souscription (0..1) pour la barre de progression —
 * `quota`/`solde` sont des strings réseau ; renvoie `null` si non
 * interpretable (évite une barre mensongère).
 */
export function progressionConsommee(
	solde: string,
	quota: string,
): number | null {
	const q = Number(quota);
	const s = Number(solde);
	if (!quota || Number.isNaN(q) || q <= 0 || Number.isNaN(s)) return null;
	return Math.min(1, Math.max(0, (q - s) / q));
}

/** `true` si le montant (string money réseau) est strictement positif. */
export function montantPositif(montant: string | null | undefined): boolean {
	return montant != null && Number(montant) > 0;
}
