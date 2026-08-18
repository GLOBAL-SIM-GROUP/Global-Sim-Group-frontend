import { Dialog } from "radix-ui";

import { ContratForm } from "./contrat-form";

interface ContratFormDialogProps {
	open: boolean;
	/** Fermeture (overlay, Échap, Annuler). */
	onOpenChange: (open: boolean) => void;
	/** Appelé après un enregistrement réussi (ferme la modale côté liste). */
	onSaved: () => void;
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
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						Nouveau contrat de location
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Crée un contrat pour un locataire existant ou nouveau ; les
						échéances sont générées automatiquement.
					</Dialog.Description>
					<div className="mt-4">
						<ContratForm
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
