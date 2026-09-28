import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type { Echeance } from "../models/contrats";
import type { MoyenPaiement } from "../models/moyens-paiement";
import { EncaisserForm } from "./encaisser-form";

interface EncaisserFormDialogProps {
	open: boolean;
	/** Échéance à encaisser ; null = fermé. */
	echeance: Echeance | null;
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Enregistrer un paiement » d'une échéance. Le `key` remonte un
 * formulaire neuf à chaque échéance (montant prérempli recalculé).
 */
export function EncaisserFormDialog({
	open,
	echeance,
	moyens,
	onOpenChange,
	onSaved,
}: EncaisserFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogTitle>Enregistrer un paiement</DialogTitle>
				<DialogDescription>
					{echeance
						? `Échéance ${echeance.mois}/${echeance.annee} — ${echeance.montant} FCFA`
						: "Encaisser le loyer de cette échéance."}
				</DialogDescription>
				<div className="mt-4">
					{echeance ? (
						<EncaisserForm
							key={echeance.id}
							echeance={echeance}
							moyens={moyens}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					) : null}
				</div>
			</DialogContent>
		</Dialog>
	);
}
