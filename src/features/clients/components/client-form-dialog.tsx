import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>{titre}</DialogTitle>
				<DialogDescription>{description}</DialogDescription>
				<div className="mt-4">
					<ClientForm
						client={client}
						typeClientCree={typeClientCree}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
