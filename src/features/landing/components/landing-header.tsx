import { Link, useNavigate } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "#/components/ui/button";
import { useCurrentUser } from "#/core/auth";
import { cn } from "#/lib/utils";

const NAVIGATION = [
	{ label: "Services", href: "#services" },
	{ label: "La carte", href: "#carte" },
	{ label: "Boutique", href: "#boutique" },
	{ label: "Comment ça marche", href: "#fonctionnement" },
	{ label: "Contact", href: "#contact" },
] as const;

function LiensNavigation({
	className,
	onNavigate,
}: {
	className?: string;
	onNavigate?: () => void;
}) {
	return (
		<nav aria-label="Navigation principale" className={className}>
			{NAVIGATION.map((item) => (
				<a
					key={item.href}
					href={item.href}
					onClick={onNavigate}
					className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
				>
					{item.label}
				</a>
			))}
		</nav>
	);
}

function ActionsAuth({ onNavigate }: { onNavigate?: () => void }) {
	const currentUser = useCurrentUser();
	const navigate = useNavigate();

	if (currentUser) {
		return (
			<Button
				size="sm"
				className="bg-lagoon text-white hover:bg-lagoon/90"
				onClick={() => {
					onNavigate?.();
					void navigate({ to: "/home" });
				}}
			>
				Accéder à mon espace
			</Button>
		);
	}

	return (
		<>
			<Button
				size="sm"
				variant="ghost"
				onClick={() => {
					onNavigate?.();
					void navigate({ to: "/login" });
				}}
			>
				Connexion
			</Button>
			<Button
				size="sm"
				className="bg-lagoon text-white hover:bg-lagoon/90"
				onClick={() => {
					onNavigate?.();
					void navigate({ to: "/inscription" });
				}}
			>
				S'inscrire
			</Button>
		</>
	);
}

/**
 * En-tête public de la landing : sticky, navigation par ancres vers les
 * sections de la page et accès auth. `mounted` évite le flash SSR des
 * boutons d'état de session (le serveur ne connaît pas la session).
 */
export function LandingHeader() {
	const [mounted, setMounted] = useState(false);
	const [menuOuvert, setMenuOuvert] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
			<div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
				<Link to="/" className="flex items-center gap-2">
					<img
						src="/logo.png"
						alt="GLOBAL SIM GROUP"
						className="h-9 w-auto object-contain"
					/>
					<span className="hidden text-lg font-bold text-foreground sm:inline">
						GLOBAL SIM GROUP
					</span>
				</Link>

				<LiensNavigation className="hidden items-center gap-6 md:flex" />

				<div className="hidden items-center gap-2 md:flex">
					{mounted ? <ActionsAuth /> : <div className="h-8 w-28" />}
				</div>

				<Button
					variant="ghost"
					size="icon-sm"
					className="md:hidden"
					aria-label={menuOuvert ? "Fermer le menu" : "Ouvrir le menu"}
					aria-expanded={menuOuvert}
					onClick={() => setMenuOuvert((precedent) => !precedent)}
				>
					{menuOuvert ? (
						<X className="size-5" aria-hidden />
					) : (
						<Menu className="size-5" aria-hidden />
					)}
				</Button>
			</div>

			<div
				className={cn(
					"border-t border-border md:hidden",
					menuOuvert ? "block" : "hidden",
				)}
			>
				<div className="space-y-4 px-4 py-4">
					<LiensNavigation
						className="flex flex-col gap-3"
						onNavigate={() => setMenuOuvert(false)}
					/>
					<div className="flex flex-col gap-2 border-t border-border pt-4">
						{mounted ? (
							<ActionsAuth onNavigate={() => setMenuOuvert(false)} />
						) : null}
					</div>
				</div>
			</div>
		</header>
	);
}
