import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";

import { Button } from "#/components/ui/button";
import { useNombreArticlesPaniers } from "#/features/portail/hooks/use-panier-articles";
import { cn } from "#/lib/utils";

/**
 * Icône panier façon `NotificationBell` : bouton-icône avec badge du nombre
 * total d'articles (restaurant + boutique), visible à toutes les tailles
 * d'écran — le libellé texte ne passe que par `aria-label`. Partagée entre
 * la navbar de l'espace client (`to="/espace-client/panier"`) et l'en-tête
 * du shell résident (`to="/residence/portail/panier"`) — le compteur lit le
 * `localStorage` commun, donc le panier suit la personne d'un espace à
 * l'autre.
 */
export function PanierBadgeButton({
	to,
	className,
}: {
	to: string;
	className?: string;
}) {
	const nombre = useNombreArticlesPaniers();
	return (
		<Button
			asChild
			variant="ghost"
			size="icon"
			className={cn("relative", className)}
			title="Panier"
		>
			<Link
				to={to as never}
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
