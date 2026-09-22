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
import { useState } from "react";

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
	{ id: "accueil", label: "Accueil", icon: Home, to: "/espace-client", exact: true },
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

function ServiceButtons({
	className,
	onNavigate,
}: {
	className?: string;
	onNavigate?: () => void;
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
						className="justify-start gap-2 text-muted-foreground hover:bg-transparent hover:text-foreground"
					>
						<Link
							to={service.to as never}
							onClick={onNavigate}
							activeOptions={{ exact: service.exact }}
							activeProps={{
								className:
									"text-foreground underline decoration-lagoon decoration-2 underline-offset-4",
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
						className="justify-start gap-2 text-muted-foreground disabled:opacity-60"
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
 * sticky avec un bouton par service, PAS la sidebar staff/résident
 * (`Sidebar`) ni un menu « Services » regroupé.
 *
 * Mobile : même motif de bascule (`mobileOpen`/hamburger) que `LandingHeader`,
 * mêmes boutons de service empilés au lieu d'alignés.
 */
export function ClientNavbar() {
	const [mobileOpen, setMobileOpen] = useState(false);

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

				<nav aria-label="Services">
					<ServiceButtons className="hidden items-center gap-1 md:flex" />
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
						className="hover:bg-transparent md:hidden"
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
					"border-t border-border md:hidden",
					mobileOpen ? "block" : "hidden",
				)}
			>
				<div className="space-y-4 px-4 py-4">
					<ServiceButtons
						className="flex flex-col items-stretch gap-1"
						onNavigate={() => setMobileOpen(false)}
					/>

					<div className="flex items-center gap-2 border-t border-border pt-4">
						<AccountMenu variant="navbar" />
					</div>
				</div>
			</div>
		</header>
	);
}
