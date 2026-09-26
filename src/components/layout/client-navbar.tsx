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

/** Libellé qui « pousse » au survol ou quand la page est active : TanStack
 *  Link pose `data-status="active"` sur l'ancre (qui porte aussi `group`),
 *  le span s'ouvre alors en largeur animée — effet « liquide » — et reste
 *  replié sinon, la navbar ne montrant que des icônes.
 *  `grid-template-columns 0fr→1fr` suit la vraie largeur du texte (contrairement
 *  à max-w) → ouverture ET fermeture progressivement fluides. */
const LIBELLE_LIQUIDE = cn(
	"grid overflow-hidden [grid-template-columns:0fr] opacity-0",
	"motion-safe:transition-all motion-safe:duration-500 motion-safe:ease-out",
	// Entrée plus vive que la sortie + maintien ~1 s avant repli au départ
	// du curseur (délai asymétrique).
	"group-hover:motion-safe:duration-300 motion-safe:delay-1000 group-hover:motion-safe:delay-0",
	"group-hover:[grid-template-columns:1fr] group-hover:opacity-100",
	"group-data-[status=active]:[grid-template-columns:1fr] group-data-[status=active]:opacity-100",
);

function ServiceButtons({
	className,
	onNavigate,
	labelsAlwaysVisible = false,
}: {
	className?: string;
	onNavigate?: () => void;
	/** `true` (menu mobile vertical) → libellés toujours affichés ; sinon la
	 *  navbar n'affiche que les icônes et le libellé se déploie au survol ou
	 *  sur l'entrée active (animation liquide). */
	labelsAlwaysVisible?: boolean;
}) {
	const libelle = labelsAlwaysVisible ? undefined : LIBELLE_LIQUIDE;
	return (
		<div className={className}>
			{SERVICES.map((service) =>
				service.to ? (
					<Button
						key={service.id}
						asChild
						variant="ghost"
						size="sm"
						className="group justify-start gap-2 text-muted-foreground transition-colors hover:bg-transparent hover:text-foreground"
					>
						<Link
							to={service.to as never}
							onClick={onNavigate}
							aria-label={service.label}
							activeOptions={{ exact: service.exact }}
							activeProps={{
								className: "text-foreground",
							}}
						>
							<service.icon
								className="size-4 shrink-0 text-lagoon"
								aria-hidden
							/>
							<span className={libelle}>
								<span className="block min-w-0 overflow-hidden whitespace-nowrap">
									{service.label}
								</span>
							</span>
						</Link>
					</Button>
				) : (
					<Button
						key={service.id}
						type="button"
						variant="ghost"
						size="sm"
						disabled
						aria-label={service.label}
						className="justify-start gap-2 text-muted-foreground disabled:opacity-60"
					>
						<service.icon className="size-4 shrink-0 text-lagoon" aria-hidden />
						<span className={libelle}>
							<span className="block min-w-0 overflow-hidden whitespace-nowrap">
								{service.label}
							</span>
						</span>
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
 * sticky avec une ICÔNE par service, PAS la sidebar staff/résident
 * (`Sidebar`) ni un menu « Services » regroupé. Le libellé se déploie en
 * largeur animée (« liquide ») au survol et sur l'entrée de la page
 * courante — sinon les 8 entrées ne tiendraient pas dans la navbar.
 *
 * Mobile : même motif de bascule (`mobileOpen`/hamburger) que `LandingHeader`,
 * mêmes entrées empilées avec libellés toujours visibles.
 */
/**
 * Spot « torche » UNIQUE qui glisse vers l'entrée active : barre néon au
 * bord haut + cône descendant, positionné en `left`/`width` mesurés sur
 * l'ancre `data-status="active"` (le `ResizeObserver` suit aussi le
 * déploiement du libellé qui élargit la pilule). Une seule instance →
 * la transition `left`/`width` produit le glissement au lieu d'un
 * fade sortie/entrée.
 */
function TorchSpot({ navRef }: { navRef: RefObject<HTMLElement | null> }) {
	const [spot, setSpot] = useState({ left: 0, width: 0, visible: false });

	useEffect(() => {
		const nav = navRef.current;
		if (!nav) return;
		const mesurer = () => {
			const actif = nav.querySelector<HTMLElement>('a[data-status="active"]');
			setSpot((prev) =>
				actif
					? { left: actif.offsetLeft, width: actif.offsetWidth, visible: true }
					: { ...prev, visible: false },
			);
		};
		mesurer();
		const ancres = [...nav.querySelectorAll("a")];
		// `data-status` change quand la navigation bascule l'entrée active ;
		// le ResizeObserver suit le libellé qui élargit la pilule active.
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
				"pointer-events-none absolute -top-4 left-0 hidden flex-col items-center lg:flex",
				"motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out",
				spot.visible ? "opacity-100" : "opacity-0",
			)}
			style={{ left: spot.left, width: spot.width }}
		>
			<span className="nav-torch-bar" />
			<span className="nav-torch-beam" />
		</div>
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
					<span className="hidden text-lg font-bold text-foreground sm:inline">
						GLOBAL SIM GROUP
					</span>
				</Link>

				{/* Pas d'overflow-x-auto ici : il clipperait verticalement le
				    spot « torche » dépassant au-dessus des boutons. */}
				<nav
					ref={navRef}
					aria-label="Services"
					className="relative hidden min-w-0 lg:block"
				>
					<ServiceButtons className="flex items-center gap-1" />
					<TorchSpot navRef={navRef} />
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
						className="hover:bg-transparent lg:hidden"
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
					"border-t border-border lg:hidden",
					mobileOpen ? "block" : "hidden",
				)}
			>
				<div className="space-y-4 px-4 py-4">
					<ServiceButtons
						className="flex flex-col items-stretch gap-1"
						onNavigate={() => setMobileOpen(false)}
						labelsAlwaysVisible
					/>

					<div className="flex items-center gap-2 border-t border-border pt-4">
						<AccountMenu variant="navbar" />
					</div>
				</div>
			</div>
		</header>
	);
}
