import { Link, useLocation } from "@tanstack/react-router";
import {
	AlertCircle,
	BarChart2,
	BarChart3,
	BedDouble,
	Building2,
	CalendarDays,
	Camera,
	ChevronDown,
	ClipboardList,
	ConciergeBell,
	CreditCard,
	Flag,
	Home,
	LayoutGrid,
	ListChecks,
	PartyPopper,
	ReceiptText,
	ShieldCheck,
	Shirt,
	ShoppingBag,
	ShoppingCart,
	Tickets,
	UserRound,
	UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

import { AvatarProfil } from "#/components/avatar-profil";
import { useCan, useCurrentUser, usePermissions } from "#/core/auth";
import {
	getAccessibleModuleSubItems,
	getAccessibleModules,
} from "#/core/permissions/modules";
import { useReliquatsADeciderCount } from "#/features/abonnement/hooks/use-souscriptions";
import { useVentesEnAttenteCount } from "#/features/marchandise/hooks/use-ventes";
import { useNombreArticlesPaniers } from "#/features/portail/hooks/use-panier-articles";
import { usePortailResume } from "#/features/portail/hooks/use-portail";
import { useCommandesEnAttenteCount as usePressingEnAttenteCount } from "#/features/pressing/hooks/use-commandes";
import { useSejoursEnAttenteCount } from "#/features/residence/hooks/use-sejours";
import { formatMontantFCFA } from "#/features/residence/models/format";
import { useCommandesEnAttenteCount as useRestaurantEnAttenteCount } from "#/features/restaurant/hooks/use-commandes";
import { useReservationsEnAttenteCount } from "#/features/salle-fete/hooks/use-reservations";
import { cn } from "#/lib/utils";

import { groupeDeLaRoute, type NavGroupe, NavGroupes } from "./nav-groupes";
import { UserMenu } from "./user-menu";

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
 * Entrées du portail résident — même mécanique d'accordéon que les modules
 * staff (header + chevron + sous-liste `border-l`, un seul menu ouvert via
 * `openModule`), regroupées par domaine : « Ma résidence » réunit le
 * locatif (`RESIDENT.VOIR`) et les séjours courts — mêmes éléments que la
 * section du même nom de `portail-page` ; « Services » les prestations
 * réservables ; « Mon suivi » le suivi des demandes, documents et
 * signalements. `code: null` = entrée plane hors accordéon (« Mon espace
 * résident »). `exact: false` sur les sections qui ont des routes détail
 * (`$id`) pour garder le lien actif sur une fiche.
 */
const RESIDENT_NAV: readonly NavGroupe[] = [
	{
		code: null,
		label: "",
		icon: Home,
		items: [
			{
				to: "/residence/portail",
				label: "Mon espace résident",
				icon: Home,
				exact: true,
			},
		],
	},
	{
		code: "PORTAIL_RESIDENCE",
		label: "Ma résidence",
		icon: Building2,
		items: [
			{
				to: "/residence/portail/echeances",
				label: "Mes échéances",
				icon: CalendarDays,
				exact: true,
			},
			{
				to: "/residence/portail/paiements",
				label: "Mon historique",
				icon: CreditCard,
				exact: true,
			},
			{
				to: "/residence/portail/caution",
				label: "Ma caution",
				icon: ShieldCheck,
				exact: true,
			},
			{
				to: "/residence/portail/etat-des-lieux",
				label: "Mes états des lieux",
				icon: Camera,
				exact: true,
			},
			{
				to: "/residence/portail/sejours",
				label: "Séjours courts",
				icon: BedDouble,
			},
		],
	},
	{
		code: "PORTAIL_SERVICES",
		label: "Services",
		icon: ConciergeBell,
		items: [
			{
				to: "/residence/portail/restaurant",
				label: "Restaurant",
				icon: UtensilsCrossed,
			},
			{
				to: "/residence/portail/boutique",
				label: "Boutique",
				icon: ShoppingBag,
			},
			{
				to: "/residence/portail/pressing",
				label: "Suivi Pressing",
				icon: Shirt,
			},
			{
				to: "/residence/portail/salle-fete",
				label: "Salle de fête",
				icon: PartyPopper,
			},
			{
				to: "/residence/portail/abonnements",
				label: "Mes abonnements",
				icon: Tickets,
			},
		],
	},
	{
		code: "PORTAIL_SUIVI",
		label: "Mon suivi",
		icon: ListChecks,
		items: [
			{
				to: "/residence/portail/demandes",
				label: "Mes demandes",
				icon: ClipboardList,
				exact: true,
			},
			{
				to: "/residence/portail/panier",
				label: "Panier",
				icon: ShoppingCart,
				exact: true,
			},
			{
				to: "/residence/portail/factures",
				label: "Mes factures",
				icon: ReceiptText,
				exact: true,
			},
			{
				to: "/residence/portail/signalements",
				label: "Mes signalements",
				icon: Flag,
			},
		],
	},
];

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
	// M10 : module RAPPORTS réel et distinct d'ADMIN (vérifié en direct
	// 2026-09-27) — les rôles Responsable (résidence/magasin/pressing/
	// restaurant/salle de fête) ont RAPPORTS.VOIR sans ADMIN.VOIR.
	const canVoirRapports = useCan("RAPPORTS.VOIR");
	const canVoirSignalements = useCan("SIGNALEMENT.VOIR");
	const estResident = useCan("RESIDENT.VOIR");
	const canVoirSalleFete = useCan("SALLE_FETE.VOIR");
	const canVoirRestaurant = useCan("RESTAURANT.VOIR");
	const canVoirPressing = useCan("PRESSING.VOIR");
	const canVoirResidence = useCan("RESIDENCE.VOIR");
	const canVoirMarchandise = useCan("MARCHANDISE.VOIR");
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
	const demandesBoutiqueEnAttente =
		useVentesEnAttenteCount(canVoirMarchandise).data;
	const portailResumeQuery = usePortailResume(estResident);
	const totalImpayes = portailResumeQuery.data?.total_impayes;
	// Panier localStorage — lecture locale seule, sûr pour tout compte ; la
	// pastille n'est rendue que sur l'entrée « Panier » du bloc résident.
	const nombreArticlesPanier = useNombreArticlesPaniers();
	const accessibleModules = getAccessibleModules(permissions);
	// `/home` ne présente à un résident « pur » qu'une tuile réduite de « Mon
	// espace résident » — doublon du portail complet, qui est déjà la
	// première entrée de `RESIDENT_NAV`. Le lien « Accueil » reste affiché
	// pour les comptes hybrides (modules métier ou RAPPORTS.VOIR) : `/home`
	// leur liste encore des pages hors portail.
	const afficherAccueil =
		!estResident || canVoirRapports || accessibleModules.length > 0;
	const { pathname, search } = useLocation();
	const activeModule = (search as { module?: string } | undefined)?.module;

	// Un seul menu ouvert à la fois ; le menu actif de l'URL est ouvert par
	// défaut (auto-ouverture du parent quand on arrive sur un sous-menu). Les
	// routes métier construites (ex. /residence/*) ouvrent leur module.
	const moduleDeLaRoute = (chemin: string): string | null => {
		if (chemin.startsWith("/dashboard")) return null; // Pas de module, lien top-level
		if (chemin.startsWith("/signalements")) return null; // Pas de module, lien top-level
		// `/residence/portail/*` appartient aux groupes accordéon du portail
		// résident, pas au module métier RESIDENCE (comptes hybrides).
		if (chemin.startsWith("/residence/portail")) return null;
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
	// Groupe accordéon du portail résident contenant la route courante
	// (ex. `/residence/portail/caution` → « Ma résidence »).
	const groupePortailDeLaRoute = (chemin: string): string | null =>
		groupeDeLaRoute(RESIDENT_NAV, chemin);

	const [openModule, setOpenModule] = useState<string | null>(
		activeModule ?? moduleDeLaRoute(pathname),
	);

	const toggleModule = (code: string) =>
		setOpenModule((current) => (current === code ? null : code));

	// Les groupes du portail résident (NavGroupes) peuvent être déroulés
	// plusieurs à la fois — état séparé de `openModule` (modules staff, qui
	// restent un seul ouvert à la fois).
	const [ouvertsPortail, setOuvertsPortail] = useState<string[]>(() => {
		const groupe = groupePortailDeLaRoute(pathname);
		return groupe ? [groupe] : [];
	});

	const toggleGroupePortail = (code: string) =>
		setOuvertsPortail((current) =>
			current.includes(code)
				? current.filter((c) => c !== code)
				: [...current, code],
		);

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
					{afficherAccueil ? (
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
					) : null}

					{estResident ? (
						<>
							<NavGroupes
								groupes={RESIDENT_NAV}
								ouverts={ouvertsPortail}
								onToggle={toggleGroupePortail}
								badgeCompteur={(item) =>
									item.to === "/residence/portail/panier"
										? nombreArticlesPanier
										: undefined
								}
								onNavigate={onClose}
							/>

							{totalImpayes !== undefined ? (
								<li>
									<div className="mx-1 mt-2 rounded-lg bg-sea-ink/70 px-3 py-2">
										<p className="text-[0.65rem] font-medium uppercase tracking-wide text-gray-400">
											Total impayés
										</p>
										<p className="text-sm font-semibold text-destructive">
											{formatMontantFCFA(totalImpayes)}
										</p>
									</div>
								</li>
							) : null}
						</>
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

					{/* Résidents exclus : ils ont `SIGNALEMENT.VOIR` comme
					    déclarants, mais la page staff `/signalements` (filtres
					    module/statut, actions de traitement réservées à
					    `SIGNALEMENT.MODIFIER`) leur montre les mêmes éléments que
					    « Mes signalements » du bloc portail — doublon. */}
					{canVoirSignalements && !estResident ? (
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
							{/* M10 : module RAPPORTS.VOIR réel, distinct d'ADMIN.VOIR
								    (vérifié en direct 2026-09-27) — accordé aussi aux
								    5 rôles Responsable, pas seulement admin/dirigeant. */}
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
																: module.code === "MARCHANDISE" &&
																		sub.id === "ventes"
																	? demandesBoutiqueEnAttente
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
				<div className="shrink-0 border-t border-palm/40 bg-sea-ink/50 -mx-3 px-3 pt-4 mt-4 rounded-lg">
					<UserMenu
						/* « Mon compte » rejoint « Se déconnecter » dans le menu —
						   même emplacement que dans l'espace client. Le résident
						   va sur son compte portail (`RESIDENT.VOIR` gate la
						   route), les autres comptes sur `/mon-compte`. */
						items={[
							{
								label: "Mon compte",
								to: estResident ? "/residence/portail/compte" : "/mon-compte",
								icon: <UserRound className="size-4" aria-hidden />,
							},
						]}
						avatar={
							<AvatarProfil
								login={user.login}
								className="size-11 bg-gradient-to-br from-lagoon/40 to-lagoon/20 text-sm font-semibold ring-2 ring-lagoon/30 shadow-lg"
							/>
						}
						login={user.login}
						role={user.role}
					/>
				</div>
			) : null}
		</aside>
	);
}
