import { Dialog } from "radix-ui";

import type { MoyenPaiement } from "#/features/residence/models/moyens-paiement";

import type { Produit } from "../models/produits";
import { VenteForm } from "./vente-form";

interface VenteFormDialogProps {
	open: boolean;
	produits: Produit[];
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/** Modale « Nouvelle vente — Market » (M3). */
export function VenteFormDialog({
	open,
	produits,
	moyens,
	onOpenChange,
	onSaved,
}: VenteFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Nouvelle vente — Market
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Sélectionnez les produits, les quantités et le moyen de paiement.
					</Dialog.Description>
					<div className="mt-4">
						<VenteForm
							produits={produits}
							moyens={moyens}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
