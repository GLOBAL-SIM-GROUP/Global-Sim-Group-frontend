import { Dialog } from "radix-ui";

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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Enregistrer un paiement
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{echeance
							? `Échéance ${echeance.mois}/${echeance.annee} — ${echeance.montant} FCFA`
							: "Encaisser le loyer de cette échéance."}
					</Dialog.Description>
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
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
