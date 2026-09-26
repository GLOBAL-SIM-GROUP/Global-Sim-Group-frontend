import { Link, useLocation } from "@tanstack/react-router";
import {
	AlertCircle,
	BarChart2,
	BarChart3,
	CalendarDays,
	Camera,
	ChevronDown,
	CreditCard,
	Home,
	LayoutGrid,
	PartyPopper,
	ShieldCheck,
	Shirt,
	ShoppingBag,
	UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

import { useCan, useCurrentUser, usePermissions } from "#/core/auth";
import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
} from "#/core/permissions/modules";
import { useReliquatsADeciderCount } from "#/features/abonnement/hooks/use-souscriptions";
import { usePortailResume } from "#/features/portail/hooks/use-portail";
import { useCommandesEnAttenteCount as usePressingEnAttenteCount } from "#/features/pressing/hooks/use-commandes";
import { useSejoursEnAttenteCount } from "#/features/residence/hooks/use-sejours";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { useCommandesEnAttenteCount as useRestaurantEnAttenteCount } from "#/features/restaurant/hooks/use-commandes";
import { useReservationsEnAttenteCount } from "#/features/salle-fete/hooks/use-reservations";
import { cn } from "#/lib/utils";

import { UserMenu } from "./user-menu";

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
	Record<
		string,
		{ to: string; exact: boolean; search?: Record<string, string> }
	>
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
	RESTAURANT: {
		plats: { to: "/restaurant/plats", exact: true },
		commandes: { to: "/restaurant/commandes", exact: true },
		statistiques: { to: "/restaurant/statistiques", exact: true },
	},
	PRESSING: {
		commandes: { to: "/pressing/commandes", exact: true },
		tarif_kg: { to: "/pressing/tarif-kg", exact: true },
		catalogue: { to: "/pressing/catalogue", exact: true },
	},
	SALLE_FETE: {
		calendrier: { to: "/salle-fete/calendrier", exact: true },
		reservations: { to: "/salle-fete/reservations", exact: false },
		catalogue: { to: "/salle-fete/catalogue", exact: true },
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
		caisses: { to: "/finances/caisses", exact: true },
		revenus_utilisateur: { to: "/finances/revenus-utilisateur", exact: true },
		ma_caisse: { to: "/finances/caissier/dashboard", exact: true },
	},
	RH: {
		employes: { to: "/rh/employes", exact: true },
		// `exact: false` garde la fiche bulletin active.
		bulletins: { to: "/rh/bulletins", exact: false },
		comptes: { to: "/rh/comptes", exact: true },
	},
	ADMIN: {
		utilisateurs: { to: "/admin/utilisateurs", exact: true },
		// `exact: false` garde le lien actif sur la page permissions d'un rôle.
		roles: { to: "/admin/roles", exact: false },
		journal: { to: "/admin/journal", exact: true },
		sauvegardes: { to: "/admin/sauvegardes", exact: true },
	},
	CLIENT: {
		// `exact: false` garde le lien actif sur la fiche client.
		clients: { to: "/client/clients", exact: false },
	},
	ABONNEMENT: {
		offres: { to: "/abonnements/offres", exact: true },
		// `exact: false` garde le lien actif sur la fiche souscription.
		souscriptions: { to: "/abonnements/souscriptions", exact: false },
		// File « reliquats à décider » = la liste filtrée côté search params.
		reliquats: {
			to: "/abonnements/souscriptions",
			exact: true,
			search: { reliquat: "a_decider" },
		},
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
export function Sidebar({ onClose }: { onClose?: () => void } = {}) {
	const user = useCurrentUser();
	const permissions = usePermissions();
	const canVoirRapports = useCan("ADMIN.VOIR");
	const canVoirSignalements = useCan("SIGNALEMENT.VOIR");
	const estResident = useCan("RESIDENT.VOIR");
	const canVoirSalleFete = useCan("SALLE_FETE.VOIR");
	const canVoirRestaurant = useCan("RESTAURANT.VOIR");
	const canVoirPressing = useCan("PRESSING.VOIR");
	const canVoirResidence = useCan("RESIDENCE.VOIR");
	const canDeciderReliquat = useCan("ABONNEMENT.DECIDER_RELIQUAT");
	const reliquatsADecider = useReliquatsADeciderCount(canDeciderReliquat).data;
	const demandesSalleFeteEnAttente =
		useReservationsEnAttenteCount(canVoirSalleFete).data;
	const demandesRestaurantEnAttente =
		useRestaurantEnAttenteCount(canVoirRestaurant).data;
	const demandesPressingEnAttente =
		usePressingEnAttenteCount(canVoirPressing).data;
	const demandesSejoursEnAttente =
		useSejoursEnAttenteCount(canVoirResidence).data;
	const portailResumeQuery = usePortailResume(estResident);
	const totalImpayes = portailResumeQuery.data?.total_impayes;
	const accessibleModules = getAccessibleModules(permissions);
	const { pathname, search } = useLocation();
	const activeModule = (search as { module?: string } | undefined)?.module;

	// Un seul module ouvert à la fois ; le module actif de l'URL est ouvert par
	// défaut (auto-ouverture du parent quand on arrive sur un sous-menu). Les
	// routes métier construites (ex. /residence/*) ouvrent leur module.
	const moduleDeLaRoute = (chemin: string): string | null => {
		if (chemin.startsWith("/dashboard")) return null; // Pas de module, lien top-level
		if (chemin.startsWith("/signalements")) return null; // Pas de module, lien top-level
		if (chemin.startsWith("/residence")) return "RESIDENCE";
		if (chemin.startsWith("/marchandise")) return "MARCHANDISE";
		if (chemin.startsWith("/pressing")) return "PRESSING";
		if (chemin.startsWith("/restaurant")) return "RESTAURANT";
		if (chemin.startsWith("/salle-fete")) return "SALLE_FETE";
		if (chemin.startsWith("/facturation")) return "FACTURATION";
		if (chemin.startsWith("/finances")) return "FINANCES";
		if (chemin.startsWith("/rh")) return "RH";
		if (chemin.startsWith("/admin")) return "ADMIN";
		if (chemin.startsWith("/abonnements")) return "ABONNEMENT";
		return null;
	};
	const [openModule, setOpenModule] = useState<string | null>(
		activeModule ?? moduleDeLaRoute(pathname),
	);

	const toggleModule = (code: string) =>
		setOpenModule((current) => (current === code ? null : code));

	const linkClassName =
		"flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-400 transition-all duration-200 hover:bg-sea-ink/50 hover:text-white";
	const linkActiveClassName =
		"bg-lagoon/15 text-lagoon before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-lagoon before:rounded-r relative";
	const headerClassName = (isOpen: boolean) =>
		cn(
			linkClassName,
			"w-full text-left relative",
			isOpen &&
				"text-lagoon bg-sea-ink/70 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-lagoon before:rounded-r",
		);

	const subLinkClassName =
		"block rounded-lg px-3 py-2 text-sm text-gray-400 transition-all duration-200 hover:bg-sea-ink/50 hover:text-white relative";
	const subActiveClassName = "bg-lagoon/20 text-lagoon font-medium";

	return (
		<aside className="sticky top-0 flex h-dvh w-60 shrink-0 flex-col border-r border-palm bg-sea-ink px-3 py-4">
			{/* Logo épinglé : hors de la zone scrollable — seul le menu défile. */}
			<div className="flex shrink-0 flex-col items-center gap-2 px-3">
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

			<nav
				aria-label="Navigation"
				className="mt-6 min-h-0 flex-1 overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
			>
				<ul className="space-y-1">
					<li>
						<Link
							to="/home"
							activeOptions={{ exact: true }}
							activeProps={{ className: linkActiveClassName }}
							className={linkClassName}
							onClick={() => onClose?.()}
						>
							<LayoutGrid
								className="size-4 text-gray-400 transition-colors"
								aria-hidden
							/>
							Accueil
						</Link>
					</li>

					{estResident ? (
						<li>
							<Link
								to="/residence/portail"
								activeOptions={{ exact: true }}
								activeProps={{ className: linkActiveClassName }}
								className={linkClassName}
								onClick={() => onClose?.()}
							>
								<Home
									className="size-4 text-gray-400 transition-colors"
									aria-hidden
								/>
								Mon espace résident
							</Link>

							<ul className="ml-5 mt-1 space-y-1 border-l border-palm pl-2">
								<li>
									<Link
										to="/residence/portail/echeances"
										activeOptions={{ exact: true }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<CalendarDays className="size-3.5" aria-hidden />
											Mes échéances
										</span>
									</Link>
								</li>
								<li>
									<Link
										to="/residence/portail/paiements"
										activeOptions={{ exact: true }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<CreditCard className="size-3.5" aria-hidden />
											Mon historique
										</span>
									</Link>
								</li>
								<li>
									<Link
										to="/residence/portail/caution"
										activeOptions={{ exact: true }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<ShieldCheck className="size-3.5" aria-hidden />
											Ma caution
										</span>
									</Link>
								</li>
								<li>
									{/* `exact: false` garde le lien actif sur le détail d'une commande. */}
									<Link
										to="/residence/portail/pressing"
										activeOptions={{ exact: false }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<Shirt className="size-3.5" aria-hidden />
											Suivi Pressing
										</span>
									</Link>
								</li>
								<li>
									<Link
										to="/residence/portail/restaurant"
										activeOptions={{ exact: false }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<UtensilsCrossed className="size-3.5" aria-hidden />
											Restaurant
										</span>
									</Link>
								</li>
								<li>
									<Link
										to="/residence/portail/salle-fete"
										activeOptions={{ exact: false }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<PartyPopper className="size-3.5" aria-hidden />
											Salle de fête
										</span>
									</Link>
								</li>
								<li>
									<Link
										to="/residence/portail/boutique"
										activeOptions={{ exact: false }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<ShoppingBag className="size-3.5" aria-hidden />
											Boutique
										</span>
									</Link>
								</li>
								<li>
									<Link
										to="/residence/portail/etat-des-lieux"
										activeOptions={{ exact: true }}
										activeProps={{ className: subActiveClassName }}
										className={subLinkClassName}
										onClick={() => onClose?.()}
									>
										<span className="inline-flex items-center gap-2">
											<Camera className="size-3.5" aria-hidden />
											Mes états des lieux
										</span>
									</Link>
								</li>
							</ul>

							{totalImpayes !== undefined ? (
								<div className="mx-1 mt-2 rounded-lg bg-sea-ink/70 px-3 py-2">
									<p className="text-[0.65rem] font-medium uppercase tracking-wide text-gray-400">
										Total impayés
									</p>
									<p className="text-sm font-semibold text-destructive">
										{formatMontantFCFA(totalImpayes)}
									</p>
								</div>
							) : null}
						</li>
					) : null}

					{canVoirRapports ? (
						<li>
							<Link
								to="/dashboard"
								activeOptions={{ exact: false }}
								activeProps={{ className: linkActiveClassName }}
								className={linkClassName}
								onClick={() => onClose?.()}
							>
								<BarChart2
									className="size-4 text-gray-400 transition-colors"
									aria-hidden
								/>
								Tableau de bord global
							</Link>
						</li>
					) : null}

					{canVoirSignalements ? (
						<li>
							<Link
								to="/signalements"
								activeOptions={{ exact: false }}
								activeProps={{ className: linkActiveClassName }}
								className={linkClassName}
								onClick={() => onClose?.()}
							>
								<AlertCircle
									className="size-4 text-gray-400 transition-colors"
									aria-hidden
								/>
								Signalements
							</Link>
						</li>
					) : null}

					{canVoirRapports ? (
						<li>
							{/* M10 : pas de module/permission RAPPORTS côté backend — le
								    menu Rapports suit `ADMIN.VOIR` (administrateurs, dirigeants). */}
							<Link
								to="/rapports"
								activeOptions={{ exact: false }}
								activeProps={{ className: linkActiveClassName }}
								className={linkClassName}
								onClick={() => onClose?.()}
							>
								<BarChart3
									className="size-4 text-gray-400 transition-colors"
									aria-hidden
								/>
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
									<module.icon
										className={cn(
											"size-4 transition-colors",
											isOpen ? "text-lagoon" : "text-gray-400",
										)}
										aria-hidden
									/>
									<span className="flex-1 text-left">{module.title}</span>
									{subItems.length > 0 && (
										<ChevronDown
											className={cn(
												"size-4 text-gray-400 transition-all duration-200",
												isOpen && "rotate-180 text-lagoon",
											)}
											aria-hidden
										/>
									)}
								</button>

								{subItems.length > 0 && isOpen && (
									<ul className="ml-5 mt-1 space-y-1 border-l border-palm pl-2">
										{subItems.map((sub) => {
											const route = ROUTES_REALLES[module.code]?.[sub.id];
											const badge =
												module.code === "SALLE_FETE" &&
												sub.id === "reservations"
													? demandesSalleFeteEnAttente
													: module.code === "RESTAURANT" &&
															sub.id === "commandes"
														? demandesRestaurantEnAttente
														: module.code === "PRESSING" &&
																sub.id === "commandes"
															? demandesPressingEnAttente
															: module.code === "RESIDENCE" &&
																	sub.id === "sejours_courts"
																? demandesSejoursEnAttente
																: module.code === "ABONNEMENT" &&
																		sub.id === "reliquats"
																	? reliquatsADecider
																	: undefined;
											return (
												<li key={sub.id}>
													{route ? (
														// Route métier réelle : lien typé, les filtres vivent dans la
														// search de cette route, pas ici.
														<Link
															to={route.to as never}
															{...(route.search
																? { search: route.search as never }
																: {})}
															activeOptions={{
																exact: route.exact,
																...(route.search
																	? { includeSearch: true }
																	: {}),
															}}
															activeProps={{ className: subActiveClassName }}
															className={subLinkClassName}
															onClick={() => onClose?.()}
														>
															<span className="flex items-center justify-between gap-2">
																{sub.label}
																{badge ? (
																	<span className="inline-grid min-w-5 place-items-center rounded-full bg-amber-500/25 px-1.5 py-0.5 text-[0.65rem] font-semibold text-amber-300">
																		{badge}
																	</span>
																) : null}
															</span>
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
															onClick={() => onClose?.()}
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

			{/* Footer utilisateur épinglé en bas — hors de la zone scrollable. */}
			{user ? (
				<div className="shrink-0 border-t border-palm/40 bg-sea-ink/50 -mx-3 px-3 py-4 mt-4 rounded-lg">
					<UserMenu
						avatar={
							<div
								aria-hidden
								className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-lagoon/40 to-lagoon/20 text-sm font-semibold text-lagoon ring-2 ring-lagoon/30 shadow-lg"
							>
								{initialsOf(user.login)}
							</div>
						}
						login={user.login}
						role={user.role}
					/>
				</div>
			) : null}
		</aside>
	);
}
