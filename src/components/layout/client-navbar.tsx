import { Link } from "@tanstack/react-router";
import {
	BedDouble,
	ClipboardList,
	ConciergeBell,
	Flag,
	Home,
	ListChecks,
	type LucideIcon,
	Menu,
	PartyPopper,
	ReceiptText,
	Shirt,
	ShoppingBag,
	ShoppingCart,
	Tickets,
	UserRound,
	UtensilsCrossed,
	X,
} from "lucide-react";
import { useState } from "react";

import { AvatarProfil } from "#/components/avatar-profil";
import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";
import { useNombreArticlesPaniers } from "#/features/portail/hooks/use-panier-articles";
import { cn } from "#/lib/utils";

import { NotificationBell } from "./notification-bell";
import { PanierBadgeButton } from "./panier-badge-button";
import { UserMenu } from "./user-menu";

/**
 * Navigation de l'espace client : accueil, cinq services et « Mes demandes »,
 * tous routés (cf. `sidebar.tsx`/`en-cours.tsx` pour l'équivalent staff, non
 * réutilisable ici puisqu'il mène dans le layout `_authenticated`, pas
 * l'espace client).
 */
interface ServiceNavItem {
	id: string;
	label: string;
	icon: LucideIcon;
	to?: string;
	/** `true` → actif uniquement sur le chemin exact (accueil : `/espace-client`
	 *  préfixe toutes les sous-pages et resterait actif partout sinon). */
	exact?: boolean;
	/** `true` → affiché uniquement dans la sidebar desktop (le mobile y accède
	 *  via la tab bar ou la navbar — ex. le Panier). */
	sidebarOnly?: boolean;
}

/** Navigation de l'espace client regroupée par domaine — même mécanique
 *  d'accordéon que `RESIDENT_NAV` dans `sidebar.tsx` : « Services » réunit
 *  les prestations réservables, « Mon suivi » les demandes, documents et
 *  signalements. `code: null` = entrée plane hors accordéon (Accueil). */
export const SERVICES_GROUPES: readonly {
	code: string | null;
	label: string;
	icon: LucideIcon;
	items: readonly ServiceNavItem[];
}[] = [
	{
		code: null,
		label: "",
		icon: Home,
		items: [
			{
				id: "accueil",
				label: "Accueil",
				icon: Home,
				to: "/espace-client",
				exact: true,
			},
		],
	},
	{
		code: "SERVICES",
		label: "Services",
		icon: ConciergeBell,
		items: [
			{
				id: "restaurant",
				label: "Restaurant",
				icon: UtensilsCrossed,
				to: "/espace-client/restaurant",
			},
			{
				id: "boutique",
				label: "Boutique",
				icon: ShoppingBag,
				to: "/espace-client/boutique",
			},
			{
				id: "pressing",
				label: "Pressing",
				icon: Shirt,
				to: "/espace-client/pressing",
			},
			{
				id: "salle-fete",
				label: "Salle de fête",
				icon: PartyPopper,
				to: "/espace-client/salle-fete",
			},
			{
				id: "residence",
				label: "Résidence",
				icon: BedDouble,
				to: "/espace-client/residence",
			},
			{
				id: "abonnements",
				label: "Abonnements",
				icon: Tickets,
				to: "/espace-client/abonnements",
			},
		],
	},
	{
		code: "SUIVI",
		label: "Mon suivi",
		icon: ListChecks,
		items: [
			{
				id: "mes-demandes",
				label: "Mes demandes",
				icon: ClipboardList,
				to: "/espace-client/mes-demandes",
			},
			{
				id: "panier",
				label: "Panier",
				icon: ShoppingCart,
				to: "/espace-client/panier",
				sidebarOnly: true,
			},
			{
				id: "factures",
				label: "Mes factures",
				icon: ReceiptText,
				to: "/espace-client/factures",
			},
			{
				id: "signalement",
				label: "Signaler un problème",
				icon: Flag,
				to: "/espace-client/signalement",
			},
		],
	},
];

/** Entrées de navigation de l'espace client — source unique partagée par
 *  `ClientSidebar` (desktop), le menu hamburger (tablette) et
 *  `MobileTabBar` (téléphone). Liste plane dérivée de `SERVICES_GROUPES` :
 *  le menu hamburger reste non groupé et exclut les entrées `sidebarOnly`. */
export const SERVICES: readonly ServiceNavItem[] = SERVICES_GROUPES.flatMap(
	(groupe) => groupe.items,
).filter((item) => !item.sidebarOnly);

function ServiceButtons({
	className,
	onNavigate,
	underlineActive = false,
}: {
	className?: string;
	onNavigate?: () => void;
	/** `true` (menu mobile vertical, sans barre glissante) → l'entrée active
	 *  est soulignée en lagoon sur le lien lui-même. */
	underlineActive?: boolean;
}) {
	return (
		<div className={className}>
			{SERVICES.map((service) =>
				service.to ? (
					<Button
						key={service.id}
						asChild
						variant="ghost"
						size="sm"
						className="justify-start gap-2 whitespace-nowrap text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
					>
						<Link
							to={service.to as never}
							onClick={onNavigate}
							activeOptions={{ exact: service.exact }}
							activeProps={{
								className: underlineActive
									? "text-foreground underline decoration-lagoon decoration-2 underline-offset-4"
									: "text-foreground",
							}}
						>
							<service.icon
								className="size-4 shrink-0 text-lagoon"
								aria-hidden
							/>
							{service.label}
						</Link>
					</Button>
				) : (
					<Button
						key={service.id}
						type="button"
						variant="ghost"
						size="sm"
						disabled
						className="justify-start gap-2 whitespace-nowrap text-muted-foreground disabled:opacity-60"
					>
						<service.icon className="size-4 shrink-0 text-lagoon" aria-hidden />
						{service.label}
					</Button>
				),
			)}
		</div>
	);
}

