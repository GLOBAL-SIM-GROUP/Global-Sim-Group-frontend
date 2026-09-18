import { ShoppingCart } from "lucide-react";

import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";

/**
 * Barre de panier flottante, toujours visible pendant le défilement (pas
 * juste une icône en en-tête) : c'est le point qui a le plus d'impact sur la
 * conversion d'après les retours UX des apps de commande en ligne. Pleine
 * largeur en bas d'écran sur mobile (pouce), carte flottante en bas à droite
 * sur desktop.
 *
 * Le paiement en ligne n'existe pas encore côté backend pour un compte
 * CLIENT (cf. mémoire `extension-clients-externes`) : le bouton reste
 * désactivé, pas un appel de soumission simulé.
 */
export function PanierBar({
	nombreArticles,
	total,
}: {
	nombreArticles: number;
	total: number;
}) {
	if (nombreArticles === 0) return null;

	return (
		<div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 backdrop-blur sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-sm sm:rounded-xl sm:border sm:shadow-lg">
			<div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-5">
				<div className="flex items-center gap-2 text-sm font-medium text-foreground">
					<ShoppingCart className="size-5 shrink-0 text-lagoon" aria-hidden />
					<span>
						{nombreArticles} article{nombreArticles > 1 ? "s" : ""} ·{" "}
						{formatMontantFCFA(String(total))}
					</span>
				</div>
				<Button
					type="button"
					size="sm"
					disabled
					title="Le paiement en ligne arrive prochainement"
					className="shrink-0 bg-lagoon text-white disabled:opacity-60"
				>
					Bientôt disponible
				</Button>
			</div>
		</div>
	);
}
