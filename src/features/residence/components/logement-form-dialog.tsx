import { Dialog } from "radix-ui";

import type { Batiment } from "../models/batiments";
import type { Logement } from "../models/logements";
import { LogementForm } from "./logement-form";

interface LogementFormDialogProps {
	open: boolean;
	/** Logement à modifier (mode édition) ; null = création. */
	logement: Logement | null;
	/** Bâtiments disponibles pour le champ « Bâtiment » (déjà chargés). */
	batiments: Batiment[];
	/** Bâtiment pré-sélectionné en mode création (bâtiment courant de la page). */
	batimentIdParDefaut?: string;
	/** Fermeture (overlay, Échap, Annuler). */
	onOpenChange: (open: boolean) => void;
	/** Appelé après un enregistrement réussi (ferme la modale côté page). */
	onSaved: () => void;
}

/**
 * Modale « Ajouter / Modifier un logement » (M2.2). Wrapper radix Dialog
 * (déjà installé) autour de `LogementForm` — s'ouvre au-dessus de la liste,
 * pas de route dédiée. Le `key` remonte un formulaire neuf à chaque ouverture
 * (état frais, valeurs par défaut recalculées). Contenu scrollable : le
 * formulaire est plus haut que celui des bâtiments (7 champs).
 */
export function LogementFormDialog({
	open,
	logement,
	batiments,
	batimentIdParDefaut,
	onOpenChange,
	onSaved,
}: LogementFormDialogProps) {
	return (
		<Dialog.Root open={open} onOpenChange={onOpenChange}>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content className="fixed top-1/2 left-1/2 z-50 max-h-[85dvh] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-border bg-card p-6 shadow-lg">
					<Dialog.Title className="text-base font-semibold text-foreground">
						{logement
							? `Modifier le logement ${logement.numero}`
							: "Ajouter un logement"}
					</Dialog.Title>
					<Dialog.Description className="mt-1 text-sm text-muted-foreground">
						Permet de créer un nouveau logement ou de modifier les informations
						d'un logement existant.
					</Dialog.Description>
					<div className="mt-4">
						<LogementForm
							key={logement?.id ?? "create"}
							logement={logement}
							batiments={batiments}
							batimentIdParDefaut={batimentIdParDefaut}
							onCancel={() => onOpenChange(false)}
							onSaved={onSaved}
						/>
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	);
}
