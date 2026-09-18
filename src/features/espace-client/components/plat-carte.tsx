import { Minus, Plus, ShoppingCart } from "lucide-react";

import { Button } from "#/components/ui/button";
import { formatMontantFCFA } from "#/features/residence/models/format";
import type { Plat } from "#/features/restaurant/models/plats";

export function PlatCarte({
	plat,
	imageUrl,
	quantiteAuPanier,
	onAjouter,
	onRetirer,
}: {
	plat: Plat;
	imageUrl: string | null;
	quantiteAuPanier: number;
	onAjouter: () => void;
	onRetirer: () => void;
}) {
	return (
		<article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
			{/* Image en carré (plus présente qu'un format 4/3) ; le bouton flotte
			    et déborde sur son bord bas pour réduire la bande de contenu qui la
			    suit, plutôt qu'un bouton texte dedans. */}
			<div className="relative aspect-square w-full bg-muted">
				{imageUrl ? (
					<img
						src={imageUrl}
						alt={plat.nom}
						className="size-full object-cover"
					/>
				) : (
					<div className="flex size-full items-center justify-center text-xs text-muted-foreground">
						Pas de photo
					</div>
				)}

				<div className="absolute -bottom-4 right-3 z-10">
					{quantiteAuPanier === 0 ? (
						<Button
							type="button"
							size="icon"
							aria-label={`Ajouter ${plat.nom} au panier`}
							className="size-10 rounded-full bg-lagoon text-white shadow-lg hover:bg-lagoon/90"
							onClick={onAjouter}
						>
							<ShoppingCart className="size-5" aria-hidden />
						</Button>
					) : (
						<div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-lg">
							<Button
								type="button"
								size="icon-xs"
								variant="ghost"
								aria-label={`Retirer un ${plat.nom} du panier`}
								onClick={onRetirer}
							>
								<Minus className="size-3.5" aria-hidden />
							</Button>
							<span className="min-w-5 text-center text-xs font-semibold text-foreground">
								{quantiteAuPanier}
							</span>
							<Button
								type="button"
								size="icon-xs"
								className="rounded-full bg-lagoon text-white hover:bg-lagoon/90"
								aria-label={`Ajouter un ${plat.nom} de plus au panier`}
								onClick={onAjouter}
							>
								<Plus className="size-3.5" aria-hidden />
							</Button>
						</div>
					)}
				</div>
			</div>

			<div className="space-y-1 px-4 pt-5 pb-4">
				<div className="flex items-start justify-between gap-2">
					<h3 className="font-semibold text-foreground">{plat.nom}</h3>
					<span className="shrink-0 font-semibold text-lagoon">
						{formatMontantFCFA(plat.prix)}
					</span>
				</div>
				{plat.description ? (
					<p className="line-clamp-2 text-sm text-muted-foreground">
						{plat.description}
					</p>
				) : null}
			</div>
		</article>
	);
}
