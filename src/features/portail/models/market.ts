/**
 * Demandes boutique du portail résident (endpoints `/market/portail/ventes`).
 * Types hand-typés : le schéma OpenAPI généré est en retard sur le backend
 * (contrat convenu — cf. prompt backend « market 084 »), même convention que
 * `models/restaurant.ts`.
 *
 * Une demande boutique est une vente `market_ventes` née `EN_ATTENTE` avec
 * `origine = "PORTAIL"` : le prix est connu dès la demande (`prix_unitaire`
 * figé au `prix_vente` catalogue, totaux calculés serveur — indicatifs).
 * Le personnel valide (`EN_COURS` — stock décrémenté) ou refuse (`ANNULEE` +
 * motif) ; l'encaissement au retrait passe par `POST /market/ventes/:id/
 * encaisser` (règlement intégral → `PAYEE`). Pas de paiement en ligne.
 */

export type VentePortailStatut =
	| "EN_ATTENTE"
	| "EN_COURS"
	| "PAYEE"
	| "ANNULEE";

export type VenteOrigine = "COMPTOIR" | "PORTAIL";

/** Ligne d'une demande boutique (détail : `lignes[]` embarqué). */
export interface LigneVentePortail {
	id_produit: string;
	/** Nom du produit si le serveur l'embarque (`produit?`). */
	nom_produit?: string | null;
	quantite: string;
	prix_unitaire: string;
	/** Toujours `"0.00"` sur une vente portail (pas de remise résident). */
	remise_ligne?: string;
	total_ligne: string;
}

export interface VentePortail {
	id: string;
	date: string;
	statut: VentePortailStatut;
	origine: VenteOrigine;
	/** Recomputé côté serveur depuis le `prix_vente` catalogue. */
	total: string;
	remise: string;
	/** Consigne libre du résident (≤500). */
	note: string | null;
	/** Raison du refus staff / annulation. */
	motif_annulation: string | null;
	/** Présentes sur le détail uniquement. */
	lignes?: LigneVentePortail[];
}

/** Libellés français du statut de demande boutique. */
export const VENTE_PORTAIL_STATUT_LABELS: Record<VentePortailStatut, string> = {
	EN_ATTENTE: "En attente de validation",
	EN_COURS: "Validée — à retirer",
	PAYEE: "Payée",
	ANNULEE: "Annulée",
};

/** Classes de badge (fond/texte) par statut — palette portail. */
export const VENTE_PORTAIL_STATUT_BADGE: Record<VentePortailStatut, string> = {
	EN_ATTENTE: "bg-[#E67E22] text-white",
	EN_COURS: "bg-[#2980B9] text-white",
	PAYEE: "bg-[#27AE60] text-white",
	ANNULEE: "bg-[#E74C3C] text-white",
};

/** Étapes visibles côté résident (PAYEE est la fin du cycle). */
export const VENTE_PORTAIL_ETAPES: VentePortailStatut[] = [
	"EN_ATTENTE",
	"EN_COURS",
	"PAYEE",
];

/** Vrai tant que la demande peut encore être annulée par le résident. */
export function estVentePortailAnnulable(
	vente: Pick<VentePortail, "statut">,
): boolean {
	return vente.statut === "EN_ATTENTE";
}
