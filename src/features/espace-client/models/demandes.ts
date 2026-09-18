/**
 * Demandes locales de l'espace client (localStorage).
 *
 * Aucun endpoint accessible à un compte CLIENT n'existe pour les demandes
 * (salle de fête, séjours courts, commandes restaurant/boutique) : les
 * formulaires de demande enregistrent une trace locale pour alimenter la
 * page « Mes demandes », en attendant les vrais endpoints backend. Ce n'est
 * PAS de l'état serveur — pas de TanStack Query (cf. règle d'état du projet,
 * « le reste → useState », ici un simple module de lecture/écriture).
 */
export type DemandeService =
	| "salle-fete"
	| "residence"
	| "commande-restaurant"
	| "commande-boutique"
	| "signalement";

export const DEMANDE_SERVICE_LABELS: Record<DemandeService, string> = {
	"salle-fete": "Salle de fête",
	residence: "Résidence — séjour court",
	"commande-restaurant": "Restaurant — commande",
	"commande-boutique": "Boutique — commande",
	signalement: "Signalement",
};

export interface DemandeLocale {
	id: string;
	service: DemandeService;
	/** Horodatage ISO 8601 de l'envoi. */
	dateEnvoi: string;
	/** Résumé d'une ligne affiché dans la liste. */
	resume: string;
	/** Message libre saisi dans le formulaire, le cas échéant. */
	observations?: string;
}

const CLE_DEMANDES = "gsg-espace-client-demandes";

function estDemandeLocale(valeur: unknown): valeur is DemandeLocale {
	if (typeof valeur !== "object" || valeur === null) return false;
	const demande = valeur as DemandeLocale;
	return (
		typeof demande.id === "string" &&
		typeof demande.service === "string" &&
		demande.service in DEMANDE_SERVICE_LABELS &&
		typeof demande.dateEnvoi === "string" &&
		typeof demande.resume === "string"
	);
}

/** Liste les demandes enregistrées, de la plus récente à la plus ancienne. */
export function listerDemandes(): DemandeLocale[] {
	try {
		const brut = localStorage.getItem(CLE_DEMANDES);
		if (!brut) return [];
		const parse: unknown = JSON.parse(brut);
		if (!Array.isArray(parse)) return [];
		return parse.filter(estDemandeLocale);
	} catch {
		return [];
	}
}

/**
 * Enregistre une demande en tête de liste. Silencieux si le stockage est
 * indisponible : la confirmation affichée par le formulaire ne dépend pas de
 * la persistance.
 */
export function enregistrerDemande(
	demande: Omit<DemandeLocale, "id" | "dateEnvoi">,
): void {
	try {
		const demandes = listerDemandes();
		demandes.unshift({
			...demande,
			id:
				typeof crypto !== "undefined" && crypto.randomUUID
					? crypto.randomUUID()
					: String(Date.now()),
			dateEnvoi: new Date().toISOString(),
		});
		localStorage.setItem(CLE_DEMANDES, JSON.stringify(demandes));
	} catch {
		/* stockage indisponible (mode privé, quota) : pas bloquant */
	}
}
