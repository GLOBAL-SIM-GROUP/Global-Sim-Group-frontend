import { Dialog } from "radix-ui";

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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter un mouvement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Entrée, sortie ou ajustement de stock pour un produit.
					</Dialog.Description>
					<div className="mt-4">
						<MouvementForm
							produits={produits}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
