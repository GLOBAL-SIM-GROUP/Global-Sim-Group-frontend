/**
 * Client de la base unique (module transverse). Types hand-typed revalidés sur
 * le backend réel (GET /client/clients). Clé primaire wire `id_client` → `id`.
 */
export interface Client {
	id: string;
	nom: string;
	prenoms: string;
	tel_principal: string | null;
	tel_secondaire: string | null;
	email: string | null;
	adresse: string | null;
	ville: string | null;
	type_client: string | null;
	date_enregistrement: string | null;
}

/** Nom complet d'un client (« NOM Prenoms »). */
export function nomComplet(client: Client): string {
	return client.prenoms ? `${client.nom} ${client.prenoms}`.trim() : client.nom;
}
