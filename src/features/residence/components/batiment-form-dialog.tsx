import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>
					{batiment ? "Modifier un bâtiment" : "Ajouter un bâtiment"}
				</DialogTitle>
				<DialogDescription>
					Permet de créer un nouveau bâtiment ou de modifier les informations
					d'un bâtiment existant.
				</DialogDescription>
				<div className="mt-4">
					<BatimentForm
						key={batiment?.id ?? "create"}
						batiment={batiment}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
