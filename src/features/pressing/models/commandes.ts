/**
 * Commande pressing (module M4). Types hand-typed revalidés sur le backend réel
 * (GET /pressing/commandes). Clé primaire wire `id_commande` → `id` ; le lister
 * embarque déjà le client (nom, prénoms, téléphone).
 *
 * `mode_tarification` (2026-09-16, vérifié en direct) : choisi une seule fois
 * à la création, jamais modifiable après (verrouillé, y compris au PATCH) —
 * `UNITAIRE` (tarif à la pièce, comportement historique) ou `POIDS` (tarif au
 * kilo, `features/pressing/api/tarifs-kg.ts`). Chaque ligne porte soit
 * `tarif` (UNITAIRE) soit `poids_kg` (POIDS), jamais les deux — le champ non
 * pertinent vaut `null` côté backend.
 */
export type CommandePressingStatut =
	| "DEPOSE"
	| "EN_TRAITEMENT"
	| "PRET"
	| "RETIRE"
	| "ANNULEE";

export type ModeTarificationPressing = "UNITAIRE" | "POIDS";

export interface CommandePressing {
	id: string;
	id_client: string;
	numero_commande: string;
	date_depot: string;
	date_retrait_prevue: string | null;
	date_retrait_reelle: string | null;
	montant_total: string;
	acompte: string;
	reste_a_payer: string;
	statut: CommandePressingStatut;
	mode_tarification: ModeTarificationPressing;
	client_nom: string;
	client_prenoms: string;
	client_tel: string | null;
}

/**
 * Ligne d'articles d'une commande (GET /pressing/commandes/{id} → `lignes[]`).
 * `tarif`/`poids_kg` sont mutuellement exclusifs selon
 * `commande.mode_tarification` (voir plus haut) — jamais les deux renseignés.
 */
export interface LigneCommandePressing {
	id: string;
	id_commande: string;
	type_vetement: string;
	quantite: number;
	prestation: string;
	/** Non-null ssi la commande est en mode `UNITAIRE`. */
	tarif: string | null;
	/** Non-null ssi la commande est en mode `POIDS` (jusqu'à 3 décimales). */
	poids_kg: string | null;
	total: string;
}

/** Libellés français du mode de tarification — badge fiche/dépôt. */
export const MODE_TARIFICATION_LABELS: Record<
	ModeTarificationPressing,
	string
> = {
	UNITAIRE: "Tarification à la pièce",
	POIDS: "Tarification au kilo",
};

/** Détail d'une commande : le GET par id embarque les lignes d'articles. */
export interface CommandePressingDetail extends CommandePressing {
	lignes: LigneCommandePressing[];
}

/** Ligne en cours de saisie dans le formulaire (avant conversion en corps API). */
export interface LigneSaisiePressing {
	typeVetement: string;
	quantite: string;
	prestation: string;
	tarif?: string;
	poidsKg?: string;
}

/**
 * Valide une ligne saisie selon le mode de tarification de la commande —
 * mirroir client de la règle de mutuelle exclusivité du backend (qui, elle,
 * échoue par une 500 plutôt qu'un 400 propre sur une ligne mal formée, vérifié
 * en direct). `null` = valide.
 */
export function validerLignePressing(
	ligne: LigneSaisiePressing,
	mode: ModeTarificationPressing,
): string | null {
	if (!ligne.typeVetement.trim()) return "Indiquez le type de vêtement.";
	if (!ligne.prestation.trim()) return "Indiquez la prestation.";
	if (!ligne.quantite.trim() || Number(ligne.quantite) <= 0) {
		return "La quantité doit être un nombre positif.";
	}
	if (mode === "UNITAIRE") {
		if (ligne.poidsKg?.trim()) {
			return "Le poids ne s'applique pas en tarification à la pièce.";
		}
		if (!ligne.tarif?.trim() || Number(ligne.tarif) <= 0) {
			return "Indiquez un tarif positif.";
		}
	} else {
		if (ligne.tarif?.trim()) {
			return "Le tarif ne s'applique pas en tarification au kilo.";
		}
		if (!ligne.poidsKg?.trim() || Number(ligne.poidsKg) <= 0) {
			return "Indiquez un poids (kg) positif.";
		}
	}
	return null;
}

/**
 * Aperçu du total d'une ligne en mode `POIDS`, calculé côté client avec le
 * tarif/kg courant — purement indicatif : le total réel est toujours calculé
 * par le backend (avec le tarif en vigueur au moment de l'appel), voir
 * `LigneCommandePressing.total`. `null` si le poids saisi n'est pas un
 * nombre valide ou si aucun tarif/kg n'est configuré.
 */
export function apercuTotalLignePoids(
	poidsKg: string,
	prixKg: string | null | undefined,
): number | null {
	const poids = Number(poidsKg);
	const prix = Number(prixKg);
	if (!poidsKg.trim() || Number.isNaN(poids) || poids <= 0) return null;
	if (!prixKg || Number.isNaN(prix)) return null;
	return poids * prix;
}

/** Libellés français du statut de commande (masculin, cf. spec M4). */
export const PRESSING_STATUT_LABELS: Record<CommandePressingStatut, string> = {
	DEPOSE: "Déposé",
	EN_TRAITEMENT: "En traitement",
	PRET: "Prêt",
	RETIRE: "Retiré",
	ANNULEE: "Annulé",
};

/** Valeurs du filtre « Statut » (URL : `?statut=`). */
export type CommandeStatutFiltre = "tous" | CommandePressingStatut;

/** Filtres de la liste des commandes (URL + côté client). */
export interface CommandeFiltres {
	statut: CommandeStatutFiltre;
	client: string;
	du: string;
	au: string;
}

/**
 * Filtre la liste côté client. Le lister accepte `recherche`/api/v1/`du`/api/v1/`au`/api/v1/`statut`
 * côté serveur ; on ré-applique statut/période sans effet et on garde la
 * recherche texte « client ». Fonction pure, sans dépendance React.
 */
export function filtrerCommandes(
	commandes: readonly CommandePressing[],
	filtres: CommandeFiltres,
): CommandePressing[] {
	return commandes.filter((commande) => {
		if (filtres.statut !== "tous" && commande.statut !== filtres.statut) {
			return false;
		}
		const client = `${commande.client_nom} ${commande.client_prenoms}`.trim();
		if (
			filtres.client &&
			!client.toLowerCase().includes(filtres.client.toLowerCase())
		) {
			return false;
		}
		const jour = commande.date_depot.slice(0, 10);
		if (filtres.du && jour < filtres.du) return false;
		if (filtres.au && jour > filtres.au) return false;
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageCommandes {
	items: CommandePressing[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerCommandes(
	commandes: readonly CommandePressing[],
	page: number,
	pageSize: number,
): PageCommandes {
	const total = commandes.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = commandes.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
