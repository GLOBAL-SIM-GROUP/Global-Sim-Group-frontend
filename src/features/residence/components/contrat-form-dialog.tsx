import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type { ContratCree } from "../api/contrats";
import { ContratForm } from "./contrat-form";

interface ContratFormDialogProps {
	open: boolean;
	/** Fermeture (overlay, Échap, Annuler). */
	onOpenChange: (open: boolean) => void;
	/** Appelé après un enregistrement réussi (ferme la modale côté liste). */
	onSaved: (contrat: ContratCree) => void;
}

/**
 * Modale « Nouveau contrat de location » (M2.2) — au-dessus de la liste des
 * contrats, pas de route dédiée. Formulaire scrollable (7+ champs).
 */
export function ContratFormDialog({
	open,
	onOpenChange,
	onSaved,
}: ContratFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>Nouveau contrat de location</DialogTitle>
				<DialogDescription>
					Crée un contrat pour un locataire existant ou nouveau ; les échéances
					sont générées automatiquement.
				</DialogDescription>
				<div className="mt-4">
					<ContratForm onCancel={() => onOpenChange(false)} onSaved={onSaved} />
				</div>
			</DialogContent>
		</Dialog>
	);
}
