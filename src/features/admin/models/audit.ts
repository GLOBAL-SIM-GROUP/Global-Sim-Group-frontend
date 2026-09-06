/**
 * Journal d'audit (module M11, 12.5). Hand-typed revalidé sur le backend réel
 * (GET /audit/journal). Clé primaire wire `id_trace` → `id`. `avant`/`apres`
 * sont des snapshots JSON (chaîne brute) de la ligne avant/après l'opération —
 * `apres` était absent du modèle mais bien présent dans la réponse réelle
 * (vérifié en direct, 2026-09-06), nécessaire pour calculer un résumé lisible
 * (voir `resumerDetailAudit`).
 */
export interface TraceAudit {
	id: string;
	date_heure: string;
	id_utilisateur: string | null;
	module: string;
	operation: string;
	entite: string | null;
	entite_id: string | null;
	description: string | null;
	montant: string | null;
	avant: string | null;
	apres: string | null;
}

/**
 * Libellés français des opérations CRUD (`INSERT`/`UPDATE`/`DELETE`, les
 * seules valeurs réelles vérifiées en direct) — pour l'affichage de la
 * colonne « Action » à des personnes non techniciennes.
 */
const LIBELLES_OPERATIONS: Record<string, string> = {
	INSERT: "Création",
	UPDATE: "Modification",
	DELETE: "Suppression",
};

export function libelleOperation(operation: string): string {
	return LIBELLES_OPERATIONS[operation] ?? operation;
}

/** Couleurs de badge par opération — mêmes teintes que le reste de l'app. */
const COULEURS_OPERATIONS: Record<string, string> = {
	INSERT: "bg-[#27AE60] text-white",
	UPDATE: "bg-[#E67E22] text-white",
	DELETE: "bg-[#E74C3C] text-white",
};

export function couleurOperation(operation: string): string {
	return COULEURS_OPERATIONS[operation] ?? "bg-[#95A5A6] text-white";
}

/**
 * Libellés français des tables techniques (`entite`, ex. `contrat_location`,
 * `moyen_paiement`) — vérifiés en direct sur tous les modules réels. Repli
 * générique (underscore → espace, majuscule) pour toute table non listée ici.
 */
const LIBELLES_ENTITES: Record<string, string> = {
	utilisateur: "Compte utilisateur",
	role: "Rôle",
	moyen_paiement: "Moyen de paiement",
	contrat_location: "Contrat de location",
	echeance_loyer: "Échéance de loyer",
	logement: "Logement",
	batiment: "Bâtiment",
	caution: "Caution",
	client: "Client",
	contact: "Contact",
	produit: "Produit",
	categorie_produit: "Catégorie de produit",
	fournisseur: "Fournisseur",
	commande_pressing: "Commande (pressing)",
	ligne_commande_pressing: "Article de commande (pressing)",
	commande_restaurant: "Commande (restaurant)",
	ligne_commande_restaurant: "Article de commande (restaurant)",
	plat: "Plat (restaurant)",
	reservation_fete: "Réservation (salle de fête)",
	employe: "Employé",
	paie: "Fiche de paie",
	element_salaire: "Élément de salaire",
	pointage: "Pointage",
	facture: "Facture",
	ligne_facture: "Ligne de facture",
	depense: "Dépense",
	categorie_depense: "Catégorie de dépense",
	caisse: "Caisse",
};

function libelleGenerique(texte: string): string {
	const sansPrefixe = texte.startsWith("id_") ? texte.slice(3) : texte;
	const espace = sansPrefixe.replaceAll("_", " ");
	return espace.charAt(0).toUpperCase() + espace.slice(1);
}

export function libelleEntite(entite: string | null): string {
	if (!entite) return "Élément";
	return LIBELLES_ENTITES[entite] ?? libelleGenerique(entite);
}

/** Libellé complet de l'objet concerné par la trace : « Moyen de paiement n° 5 ». */
export function libelleObjet(trace: TraceAudit): string {
	if (!trace.entite) return "—";
	return trace.entite_id
		? `${libelleEntite(trace.entite)} n° ${trace.entite_id}`
		: libelleEntite(trace.entite);
}

/**
 * Libellés français des champs les plus courants entre les entités du
 * journal — pour que le résumé d'une modification (voir `resumerDetailAudit`)
 * n'affiche jamais un nom de colonne brut. Repli générique pour le reste.
 */
const LIBELLES_CHAMPS: Record<string, string> = {
	nom: "Nom",
	prenom: "Prénom",
	prenoms: "Prénoms",
	login: "Identifiant",
	email: "Email",
	actif: "Actif",
	libelle: "Libellé",
	statut: "Statut",
	montant: "Montant",
	montant_total: "Montant total",
	montant_paye: "Montant payé",
	prix: "Prix",
	prix_achat: "Prix d'achat",
	prix_vente: "Prix de vente",
	quantite: "Quantité",
	quantite_stock: "Stock",
	seuil_alerte: "Seuil d'alerte",
	dernier_connexion: "Dernière connexion",
	date_debut: "Date de début",
	date_fin: "Date de fin",
	date_fin_prevue: "Date de fin prévue",
	date_signature: "Date de signature",
	montant_loyer: "Loyer",
	numero: "Numéro",
	numero_contrat: "N° de contrat",
	numero_commande: "N° de commande",
	fonction: "Fonction",
	telephone: "Téléphone",
	tel_principal: "Téléphone",
	tel_secondaire: "Téléphone secondaire",
	adresse: "Adresse",
	ville: "Ville",
	pays: "Pays",
	reference: "Référence",
	code_barre: "Code-barres",
	description: "Description",
};

