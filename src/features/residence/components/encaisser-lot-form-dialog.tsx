import { Dialog } from "radix-ui";

import type { Echeance } from "../models/contrats";
import type { MoyenPaiement } from "../models/moyens-paiement";
import { EncaisserLotForm } from "./encaisser-lot-form";

interface EncaisserLotFormDialogProps {
	open: boolean;
	idContrat: string;
	echeances: Echeance[];
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
	moyens,
	onOpenChange,
	onSaved,
}: EncaisserLotFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Encaissement en lot
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Paye un montant unique, réparti automatiquement sur les échéances
						impayées les plus anciennes.
					</Dialog.Description>
					<div className="mt-4">
						{open ? (
							<EncaisserLotForm
								idContrat={idContrat}
								echeances={echeances}
								moyens={moyens}
								onCancel={() => onOpenChange(false)}
								onSaved={onSaved}
							/>
						) : null}
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
