import { Link } from "@tanstack/react-router";
import {
	BedDouble,
	ClipboardList,
	Flag,
	Home,
	type LucideIcon,
	Menu,
	PartyPopper,
	Shirt,
	ShoppingBag,
	ShoppingCart,
	Tickets,
	UserRound,
	UtensilsCrossed,
	X,
} from "lucide-react";
import { type RefObject, useEffect, useRef, useState } from "react";

import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";
import { useNombreArticlesPaniers } from "#/features/espace-client/hooks/use-panier-articles";
import { cn } from "#/lib/utils";

import { NotificationBell } from "./notification-bell";
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
}

const SERVICES: readonly ServiceNavItem[] = [
	{
		id: "accueil",
		label: "Accueil",
		icon: Home,
		to: "/espace-client",
		exact: true,
	},
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
	{
		id: "mes-demandes",
		label: "Mes demandes",
		icon: ClipboardList,
		to: "/espace-client/mes-demandes",
	},
];

/** Initiales de l'utilisateur pour l'avatar (même logique que `sidebar.tsx`,
    dupliquée ici plutôt que partagée — trop petit pour justifier un utilitaire
    commun entre les deux layouts, volontairement indépendants). */
function initialsOf(login: string): string {
	return login
		.split(/[\s._-]+/)
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join("");
}

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

/**
 * Icône panier façon `NotificationBell` : bouton-icône avec badge du nombre
 * total d'articles (restaurant + boutique), visible à toutes les tailles
 * d'écran — le libellé texte ne passe que par `aria-label`.
 */
function PanierButton() {
	const nombre = useNombreArticlesPaniers();
	return (
		<Button
			asChild
			variant="ghost"
			size="icon"
			className="relative hover:bg-transparent"
			title="Panier"
		>
			<Link
				to="/espace-client/panier"
				aria-label={nombre > 0 ? `Panier, ${nombre} article(s)` : "Panier"}
				activeProps={{ className: "text-lagoon" }}
			>
				<ShoppingCart aria-hidden />
				{nombre > 0 ? (
					<span
						aria-hidden
						className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-lagoon px-0.5 text-[0.6rem] font-semibold text-white"
					>
						{nombre > 99 ? "99+" : nombre}
					</span>
				) : null}
			</Link>
		</Button>
	);
}

function AccountMenu({ variant }: { variant: "navbar" | "sidebar" }) {
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
				{
					label: "Signaler un problème",
					to: "/espace-client/signalement",
					icon: <Flag className="size-4" aria-hidden />,
				},
			]}
			avatar={
				<div
					aria-hidden
					className="grid size-9 shrink-0 place-items-center rounded-full bg-lagoon/15 text-sm font-semibold text-lagoon"
				>
					{initialsOf(user.login)}
				</div>
			}
			login={user.login}
			role={user.role}
		/>
	);
}

/**
 * Navigation horizontale de l'espace client (comptes rôle CLIENT) : navbar
 * sticky avec une entrée LIBELLÉE par service, PAS la sidebar staff/résident
 * (`Sidebar`) ni un menu « Services » regroupé. L'entrée de la page courante
 * est marquée par une barre lagoon qui GLISSE vers elle (`IndicateurGlissant`,
 * une seule instance animée en `left`/`width` au lieu d'un soulignement
 * fade sortie/entrée par lien).
 *
 * La rangée libellée ne tient qu'à partir de `xl` (~1280 px) : en dessous le
 * hamburger reprend le relais (même motif `mobileOpen` que `LandingHeader`,
 * entrées empilées ; l'actif y est souligné faute de barre glissante).
 */

/**
 * Barre de soulignement UNIQUE qui glisse vers l'entrée active : position
 * `left`/`width` mesurée sur l'ancre `data-status="active"`, transitionnée —
 * la barre se déplace d'un item à l'autre au lieu de réapparaître.
 * `MutationObserver` sur `data-status` suit le changement de page ;
 * `ResizeObserver` suit les variations de largeur (polices, redimension).
 */
function IndicateurGlissant({
	navRef,
}: {
	navRef: RefObject<HTMLElement | null>;
}) {
	const [pos, setPos] = useState({ left: 0, width: 0, visible: false });

	useEffect(() => {
		const nav = navRef.current;
		if (!nav) return;
		const mesurer = () => {
			const actif = nav.querySelector<HTMLElement>('a[data-status="active"]');
			setPos((prev) =>
				actif
					? { left: actif.offsetLeft, width: actif.offsetWidth, visible: true }
					: { ...prev, visible: false },
			);
		};
		mesurer();
		const ancres = [...nav.querySelectorAll("a")];
		const mo = new MutationObserver(mesurer);
		for (const a of ancres)
			mo.observe(a, { attributes: true, attributeFilter: ["data-status"] });
		const ro =
			typeof ResizeObserver === "undefined"
				? null
				: new ResizeObserver(mesurer);
		ro?.observe(nav);
		for (const a of ancres) ro?.observe(a);
		return () => {
			mo.disconnect();
			ro?.disconnect();
		};
	}, [navRef]);

	return (
		<div
			aria-hidden
			className={cn(
				"pointer-events-none absolute bottom-0 left-0 h-0.5 rounded-full bg-lagoon",
				"motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
				pos.visible ? "opacity-100" : "opacity-0",
			)}
			style={{ left: pos.left, width: pos.width }}
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

export function ClientNavbar() {
	const [mobileOpen, setMobileOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
				<Link to="/" className="flex shrink-0 items-center gap-2">
					<img
						src="/logo.png"
						alt="GLOBAL SIM GROUP"
						className="h-9 w-auto object-contain"
					/>
					{/* Texte de marque masqué à partir de `xl` : la rangée des 8
					    entrées libellées a besoin de toute la largeur du conteneur
					    `max-w-7xl` ; le logo seul suffit (le nom reste visible en
					    mobile/tablette où le menu passe par le hamburger). */}
					<span className="hidden text-lg font-bold text-foreground sm:inline xl:hidden">
						GLOBAL SIM GROUP
					</span>
				</Link>

				{/* Filet de sécurité `overflow-x-auto` (scrollbar masquée) : les 8
				    entrées libellées (~950 px) peuvent être légèrement justes à
				    1280 px une fois logo et actions déduits. */}
				<nav
					ref={navRef}
					aria-label="Services"
					className="relative hidden min-w-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:block"
				>
					<ServiceButtons className="flex items-center gap-1" />
					<IndicateurGlissant navRef={navRef} />
				</nav>

				<div className="flex shrink-0 items-center gap-2">
					<NotificationBell />
					<PanierButton />
					<div className="hidden md:flex">
						<AccountMenu variant="navbar" />
					</div>
					<Button
						variant="ghost"
						size="icon-sm"
						className="hover:bg-transparent xl:hidden"
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
					"border-t border-border xl:hidden",
					mobileOpen ? "block" : "hidden",
				)}
			>
				<div className="space-y-4 px-4 py-4">
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
