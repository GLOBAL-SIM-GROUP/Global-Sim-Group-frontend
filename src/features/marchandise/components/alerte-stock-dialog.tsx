import { Dialog } from "radix-ui";

import { cn } from "#/lib/utils";

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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Alerte stock
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Produits dont le stock est sous le seuil d'alerte.
					</Dialog.Description>

					<div className="mt-4">
						{alerteQuery.isLoading ? (
							<p className="text-sm text-muted-foreground">Chargement…</p>
						) : alerteQuery.isError ? (
							<p role="alert" className="text-sm text-destructive">
								Impossible de charger les alertes.
							</p>
						) : (alerteQuery.data ?? []).length === 0 ? (
							<p className="rounded-lg border border-border p-6 text-center text-sm text-muted-foreground">
								Aucun produit en alerte.
							</p>
						) : (
							<ul className="divide-y divide-border rounded-md border border-border">
								{(alerteQuery.data ?? []).map((produit) => (
									<li
										key={produit.reference}
										className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
									>
										<div>
											<p className="font-medium text-foreground">
												{produit.nom}
											</p>
											<p className="text-xs text-muted-foreground">
												{produit.reference}
											</p>
										</div>
										<span
											className={cn(
												"inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium",
												Number(produit.quantite_stock) <= 0
													? "bg-[#E74C3C] text-white"
													: "bg-[#E67E22] text-white",
											)}
										>
											{produit.niveau}
										</span>
									</li>
								))}
							</ul>
						)}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
