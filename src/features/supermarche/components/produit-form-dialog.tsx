import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type {
	CategorieProduit,
	Fournisseur,
	Produit,
} from "../models/produits";
import { ProduitForm } from "./produit-form";

interface ProduitFormDialogProps {
	open: boolean;
	/** Produit à modifier (mode édition) ; null = création. */
	produit: Produit | null;
	categories: CategorieProduit[];
	fournisseurs: Fournisseur[];
	/** Code-barres à pré-remplir (création à la volée depuis un scan). */
	codeBarrePrefill?: string;
	onOpenChange: (open: boolean) => void;
	onSaved: (produit: Produit) => void;
}

/**
 * Modale « Ajouter / Modifier un produit » (M3). Le `key` remonte un
 * formulaire neuf à chaque ouverture.
 */
export function ProduitFormDialog({
	open,
	produit,
	categories,
	fournisseurs,
	codeBarrePrefill,
	onOpenChange,
	onSaved,
}: ProduitFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>
					{produit ? "Modifier le produit" : "Ajouter un produit"}
				</DialogTitle>
				<DialogDescription>
					Créer ou modifier un produit avec toutes ses caractéristiques.
				</DialogDescription>
				<div className="mt-4">
					<ProduitForm
						key={produit?.id ?? "create"}
						produit={produit}
						categories={categories}
						fournisseurs={fournisseurs}
						codeBarrePrefill={codeBarrePrefill}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
