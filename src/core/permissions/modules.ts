import type { LucideIcon } from "lucide-react";
import {
	Building2,
	Package,
	PartyPopper,
	Receipt,
	ShieldCheck,
	Shirt,
	Users,
	Users2,
	UtensilsCrossed,
	Wallet,
} from "lucide-react";

import { hasPermission } from "./index";
import type { ModuleCode, PermissionCode } from "./types";

/**
 * Registre des modules affichables par le lanceur (menu global) et la sidebar.
 *
 * Les 12 modules correspondent exactement aux préfixes de permission renvoyés
 * par `GET /auth/me` (`MODULES` dans `./types`). `permission` est toujours
 * `<CODE>.VOIR` : une tuile s'affiche si l'utilisateur peut voir le module.
 *
 * ⚠️ La liste affichée dépend des permissions réelles de l'utilisateur — c'est
 * de l'UX (masquage/navigation), pas une frontière de sécurité : le backend
 * reste responsable de chaque opération protégée.
 */
/**
 * Sous-page d'un module (menu déroulant de la sidebar). La route métier
 * (`path`) n'existe pas encore : le rendu actuel pointe vers le placeholder
 * partagé `/api/v1/en-cours?module=…&page=…`. Déclarée ici pour câbler la navigation
 * quand la route sera construite.
 */
export interface SubMenuItem {
	/** Identifiant stable, ex. "logements" — sert de paramètre `page` dans /en-cours. */
	id: string;
	/** Libellé affiché (français, en dur). */
	label: string;
	/** Permission requise pour afficher : `<CODE>.VOIR`. */
	permission: PermissionCode;
	/** Route future de la page (non construite, documentée pour le câblage). */
	path: string;
}

export interface ModuleDefinition {
	/** Code du module, source unique = `MODULES`. */
	code: ModuleCode;
	/** Titre affiché (français, en dur). */
	title: string;
	/** Description courte affichée. */
	description: string;
	/** Icône lucide du module. */
	icon: LucideIcon;
	/** Route future du module (non construite : la fondation n'implémente
	 *  aucune fonctionnalité métier). Documentée ici pour le câblage futur. */
	path: string;
	/** Permission requise pour afficher la tuile : `<CODE>.VOIR`. */
	permission: PermissionCode;
	/** Sous-pages du module (accordéon de la sidebar). Vide tant que les
	 *  routes métier n'existent pas. */
	subItems?: SubMenuItem[];
}

