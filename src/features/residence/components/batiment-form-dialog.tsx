import { Dialog } from "radix-ui";

import type { Batiment } from "../models/batiments";
import { BatimentForm } from "./batiment-form";

interface BuildingFormDialogProps {
	open: boolean;
	/** Bâtiment à modifier (mode édition) ; null = création. */
	batiment: Batiment | null;
	/** Fermeture (overlay, Échap, Annuler). */
	onOpenChange: (open: boolean) => void;
	/** Appelé après un enregistrement réussi (ferme la modale côté page). */
	onSaved: () => void;
}

/**
 * Modale « Ajouter / Modifier un bâtiment » (M2.1). Wrapper radix Dialog
 * (déjà installé) autour de `BatimentForm` — s'ouvre au-dessus de la liste,
 * pas de route dédiée. Le `key` remonte un formulaire neuf à chaque ouverture
 * (état frais, valeurs par défaut recalculées depuis le bâtiment éventuel).
 */
export function BuildingFormDialog({
	open,
	batiment,
	onOpenChange,
	onSaved,
}: BuildingFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{batiment ? "Modifier un bâtiment" : "Ajouter un bâtiment"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Permet de créer un nouveau bâtiment ou de modifier les informations
						d'un bâtiment existant.
					</Dialog.Description>
					<div className="mt-4">
						<BatimentForm
							key={batiment?.id ?? "create"}
							batiment={batiment}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
