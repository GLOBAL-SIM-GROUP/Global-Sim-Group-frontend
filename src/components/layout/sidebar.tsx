import { Link, useLocation } from "@tanstack/react-router";
import { BarChart3, ChevronDown, LayoutGrid } from "lucide-react";
import { useState } from "react";

import { useCan, useCurrentUser, usePermissions } from "#/core/auth";
import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
} from "#/core/permissions/modules";
import { cn } from "#/lib/utils";

import { LogoutButton } from "./logout-button";

/** Initiales de l'utilisateur pour l'avatar (2 premiers segments du login,
    ex. "jean.dupont" → "JD", "admin" → "A"). */
function initialsOf(login: string): string {
	return login
		.split(/[\s._-]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

/**
 * Routes métier construites (liens typés de la sidebar), par module puis
 * `sub.id` (les ids de sous-menu se chevauchent entre modules, ex.
 * « statistiques »). Les autres sous-menus pointent vers le placeholder
 * `/en-cours`.
 */
const ROUTES_REALLES: Record<
	string,
	Record<string, { to: string; exact: boolean }>
> = {
	RESIDENCE: {
		batiments: { to: "/residence/batiments", exact: true },
		// `exact: false` garde le lien actif sur la fiche contrat.
		locations: { to: "/residence/contrats", exact: false },
		echeances: { to: "/residence/echeances", exact: true },
		sejours_courts: { to: "/residence/sejours-courts", exact: true },
		charges: { to: "/residence/charges", exact: true },
	},
	MARCHANDISE: {
		produits: { to: "/marchandise/produits", exact: true },
		mouvements: { to: "/marchandise/mouvements", exact: true },
		ventes: { to: "/marchandise/ventes", exact: true },
		statistiques: { to: "/marchandise/statistiques", exact: true },
	},
	// Le dépôt et le retrait sont des modales depuis la liste des commandes.
	PRESSING: {
		commandes: { to: "/pressing/commandes", exact: false },
	},
	RESTAURANT: {
		plats: { to: "/restaurant/plats", exact: true },
		commandes: { to: "/restaurant/commandes", exact: true },
		statistiques: { to: "/restaurant/statistiques", exact: true },
	},
	SALLE_FETE: {
		calendrier: { to: "/salle-fete/calendrier", exact: true },
		reservations: { to: "/salle-fete/reservations", exact: false },
	},
	FACTURATION: {
		prestations: { to: "/facturation/prestations", exact: true },
		// `exact: false` garde le lien actif sur la fiche facture.
		facturation: { to: "/facturation/factures", exact: false },
	},
	FINANCES: {
		tableau_de_bord: { to: "/finances/tableau-de-bord", exact: true },
		encaissements: { to: "/finances/encaissements", exact: true },
		depenses: { to: "/finances/depenses", exact: true },
		impayes: { to: "/finances/impayes", exact: true },
		moyens_paiement: { to: "/finances/moyens-paiement", exact: true },
		categories_depenses: { to: "/finances/categories-depenses", exact: true },
	},
	RH: {
		employes: { to: "/rh/employes", exact: true },
		// `exact: false` garde la fiche employé active.
		pointage: { to: "/rh/pointage", exact: false },
		// `exact: false` garde la fiche bulletin active.
		bulletins: { to: "/rh/bulletins", exact: false },
		comptes: { to: "/rh/comptes", exact: true },
	},
};

/**
 * Menu latéral des écrans authentifiés (desktop) : marque + Accueil, puis un
 * accordéon par module accessible (un seul ouvert à la fois), footer
 * utilisateur + déconnexion.
 *
 * Fond `bg-sea-ink` FIGÉ (tokens --color-sea-ink/lagoon/palm : les variables
 * --sea-ink/--lagoon/--palm changent de valeur sous `.dark` et éclairciraient
 * la sidebar).
 */
export function Sidebar() {
	const user = useCurrentUser();
	const permissions = usePermissions();
	const canVoirRapports = useCan("ADMIN.VOIR");
	const accessibleModules = getAccessibleModules(permissions);
	const { pathname, search } = useLocation();
	const activeModule = (search as { module?: string } | undefined)?.module;

	// Un seul module ouvert à la fois ; le module actif de l'URL est ouvert par
	// défaut (auto-ouverture du parent quand on arrive sur un sous-menu). Les
	// routes métier construites (ex. /residence/*) ouvrent leur module.
	const moduleDeLaRoute = (chemin: string): string | null => {
		if (chemin.startsWith("/residence")) return "RESIDENCE";
		if (chemin.startsWith("/marchandise")) return "MARCHANDISE";
		if (chemin.startsWith("/pressing")) return "PRESSING";
		if (chemin.startsWith("/restaurant")) return "RESTAURANT";
		if (chemin.startsWith("/salle-fete")) return "SALLE_FETE";
		if (chemin.startsWith("/facturation")) return "FACTURATION";
		if (chemin.startsWith("/finances")) return "FINANCES";
		if (chemin.startsWith("/rh")) return "RH";
		return null;
	};
	const [openModule, setOpenModule] = useState<string | null>(
		activeModule ?? moduleDeLaRoute(pathname),
	);

	const toggleModule = (code: string) =>
		setOpenModule((current) => (current === code ? null : code));

	const linkClassName =
		"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-lagoon/20 hover:text-white";
	const headerClassName = (isOpen: boolean) =>
		cn(linkClassName, "w-full text-left", isOpen && "bg-lagoon/20 text-white");

	const subLinkClassName =
		"block rounded-lg px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-lagoon/20 hover:text-white";
	const subActiveClassName = "bg-lagoon/25 text-white font-medium";

	return (
		<aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col justify-between overflow-y-auto border-r border-palm bg-sea-ink px-3 py-4 lg:flex">
			<div className="space-y-6">
				<div className="flex flex-col items-center gap-2 px-3">
					{/* Logo de marque servi depuis public/ (sur fond sombre sea-ink). */}
					<img
						src="/logo.png"
						alt=""
						aria-hidden
						className="size-32 shrink-0 rounded-md object-contain"
					/>
					<span className="text-center text-lg font-semibold text-white">
						GLOBAL SIM GROUP
					</span>
				</div>

				<nav aria-label="Navigation">
					<ul className="space-y-1">
						<li>
							<Link
								to="/"
								activeOptions={{ exact: true }}
								activeProps={{ className: "bg-lagoon/25 text-white" }}
								className={linkClassName}
							>
								<LayoutGrid className="size-4 text-lagoon" aria-hidden />
								Accueil
							</Link>
						</li>

						{canVoirRapports ? (
							<li>
								{/* M10 : pas de module/permission RAPPORTS côté backend — le
								    menu Rapports suit `ADMIN.VOIR` (administrateurs, dirigeants). */}
								<Link
									to="/rapports"
									activeOptions={{ exact: false }}
									activeProps={{ className: "bg-lagoon/25 text-white" }}
									className={linkClassName}
								>
									<BarChart3 className="size-4 text-lagoon" aria-hidden />
									Rapports
								</Link>
							</li>
						) : null}

						{accessibleModules.map((module) => {
							const isOpen = openModule === module.code;
							const subItems = getAccessibleModuleSubItems(module, permissions);

							return (
								<li key={module.code}>
									<button
										type="button"
										onClick={() => toggleModule(module.code)}
										className={headerClassName(isOpen)}
									>
										<module.icon className="size-4 text-lagoon" aria-hidden />
										<span className="flex-1 text-left">{module.title}</span>
										{subItems.length > 0 && (
											<ChevronDown
												className={cn(
													"size-4 text-lagoon transition-transform duration-200",
													isOpen && "rotate-180",
												)}
												aria-hidden
											/>
										)}
									</button>

									{subItems.length > 0 && isOpen && (
										<ul className="ml-5 mt-1 space-y-1 border-l border-palm pl-2">
											{subItems.map((sub) => {
												const route = ROUTES_REALLES[module.code]?.[sub.id];
												return (
													<li key={sub.id}>
														{route ? (
															// Route métier réelle : lien typé, les filtres vivent dans la
															// search de cette route, pas ici.
															<Link
																to={route.to as never}
																activeOptions={{ exact: route.exact }}
																activeProps={{ className: subActiveClassName }}
																className={subLinkClassName}
															>
																{sub.label}
															</Link>
														) : (
															// Placeholder partagé tant que la route métier n'existe pas.
															<Link
																to="/en-cours"
																search={{ module: module.code, page: sub.id }}
																activeOptions={{ includeSearch: true }}
																activeProps={{
																	className: subActiveClassName,
																}}
																className={subLinkClassName}
															>
																{sub.label}
															</Link>
														)}
													</li>
												);
											})}
										</ul>
									)}
								</li>
							);
						})}
					</ul>
				</nav>
			</div>

			{user ? (
				<div className="space-y-3 border-t border-palm pt-3">
					<div className="flex items-center gap-3 px-3">
						{/* Cercle avatar : aucune photo réelle n'est exposée par
						    /auth/me → initiales du login en attendant une vraie photo. */}
						<div
							aria-hidden
							className="grid size-10 shrink-0 place-items-center rounded-full bg-lagoon/20 text-sm font-semibold text-lagoon ring-1 ring-palm"
						>
							{initialsOf(user.login)}
						</div>
						<div className="min-w-0">
							<p className="truncate text-sm font-medium text-white">
								{user.login}
							</p>
							{user.role ? (
								<p className="truncate text-sm text-gray-400">{user.role}</p>
							) : null}
						</div>
					</div>
					<LogoutButton className="w-full justify-start text-gray-300 hover:bg-lagoon/20 hover:text-white" />
				</div>
			) : null}
		</aside>
	);
}
