import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type { Produit } from "../models/produits";
import { MouvementForm } from "./mouvement-form";

interface MouvementFormDialogProps {
	open: boolean;
	produits: Produit[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/** Modale « Ajouter un mouvement » (M3) de stock. */
export function MouvementFormDialog({
	open,
	produits,
	onOpenChange,
	onSaved,
}: MouvementFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>Ajouter un mouvement</DialogTitle>
				<DialogDescription>
					Entrée, sortie ou ajustement de stock pour un produit.
				</DialogDescription>
				<div className="mt-4">
					<MouvementForm
						produits={produits}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
