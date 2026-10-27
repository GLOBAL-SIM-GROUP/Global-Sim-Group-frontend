import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>Nouvelle vente — Market</DialogTitle>
				<DialogDescription>
					Sélectionnez les produits, les quantités et le moyen de paiement.
				</DialogDescription>
				<div className="mt-4">
					<VenteForm
						produits={produits}
						moyens={moyens}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
