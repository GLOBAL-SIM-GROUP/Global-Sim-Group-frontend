import { Badge } from "#/components/ui/badge";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import { EmptyState } from "#/components/ui/empty-state";

import { useStockAlerte } from "../hooks/use-mouvements";

interface AlerteStockDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

/**
 * Modale « Alerte stock » (M3) : liste des produits sous le seuil, chargée par
 * `GET /market/stock/alerte`.
 */
export function AlerteStockDialog({
	open,
	onOpenChange,
}: AlerteStockDialogProps) {
	const alerteQuery = useStockAlerte();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
				<DialogTitle>Alerte stock</DialogTitle>
				<DialogDescription>
					Produits dont le stock est sous le seuil d'alerte.
				</DialogDescription>

				<div className="mt-4">
					{alerteQuery.isLoading ? (
						<p className="text-sm text-muted-foreground">Chargement…</p>
					) : alerteQuery.isError ? (
						<p role="alert" className="text-sm text-destructive">
							Impossible de charger les alertes.
						</p>
					) : (alerteQuery.data ?? []).length === 0 ? (
						<EmptyState title="Aucun produit en alerte." />
					) : (
						<ul className="divide-y divide-border rounded-md border border-border">
							{(alerteQuery.data ?? []).map((produit) => (
								<li
									key={produit.reference}
									className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
								>
									<div>
										<p className="font-medium text-foreground">{produit.nom}</p>
										<p className="text-xs text-muted-foreground">
											{produit.reference}
										</p>
									</div>
									<Badge
										variant={
											Number(produit.quantite_stock) <= 0 ? "danger" : "warning"
										}
									>
										{produit.niveau}
									</Badge>
								</li>
							))}
						</ul>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
