import type { LucideIcon } from "lucide-react";
import {
	Building2,
	ClipboardList,
	Package,
	PartyPopper,
	Receipt,
	Settings,
	ShieldCheck,
	Shirt,
	Users,
	Users2,
	UtensilsCrossed,
	Wallet,
} from "lucide-react";

import * as m from "#/paraglide/messages";

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
 * partagé `/en-cours?module=…&page=…`. Déclarée ici pour câbler la navigation
 * quand la route sera construite.
 */
export interface SubMenuItem {
	/** Identifiant stable, ex. "logements" — sert de paramètre `page` dans /en-cours. */
	id: string;
	/** Libellé localisé (message Paraglide, jamais de string en dur). */
	label: () => string;
	/** Permission requise pour afficher : `<CODE>.VOIR`. */
	permission: PermissionCode;
	/** Route future de la page (non construite, documentée pour le câblage). */
	path: string;
}

export interface ModuleDefinition {
	/** Code du module, source unique = `MODULES`. */
	code: ModuleCode;
	/** Titre localisé (message Paraglide, jamais de string en dur). */
	title: () => string;
	/** Description courte localisée. */
	description: () => string;
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
		title: m.module_residence_title,
		description: m.module_residence_description,
		icon: Building2,
		path: "/residence",
		permission: "RESIDENCE.VOIR",
		subItems: [
			{
				id: "batiments",
				label: m.nav_residence_batiments,
				permission: "RESIDENCE.VOIR",
				path: "/residence/batiments",
			},
			{
				id: "logements",
				label: m.nav_residence_logements,
				permission: "RESIDENCE.VOIR",
				path: "/residence/logements",
			},
			{
				id: "locations",
				label: m.nav_residence_locations,
				permission: "RESIDENCE.VOIR",
				path: "/residence/locations",
			},
			{
				id: "sejours_courts",
				label: m.nav_residence_sejours_courts,
				permission: "RESIDENCE.VOIR",
				path: "/residence/sejours-courts",
			},
			{
				id: "charges",
				label: m.nav_residence_charges,
				permission: "RESIDENCE.VOIR",
				path: "/residence/charges",
			},
			{
				id: "portail",
				label: m.nav_residence_portail,
				permission: "RESIDENCE.VOIR",
				path: "/residence/portail",
			},
		],
	},
	{
		code: "PRESSING",
		title: m.module_pressing_title,
		description: m.module_pressing_description,
		icon: Shirt,
		path: "/pressing",
		permission: "PRESSING.VOIR",
		subItems: [
			{
				id: "commandes",
				label: m.nav_pressing_commandes,
				permission: "PRESSING.VOIR",
				path: "/pressing/commandes",
			},
			{
				id: "depot",
				label: m.nav_pressing_depot,
				permission: "PRESSING.VOIR",
				path: "/pressing/depot",
			},
			{
				id: "retrait",
				label: m.nav_pressing_retrait,
				permission: "PRESSING.VOIR",
				path: "/pressing/retrait",
			},
		],
	},
	{
		code: "RESTAURANT",
		title: m.module_restaurant_title,
		description: m.module_restaurant_description,
		icon: UtensilsCrossed,
		path: "/restaurant",
		permission: "RESTAURANT.VOIR",
		subItems: [
			{
				id: "plats",
				label: m.nav_restaurant_plats,
				permission: "RESTAURANT.VOIR",
				path: "/restaurant/plats",
			},
			{
				id: "commandes",
				label: m.nav_restaurant_commandes,
				permission: "RESTAURANT.VOIR",
				path: "/restaurant/commandes",
			},
			{
				id: "statistiques",
				label: m.nav_restaurant_statistiques,
				permission: "RESTAURANT.VOIR",
				path: "/restaurant/statistiques",
			},
		],
	},
	{
		code: "SALLE_FETE",
		title: m.module_salle_fete_title,
		description: m.module_salle_fete_description,
		icon: PartyPopper,
		path: "/salle-fete",
		permission: "SALLE_FETE.VOIR",
		subItems: [
			{
				id: "calendrier",
				label: m.nav_salle_fete_calendrier,
				permission: "SALLE_FETE.VOIR",
				path: "/salle-fete/calendrier",
			},
			{
				id: "reservations",
				label: m.nav_salle_fete_reservations,
				permission: "SALLE_FETE.VOIR",
				path: "/salle-fete/reservations",
			},
		],
	},
	{
		code: "FACTURATION",
		title: m.module_facturation_title,
		description: m.module_facturation_description,
		icon: Receipt,
		path: "/facturation",
		permission: "FACTURATION.VOIR",
		subItems: [
			{
				id: "prestations",
				label: m.nav_facturation_prestations,
				permission: "FACTURATION.VOIR",
				path: "/facturation/prestations",
			},
			{
				id: "facturation",
				label: m.nav_facturation_facturation,
				permission: "FACTURATION.VOIR",
				path: "/facturation/facturation",
			},
		],
	},
	{
		code: "FINANCES",
		title: m.module_finances_title,
		description: m.module_finances_description,
		icon: Wallet,
		path: "/finances",
		permission: "FINANCES.VOIR",
		subItems: [
			{
				id: "tableau_de_bord",
				label: m.nav_finances_tableau_de_bord,
				permission: "FINANCES.VOIR",
				path: "/finances/tableau-de-bord",
			},
			{
				id: "encaissements",
				label: m.nav_finances_encaissements,
				permission: "FINANCES.VOIR",
				path: "/finances/encaissements",
			},
			{
				id: "depenses",
				label: m.nav_finances_depenses,
				permission: "FINANCES.VOIR",
				path: "/finances/depenses",
			},
			{
				id: "impayes",
				label: m.nav_finances_impayes,
				permission: "FINANCES.VOIR",
				path: "/finances/impayes",
			},
			{
				id: "moyens_paiement",
				label: m.nav_finances_moyens_paiement,
				permission: "FINANCES.VOIR",
				path: "/finances/moyens-paiement",
			},
			{
				id: "categories_depenses",
				label: m.nav_finances_categories_depenses,
				permission: "FINANCES.VOIR",
				path: "/finances/categories-depenses",
			},
		],
	},
	{
		code: "RH",
		title: m.module_rh_title,
		description: m.module_rh_description,
		icon: Users,
		path: "/rh",
		permission: "RH.VOIR",
		subItems: [
			{
				id: "employes",
				label: m.nav_rh_employes,
				permission: "RH.VOIR",
				path: "/rh/employes",
			},
			{
				id: "pointage",
				label: m.nav_rh_pointage,
				permission: "RH.VOIR",
				path: "/rh/pointage",
			},
			{
				id: "bulletins",
				label: m.nav_rh_bulletins,
				permission: "RH.VOIR",
				path: "/rh/bulletins",
			},
			{
				id: "comptes",
				label: m.nav_rh_comptes,
				permission: "RH.VOIR",
				path: "/rh/comptes",
			},
		],
	},
	{
		code: "CLIENT",
		title: m.module_client_title,
		description: m.module_client_description,
		icon: Users2,
		path: "/client",
		permission: "CLIENT.VOIR",
	},
	{
		code: "MARCHANDISE",
		title: m.module_marchandise_title,
		description: m.module_marchandise_description,
		icon: Package,
		path: "/marchandise",
		permission: "MARCHANDISE.VOIR",
		subItems: [
			{
				id: "produits",
				label: m.nav_marchandise_produits,
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/produits",
			},
			{
				id: "mouvements",
				label: m.nav_marchandise_mouvements,
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/mouvements",
			},
			{
				id: "ventes",
				label: m.nav_marchandise_ventes,
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/ventes",
			},
			{
				id: "statistiques",
				label: m.nav_marchandise_statistiques,
				permission: "MARCHANDISE.VOIR",
				path: "/marchandise/statistiques",
			},
		],
	},
	{
		code: "ADMIN",
		title: m.module_admin_title,
		description: m.module_admin_description,
		icon: ShieldCheck,
		path: "/admin",
		permission: "ADMIN.VOIR",
		subItems: [
			{
				id: "utilisateurs",
				label: m.nav_admin_utilisateurs,
				permission: "ADMIN.VOIR",
				path: "/admin/utilisateurs",
			},
			{
				id: "roles",
				label: m.nav_admin_roles,
				permission: "ADMIN.VOIR",
				path: "/admin/roles",
			},
			{
				id: "journal",
				label: m.nav_admin_journal,
				permission: "ADMIN.VOIR",
				path: "/admin/journal",
			},
			{
				id: "parametres",
				label: m.nav_admin_parametres,
				permission: "ADMIN.VOIR",
				path: "/admin/parametres",
			},
			{
				id: "sauvegardes",
				label: m.nav_admin_sauvegardes,
				permission: "ADMIN.VOIR",
				path: "/admin/sauvegardes",
			},
		],
	},
	{
		code: "AUDIT",
		title: m.module_audit_title,
		description: m.module_audit_description,
		icon: ClipboardList,
		path: "/audit",
		permission: "AUDIT.VOIR",
	},
	{
		code: "CORE",
		title: m.module_core_title,
		description: m.module_core_description,
		icon: Settings,
		path: "/core",
		permission: "CORE.VOIR",
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
