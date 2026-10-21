/**
 * Secteur d'activité (`GET /finances/activites`) — référentiel stable
 * derrière `Caisse.id_activite`/`CaisseAccessible.id_activite`. `code` sert
 * à faire correspondre un `CaissePicker` à son module (`"PRESSING"`,
 * `"RESTAURATION"`, `"SALLE_FETE"`, `"VENTE_MARCHANDISES"`,
 * `"LOCATION_RESIDENTIEL"`, `"LOCATION_COMMERCIAL"`, `"AUTRE"` — vérifiés en
 * direct, absents du spec généré) sans dépendre du libellé affiché ni de
 * l'id numérique (non stable entre environnements).
 */
export interface ActiviteCaisse {
	id_activite: string;
	code: string;
	libelle: string;
	actif: boolean;
}

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
 * lire la période courante — l'état ouverte/fermée affiché côté UI vient du
 * flag `ouverte` de `GET /caisses/accessibles` (`useCaisseOuverte`), le cache
 * `["caisse-etat", id]` ne servant qu'à refléter le dernier ouvrir/fermer
 * fait dans la session avant le refetch (voir `caisse-dashboard-page.tsx`).
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

/**
 * Caisse dans laquelle l'utilisateur connecté peut enregistrer un mouvement
 * (`GET /finances/caisses/accessibles`) — sa propre caisse (rattaché), celles
 * de son scope d'activité (responsable) ou toutes (admin). Triée pour
 * l'affichage par le serveur (propre caisse d'abord) — rendre telle quelle.
 */
export interface CaisseAccessible {
	id_caisse: string;
	libelle: string;
	id_activite: string;
	activite_libelle: string | null;
	/** `false` → la soumettre produit `CAISSE_FERMEE` (400). */
	ouverte: boolean;
	/** `true` → caisse du compte connecté : elle est forcée côté serveur. */
	est_propre: boolean;
	/** Premier utilisateur rattaché à la caisse (affichage seulement). */
	utilisateur: { id: string; nom: string | null; prenom: string | null } | null;
}

/**
 * `id_caisse` à envoyer dans un DTO d'encaissement/décaissement :
 * - `undefined` quand le serveur résout seul (0 ou 1 caisse, ou présence
 *   d'une caisse `est_propre` — elle est forcée, toute valeur serait ignorée) ;
 * - le choix saisi quand plusieurs caisses subalternes sont proposées.
 */
export function idCaisseAEnvoyer(
	caisses: CaisseAccessible[] | undefined,
	choix: string,
): string | undefined {
	if (!caisses || caisses.length === 0) return undefined;
	if (caisses.length === 1) return undefined;
	if (caisses.some((caisse) => caisse.est_propre)) return undefined;
	return choix || undefined;
}

/**
 * Erreur de validation caisse avant envoi, ou `null` :
 * - aucune caisse accessible → l'encaissement sera rejeté (`CAISSE_REQUISE`) ;
 * - plusieurs caisses subalternes et pas de choix → sélection obligatoire.
 */
export function erreurCaisseRequise(
	caisses: CaisseAccessible[] | undefined,
	choix: string,
	sens: "destination" | "source" = "destination",
): string | null {
	if (!caisses) return null; // chargement en cours
	if (caisses.length === 0) {
		return "Aucune caisse accessible — ouvrez une caisse ou demandez à un responsable de vous en rattacher une.";
	}
	if (caisses.length > 1 && !caisses.some((c) => c.est_propre) && !choix) {
		return sens === "source"
			? "Sélectionnez la caisse source."
			: "Sélectionnez la caisse de destination.";
	}
	return null;
}

/**
 * La spec backend déclare `id_caisse` en `type: object` (au lieu de `string`)
 * sur les DTO — openapi-typescript génère `Record<string, never>`. Le serveur
 * attend l'identifiant en chaîne (exemple `"1"` de la spec) ; ce cast lève
 * l'erreur de typage en un seul point, à retirer quand la spec sera corrigée.
 */
export function idCaisseDto(
	id: string | undefined,
): Record<string, never> | undefined {
	return id as unknown as Record<string, never> | undefined;
}
