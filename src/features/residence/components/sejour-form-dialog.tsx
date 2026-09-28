import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

import type { Sejour } from "../models/sejours";
import { SejourForm } from "./sejour-form";

interface SejourFormDialogProps {
	open: boolean;
	/** Séjour à modifier (mode édition) ; null = création. */
	sejour: Sejour | null;
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
	onOpenChange,
	onSaved,
}: SejourFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>
					{sejour ? "Modifier le séjour" : "Nouvelle nuitée / Nouvelle sieste"}
				</DialogTitle>
				<DialogDescription>
					{sejour
						? "Mettre à jour les informations du séjour."
						: "Enregistrer l'arrivée d'un client pour une nuitée ou une sieste."}
				</DialogDescription>
				<div className="mt-4">
					<SejourForm
						key={sejour?.id ?? "create"}
						sejour={sejour}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
