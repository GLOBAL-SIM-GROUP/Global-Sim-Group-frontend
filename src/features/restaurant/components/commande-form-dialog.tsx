import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
} from "#/components/ui/dialog";
import type { MoyenPaiement } from "#/features/residence/models/moyens-paiement";

import type { Plat } from "../models/plats";
import { CommandeForm } from "./commande-form";

interface CommandeFormDialogProps {
	open: boolean;
	plats: Plat[];
	moyens: MoyenPaiement[];
	onOpenChange: (open: boolean) => void;
	onSaved: () => void;
}

/** Modale « Nouvelle commande — Restaurant » (M5). */
export function CommandeFormDialog({
	open,
	plats,
	moyens,
	onOpenChange,
	onSaved,
}: CommandeFormDialogProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto">
				<DialogTitle>Nouvelle commande — Restaurant</DialogTitle>
				<DialogDescription>
					Sélectionnez les plats, les quantités et le moyen de paiement.
				</DialogDescription>
				<div className="mt-4">
					<CommandeForm
						plats={plats}
						moyens={moyens}
						onCancel={() => onOpenChange(false)}
						onSaved={onSaved}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
