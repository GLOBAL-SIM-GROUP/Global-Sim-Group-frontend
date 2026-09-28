import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type { Echeance } from "../models/contrats";
import type { MoyenPaiement } from "../models/moyens-paiement";
import { EncaisserLotForm } from "./encaisser-lot-form";

interface EncaisserLotFormDialogProps {
	open: boolean;
	idContrat: string;
	echeances: Echeance[];
	montantMaximum: number;
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Encaissement en lot » : un seul paiement réparti par le serveur
 * sur plusieurs échéances impayées. Complémentaire au paiement par échéance
 * (`EncaisserFormDialog`), pas un remplacement.
 */
export function EncaisserLotFormDialog({
	open,
	idContrat,
	echeances,
	montantMaximum,
	moyens,
	onOpenChange,
	onSaved,
}: EncaisserLotFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-lg overflow-y-auto">
				<DialogTitle>Encaissement en lot</DialogTitle>
				<DialogDescription>
					Paye un montant unique, réparti automatiquement sur les échéances
					impayées les plus anciennes.
				</DialogDescription>
				<div className="mt-4">
					{open ? (
						<EncaisserLotForm
							idContrat={idContrat}
							echeances={echeances}
							montantMaximum={montantMaximum}
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
