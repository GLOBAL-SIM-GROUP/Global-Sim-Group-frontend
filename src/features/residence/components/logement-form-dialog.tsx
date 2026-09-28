import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";

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
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-md overflow-y-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				<DialogTitle>
					{logement
						? `Modifier le logement ${logement.numero}`
						: "Ajouter un logement"}
				</DialogTitle>
				<DialogDescription>
					Permet de créer un nouveau logement ou de modifier les informations
					d'un logement existant.
				</DialogDescription>
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
			</DialogContent>
		</Dialog>
	);
}
