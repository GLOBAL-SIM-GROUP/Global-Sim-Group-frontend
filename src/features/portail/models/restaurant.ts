/**
 * Commandes restaurant du portail résident (endpoints `/restaurant/portail/
 * commandes`). Types hand-typés : le schéma OpenAPI généré est en retard sur
 * le backend réel (seuls les GET y figurent), même convention que
 * `models/pressing.ts`.
 *
 * La commande naît `EN_ATTENTE` : rien ne part en cuisine avant validation
 * du personnel. Pas de paiement en ligne — le règlement se fait au comptoir.
 */

export type CommandeRestaurantPortailStatut =
	| "EN_ATTENTE"
	| "EN_COURS"
	| "EN_PREPARATION"
	| "SERVIE"
	| "PAYEE"
	| "ANNULEE";

export type TypeCommandePortail = "SUR_PLACE" | "A_EMPORTER" | "LIVRAISON";

/** Ligne d'une commande portail (détail : `lignes[]` embarqué). */
export interface LigneCommandePortail {
	id_plat: string;
	nom_plat?: string | null;
	quantite: string;
	prix_unitaire: string;
	total: string;
}

export interface CommandeRestaurantPortail {
	id: string;
	date: string;
	type: TypeCommandePortail;
	statut: CommandeRestaurantPortailStatut;
	/** Recomputé côté serveur à partir des prix des plats. */
	total: string;
	notes: string | null;
	adresse_livraison: string | null;
	/** Raison du refus quand le personnel a annulé la commande. */
	motif_annulation: string | null;
	/** Présentes sur le détail uniquement. */
	lignes?: LigneCommandePortail[];
}

/** Libellés français du statut de commande portail. */
export const COMMANDE_PORTAIL_STATUT_LABELS: Record<
	CommandeRestaurantPortailStatut,
	string
> = {
	EN_ATTENTE: "En attente de validation",
	EN_COURS: "Prise en charge",
	EN_PREPARATION: "En préparation",
	SERVIE: "Servie",
	PAYEE: "Payée",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut — palette portail. */
export const COMMANDE_PORTAIL_STATUT_BADGE: Record<
	CommandeRestaurantPortailStatut,
	string
> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	EN_COURS: "bg-[#2980B9] text-white",
	EN_PREPARATION: "bg-[#E67E22] text-white",
	SERVIE: "bg-[#2980B9] text-white",
	PAYEE: "bg-[#27AE60] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

export const TYPE_COMMANDE_PORTAIL_LABELS: Record<TypeCommandePortail, string> =
	{
		SUR_PLACE: "Sur place",
		A_EMPORTER: "À emporter",
		LIVRAISON: "Livraison",
	};

/** Étapes visibles côté résident (PAYEE est la fin du cycle). */
export const COMMANDE_PORTAIL_ETAPES: CommandeRestaurantPortailStatut[] = [
	"EN_ATTENTE",
	"EN_COURS",
	"EN_PREPARATION",
	"SERVIE",
	"PAYEE",
];

/** Vrai tant que la commande peut encore être annulée par le résident. */
export function estCommandeAnnulable(
	commande: Pick<CommandeRestaurantPortail, "statut">,
): boolean {
	return commande.statut === "EN_ATTENTE";
}
