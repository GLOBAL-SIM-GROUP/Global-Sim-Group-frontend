import { Dialog } from "radix-ui";

import type { Client, TypeClient } from "../models/clients";
import { ClientForm } from "./client-form";

interface ClientFormDialogProps {
	open: boolean;
	client: Client | null;
	/**
	 * Type imposé à la création (« Ajouter un locataire » vs « Ajouter un
	 * client ») : le sélecteur de type est alors masqué, implicite au bouton
	 * cliqué. Ignoré en édition (le type reste modifiable comme avant).
	 */
	typeClientCree?: TypeClient;
	onOpenChange: (open: boolean) => void;
	onSaved: (id?: string, label?: string) => void;
}

/**
 * Modale « Ajouter / Modifier un client » (3.1) : affiche `ClientForm` dans
 * une boîte de dialogue. En création, le type est imposé par le bouton
 * d'origine (`typeClientCree`) plutôt que choisi dans le formulaire.
 */
export function ClientFormDialog({
	open,
	client,
	typeClientCree,
	onOpenChange,
	onSaved,
}: ClientFormDialogProps) {
	const titre = client
		? "Modifier le client"
		: typeClientCree === "LOCATAIRE"
			? "Nouveau locataire"
			: "Nouveau client";
	const description = client
		? "Fiche d'un locataire ou client de passage."
		: typeClientCree === "LOCATAIRE"
			? "Fiche complète d'un résident locataire."
			: "Fiche d'un client de passage.";

	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-2xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{titre}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						{description}
					</Dialog.Description>
					<div className="mt-4">
						<ClientForm
							client={client}
							typeClientCree={typeClientCree}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