export const MODULE_DEFINITIONS: ModuleDefinition[] = [
	{
		code: "RESIDENCE",
		title: "Résidence",
		description: "Gestion des locataires, baux et maintenance.",
		icon: Building2,
		path: "/residence",
		permission: "RESIDENCE.VOIR",
		subItems: [
			{
				id: "batiments",
				label: "Bâtiments",
				permission: "RESIDENCE.VOIR",
				path: "/residence/batiments",
			},
			{
				id: "locations",
				label: "Contrats de location",
				permission: "RESIDENCE.VOIR",
				path: "/residence/contrats",
			},
			{
				id: "echeances",
				label: "Échéances de loyer",
				permission: "RESIDENCE.VOIR",
				path: "/residence/echeances",
			},
			{
				id: "sejours_courts",
				label: "Séjours courts",
				permission: "RESIDENCE.VOIR",
				path: "/residence/sejours-courts",
			},
			{
				id: "charges",
				label: "Charges et abonnements",
				permission: "RESIDENCE.VOIR",
				path: "/residence/charges",
			},
		],
	},
	{
		code: "RESTAURANT",
		title: "Restaurant",
		description: "Gestion des menus, des commandes et du service.",
		icon: UtensilsCrossed,
		path: "/restaurant",
		permission: "RESTAURANT.VOIR",
		subItems: [
			{
				id: "plats",
				label: "Plats / carte",
				permission: "RESTAURANT.VOIR",
				path: "/restaurant/plats",
			},
			{
				id: "commandes",
				label: "Commandes",
				permission: "RESTAURANT.VOIR",
				path: "/restaurant/commandes",
			},
			{
				id: "statistiques",
				label: "Statistiques",
				permission: "RESTAURANT.VOIR",
				path: "/restaurant/statistiques",
			},
		],
	},
	{
		code: "PRESSING",
		title: "Blanchisserie",
		description: "Gestion du nettoyage et de la blanchisserie.",
		icon: Shirt,
		path: "/pressing",
		permission: "PRESSING.VOIR",
		subItems: [
			{
				id: "commandes",
				label: "Commandes",
				permission: "PRESSING.VOIR",
				path: "/pressing/commandes",
			},
		],
	},
	{
		code: "SALLE_FETE",
		title: "Salle de fête",
		description: "Réservation et organisation des événements en salle.",
		icon: PartyPopper,
		path: "/salle-fete",
		permission: "SALLE_FETE.VOIR",
		subItems: [
			{
				id: "calendrier",
				label: "Calendrier",
				permission: "SALLE_FETE.VOIR",
				path: "/salle-fete/calendrier",
			},
			{
				id: "reservations",
				label: "Réservations",
				permission: "SALLE_FETE.VOIR",
				path: "/salle-fete/reservations",
			},
		],
	},
	{
		code: "FACTURATION",
		title: "Facturation",
		description: "Émission et suivi des factures et des paiements.",
		icon: Receipt,
		path: "/facturation",
		permission: "FACTURATION.VOIR",
		subItems: [
			{
				id: "prestations",
				label: "Prestations facturables",
				permission: "FACTURATION.VOIR",
				path: "/facturation/prestations",
			},
			{
				id: "facturation",
				label: "Facturation ponctuelle",
				permission: "FACTURATION.VOIR",
				path: "/facturation/facturation",
			},
		],
	},
	{
		code: "FINANCES",
		title: "Finances",
		description: "Suivi des encaissements, dépenses et trésorerie.",
		icon: Wallet,
		path: "/finances",
		permission: "FINANCES.VOIR",
		subItems: [
			{
				id: "tableau_de_bord",
				label: "Tableau de bord financier",
				permission: "FINANCES.VOIR",
				path: "/finances/tableau-de-bord",
			},
			{
				id: "encaissements",
				label: "Encaissements",
				permission: "FINANCES.VOIR",
				path: "/finances/encaissements",
			},
			{
				id: "depenses",
				label: "Dépenses",
				permission: "FINANCES.VOIR",
				path: "/finances/depenses",
			},
			{
				id: "impayes",
				label: "Impayés",
				permission: "FINANCES.VOIR",
				path: "/finances/impayes",
			},
			{
				id: "moyens_paiement",
				label: "Moyens de paiement",
				permission: "FINANCES.VOIR",
				path: "/finances/moyens-paiement",
			},
			{
				id: "categories_depenses",
				label: "Catégories de dépenses",
				permission: "FINANCES.VOIR",
				path: "/finances/categories-depenses",
			},
			{
				id: "caisses",
				label: "Caisses",
				permission: "FINANCES.MODIFIER",
				path: "/finances/caisses",
			},
			{
				id: "revenus_utilisateur",
				label: "Revenus par utilisateur",
				permission: "FINANCES.VOIR",
				path: "/finances/revenus-utilisateur",
			},
		],
	},
	{
		code: "RH",
		title: "Ressources humaines",
		description: "Gestion des employés, contrats et présences.",
		icon: Users,
		path: "/rh",
		permission: "RH.VOIR",
		subItems: [
			{
				id: "employes",
				label: "Employés",
				permission: "RH.VOIR",
				path: "/rh/employes",
			},
			{
				id: "pointage",
				label: "Pointage",
				permission: "RH.VOIR",
				path: "/rh/pointage",
			},
			{
				id: "bulletins",
				label: "Bulletins de salaire",
				permission: "RH.VOIR",
				path: "/rh/bulletins",
			},
			{
				id: "comptes",
				label: "Comptes utilisateurs",
				permission: "RH.VOIR",
				path: "/rh/comptes",
			},
		],
	},
	{
		code: "CLIENT",
		title: "Clients",
		description: "Fiches clients et historique des transactions.",
		icon: Users2,
		path: "/client",
		permission: "CLIENT.VOIR",
		subItems: [
			{
				id: "clients",
				label: "Locataires et clients",
				permission: "CLIENT.VOIR",
				path: "/client/clients",
			},
		],
	},
	{
		code: "MARCHANDISE",
		title: "Marchandise",
		description: "Gestion des stocks et des inventaires.",
		icon: Package,
		path: "/marchandise",
		permission: "MARCHANDISE.VOIR",
		subItems: [
			{
				id: "produits",
				label: "Produits",
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/produits",
			},
			{
				id: "mouvements",
				label: "Mouvements de stock",
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/mouvements",
			},
			{
				id: "ventes",
				label: "Ventes",
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/ventes",
			},
			{
				id: "statistiques",
				label: "Statistiques",
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/statistiques",
			},
		],
	},
	{
		code: "ADMIN",
		title: "Administration",
		description: "Paramètres généraux et comptes utilisateurs.",
		icon: ShieldCheck,
		path: "/admin",
		permission: "ADMIN.VOIR",
		subItems: [
			{
				id: "utilisateurs",
				label: "Utilisateurs",
				permission: "ADMIN.VOIR",
				path: "/admin/utilisateurs",
			},
			{
				id: "roles",
				label: "Rôles",
				permission: "ADMIN.VOIR",
				path: "/admin/roles",
			},
			{
				id: "journal",
				label: "Journal d'audit",
				permission: "ADMIN.VOIR",
				path: "/admin/journal",
			},
			{
				id: "sauvegardes",
				label: "Sauvegardes",
				permission: "ADMIN.VOIR",
				path: "/admin/sauvegardes",
			},
		],
	},
	{
		code: "CAISSIER",
		title: "Ma caisse",
		description: "Consultation et tirage de votre caisse.",
		icon: Wallet,
		path: "/finances/caissier/dashboard",
		permission: "FINANCES.VOIR",
		subItems: [
			{
				id: "dashboard",
				label: "Dashboard",
				permission: "FINANCES.VOIR",
				path: "/finances/caissier/dashboard",
			},
			{
				id: "tirages",
				label: "Tirages",
				permission: "FINANCES.VOIR",
				path: "/finances/caissier/tirages",
			},
		],
	},
] as const;

/**
 * Modules que l'utilisateur peut voir (droit de lecture `VOIR`), dans l'ordre
 * du registre. Fonction pure, sans dépendance React — testable unitairement.
 */
export function getAccessibleModules(
	permissions: readonly string[],
): ModuleDefinition[] {
	return MODULE_DEFINITIONS.filter((module) =>
		hasPermission(permissions, module.permission),
	);
}

/**
 * Sous-pages d'un module que l'utilisateur peut voir (`<CODE>.VOIR`), dans
 * l'ordre de déclaration. Fonction pure, sans dépendance React — testable
 * unitairement. Retourne `[]` si le module n'a pas de sous-pages.
 */
export function getAccessibleModuleSubItems(
	def: ModuleDefinition,
	permissions: readonly string[],
): SubMenuItem[] {
	return (def.subItems ?? []).filter((sub) =>
		hasPermission(permissions, sub.permission),
	);
}