/** Menu compte partagé entre la navbar mobile (`navbar`) et la sidebar
 *  desktop (`sidebar` — fond sombre `sea-ink`). */
export function AccountMenu({ variant }: { variant: "navbar" | "sidebar" }) {
	const user = useCurrentUser();
	if (!user) return null;
	return (
		<UserMenu
			variant={variant}
			items={[
				{
					label: "Mon compte",
					to: "/espace-client/mon-compte",
					icon: <UserRound className="size-4" aria-hidden />,
				},
			]}
			avatar={
				<AvatarProfil
					login={user.login}
					className="size-9 bg-lagoon/15 text-sm font-semibold"
				/>
			}
			login={user.login}
			role={user.role}
		/>
	);
}

/** Une entrée normale (icône + libellé) de la barre d'onglets mobile. */
function TabBarLink({
	to,
	icon: Icon,
	label,
	exact,
	badge,
}: {
	to: string;
	icon: LucideIcon;
	label: string;
	exact?: boolean;
	badge?: number;
}) {
	return (
		<Link
			to={to as never}
			activeOptions={{ exact }}
			className="relative flex flex-1 flex-col items-center gap-1 py-1.5 text-muted-foreground"
			activeProps={{ className: "text-lagoon" }}
		>
			<Icon className="size-5" aria-hidden />
			<span className="text-[0.65rem] font-semibold">{label}</span>
			{badge && badge > 0 ? (
				<span
					aria-hidden
					className="absolute top-0 right-[calc(50%-18px)] flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-lagoon px-0.5 text-[0.55rem] font-bold text-white"
				>
					{badge > 99 ? "99+" : badge}
				</span>
			) : null}
		</Link>
	);
}

/**
 * Barre d'onglets basse (téléphone uniquement, `sm:hidden`) : pattern des
 * apps mobiles modernes (Accueil / Mes demandes / geste central mis en avant
 * / Panier / Compte) — remplace le seul menu hamburger comme accès principal
 * sur petit écran. `PanierBar` (barre panier flottante des pages
 * Restaurant/Boutique) se positionne au-dessus (`bottom-16`) pour ne pas se
 * superposer.
 */
export function MobileTabBar() {
	const nombreArticles = useNombreArticlesPaniers();

	return (
		<nav
			aria-label="Navigation principale"
			className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-border bg-card/95 px-1 backdrop-blur sm:hidden"
		>
			<TabBarLink to="/espace-client" icon={Home} label="Accueil" exact />
			<TabBarLink
				to="/espace-client/mes-demandes"
				icon={ClipboardList}
				label="Demandes"
			/>
			<div className="relative flex flex-1 justify-center">
				<Link
					to="/espace-client/restaurant"
					aria-label="Commander"
					className="absolute -top-6 grid size-14 place-items-center rounded-full bg-lagoon text-white shadow-lg shadow-lagoon/40 transition-transform active:scale-95"
				>
					<UtensilsCrossed className="size-6" aria-hidden />
				</Link>
				<span className="mt-auto pb-1.5 text-[0.65rem] font-semibold text-muted-foreground">
					Commander
				</span>
			</div>
			<TabBarLink
				to="/espace-client/panier"
				icon={ShoppingCart}
				label="Panier"
				badge={nombreArticles}
			/>
			<TabBarLink
				to="/espace-client/mon-compte"
				icon={UserRound}
				label="Compte"
			/>
		</nav>
	);
}

/**
 * Header mobile/tablette de l'espace client (`lg:hidden`) : logo + actions
 * (cloche, panier, compte) + hamburger qui déplie les `SERVICES` en
 * empilement vertical. Sur desktop (`lg+`), `ClientSidebar` prend le relais
 * — ce header ne sert alors plus à la navigation, la sidebar porte tout.
 */
export function ClientNavbar() {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur lg:hidden">
			<div className="flex h-16 w-full items-center justify-between gap-4 px-6">
				<Link to="/" className="flex shrink-0 items-center gap-2">
					<img
						src="/logo.png"
						alt="GLOBAL SIM GROUP"
						className="h-9 w-auto object-contain"
					/>
					<span className="hidden text-lg font-bold text-foreground sm:inline">
						GLOBAL SIM GROUP
					</span>
				</Link>

				<div className="flex shrink-0 items-center gap-2">
					<NotificationBell />
					<PanierBadgeButton
						to="/espace-client/panier"
						className="hover:bg-transparent"
					/>
					<div className="hidden md:flex">
						<AccountMenu variant="navbar" />
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						className="hover:bg-transparent"
						aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
						aria-expanded={mobileOpen}
						onClick={() => setMobileOpen((current) => !current)}
					>
						{mobileOpen ? (
							<X className="size-5" aria-hidden />
						) : (
							<Menu className="size-5" aria-hidden />
						)}
					</Button>
				</div>
			</div>

			<div
				className={cn(
					"border-t border-border",
					mobileOpen ? "block" : "hidden",
				)}
			>
				<div className="space-y-4 px-6 py-4">
					<ServiceButtons
						className="flex flex-col items-stretch gap-1"
						onNavigate={() => setMobileOpen(false)}
						underlineActive
					/>

					<div className="flex items-center gap-2 border-t border-border pt-4">
						<AccountMenu variant="navbar" />
					</div>
				</div>
			</div>
		</header>
	);
}
