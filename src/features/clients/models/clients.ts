/**
 * Client / locataire (module 3.1/3.2). Hand-typed revalidé sur le backend réel
 * (GET /client/clients). Clés primaires wire `id_client`/api/v1/`id_contact`/api/v1/`id_piece`
 * → `id`.
 */
export type TypeClient = "LOCATAIRE" | "PASSAGE" | "AUTRE";
export type TypePiece = "CNI" | "PASSEPORT" | "CARTE_SEJOUR" | "AUTRE";

export interface Client {
	id: string;
	nom: string;
	prenoms: string;
	date_naissance: string | null;
	lieu_naissance: string | null;
	sexe: string | null;
	nationalite: string | null;
	profession: string | null;
	photo: string | null;
	tel_principal: string;
	tel_secondaire: string | null;
	email: string | null;
	adresse: string | null;
	ville: string | null;
	pays: string | null;
	date_enregistrement: string;
	type_client: TypeClient;
}

export interface ContactUrgence {
	id: string;
	id_client: string;
	nom: string;
	prenom: string | null;
	lien: string;
	tel_principal: string;
	tel_secondaire: string | null;
	adresse: string | null;
	email: string | null;
}

export interface PieceIdentite {
	id: string;
	id_client: string;
	type_piece: TypePiece | (string & {});
	numero: string;
	date_delivrance: string | null;
	date_expiration: string | null;
	autorite_delivrance: string | null;
	copie_num: string | null;
	copie_num_verso: string | null;
}

/** Détail d'un client : contacts d'urgence et pièces d'identité inclus. */
export interface ClientDetail extends Client {
	contacts: ContactUrgence[];
	pieces: PieceIdentite[];
}

export const TYPE_CLIENT_LABELS: Record<TypeClient, string> = {
	LOCATAIRE: "Locataire",
	PASSAGE: "De passage",
	AUTRE: "Autre",
};

export const TYPE_PIECE_LABELS: Record<string, string> = {
	CNI: "CNI",
	PASSEPORT: "Passeport",
	CARTE_SEJOUR: "Carte de séjour",
	AUTRE: "Autre",
};

export const SEXE_LABELS: Record<string, string> = {
	M: "Masculin",
	F: "Féminin",
	AUTRE: "Autre",
};

/** Nom complet « PRENOMS Nom » d'un client. */
export function nomComplet(client: Client): string {
	return `${client.prenoms} ${client.nom}`.trim() || "—";
}

/** Filtres de la liste des clients (côté client). */
export interface ClientFiltres {
	type: string;
	recherche: string;
}

/** Filtre la liste : type et texte libre (nom, prénoms, téléphone). Fonction pure. */
export function filtrerClients(
	clients: readonly Client[],
	filtres: ClientFiltres,
): Client[] {
	const terme = filtres.recherche.trim().toLowerCase();
	return clients.filter((client) => {
		if (filtres.type !== "tous" && client.type_client !== filtres.type) {
			return false;
		}
		if (terme) {
			const cible =
				`${client.nom} ${client.prenoms} ${client.tel_principal} ${client.email ?? ""}`.toLowerCase();
			if (!cible.includes(terme)) return false;
		}
		return true;
	});
}

/** Résultat de la pagination client. */
export interface PageClients {
	items: Client[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerClients(
	clients: readonly Client[],
	page: number,
	pageSize: number,
): PageClients {
	const total = clients.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = clients.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
