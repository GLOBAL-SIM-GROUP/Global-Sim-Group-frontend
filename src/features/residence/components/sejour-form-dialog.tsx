import { Dialog } from "radix-ui";
import type { MoyenPaiement } from "../models/moyens-paiement";
import type { Sejour } from "../models/sejours";
import { SejourForm } from "./sejour-form";

interface SejourFormDialogProps {
	open: boolean;
	/** Séjour à modifier (mode édition) ; null = création. */
	sejour: Sejour | null;
	/** Moyens de paiement (module Finances) pour le paiement initial. */
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Nouvelle nuitée / Nouvelle sieste » ou « Modifier le séjour ».
 * Le `key` remonte un formulaire neuf à chaque ouverture.
 */
export function SejourFormDialog({
	open,
	sejour,
	moyens,
	onOpenChange,
	onSaved,
}: SejourFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{sejour
							? "Modifier le séjour"
							: "Nouvelle nuitée / Nouvelle sieste"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{sejour
							? "Mettre à jour les informations du séjour."
							: "Enregistrer l'arrivée d'un client pour une nuitée ou une sieste."}
					</Dialog.Description>
					<div className="mt-4">
						<SejourForm
							key={sejour?.id ?? "create"}
							sejour={sejour}
							moyens={moyens}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
