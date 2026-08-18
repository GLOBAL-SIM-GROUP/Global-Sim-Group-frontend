import { Dialog } from "radix-ui";

import type { CategorieCharge } from "../models/charges";
import { ChargeForm } from "./charge-form";

interface ChargeFormDialogProps {
	open: boolean;
	logementId: string;
	/** Catégories disponibles (déjà chargées par la page). */
	categories: CategorieCharge[];
	/** Fermeture (overlay, Échap, Annuler). */
	onOpenChange: (open: boolean) => void;
	/** Appelé après un enregistrement réussi (ferme la modale côté page). */
	onSaved: () => void;
}

/**
 * Modale « Ajouter une charge » (M2.2). Wrapper radix Dialog autour de
 * `ChargeForm`. Le `key` remonte un formulaire neuf à chaque ouverture.
 */
export function ChargeFormDialog({
	open,
	logementId,
	categories,
	onOpenChange,
	onSaved,
}: ChargeFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Ajouter une charge
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Enregistrer une charge (eau, électricité…) pour ce logement.
					</Dialog.Description>
					<div className="mt-4">
						<ChargeForm
							key={logementId}
							logementId={logementId}
							categories={categories}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
