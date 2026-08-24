/** Tirage (fermeture) de caisse — montant compté vs attendu */
export interface Tirage {
	id: string;
	id_caisse: string;
	date: string;
	montant_compte: number;
	montant_attendu?: number;
	ecart?: number;
	note?: string | null;
	id_utilisateur?: string | null;
	login?: string;
}

/** DTO pour créer un tirage */
export interface CreerTirageDto {
	montant_compte: string | number;
	date: string;
	id_caisse: string;
	note?: string | null;
}

/** Filtres pour lister les tirages */
export interface TirageFiltres {
	du?: string;
	au?: string;
	id_caisse?: string;
	recherche?: string;
	sort?: string;
	order?: "asc" | "desc";
	limit?: number;
	offset?: number;
}
