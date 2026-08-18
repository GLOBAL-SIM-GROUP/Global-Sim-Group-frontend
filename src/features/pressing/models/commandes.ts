/**
 * Commande pressing (module M4). Types hand-typed revalidés sur le backend réel
 * (GET /pressing/commandes). Clé primaire wire `id_commande` → `id` ; le lister
 * embarque déjà le client (nom, prénoms, téléphone).
 */
export type CommandePressingStatut =
	| "DEPOSE"
	| "EN_TRAITEMENT"
	| "PRET"
	| "RETIRE"
	| "ANNULEE";

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
	client_nom: string;
	client_prenoms: string;
	client_tel: string | null;
}

/** Ligne d'articles d'une commande (GET /pressing/commandes/{id} → `lignes[]`). */
export interface LigneCommandePressing {
	id: string;
	id_commande: string;
	type_vetement: string;
	quantite: number;
	prestation: string;
	tarif: string;
	total: string;
}

/** Détail d'une commande : le GET par id embarque les lignes d'articles. */
export interface CommandePressingDetail extends CommandePressing {
	lignes: LigneCommandePressing[];
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
 * Filtre la liste côté client. Le lister accepte `recherche`/`du`/`au`/`statut`
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
