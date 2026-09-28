import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type { CategorieCharge } from "../models/charges";
import { ChargeForm } from "./charge-form";

interface ChargeFormDialogProps {
	open: boolean;
	/**
	 * Logement fixé (onglet Charges de la fiche logement) ; absent → la page
	 * « Nouvelle charge » propose un sélecteur de logement.
	 */
	logementId?: string;
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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>Ajouter une charge</DialogTitle>
				<DialogDescription>
					Enregistrer une charge (eau, électricité…) pour un logement.
				</DialogDescription>
				<div className="mt-4">
					<ChargeForm
						key={logementId ?? "create"}
						logementIdParDefaut={logementId}
						categories={categories}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
