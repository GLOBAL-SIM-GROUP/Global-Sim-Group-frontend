import { Dialog } from "radix-ui";

import type { Abonnement } from "../models/abonnements";
import { AbonnementForm } from "./abonnement-form";

interface AbonnementFormDialogProps {
	open: boolean;
	/** Abonnement à modifier (mode édition) ; null = création. */
	abonnement: Abonnement | null;
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/**
 * Modale « Nouvel abonnement » ou « Modifier l'abonnement » (M2.4). Le `key`
 * remonte un formulaire neuf à chaque ouverture.
 */
export function AbonnementFormDialog({
	open,
	abonnement,
	onOpenChange,
	onSaved,
}: AbonnementFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{abonnement ? "Modifier l'abonnement" : "Nouvel abonnement"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Souscription d'un abonnement à un service pour un résident.
					</Dialog.Description>
					<div className="mt-4">
						<AbonnementForm
							key={abonnement?.id ?? "create"}
							abonnement={abonnement}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