function libelleChamp(champ: string): string {
	return LIBELLES_CHAMPS[champ] ?? libelleGenerique(champ);
}

/** Champs jamais affichés dans un résumé de modification (aucune valeur utile). */
const CHAMPS_IGNORES_DIFF = new Set(["mot_de_passe"]);

/** Formate une valeur de champ (booléen, date ISO, `null`…) en texte lisible. */
function formaterValeurChamp(valeur: unknown): string {
	if (valeur === null || valeur === undefined || valeur === "") return "—";
	if (typeof valeur === "boolean") return valeur ? "Oui" : "Non";
	if (typeof valeur === "string" && /^\d{4}-\d{2}-\d{2}/.test(valeur)) {
		const date = new Date(valeur);
		if (!Number.isNaN(date.getTime())) {
			const aUneHeure = valeur.includes("T") || valeur.includes(":");
			return date.toLocaleString("fr-FR", {
				dateStyle: "short",
				...(aUneHeure ? { timeStyle: "short" } : {}),
			});
		}
	}
	return String(valeur);
}

/** Extrait un identifiant lisible d'un snapshot JSON (création/suppression). */
function identifiantLisible(objet: Record<string, unknown>): string | null {
	const candidat =
		objet.libelle ?? objet.nom ?? objet.login ?? objet.numero ?? null;
	return candidat != null ? String(candidat) : null;
}

/**
 * Résumé lisible (français, sans jargon) d'une trace d'audit : ce qui a été
 * créé/supprimé, ou la liste des champs modifiés avec leur ancienne et
 * nouvelle valeur. Repli sur `description` (brute, technique) si `avant`/
 * `apres` sont absents ou illisibles — ne devrait arriver que pour des traces
 * anciennes, avant l'ajout de ces snapshots côté backend.
 */
export function resumerDetailAudit(trace: TraceAudit): string {
	if (trace.operation === "INSERT" && trace.apres) {
		try {
			const objet = JSON.parse(trace.apres) as Record<string, unknown>;
			const identifiant = identifiantLisible(objet);
			return identifiant
				? `Création : ${identifiant}`
				: `Création — ${libelleEntite(trace.entite).toLowerCase()}`;
		} catch {
			// Repli sur description ci-dessous.
		}
	}
	if (trace.operation === "DELETE" && trace.avant) {
		try {
			const objet = JSON.parse(trace.avant) as Record<string, unknown>;
			const identifiant = identifiantLisible(objet);
			return identifiant
				? `Suppression : ${identifiant}`
				: `Suppression — ${libelleEntite(trace.entite).toLowerCase()}`;
		} catch {
			// Repli sur description ci-dessous.
		}
	}
	if (trace.operation === "UPDATE" && trace.avant && trace.apres) {
		try {
			const av = JSON.parse(trace.avant) as Record<string, unknown>;
			const ap = JSON.parse(trace.apres) as Record<string, unknown>;
			const cles = new Set([...Object.keys(av), ...Object.keys(ap)]);
			const changements: string[] = [];
			for (const cle of cles) {
				if (CHAMPS_IGNORES_DIFF.has(cle)) continue;
				const valeurAvant = av[cle];
				const valeurApres = ap[cle];
				if (JSON.stringify(valeurAvant) === JSON.stringify(valeurApres)) {
					continue;
				}
				changements.push(
					`${libelleChamp(cle)} : ${formaterValeurChamp(valeurAvant)} → ${formaterValeurChamp(valeurApres)}`,
				);
			}
			if (changements.length === 0) return "Aucun changement de valeur.";
			return changements.join(" · ");
		} catch {
			// Repli sur description ci-dessous.
		}
	}
	return trace.description ?? "—";
}

/** Filtres du journal d'audit (URL + serveur). */
export interface AuditFiltres {
	utilisateur: string;
	module: string;
	operation: string;
	du: string;
	au: string;
	recherche: string;
}

/** Filtre côté client : texte libre sur module/entité/description. */
export function rechercherAudit(
	traces: readonly TraceAudit[],
	terme: string,
): TraceAudit[] {
	const t = terme.trim().toLowerCase();
	if (!t) return [...traces];
	return traces.filter((trace) => {
		const champs = [
			String(trace.module),
			trace.entite,
			trace.description,
			trace.operation,
		].filter((valeur): valeur is string => Boolean(valeur));
		return champs.some((valeur) => valeur.toLowerCase().includes(t));
	});
}

/** Résultat de la pagination client. */
export interface PageAudit {
	items: TraceAudit[];
	total: number;
	page: number;
	totalPages: number;
	start: number;
	end: number;
}

/** Pagination client ; page bornée à [1, totalPages]. */
export function paginerAudit(
	traces: readonly TraceAudit[],
	page: number,
	pageSize: number,
): PageAudit {
	const total = traces.length;
	const totalPages = Math.max(1, Math.ceil(total / pageSize));
	const pageCourante = Math.min(Math.max(1, page), totalPages);
	const debut = (pageCourante - 1) * pageSize;
	const items = traces.slice(debut, debut + pageSize);
	const start = total === 0 ? 0 : debut + 1;
	const end = Math.min(debut + pageSize, total);
	return { items, total, page: pageCourante, totalPages, start, end };
}
