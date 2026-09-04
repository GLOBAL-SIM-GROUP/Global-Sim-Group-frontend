import { Dialog } from "radix-ui";

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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{produit ? "Modifier le produit" : "Ajouter un produit"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Créer ou modifier un produit avec toutes ses caractéristiques.
					</Dialog.Description>
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
